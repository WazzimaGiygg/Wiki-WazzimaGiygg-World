import { PageNamespace, TOCItem } from '../types/wiki';
import { getCachedFileUrl } from '../services/extensionService';
import { WIKI_SITE_VERSION, WIKI_SITE_NAME } from './version';
import {
  resolveTranscludedPage,
  extractTransclusionBody,
  stripTemplateViewingTags,
  stripTemplateNamespacePrefix,
} from './templateRegistry';

export interface ParseResult {
  html: string;
  toc: TOCItem[];
  categories: string[];
  references: string[];
}

export interface ParseWikitextOptions {
  pageTitle?: string;
  pageSlug?: string;
  namespace?: PageNamespace;
  totalPages?: number;
  disabledExtensions?: string[] | Set<string>;
}

const NAMESPACE_LABELS: Record<PageNamespace, string> = {
  Main: '',
  Talk: 'Discussão',
  Special: 'Especial',
  Help: 'Ajuda',
  Manual: 'Manual',
  Template: 'Predefinição',
  Category: 'Categoria',
  User: 'Usuário',
  File: 'Ficheiro',
  Wiki: 'Wiki',
};

function getPageContext(options?: ParseWikitextOptions) {
  const fullTitle =
    options?.pageTitle ||
    (options?.pageSlug ? options.pageSlug.replace(/_/g, ' ') : 'Página_principal');
  const fullSlug = options?.pageSlug || slugify(fullTitle);
  const colonIdx = fullTitle.indexOf(':');
  const inferredNs =
    options?.namespace && options.namespace !== 'Main'
      ? NAMESPACE_LABELS[options.namespace] || ''
      : colonIdx > 0
      ? fullTitle.slice(0, colonIdx).trim()
      : '';
  const pagename = colonIdx > 0 ? fullTitle.slice(colonIdx + 1).trim() : fullTitle;
  return {
    fullTitle,
    fullSlug,
    pagename,
    pagenamee: slugify(pagename),
    namespace: inferredNs,
  };
}

