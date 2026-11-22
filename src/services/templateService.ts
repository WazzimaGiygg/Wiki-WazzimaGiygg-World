import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { WikiPage, WikiUser } from '../types/wiki';
import { INITIAL_PAGES } from '../core/defaultPages';
import {
  parseWikitext,
  expandSubstTemplates,
  ParseResult,
  ParseWikitextOptions,
  slugify,
} from '../core/parser';
import {
  TemplateCatalogEntry,
  TemplateParamMeta,
  setCachedTemplates,
  removeCachedTemplate,
  getAvailableTemplates,
  extractTemplateParams,
  resolveTranscludedPage,
  stripTemplateNamespacePrefix,
  slugifyTemplateName,
} from '../core/templateRegistry';
import { savePage, canUserEditPage } from './wikiService';

export type { TemplateCatalogEntry, TemplateParamMeta };

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  detectedParams: TemplateParamMeta[];
  normalizedSlug: string;
  normalizedTitle: string;
}

const WIKI_PAGES_COLLECTION = 'wiki_pages';

// Structural payload limits synchronized with firebase-blueprint.json & firestore.rules
const MAX_SLUG_LEN = 200;
const MAX_TITLE_LEN = 250;
const MAX_CONTENT_LEN = 500000;
const MAX_SUMMARY_LEN = 500;
const MAX_AUTHOR_LEN = 100;

export interface SaveTemplateParams {
  name: string;
  content: string;
  summary?: string;
  user: WikiUser;
  minorEdit?: boolean;
}

/**
 * Normalizes a raw template name into its canonical Predefinição:... slug.
 */
export function formatTemplateSlug(rawName: string): string {
  const clean = stripTemplateNamespacePrefix(rawName).trim();
  return slugify(slugifyTemplateName(clean));
}

/**
 * Normalizes a raw template name into its canonical display title ("Predefinição:Nome").
 */
export function formatTemplateTitle(rawName: string): string {
  const clean = stripTemplateNamespacePrefix(rawName).trim().replace(/_/g, ' ');
  return `Predefinição:${clean}`;
}

/**
 * Returns the short template name without the Predefinição:/Template: prefix.
 */
export function formatTemplateDisplayName(rawName: string): string {
  return stripTemplateNamespacePrefix(rawName);
}

/**
 * Ensures built-in templates from INITIAL_PAGES are registered in the local expansion cache.
 */
export function ensureBuiltInTemplatesCached(): void {
  const builtInTemplates = Object.values(INITIAL_PAGES).filter(
    p => p.namespace === 'Template' || /^(?:Predefinição|Template):/i.test(p.slug)
  );
  setCachedTemplates(builtInTemplates, true);
}

const trackedRemoteTemplateSlugs = new Set<string>();

/**
 * Validates MediaWiki template name, structural delimiters ({{...}}, {{{...}}}),
 * transclusion tags (<includeonly>, <noinclude>, <onlyinclude>), security constraints,
 * and Firestore blueprint payload limits.
 */