export function parseWikitext(
  wikitext: string,
  existingPages: Set<string> = new Set(),
  options?: ParseWikitextOptions
): ParseResult {
  if (!wikitext) {
    return { html: '', toc: [], categories: [], references: [] };
  }

  const disabledSet = options?.disabledExtensions
    ? new Set(options.disabledExtensions)
    : new Set<string>();
  const isExtActive = (id: string) => !disabledSet.has(id);

  let text = wikitext;
  const categories: string[] = [];
  const references: string[] = [];
  const toc: TOCItem[] = [];

  const codeBlocks: string[] = [];
  const nowikiBlocks: string[] = [];
  const inlineCodeBlocks: string[] = [];

  const protectLiteralSyntaxes = (raw: string): string => {
    let out = raw;

    if (isExtActive('syntax-highlight')) {
      // Protect <syntaxhighlight> blocks
      out = out.replace(
        /<syntaxhighlight(?:\s+lang="([^"]*)")?\s*>([\s\S]*?)<\/syntaxhighlight>/gi,
        (_, lang, code) => {
          const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
          const escaped = escapeHtml(code.trim());
          codeBlocks.push(
            `<div class="my-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto text-xs font-mono">
        ${lang ? `<div class="px-3 py-1 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-sans font-semibold">${escapeHtml(lang)}</div>` : ''}
        <pre class="p-3 leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre"><code>${escaped}</code></pre>
      </div>`
          );
          return placeholder;
        }
      );

      // Protect <pre> blocks
      out = out.replace(/<pre(?:\s+[^>]*)?>([\s\S]*?)<\/pre>/gi, (_, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(
          `<div class="my-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto text-xs font-mono"><pre class="p-3 leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre"><code>${escapeHtml(code.trim())}</code></pre></div>`
        );
        return placeholder;
      });
    }

    if (isExtActive('math')) {
      out = out.replace(/<math>([\s\S]*?)<\/math>/gi, (_, formula) => {
        const placeholder = `__INLINE_CODE_${inlineCodeBlocks.length}__`;
        inlineCodeBlocks.push(
          `<span class="inline-block px-2 py-0.5 mx-0.5 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 font-serif italic text-gray-900 dark:text-blue-100 text-sm" title="Expressão Matemática (TeX)">${escapeHtml(formula.trim())}</span>`
        );
        return placeholder;
      });
    }

    // Protect <nowiki>...</nowiki> literal spans
    out = out.replace(/<nowiki>([\s\S]*?)<\/nowiki>/gi, (_, literal) => {
      const placeholder = `__NOWIKI_BLOCK_${nowikiBlocks.length}__`;
      nowikiBlocks.push(escapeHtml(literal));
      return placeholder;
    });

    if (isExtActive('syntax-highlight')) {
      // Protect inline `...` literals before template/magic-word expansion
      out = out.replace(/`([^`\n]+)`/g, (_, codeLiteral) => {
        const placeholder = `__INLINE_CODE_${inlineCodeBlocks.length}__`;
        inlineCodeBlocks.push(
          `<code class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 font-mono text-xs">${escapeHtml(codeLiteral)}</code>`
        );
        return placeholder;
      });
    }

    // Protect literal <code>...</code> spans so wikitext/category examples inside code tags are preserved verbatim
    out = out.replace(/<code([^>]*)>([\s\S]*?)<\/code>/gi, (_, attrs, inner) => {
      const placeholder = `__INLINE_CODE_${inlineCodeBlocks.length}__`;
      const safeAttrs = attrs && attrs.trim() ? attrs : ' class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 font-mono text-xs"';
      inlineCodeBlocks.push(`<code${safeAttrs}>${inner}</code>`);
      return placeholder;
    });

    return out;
  };

  // 1. Protect code & nowiki literals first so template examples inside docs aren't executed
  text = protectLiteralSyntaxes(text);

  // 2. If viewing a Template (Predefinição:...) page directly, strip <includeonly> and unwrap <noinclude>/<onlyinclude>
  const isTemplatePage =
    options?.namespace === 'Template' ||
    /^(?:Predefinição|Predefinicao|Template):/i.test(
      options?.pageSlug || options?.pageTitle || ''
    );
  if (isTemplatePage && isExtActive('templates-transclusion')) {
    text = stripTemplateViewingTags(text);
  }

  // 3. Expand MediaWiki Templates ({{Predefinição}}), Magic Words ({{PAGENAME}}), and ParserFunctions ({{#if:}})
  if (isExtActive('templates-transclusion') || isExtActive('parser-functions')) {
    text = expandTemplatesAndFunctions(text, {
      existingPages,
      options,
      protectFn: protectLiteralSyntaxes,
      visitedStack: new Set<string>(),
      depth: 0,
      enableTemplates: isExtActive('templates-transclusion'),
      enableParserFunctions: isExtActive('parser-functions'),
    });
  }

  // 4. Extract Categories [[Categoria:...]] or [[Category:...]] (including ones emitted by templates!)
  if (isExtActive('dynamic-page-list')) {
    const seenCategoryKeys = new Set<string>();
    text = text.replace(
      /\[\[\s*(?:Categoria|Category)\s*:\s*([^\]|]+?)(?:\s*\|[^\]]*)?\s*\]\]/gi,
      (_, rawCatName) => {
        const cleaned = rawCatName
          .replace(/_/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleaned && !cleaned.includes('{{') && !cleaned.includes('{{{')) {
          const dedupKey = cleaned
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
          if (!seenCategoryKeys.has(dedupKey)) {
            seenCategoryKeys.add(dedupKey);
            categories.push(cleaned);
          }
        }
        return '';
      }
    );
  }

  // 5. Extract Footnotes / References <ref>...</ref>
  if (isExtActive('cite')) {
    text = text.replace(/<ref(?:\s+[^>]*)?>([\s\S]*?)<\/ref>/gi, (_, refContent) => {
      references.push(refContent.trim());
      const refIndex = references.length;
      return `__REF_${refIndex}__`;
    });
  }

  // 6. Process Infoboxes: {{Infobox ... | key = val }}
  if (isExtActive('scribunto')) {
    text = text.replace(/\{\{Infobox([\s\S]*?)\}\}/gi, (_, boxContent) => {
      return parseInfobox(boxContent);
    });
  }

  // 7. Process Fallback Built-in Notices if {{Aviso|...}} wasn't overridden by Predefinição:Aviso
  if (isExtActive('templates-transclusion')) {
    text = text.replace(/\{\{(?:Aviso|Notice)\|([\s\S]*?)\}\}/gi, (_, noticeContent) => {
      return `<div class="my-3 p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2 shadow-xs">
      <span class="text-amber-600 dark:text-amber-400 font-bold">ℹ</span>
      <div>${parseInlineWikitext(noticeContent.trim(), existingPages)}</div>
    </div>`;
    });
  }

  // 8. Process Wikitables: {| ... |}
  if (isExtActive('wikitable-parser')) {
    text = text.replace(/\{\|([\s\S]*?)\|\}/g, (_, tableContent) => {
      return parseWikitable(tableContent);
    });
  }

  // 9. Parse Headings & collect TOC: == Heading ==, === Sub ===
  const headingCounters = [0, 0, 0, 0];
  let sectionIndex = 0;

  text = text.replace(/^(={1,4})\s*(.*?)\s*\1$/gm, (_, levelStr, title) => {
    const level = levelStr.length;
    const cleanTitle = title.trim();
    const id = slugify(cleanTitle);

    if (level === 2) {
      headingCounters[0]++;
      headingCounters[1] = 0;
      headingCounters[2] = 0;
    } else if (level === 3) {
      headingCounters[1]++;
      headingCounters[2] = 0;
    } else if (level === 4) {
      headingCounters[2]++;
    }

    const numberStr =
      level === 1
        ? ''
        : level === 2
        ? `${headingCounters[0]}`
        : level === 3
        ? `${headingCounters[0]}.${headingCounters[1]}`
        : `${headingCounters[0]}.${headingCounters[1]}.${headingCounters[2]}`;

    if (level >= 2) {
      toc.push({
        id,
        level,
        text: cleanTitle,
        number: numberStr,
      });
    }

    sectionIndex++;
    const currentSection = sectionIndex;

    const baseClass =
      'group font-serif font-medium text-gray-900 dark:text-gray-100 flex items-baseline justify-between';
    if (level === 1) {
      return `<h1 id="${id}" class="${baseClass} text-2xl pb-1 mb-3 border-b border-gray-300 dark:border-gray-700">
        <span>${escapeHtml(cleanTitle)}</span>
      </h1>`;
    } else if (level === 2) {
      return `<h2 id="${id}" class="${baseClass} text-xl mt-6 pb-1 mb-2 border-b border-gray-300 dark:border-gray-700">
        <span class="mw-headline">${escapeHtml(cleanTitle)}</span>
        <button type="button" data-section="${currentSection}" class="mw-section-edit text-xs font-sans text-blue-600 dark:text-blue-400 opacity-60 group-hover:opacity-100 hover:underline cursor-pointer ml-3">[editar]</button>
      </h2>`;
    } else if (level === 3) {
      return `<h3 id="${id}" class="${baseClass} text-lg font-semibold mt-4 mb-1">
        <span class="mw-headline">${escapeHtml(cleanTitle)}</span>
        <button type="button" data-section="${currentSection}" class="mw-section-edit text-xs font-sans text-blue-600 dark:text-blue-400 opacity-60 group-hover:opacity-100 hover:underline cursor-pointer ml-3">[editar]</button>
      </h3>`;
    } else {
      return `<h4 id="${id}" class="${baseClass} text-base font-semibold mt-3 mb-1">
        <span class="mw-headline">${escapeHtml(cleanTitle)}</span>
        <button type="button" data-section="${currentSection}" class="mw-section-edit text-xs font-sans text-blue-600 dark:text-blue-400 opacity-60 group-hover:opacity-100 hover:underline cursor-pointer ml-3">[editar]</button>
      </h4>`;
    }
  });

  // 10. Process Lists (* and #)
  text = parseLists(text);

  // 11. Process Paragraphs
  const rawParagraphs = text.split(/\n\s*\n/);
  const formattedParagraphs = rawParagraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (
      /^<(?:h[1-6]|div|\/div|blockquote|hr|table|ul|ol|figure|p|section|aside)\b/i.test(trimmed) ||
      trimmed.startsWith('__CODE_BLOCK_')
    ) {
      return trimmed;
    }
    return `<p class="my-3 leading-relaxed text-[14.5px] text-gray-800 dark:text-gray-200">${trimmed}</p>`;
  });
  text = formattedParagraphs.filter(Boolean).join('\n\n');

  // 12. Process Inline Wikitext (bold, italic, links, etc.)
  text = parseInlineWikitext(text, existingPages);

  // 13. Restore Inline Code, Nowiki, and Code Blocks
  inlineCodeBlocks.forEach((codeHtml, index) => {
    text = text.replaceAll(`__INLINE_CODE_${index}__`, codeHtml);
  });
  nowikiBlocks.forEach((literalHtml, index) => {
    text = text.replaceAll(`__NOWIKI_BLOCK_${index}__`, literalHtml);
  });
  codeBlocks.forEach((blockHtml, index) => {
    text = text.replaceAll(`__CODE_BLOCK_${index}__`, blockHtml);
  });

  // 14. References Placeholder Replacement
  text = text.replace(/__REF_(\d+)__/g, (_, refNum) => {
    return `<sup class="reference" id="cite_ref-${refNum}"><a href="#cite_note-${refNum}" class="text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px] font-medium">[${refNum}]</a></sup>`;
  });

  // 15. Handle <references /> and {{reflist}}
  if (isExtActive('cite')) {
    const referencesHtml =
      references.length > 0
        ? `
    <div class="mw-references-wrap my-4 pt-2 border-t border-gray-200 dark:border-gray-800 text-xs">
      <h3 class="font-serif font-medium text-base mb-2 text-gray-800 dark:text-gray-200">Referências</h3>
      <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
        ${references
          .map(
            (ref, idx) => `
          <li id="cite_note-${idx + 1}" class="leading-normal">
            <span class="mr-1 text-blue-600 dark:text-blue-400"><a href="#cite_ref-${idx + 1}">↑</a></span>
            ${parseInlineWikitext(ref, existingPages)}
          </li>
        `
          )
          .join('')}
      </ol>
    </div>
  `
        : '';

    if (text.includes('<references') || /\{\{reflist\}\}/i.test(text)) {
      text = text.replace(/<references\s*\/?>|\{\{reflist\}\}/gi, referencesHtml);
    } else if (references.length > 0 && !text.includes('cite_note-')) {
      text += referencesHtml;
    }
  }

  // 16. Sanitize resulting HTML against XSS while keeping MediaWiki template styling intact
  text = sanitizeWikiHtml(text);

  return {
    html: text,
    toc: isExtActive('auto-toc') ? toc : [],
    categories: isExtActive('dynamic-page-list') ? categories : [],
    references: isExtActive('cite') ? references : [],
  };
}

// ============================================================================
// MEDIAWIKI TEMPLATE TRANSCUSION, MAGIC WORDS & PARSER FUNCTIONS ENGINE
// ============================================================================

interface ExpansionContext {
  existingPages: Set<string>;
  options?: ParseWikitextOptions;
  protectFn: (raw: string) => string;
  visitedStack: Set<string>;
  depth: number;
  enableTemplates?: boolean;
  enableParserFunctions?: boolean;
}

const MAX_TEMPLATE_DEPTH = 10;

function splitTopLevel(input: string, separator = '|'): string[] {
  const parts: string[] = [];
  let braceDepth = 0;
  let bracketDepth = 0;
  let current = '';

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '{') {
      braceDepth++;
    } else if (ch === '}') {
      if (braceDepth > 0) braceDepth--;
    } else if (ch === '[') {
      bracketDepth++;
    } else if (ch === ']') {
      if (bracketDepth > 0) bracketDepth--;
    }

    if (ch === separator && braceDepth === 0 && bracketDepth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }

  parts.push(current);
  return parts;
}

function splitFirstTopLevelEquals(arg: string): [string, string] | null {
  let braceDepth = 0;
  let bracketDepth = 0;
  let angleDepth = 0;

  for (let i = 0; i < arg.length; i++) {
    const ch = arg[i];
    if (ch === '{') braceDepth++;
    else if (ch === '}' && braceDepth > 0) braceDepth--;
    else if (ch === '[') bracketDepth++;
    else if (ch === ']' && bracketDepth > 0) bracketDepth--;
    else if (ch === '<' && /^<\/?[a-zA-Z]/.test(arg.slice(i))) angleDepth++;
    else if (ch === '>' && angleDepth > 0) angleDepth--;
    else if (ch === '=' && braceDepth === 0 && bracketDepth === 0 && angleDepth === 0) {
      const lhs = arg.slice(0, i);
      // Do not treat newline or markup as parameter name
      if (!lhs.includes('\n') && !lhs.includes('<')) {
        return [lhs.trim(), arg.slice(i + 1).trim()];
      }
    }
  }
  return null;
}

function buildArgsMap(rawArgs: string[]): Map<string, string> {
  const map = new Map<string, string>();
  let positionalIndex = 1;

  for (const rawArg of rawArgs) {
    const eq = splitFirstTopLevelEquals(rawArg);
    if (eq && eq[0]) {
      map.set(eq[0], eq[1]);
    } else {
      map.set(String(positionalIndex), rawArg.trim());
      positionalIndex++;
    }
  }
  return map;
}

function substituteParameters(body: string, argsMap: Map<string, string>): string {
  let out = '';
  let i = 0;

  while (i < body.length) {
    if (body[i] === '{' && body[i + 1] === '{' && body[i + 2] === '{') {
      // Find balanced closing }}}
      let depth = 3;
      let j = i + 3;
      while (j < body.length && depth > 0) {
        if (body[j] === '{') depth++;
        else if (body[j] === '}') depth--;
        j++;
      }

      if (depth === 0) {
        const inner = body.slice(i + 3, j - 3);
        const parts = splitTopLevel(inner, '|');
        const paramName = (parts[0] || '').trim();
        const hasDefault = parts.length > 1;
        const defaultRaw = hasDefault ? parts.slice(1).join('|') : '';

        if (argsMap.has(paramName)) {
          out += argsMap.get(paramName)!;
        } else if (hasDefault) {
          out += substituteParameters(defaultRaw, argsMap);
        } else {
          out += `{{{${paramName}}}}`;
        }
        i = j;
        continue;
      }
    }

    out += body[i];
    i++;
  }

  return out;
}

function resolveMagicWord(name: string, ctx: ExpansionContext): string | null {
  const upper = name.trim().toUpperCase();
  const pageCtx = getPageContext(ctx.options);
  const now = new Date();

  switch (upper) {
    case '!':
      return '|';
    case 'SITENAME':
      return WIKI_SITE_NAME;
    case 'CURRENTVERSION':
    case 'VERSÃO':
    case 'VERSAO':
    case 'WIKIVERSION':
      return WIKI_SITE_VERSION;
    case 'PAGENAME':
      return pageCtx.pagename;
    case 'PAGENAMEE':
      return pageCtx.pagenamee;
    case 'FULLPAGENAME':
      return pageCtx.fullTitle;
    case 'FULLPAGENAMEE':
      return pageCtx.fullSlug;
    case 'NAMESPACE':
      return pageCtx.namespace;
    case 'CURRENTYEAR':
      return String(now.getFullYear());
    case 'CURRENTMONTH':
      return String(now.getMonth() + 1).padStart(2, '0');
    case 'CURRENTDAY':
      return String(now.getDate()).padStart(2, '0');
    case 'CURRENTDATE':
      return now.toLocaleDateString('pt-BR');
    case 'NUMBEROFPAGES':
      return String(ctx.options?.totalPages || ctx.existingPages.size || 15);
    default:
      return null;
  }
}