export function validateTemplate(rawName: string, rawContent: string): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const cleanName = stripTemplateNamespacePrefix(rawName || '').trim();
  const normalizedSlug = cleanName ? formatTemplateSlug(cleanName) : '';
  const normalizedTitle = cleanName ? formatTemplateTitle(cleanName) : '';

  if (!cleanName) {
    errors.push('Informe um nome válido para a predefinição.');
  } else {
    if (/[#<>[\]|{}]/.test(cleanName)) {
      errors.push(
        'O nome da predefinição contém caracteres inválidos do MediaWiki (#, <, >, [, ], |, {, }).'
      );
    }
    if (normalizedSlug.length > MAX_SLUG_LEN) {
      errors.push(`O identificador da predefinição excede o limite de ${MAX_SLUG_LEN} caracteres.`);
    }
    if (normalizedTitle.length > MAX_TITLE_LEN) {
      errors.push(`O título da predefinição excede o limite de ${MAX_TITLE_LEN} caracteres.`);
    }
  }

  const content = rawContent || '';
  if (!content.trim()) {
    errors.push('O conteúdo wikitexto da predefinição não pode estar vazio.');
  } else if (content.length > MAX_CONTENT_LEN) {
    errors.push(`O conteúdo da predefinição excede o limite máximo de ${MAX_CONTENT_LEN} caracteres.`);
  }

  // Strip literal code/nowiki blocks before checking template delimiters
  const strippedForSyntaxCheck = content
    .replace(/<syntaxhighlight[\s\S]*?<\/syntaxhighlight>/gi, '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, '')
    .replace(/<nowiki>[\s\S]*?<\/nowiki>/gi, '')
    .replace(/<code[\s\S]*?<\/code>/gi, '')
    .replace(/`[^`\n]+`/g, '');

  // Check balanced MediaWiki braces ({{ ... }} / {{{ ... }}})
  let braceBalance = 0;
  let hasUnmatchedClosing = false;
  for (let i = 0; i < strippedForSyntaxCheck.length; i++) {
    const ch = strippedForSyntaxCheck[i];
    if (ch === '{') {
      braceBalance++;
    } else if (ch === '}') {
      braceBalance--;
      if (braceBalance < 0) {
        hasUnmatchedClosing = true;
        break;
      }
    }
  }
  if (hasUnmatchedClosing || braceBalance !== 0) {
    errors.push(
      'Chaves MediaWiki desbalanceadas: verifique se todas as marcações {{...}} e {{{parâmetro}}} estão corretamente fechadas.'
    );
  }

  // Check balanced transclusion control tags
  const tagPairs: Array<[string, RegExp, RegExp]> = [
    ['<includeonly>', /<includeonly>/gi, /<\/includeonly>/gi],
    ['<noinclude>', /<noinclude>/gi, /<\/noinclude>/gi],
    ['<onlyinclude>', /<onlyinclude>/gi, /<\/onlyinclude>/gi],
  ];
  for (const [tagLabel, openRx, closeRx] of tagPairs) {
    const openCount = (content.match(openRx) || []).length;
    const closeCount = (content.match(closeRx) || []).length;
    if (openCount !== closeCount) {
      errors.push(
        `Tag de transclusão ${tagLabel} não foi fechada corretamente (${openCount} abertura(s) e ${closeCount} fechamento(s)).`
      );
    }
  }

  // Block unsafe HTML / XSS payloads inside templates
  if (
    /<\s*(script|iframe|object|embed|meta|link|base)\b/i.test(content) ||
    /\son[a-z]+\s*=/i.test(content) ||
    /(?:href|src)\s*=\s*["']\s*(?:javascript|vbscript):/i.test(content)
  ) {
    errors.push(
      'Conteúdo bloqueado por segurança: tags executáveis (<script>, <iframe>, <object>), atributos on*= e URIs javascript: não são permitidos em predefinições.'
    );
  }

  const detectedParams = content.trim() ? extractTemplateParams(content) : [];

  if (content.trim() && !/<noinclude>/i.test(content) && detectedParams.length > 0) {
    warnings.push(
      'Dica: adicione uma seção <noinclude>...</noinclude> documentando os parâmetros detectados na página da predefinição.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    detectedParams,
    normalizedSlug,
    normalizedTitle,
  };
}

/**
 * Subscribes in real time to all Template-namespace pages in Firestore (/wiki_pages where namespace == 'Template'),
 * keeps the local expansion cache synchronized for ArticleView & EditView, and emits a sorted template catalog.
 */
export function subscribeToTemplates(
  callback: (templates: TemplateCatalogEntry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  ensureBuiltInTemplatesCached();

  const qTemplates = query(
    collection(db, WIKI_PAGES_COLLECTION),
    where('namespace', '==', 'Template')
  );

  return onSnapshot(
    qTemplates,
    snapshot => {
      const firestoreTemplates = snapshot.docs.map(d => d.data() as WikiPage);
      const currentRemoteSlugs = new Set(firestoreTemplates.map(p => p.slug));

      trackedRemoteTemplateSlugs.forEach(prevSlug => {
        if (!currentRemoteSlugs.has(prevSlug)) {
          removeCachedTemplate(prevSlug);
          trackedRemoteTemplateSlugs.delete(prevSlug);
        }
      });
      currentRemoteSlugs.forEach(s => trackedRemoteTemplateSlugs.add(s));

      setCachedTemplates(firestoreTemplates, true);
      callback(getAvailableTemplates());
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.LIST, WIKI_PAGES_COLLECTION);
      } catch (structuredErr) {
        ensureBuiltInTemplatesCached();
        callback(getAvailableTemplates());
        if (onError) {
          onError(structuredErr instanceof Error ? structuredErr : new Error(String(structuredErr)));
        }
      }
    }
  );
}

/**
 * Fetches all templates once from Firestore and merges with built-in templates.
 */
export async function listTemplates(): Promise<TemplateCatalogEntry[]> {
  ensureBuiltInTemplatesCached();
  const path = WIKI_PAGES_COLLECTION;

  try {
    const qTemplates = query(
      collection(db, WIKI_PAGES_COLLECTION),
      where('namespace', '==', 'Template')
    );
    const snap = await getDocs(qTemplates);
    const remoteTemplates = snap.docs.map(d => d.data() as WikiPage);
    setCachedTemplates(remoteTemplates, true);
    return getAvailableTemplates();
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Retrieves a single template page by name or slug from Firestore (falling back to built-ins).
 */
export async function getTemplate(rawNameOrSlug: string): Promise<WikiPage | null> {
  const slug = formatTemplateSlug(rawNameOrSlug);
  const path = `${WIKI_PAGES_COLLECTION}/${slug}`;

  try {
    const docSnap = await getDoc(doc(db, WIKI_PAGES_COLLECTION, slug));
    if (docSnap.exists()) {
      const page = docSnap.data() as WikiPage;
      setCachedTemplates([page], true);
      return page;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  return resolveTranscludedPage(rawNameOrSlug);
}

/**
 * Creates or updates a reusable wikitext template (Predefinição:<Nome>) in Firestore.
 * Requires an authenticated non-anonymous, non-blocked user and validates page protection & blueprint constraints.
 */
export async function saveTemplate(params: SaveTemplateParams): Promise<WikiPage> {
  if (!auth.currentUser || auth.currentUser.isAnonymous || params.user.isAnonymous) {
    throw new Error(
      'Acesso negado: é obrigatório fazer login com sua conta para criar ou editar predefinições.'
    );
  }
  if (params.user.isBlocked) {
    throw new Error('Sua conta está bloqueada no wiki e não pode modificar predefinições.');
  }

  const validation = validateTemplate(params.name, params.content);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  const slug = validation.normalizedSlug.slice(0, MAX_SLUG_LEN);
  const title = validation.normalizedTitle.slice(0, MAX_TITLE_LEN);
  const content = params.content.slice(0, MAX_CONTENT_LEN);
  const summary = (params.summary || 'Criação/atualização de predefinição reutilizável')
    .trim()
    .slice(0, MAX_SUMMARY_LEN);
  const author = (params.user.username || 'Editor').slice(0, MAX_AUTHOR_LEN);

  // Check existing template protection level before overwriting
  const existing = await getTemplate(slug);
  if (existing) {
    const perm = canUserEditPage(existing, params.user);
    if (!perm.allowed) {
      throw new Error(`Edição bloqueada: ${perm.reason}`);
    }
  }

  const savedPage = await savePage({
    slug,
    title,
    content,
    summary,
    author,
    authorId: auth.currentUser.uid,
    minorEdit: Boolean(params.minorEdit),
    namespace: 'Template',
    user: params.user,
  });

  trackedRemoteTemplateSlugs.add(savedPage.slug);
  setCachedTemplates([savedPage], true);
  return savedPage;
}

/**
 * Deletes a template page from Firestore (strictly Bureaucrat-only per firestore.rules).
 */
export async function deleteTemplate(nameOrSlug: string, isBureaucrat: boolean): Promise<void> {
  if (!auth.currentUser || auth.currentUser.isAnonymous || !isBureaucrat) {
    throw new Error('Acesso negado: apenas Burocratas podem eliminar predefinições do banco de dados.');
  }

  const slug = formatTemplateSlug(nameOrSlug);
  const path = `${WIKI_PAGES_COLLECTION}/${slug}`;

  try {
    await deleteDoc(doc(db, WIKI_PAGES_COLLECTION, slug));
    trackedRemoteTemplateSlugs.delete(slug);
    removeCachedTemplate(slug);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Expands wikitext containing {{NomeDaPredefinição|parâmetro}} calls for ArticleView / previews.
 */
export function expandWikitextTemplates(
  wikitext: string,
  existingPages: Set<string> = new Set(),
  options?: ParseWikitextOptions
): ParseResult {
  ensureBuiltInTemplatesCached();
  return parseWikitext(wikitext, existingPages, options);
}

/**
 * Expands {{subst:NomeDaPredefinição|parâmetro}} into static wikitext upon saving an article.
 */
export function expandSubstInWikitext(wikitext: string, pageTitle?: string): string {
  ensureBuiltInTemplatesCached();
  return expandSubstTemplates(wikitext, pageTitle);
}

/**
 * Extracts parameter definitions ({{{1}}}, {{{param|padrão}}}) from template wikitext.
 */
export function extractTemplateParameters(rawWikitext: string): TemplateParamMeta[] {
  return extractTemplateParams(rawWikitext);
}

/**
 * Builds a clean {{NomeDaPredefinição|parâmetro}} wikitext call string for insertion in the editor.
 */
export function buildTemplateInvocation(
  templateName: string,
  paramValues: Record<string, string>,
  paramsMeta: TemplateParamMeta[] = [],
  useSubst = false
): string {
  const prefix = useSubst ? 'subst:' : '';
  const bareName = stripTemplateNamespacePrefix(templateName).replace(/\s+/g, '_');

  const entries =
    paramsMeta.length > 0
      ? paramsMeta
          .filter(p => (paramValues[p.name] || '').trim() !== '')
          .map(p => ({
            name: p.name,
            isPositional: p.isPositional,
            value: paramValues[p.name].trim(),
          }))
      : Object.entries(paramValues)
          .filter(([, val]) => val.trim() !== '')
          .map(([name, val]) => ({
            name,
            isPositional: /^\d+$/.test(name),
            value: val.trim(),
          }));

  if (entries.length === 0) {
    return `{{${prefix}${bareName}}}`;
  }

  const allPositional = entries.every(e => e.isPositional);
  if (allPositional && entries.length <= 3) {
    const args = entries
      .sort((a, b) => Number(a.name) - Number(b.name))
      .map(e => e.value);
    return `{{${prefix}${bareName}|${args.join('|')}}}`;
  }

  const lines = entries.map(e =>
    e.isPositional ? `| ${e.value}` : `| ${e.name} = ${e.value}`
  );
  return `{{${prefix}${bareName}\n${lines.join('\n')}\n}}`;
}