function evaluateParserFunction(
  funcName: string,
  firstArgRaw: string,
  restArgs: string[],
  ctx: ExpansionContext
): string | null {
  const lower = funcName.trim().toLowerCase();
  const expand = (val: string) => expandTemplatesAndFunctions(val, ctx);

  if (lower === '#if') {
    const cond = expand(firstArgRaw).trim();
    const thenBranch = restArgs[0] ?? '';
    const elseBranch = restArgs[1] ?? '';
    return cond !== '' ? expand(thenBranch) : expand(elseBranch);
  }

  if (lower === '#ifeq') {
    const left = expand(firstArgRaw).trim();
    const right = expand(restArgs[0] ?? '').trim();
    const thenBranch = restArgs[1] ?? '';
    const elseBranch = restArgs[2] ?? '';
    const numLeft = left !== '' ? Number(left) : NaN;
    const numRight = right !== '' ? Number(right) : NaN;
    const isEqual =
      left === right ||
      (!Number.isNaN(numLeft) && !Number.isNaN(numRight) && numLeft === numRight);
    return isEqual ? expand(thenBranch) : expand(elseBranch);
  }

  if (lower === '#switch') {
    const switchVal = expand(firstArgRaw).trim();
    const cases = restArgs;
    let defaultBranch = '';
    let matchedFallthrough = false;

    for (let idx = 0; idx < cases.length; idx++) {
      const part = cases[idx];
      const eq = splitFirstTopLevelEquals(part);
      if (eq) {
        const [caseKeyRaw, caseResult] = eq;
        const caseKey = expand(caseKeyRaw).trim();
        if (caseKey.toLowerCase() === '#default') {
          defaultBranch = caseResult;
          if (matchedFallthrough) {
            return expand(caseResult);
          }
        } else if (matchedFallthrough || caseKey === switchVal) {
          return expand(caseResult);
        }
      } else {
        const bareKey = expand(part).trim();
        // Last bare item without '=' acts as #default fallback if not matched yet
        if (idx === cases.length - 1 && !matchedFallthrough) {
          return bareKey;
        }
        if (bareKey === switchVal) {
          matchedFallthrough = true;
        } else if (bareKey.toLowerCase() === '#default') {
          matchedFallthrough = true;
        }
      }
    }
    return defaultBranch ? expand(defaultBranch) : '';
  }

  if (lower === '#expr') {
    const exprText = expand(firstArgRaw).trim();
    return evaluateMathExpression(exprText);
  }

  if (lower === 'lc') {
    return expand(firstArgRaw).toLowerCase();
  }
  if (lower === 'uc') {
    return expand(firstArgRaw).toUpperCase();
  }
  if (lower === 'lcfirst') {
    const v = expand(firstArgRaw);
    return v ? v.charAt(0).toLowerCase() + v.slice(1) : '';
  }
  if (lower === 'ucfirst') {
    const v = expand(firstArgRaw);
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
  }

  return null;
}

// Safe recursive-descent arithmetic evaluator for {{#expr:...}} (no eval/Function)
function evaluateMathExpression(expr: string): string {
  if (!expr) return '';
  const tokens: Array<{ type: 'num' | 'op' | 'id'; val: string }> = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/\d|\./.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        numStr += expr[i++];
      }
      tokens.push({ type: 'num', val: numStr });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let id = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        id += expr[i++];
      }
      tokens.push({ type: 'id', val: id.toLowerCase() });
      continue;
    }
    const twoChar = expr.slice(i, i + 2);
    if (twoChar === '!=' || twoChar === '<=' || twoChar === '>=' || twoChar === '<>') {
      tokens.push({ type: 'op', val: twoChar });
      i += 2;
      continue;
    }
    if ('+-*/%^()=<>'.includes(ch)) {
      tokens.push({ type: 'op', val: ch });
      i++;
      continue;
    }
    return '<span class="text-red-600 dark:text-red-400 font-mono text-xs">[Erro de expressão]</span>';
  }

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const parseOr = (): number => {
    let left = parseAnd();
    while (peek()?.type === 'id' && peek()?.val === 'or') {
      consume();
      const right = parseAnd();
      left = left !== 0 || right !== 0 ? 1 : 0;
    }
    return left;
  };

  const parseAnd = (): number => {
    let left = parseCmp();
    while (peek()?.type === 'id' && peek()?.val === 'and') {
      consume();
      const right = parseCmp();
      left = left !== 0 && right !== 0 ? 1 : 0;
    }
    return left;
  };

  const parseCmp = (): number => {
    let left = parseAddSub();
    const tok = peek();
    if (tok?.type === 'op' && ['=', '!=', '<>', '<', '>', '<=', '>='].includes(tok.val)) {
      consume();
      const right = parseAddSub();
      switch (tok.val) {
        case '=':
          return left === right ? 1 : 0;
        case '!=':
        case '<>':
          return left !== right ? 1 : 0;
        case '<':
          return left < right ? 1 : 0;
        case '>':
          return left > right ? 1 : 0;
        case '<=':
          return left <= right ? 1 : 0;
        case '>=':
          return left >= right ? 1 : 0;
      }
    }
    return left;
  };

  const parseAddSub = (): number => {
    let left = parseMulDiv();
    while (peek()?.type === 'op' && (peek()?.val === '+' || peek()?.val === '-')) {
      const op = consume().val;
      const right = parseMulDiv();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  };

  const parseMulDiv = (): number => {
    let left = parsePow();
    while (
      (peek()?.type === 'op' && (peek()?.val === '*' || peek()?.val === '/' || peek()?.val === '%')) ||
      (peek()?.type === 'id' && (peek()?.val === 'mod' || peek()?.val === 'div'))
    ) {
      const op = consume().val;
      const right = parsePow();
      if (op === '*') left *= right;
      else if (op === '/' || op === 'div') {
        if (right === 0) throw new Error('Divisão por zero');
        left /= right;
      } else {
        if (right === 0) throw new Error('Divisão por zero');
        left %= right;
      }
    }
    return left;
  };

  const parsePow = (): number => {
    const base = parseUnary();
    if (peek()?.type === 'op' && peek()?.val === '^') {
      consume();
      return Math.pow(base, parsePow());
    }
    return base;
  };

  const parseUnary = (): number => {
    const tok = peek();
    if (tok?.type === 'op' && tok.val === '+') {
      consume();
      return parseUnary();
    }
    if (tok?.type === 'op' && tok.val === '-') {
      consume();
      return -parseUnary();
    }
    if (tok?.type === 'id' && tok.val === 'not') {
      consume();
      return parseUnary() === 0 ? 1 : 0;
    }
    if (tok?.type === 'id' && ['round', 'floor', 'ceil', 'abs', 'trunc'].includes(tok.val)) {
      const fn = consume().val;
      const arg = parseUnary();
      if (fn === 'round') return Math.round(arg);
      if (fn === 'floor') return Math.floor(arg);
      if (fn === 'ceil') return Math.ceil(arg);
      if (fn === 'abs') return Math.abs(arg);
      return Math.trunc(arg);
    }
    return parsePrimary();
  };

  const parsePrimary = (): number => {
    const tok = peek();
    if (!tok) throw new Error('Fim inesperado');
    if (tok.type === 'num') {
      consume();
      const n = Number(tok.val);
      if (Number.isNaN(n)) throw new Error('Número inválido');
      return n;
    }
    if (tok.type === 'id') {
      consume();
      if (tok.val === 'pi') return Math.PI;
      if (tok.val === 'e') return Math.E;
      throw new Error('Identificador desconhecido');
    }
    if (tok.type === 'op' && tok.val === '(') {
      consume();
      const val = parseOr();
      if (peek()?.val !== ')') throw new Error('Parêntese não fechado');
      consume();
      return val;
    }
    throw new Error('Token inesperado');
  };

  try {
    const result = parseOr();
    if (pos < tokens.length || !Number.isFinite(result)) {
      return '<span class="text-red-600 dark:text-red-400 font-mono text-xs">[Erro de expressão]</span>';
    }
    return Number.isInteger(result)
      ? String(result)
      : String(Number(result.toFixed(6)));
  } catch {
    return '<span class="text-red-600 dark:text-red-400 font-mono text-xs">[Erro de expressão]</span>';
  }
}

function expandTemplatesAndFunctions(input: string, ctx: ExpansionContext): string {
  if (!input || ctx.depth >= MAX_TEMPLATE_DEPTH) return input;

  let out = '';
  let i = 0;

  while (i < input.length) {
    // Skip triple-brace parameter syntax {{{...}}} so we never misparse its inner {{
    if (input[i] === '{' && input[i + 1] === '{' && input[i + 2] === '{') {
      let depth = 3;
      let j = i + 3;
      while (j < input.length && depth > 0) {
        if (input[j] === '{') depth++;
        else if (input[j] === '}') depth--;
        j++;
      }
      out += input.slice(i, j);
      i = j;
      continue;
    }

    // Match {{...}} template / parser function / magic word call
    if (input[i] === '{' && input[i + 1] === '{') {
      let depth = 2;
      let j = i + 2;
      while (j < input.length && depth > 0) {
        if (input[j] === '{') depth++;
        else if (input[j] === '}') depth--;
        j++;
      }

      if (depth === 0) {
        const inner = input.slice(i + 2, j - 2);
        const trimmedInner = inner.trim();

        // Keep Infobox and reflist intact for their dedicated post-steps, expanding inner templates inside Infobox
        if (/^infobox\b/i.test(trimmedInner)) {
          const expandedInfoboxInner = expandTemplatesAndFunctions(inner, {
            ...ctx,
            depth: ctx.depth + 1,
          });
          out += `{{${expandedInfoboxInner}}}`;
          i = j;
          continue;
        }
        if (/^reflist$/i.test(trimmedInner)) {
          out += '{{reflist}}';
          i = j;
          continue;
        }

        const parts = splitTopLevel(inner, '|');
        const headRaw = parts[0] || '';
        const headTrimmed = headRaw.trim();
        const restParts = parts.slice(1);

        // 1. Check ParserFunctions with colon syntax: {{#if:...}}, {{#ifeq:...}}, {{#switch:...}}, {{#expr:...}}, {{lc:...}}, {{uc:...}}
        const colonIdx = headTrimmed.indexOf(':');
        if (colonIdx > 0 && ctx.enableParserFunctions !== false) {
          const maybeFunc = headTrimmed.slice(0, colonIdx).trim();
          const lowerFunc = maybeFunc.toLowerCase();
          if (
            ['#if', '#ifeq', '#switch', '#expr', 'lc', 'uc', 'lcfirst', 'ucfirst'].includes(
              lowerFunc
            )
          ) {
            const firstArg = headTrimmed.slice(colonIdx + 1);
            const evaluated = evaluateParserFunction(maybeFunc, firstArg, restParts, {
              ...ctx,
              depth: ctx.depth + 1,
            });
            if (evaluated !== null) {
              out += evaluated;
              i = j;
              continue;
            }
          }
        }

        // 2. Check Magic Words (no args)
        if (restParts.length === 0 && ctx.enableParserFunctions !== false) {
          const magicVal = resolveMagicWord(headTrimmed, ctx);
          if (magicVal !== null) {
            out += magicVal;
            i = j;
            continue;
          }
        }

        // 3. Resolve Transcluded Template / Article from live cache (only when templates-transclusion is active)
        if (ctx.enableTemplates !== false) {
          const expandedHead = expandTemplatesAndFunctions(headTrimmed, {
            ...ctx,
            depth: ctx.depth + 1,
          }).trim();

          const targetPage = resolveTranscludedPage(expandedHead);
          if (targetPage) {
            const loopKey = targetPage.slug.toLowerCase();
            if (ctx.visitedStack.has(loopKey)) {
              out += `<span class="text-red-600 dark:text-red-400 font-mono text-xs">[Ciclo de predefinição detectado: ${escapeHtml(targetPage.title)}]</span>`;
              i = j;
              continue;
            }

            // Expand each argument before substituting so nested {{...}} inside arguments resolve cleanly
            const expandedArgs = restParts.map(arg =>
              expandTemplatesAndFunctions(arg, { ...ctx, depth: ctx.depth + 1 })
            );
            const argsMap = buildArgsMap(expandedArgs);

            let transcludedBody = extractTransclusionBody(targetPage.content);
            transcludedBody = ctx.protectFn(transcludedBody);
            transcludedBody = substituteParameters(transcludedBody, argsMap);

            const nextVisited = new Set(ctx.visitedStack);
            nextVisited.add(loopKey);

            out += expandTemplatesAndFunctions(transcludedBody, {
              ...ctx,
              visitedStack: nextVisited,
              depth: ctx.depth + 1,
            });
            i = j;
            continue;
          }

          // 4. Built-in fallback for {{Aviso|...}} / {{Notice|...}} if Predefinição:Aviso was not seeded
          if (/^(?:Aviso|Notice)$/i.test(expandedHead) && restParts.length > 0) {
            const expandedRest = restParts
              .map(arg => expandTemplatesAndFunctions(arg, { ...ctx, depth: ctx.depth + 1 }))
              .join('|');
            out += `{{Aviso|${expandedRest}}}`;
            i = j;
            continue;
          }

          // 5. Missing template -> authentic MediaWiki red link [[Predefinição:Nome]]
          if (expandedHead) {
            const isMainNsTransclusion = expandedHead.startsWith(':');
            const missingTarget = isMainNsTransclusion
              ? expandedHead.slice(1).trim()
              : `Predefinição:${stripTemplateNamespacePrefix(expandedHead)}`;
            out += `[[${missingTarget}]]`;
          }
          i = j;
          continue;
        }

        // Templates disabled: leave template call untouched
        out += `{{${inner}}}`;
        i = j;
        continue;
      }
    }

    out += input[i];
    i++;
  }

  return out;
}

/**
 * Expands MediaWiki {{subst:Predefinição|...}} calls directly into wikitext upon saving.
 */
export function expandSubstTemplates(wikitext: string, pageTitle?: string): string {
  if (!wikitext || !/\{\{\s*subst:/i.test(wikitext)) {
    return wikitext;
  }

  // Temporarily protect <syntaxhighlight>, <pre>, <nowiki>, and inline backticks
  const literals: string[] = [];
  let protectedText = wikitext
    .replace(/<syntaxhighlight[\s\S]*?<\/syntaxhighlight>/gi, m => {
      const k = `__SUBST_LIT_${literals.length}__`;
      literals.push(m);
      return k;
    })
    .replace(/<pre[\s\S]*?<\/pre>/gi, m => {
      const k = `__SUBST_LIT_${literals.length}__`;
      literals.push(m);
      return k;
    })
    .replace(/<nowiki>[\s\S]*?<\/nowiki>/gi, m => {
      const k = `__SUBST_LIT_${literals.length}__`;
      literals.push(m);
      return k;
    })
    .replace(/`[^`\n]+`/g, m => {
      const k = `__SUBST_LIT_${literals.length}__`;
      literals.push(m);
      return k;
    });

  const dummyCtx: ExpansionContext = {
    existingPages: new Set(),
    options: { pageTitle },
    protectFn: raw => raw,
    visitedStack: new Set(),
    depth: 0,
  };

  let out = '';
  let i = 0;
  while (i < protectedText.length) {
    if (protectedText[i] === '{' && protectedText[i + 1] === '{' && protectedText[i + 2] !== '{') {
      let depth = 2;
      let j = i + 2;
      while (j < protectedText.length && depth > 0) {
        if (protectedText[j] === '{') depth++;
        else if (protectedText[j] === '}') depth--;
        j++;
      }

      if (depth === 0) {
        const inner = protectedText.slice(i + 2, j - 2);
        const parts = splitTopLevel(inner, '|');
        const head = (parts[0] || '').trim();
        const substMatch = head.match(/^subst:\s*([\s\S]+)$/i);

        if (substMatch) {
          const targetName = substMatch[1].trim();
          const restParts = parts.slice(1);

          if (restParts.length === 0) {
            const magicVal = resolveMagicWord(targetName, dummyCtx);
            if (magicVal !== null) {
              out += magicVal;
              i = j;
              continue;
            }
          }

          const targetPage = resolveTranscludedPage(targetName);
          if (targetPage) {
            const argsMap = buildArgsMap(restParts);
            const body = extractTransclusionBody(targetPage.content);
            out += substituteParameters(body, argsMap).trim();
            i = j;
            continue;
          }
        }
      }
    }

    out += protectedText[i];
    i++;
  }

  literals.forEach((orig, idx) => {
    out = out.replaceAll(`__SUBST_LIT_${idx}__`, orig);
  });

  return out;
}

// Lightweight HTML sanitizer permitting safe MediaWiki layout tags while blocking XSS vectors
function sanitizeWikiHtml(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed|form|input|button[^>]*\bon|meta|link|base)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|input|meta|link|base)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript):[\s\S]*?\2/gi, '$1=$2#$2');
}

function parseInlineWikitext(input: string, existingPages: Set<string>): string {
  let text = input;

  // Bold & Italic: '''''text'''''
  text = text.replace(/'''''(.*?)'''''/g, '<strong><em>$1</em></strong>');
  // Bold: '''text'''
  text = text.replace(/'''(.*?)'''/g, '<strong>$1</strong>');
  // Italic: ''text''
  text = text.replace(/''(.*?)''/g, '<em>$1</em>');
  // Strike: <s>text</s>
  text = text.replace(/<s>(.*?)<\/s>/gi, '<del class="line-through text-gray-500">$1</del>');
  // Underline: <u>text</u>
  text = text.replace(/<u>(.*?)<\/u>/gi, '<u class="underline">$1</u>');

  // Internal Links & Media: [[Target]] or [[Target|Label]] or [[Ficheiro:...|thumb|...]]
  text = text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, rawParams) => {
    const rawTarget = target.trim();

    // Check for MediaWiki media syntax: Ficheiro:, File:, Imagem:, Image:
    const mediaMatch = rawTarget.match(/^(?:Ficheiro|File|Imagem|Image):(.*)$/i);
    if (mediaMatch) {
      const fileName = mediaMatch[1].trim();
      const cleanFileName = fileName.replace(/\s+/g, '_');
      const fileTargetSlug = `Ficheiro:${cleanFileName}`;

      const paramsList = rawParams ? rawParams.split('|').map((p: string) => p.trim()) : [];
      let align = 'right';
      let widthStr = '';
      let caption = '';

      paramsList.forEach((param: string) => {
        const lower = param.toLowerCase();
        if (lower === 'thumb' || lower === 'thumbnail' || lower === 'quadro') {
          // default thumb behavior
        } else if (lower === 'left' || lower === 'esquerda') {
          align = 'left';
        } else if (lower === 'right' || lower === 'direita') {
          align = 'right';
        } else if (lower === 'center' || lower === 'centro') {
          align = 'center';
        } else if (lower === 'none' || lower === 'nenhum') {
          align = 'none';
        } else if (/^\d+px$/.test(lower)) {
          widthStr = lower;
        } else {
          caption = param;
        }
      });

      let imgSrc = getCachedFileUrl(cleanFileName) || getCachedFileUrl(fileTargetSlug) || '';
      if (!imgSrc) {
        if (/^(https?:|\/\/|data:)/.test(fileName)) {
          imgSrc = fileName;
        } else if (fileName.includes('image_19fe7a14')) {
          imgSrc = '/assets/aistudio/image_19fe7a14.png';
        } else {
          imgSrc = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f1f3f5"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%236c757d">📁 ${encodeURIComponent(cleanFileName)}</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%23adb5bd">Clique para detalhes do ficheiro</text></svg>`;
        }
      }

      const alignClasses =
        align === 'left'
          ? 'md:float-left md:mr-4 mr-auto ml-0 clear-left'
          : align === 'center'
          ? 'mx-auto clear-both block text-center'
          : align === 'none'
          ? 'inline-block align-top my-1'
          : 'md:float-right md:ml-4 ml-auto mr-0 clear-right';

      const widthStyle = widthStr ? `style="max-width: ${widthStr};"` : 'style="max-width: 320px;"';

      return `<figure class="mw-halign-${align} mw-image-thumb border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800 p-1.5 rounded my-3 ${alignClasses}" ${widthStyle}>
        <a href="#/wiki/${encodeURIComponent(fileTargetSlug)}" class="block overflow-hidden rounded bg-white dark:bg-black/30 text-center cursor-pointer group" title="${escapeHtml(caption || fileName)}">
          <img src="${imgSrc}" alt="${escapeHtml(caption || fileName)}" class="mx-auto h-auto object-contain max-h-80 w-auto rounded group-hover:opacity-95 transition-opacity" />
        </a>
        ${caption ? `<figcaption class="text-xs text-gray-600 dark:text-gray-300 mt-1.5 px-1 leading-snug text-left">${escapeHtml(caption)}</figcaption>` : ''}
      </figure>`;
    }

    const normalizedTarget = rawTarget.replace(/^:/, '').trim();
    const cleanTarget = normalizedTarget.replace(/\s+/g, '_');
    const label = rawParams ? rawParams.trim() : normalizedTarget;

    const pageExists = existingPages.has(cleanTarget) || existingPages.has(normalizedTarget);

    if (pageExists) {
      return `<a href="#/wiki/${encodeURIComponent(cleanTarget)}" class="mw-wiki-link text-[#0645ad] dark:text-[#6ba4ff] hover:underline" data-target="${escapeHtml(cleanTarget)}">${escapeHtml(label)}</a>`;
    } else {
      return `<a href="#/wiki/${encodeURIComponent(cleanTarget)}?action=edit" class="mw-new-link text-[#ba0000] dark:text-[#ff7878] hover:underline cursor-pointer" title="${escapeHtml(normalizedTarget)} (página ainda não criada)" data-target="${escapeHtml(cleanTarget)}">${escapeHtml(label)}</a>`;
    }
  });

  // External & Mailto Links: [https://example.com Label] or [mailto:a@b.com Label]
  text = text.replace(/\[((?:https?:\/\/|mailto:)[^\s\]]+)(?:\s+([^\]]+))?\]/gi, (_, url, label) => {
    const textLabel = label ? label.trim() : url.replace(/^mailto:/i, '');
    const isMailto = /^mailto:/i.test(url);
    return `<a href="${escapeHtml(url)}" ${isMailto ? '' : 'target="_blank" rel="noopener noreferrer" '}class="mw-external-link text-[#3366cc] dark:text-[#729fcf] hover:underline inline-flex items-center gap-0.5"><span>${escapeHtml(textLabel)}</span>${isMailto ? '' : '<span class="text-[10px] opacity-70">↗</span>'}</a>`;
  });

  // Inline code `code` (fallback for any generated dynamically)
  text = text.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 font-mono text-xs">$1</code>'
  );

  return text;
}

function parseLists(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('*')) {
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        result.push(
          '<ul class="list-disc pl-6 my-2 space-y-1 text-gray-800 dark:text-gray-200 text-[14px]">'
        );
        inUl = true;
      }
      const itemContent = line.replace(/^\*+\s*/, '');
      result.push(`<li>${itemContent}</li>`);
    } else if (line.startsWith('#')) {
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        result.push(
          '<ol class="list-decimal pl-6 my-2 space-y-1 text-gray-800 dark:text-gray-200 text-[14px]">'
        );
        inOl = true;
      }
      const itemContent = line.replace(/^#+\s*/, '');
      result.push(`<li>${itemContent}</li>`);
    } else {
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      result.push(line);
    }
  }

  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  return result.join('\n');
}

function parseWikitable(content: string): string {
  const lines = content.split('\n');
  let html =
    '<div class="overflow-x-auto my-4"><table class="wikitable w-full text-left text-xs md:text-sm border-collapse border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900">';
  let inRow = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('|+')) {
      const caption = line.substring(2).trim();
      html += `<caption class="p-2 font-bold text-gray-800 dark:text-gray-200 text-sm">${escapeHtml(caption)}</caption>`;
    } else if (line.startsWith('|-')) {
      if (inRow) html += '</tr>';
      html += '<tr class="border-b border-[#a2a9b1] dark:border-gray-700">';
      inRow = true;
    } else if (line.startsWith('!')) {
      if (!inRow) {
        html += '<tr class="border-b border-[#a2a9b1] dark:border-gray-700">';
        inRow = true;
      }
      const headers = line.substring(1).split('!!');
      headers.forEach(h => {
        html += `<th class="p-2 bg-[#eaecf0] dark:bg-gray-800 font-semibold border-r border-[#a2a9b1] dark:border-gray-700 text-gray-900 dark:text-gray-100">${h.trim()}</th>`;
      });
    } else if (line.startsWith('|') && !line.startsWith('|}')) {
      if (!inRow) {
        html += '<tr class="border-b border-[#a2a9b1] dark:border-gray-700">';
        inRow = true;
      }
      const cells = line.substring(1).split('||');
      cells.forEach(c => {
        html += `<td class="p-2 border-r border-[#a2a9b1] dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900/60">${c.trim()}</td>`;
      });
    }
  }

  if (inRow) html += '</tr>';
  html += '</table></div>';
  return html;
}

const INFOBOX_LABEL_MAP: Record<string, string> = {
  email: 'E-mail',
  'e-mail': 'E-mail',
  'e mail': 'E-mail',
  usuario: 'Usuário',
  'usuário': 'Usuário',
  uid: 'Google UID',
  'google uid': 'Google UID',
  funcao: 'Função',
  'função': 'Função',
  especialidade: 'Especialidade',
  idiomas: 'Idiomas',
  localizacao: 'Localização',
  'localização': 'Localização',
  biografia: 'Biografia',
  contribuicoes: 'Contribuições',
  'contribuições': 'Contribuições',
  projeto: 'Projeto',
  'pagina de discussao': 'Discussão',
  'página de discussão': 'Discussão',
  'registrado em': 'Registrado em',
  versao: 'Versão',
  'versão': 'Versão',
  'versao estavel': 'Versão estável',
  'ultima versao': 'Última versão',
  lancamento: 'Lançamento',
  licenca: 'Licença',
  repositorio: 'Repositório',
  documentacao: 'Documentação',
  descricao: 'Descrição',
  genero: 'Gênero',
  'codigo fonte': 'Código-fonte',
  'sistema operacional': 'Sistema operacional',
  desenvolvedor: 'Desenvolvedor',
  mantenedor: 'Mantenedor',
  autor: 'Autor',
  linguagem: 'Linguagem',
  plataforma: 'Plataforma',
  site: 'Site oficial',
  status: 'Status',
  tipo: 'Tipo',
  nascimento: 'Nascimento',
  falecimento: 'Falecimento',
  nacionalidade: 'Nacionalidade',
  ocupacao: 'Ocupação',
  'ocupação': 'Ocupação',
  capital: 'Capital',
  populacao: 'População',
  'população': 'População',
  area: 'Área',
  'área': 'Área',
  moeda: 'Moeda',
  'idioma oficial': 'Idioma oficial',
  pais: 'País',
  'país': 'País',
  editora: 'Editora',
  isbn: 'ISBN',
  paginas: 'Páginas',
  'páginas': 'Páginas',
  fundacao: 'Fundação',
  'fundação': 'Fundação',
  sede: 'Sede',
  industria: 'Indústria',
  'indústria': 'Indústria',
  direcao: 'Direção',
  'direção': 'Direção',
  duracao: 'Duração',
  'duração': 'Duração',
  'local nascimento': 'Local de nascimento',
  'local falecimento': 'Local de falecimento',
  conjuge: 'Cônjuge',
  'cônjuge': 'Cônjuge',
  filhos: 'Filhos',
  premios: 'Prêmios',
  'prêmios': 'Prêmios',
  lema: 'Lema',
  hino: 'Hino',
  'maior cidade': 'Maior cidade',
  governo: 'Governo',
  pib: 'PIB',
  'fuso horario': 'Fuso horário',
  'fuso horário': 'Fuso horário',
  'codigo iso': 'Código ISO',
  'código iso': 'Código ISO',
  estado: 'Estado',
  densidade: 'Densidade',
  gentilico: 'Gentílico',
  'gentílico': 'Gentílico',
  prefeito: 'Prefeito(a)',
  fundadores: 'Fundadores',
  produtos: 'Produtos',
  receita: 'Receita',
  funcionarios: 'Funcionários',
  'funcionários': 'Funcionários',
  sigla: 'Sigla',
  proposito: 'Propósito',
  'propósito': 'Propósito',
  membros: 'Membros',
  tradutor: 'Tradutor(a)',
  ilustrador: 'Ilustrador(a)',
  roteiro: 'Roteiro',
  elenco: 'Elenco',
  distribuidora: 'Distribuidora',
  artista: 'Artista',
  gravadora: 'Gravadora',
  produtor: 'Produtor(a)',
  publicadora: 'Publicadora',
  diretor: 'Diretor(a)',
  serie: 'Série',
  'série': 'Série',
  modos: 'Modos de jogo',
  reino: 'Reino',
  filo: 'Filo',
  classe: 'Classe',
  ordem: 'Ordem',
  familia: 'Família',
  'família': 'Família',
  especie: 'Espécie',
  'espécie': 'Espécie',
  'nome binomial': 'Nome binomial',
  'estado conservacao': 'Estado de conservação',
  'estado conservação': 'Estado de conservação',
  data: 'Data',
  local: 'Local',
  participantes: 'Participantes',
  resultado: 'Resultado',
  consequencias: 'Consequências',
  'consequências': 'Consequências',
  simbolo: 'Símbolo',
  'símbolo': 'Símbolo',
  'numero atomico': 'Número atômico',
  'número atômico': 'Número atômico',
  'massa atomica': 'Massa atômica',
  'massa atômica': 'Massa atômica',
  'serie quimica': 'Série química',
  'série química': 'Série química',
  grupo: 'Grupo',
  periodo: 'Período',
  'período': 'Período',
  'estado materia': 'Estado da matéria',
  'estado matéria': 'Estado da matéria',
  idioma: 'Idioma',
};

function formatInfoboxValue(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\/[^\s<>]+$/i.test(trimmed)) {
    const safeUrl = escapeHtml(trimmed);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="mw-external-link text-[#3366cc] dark:text-[#729fcf] hover:underline break-all inline-flex items-center justify-end gap-0.5"><span>${safeUrl}</span><span class="text-[10px] opacity-70">↗</span></a>`;
  }
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/i.test(trimmed)) {
    const safeEmail = escapeHtml(trimmed);
    return `<a href="mailto:${safeEmail}" class="text-[#3366cc] dark:text-[#729fcf] hover:underline break-all">${safeEmail}</a>`;
  }
  if (/\[\[[^\]]+\]\]/.test(trimmed) || /__INLINE_CODE_\d+__/.test(trimmed)) {
    return trimmed
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  return escapeHtml(trimmed);
}

function resolveInfoboxImage(rawValue: string): string {
  const cleaned = rawValue.replace(/^\[\[/, '').replace(/\]\]$/, '').split('|')[0].trim();
  const mediaMatch = cleaned.match(/^(?:Ficheiro|File|Imagem|Image):(.*)$/i);
  if (mediaMatch) {
    const fileName = mediaMatch[1].trim().replace(/\s+/g, '_');
    const cached = getCachedFileUrl(fileName) || getCachedFileUrl(`Ficheiro:${fileName}`);
    if (cached) return cached;
    if (fileName.includes('image_19fe7a14')) return '/assets/aistudio/image_19fe7a14.png';
  }
  return cleaned;
}

function parseInfobox(content: string): string {
  const lines = content.split('\n');
  const firstLine = (lines[0] || '').trim().toLowerCase();
  const isUserInfobox =
    firstLine.includes('usuário') || firstLine.includes('usuario') || firstLine.includes('user');

  let title = isUserInfobox ? 'Perfil de Usuário' : 'Informações';
  let subtitle = '';
  let imageSrc = '';
  let imageCaption = '';
  const fields: { key: string; value: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      const parts = trimmed.substring(1).split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/_/g, ' ');
        const value = parts.slice(1).join('=').trim();
        const lowerKey = key.toLowerCase();

        if (!value) continue;

        if (lowerKey === 'nome' || lowerKey === 'título' || lowerKey === 'titulo') {
          title = value;
        } else if (lowerKey === 'subtítulo' || lowerKey === 'subtitulo') {
          subtitle = value;
        } else if (
          lowerKey === 'logo' ||
          lowerKey === 'logotipo' ||
          lowerKey === 'imagem' ||
          lowerKey === 'foto' ||
          lowerKey === 'avatar'
        ) {
          imageSrc = resolveInfoboxImage(value);
        } else if (lowerKey === 'legenda' || lowerKey === 'legenda imagem') {
          imageCaption = value;
        } else {
          const displayKey =
            INFOBOX_LABEL_MAP[lowerKey] || key.charAt(0).toUpperCase() + key.slice(1);
          fields.push({ key: displayKey, value });
        }
      }
    }
  }

  let html = `
    <div class="infobox float-none md:float-right md:ml-6 mb-4 w-full md:w-80 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800 p-3 shadow-xs text-xs">
      <div class="${isUserInfobox ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800' : 'bg-[#eaecf0] dark:bg-gray-700'} p-2 font-serif font-bold text-center text-sm text-gray-900 dark:text-gray-100 rounded-t mb-2">
        <div>${escapeHtml(title)}</div>
        ${subtitle ? `<div class="text-[11px] font-sans font-normal text-gray-600 dark:text-gray-300 mt-0.5">${escapeHtml(subtitle)}</div>` : ''}
      </div>
      ${imageSrc ? `
        <div class="my-2 p-2 bg-white dark:bg-black rounded border border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(title)}" referrerpolicy="no-referrer" class="${isUserInfobox ? 'w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700' : 'max-h-28 object-contain'}" />
          ${imageCaption ? `<div class="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 text-center">${escapeHtml(imageCaption)}</div>` : ''}
        </div>
      ` : ''}
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
  `;

  for (const field of fields) {
    html += `
      <div class="py-1.5 flex justify-between gap-2">
        <span class="font-semibold text-gray-600 dark:text-gray-400 w-2/5 break-words">${escapeHtml(field.key)}</span>
        <span class="text-gray-900 dark:text-gray-100 w-3/5 text-right break-words">${formatInfoboxValue(field.value)}</span>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function slugify(text: string): string {
  return text
    .trim()
    .replace(/[\s/]+/g, '_')
    .replace(/[^\w\u00C0-\u024F_:.()-]/g, '');
}
