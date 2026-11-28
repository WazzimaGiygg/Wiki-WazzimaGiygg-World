import { expandWikitextTemplates } from '../services/templateService';
import { ParseWikitextOptions } from './parser';

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface AtomicToken {
  placeholder: string;
  raw: string;
  html: string;
  isBlock: boolean;
}

/**
 * Finds balanced {{...}} blocks (skipping {{{...}}}).
 */
function extractBalancedCurlyBlocks(
  input: string,
  createToken: (raw: string, isBlock: boolean) => string,
  isBlockTemplate: (raw: string) => boolean
): string {
  let out = '';
  let i = 0;

  while (i < input.length) {
    if (input[i] === '{' && input[i + 1] === '{' && input[i + 2] === '{') {
      let depth = 3;
      let j = i + 3;
      while (j < input.length && depth > 0) {
        if (input[j] === '{') depth++;
        else if (input[j] === '}') depth--;
        j++;
      }
      const raw = input.slice(i, j);
      out += createToken(raw, false);
      i = j;
      continue;
    }

    if (input[i] === '{' && input[i + 1] === '{') {
      let depth = 2;
      let j = i + 2;
      while (j < input.length && depth > 0) {
        if (input[j] === '{') depth++;
        else if (input[j] === '}') depth--;
        j++;
      }
      if (depth === 0) {
        const raw = input.slice(i, j);
        out += createToken(raw, isBlockTemplate(raw));
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
 * Converts MediaWiki wikitext into interactive formatted HTML where prose, headings, lists,
 * bold/italic/underline/strike, and links are directly editable via contentEditable, while
 * templates ({{...}}), Infoboxes, Wikitables, code blocks, categories, files, and <ref> tags
 * render live inside lossless atomic widgets (data-mw-raw) so source wikitext is never corrupted.
 */
export function wikitextToFormattedHtml(
  wikitext: string,
  existingPages: Set<string>,
  options?: ParseWikitextOptions
): string {
  if (!wikitext.trim()) {
    return '<p><br></p>';
  }

  const tokens: AtomicToken[] = [];

  const renderAtomicHtml = (raw: string, isBlock: boolean, customLabel?: string): string => {
    const encoded = encodeURIComponent(raw);
    if (customLabel) {
      return isBlock
        ? `<div contenteditable="false" data-mw-raw="${encoded}" class="mw-atomic-block my-2 select-none">${customLabel}</div>`
        : `<span contenteditable="false" data-mw-raw="${encoded}" class="mw-atomic-inline inline-flex items-center select-none">${customLabel}</span>`;
    }

    const expanded = expandWikitextTemplates(raw, existingPages, options);
    const rendered = expanded.html.trim();

    if (isBlock) {
      return `<div contenteditable="false" data-mw-raw="${encoded}" class="mw-atomic-block my-2 rounded border border-dashed border-indigo-300/70 dark:border-indigo-700/70 p-1.5 bg-indigo-50/20 dark:bg-indigo-950/10 select-none" title="Bloco MediaWiki sincronizado (edite os parâmetros no painel de código)">${rendered || `<code>${escapeHtmlText(raw)}</code>`}</div>`;
    }
    return `<span contenteditable="false" data-mw-raw="${encoded}" class="mw-atomic-inline inline-block align-baseline rounded px-0.5 border border-dashed border-indigo-300/70 dark:border-indigo-700/70 bg-indigo-50/30 dark:bg-indigo-950/20 select-none" title="Elemento MediaWiki sincronizado">${rendered || `<code>${escapeHtmlText(raw)}</code>`}</span>`;
  };

  const pushToken = (raw: string, isBlock: boolean, customLabel?: string): string => {
    const idx = tokens.length;
    const placeholder = `@@MWATOMIC_${idx}@@`;
    tokens.push({
      placeholder,
      raw,
      html: renderAtomicHtml(raw, isBlock, customLabel),
      isBlock,
    });
    return placeholder;
  };

  let text = wikitext;

  // 1. Code, pre, nowiki, math blocks
  text = text.replace(
    /<syntaxhighlight(?:\s+lang="([^"]*)")?\s*>[\s\S]*?<\/syntaxhighlight>/gi,
    raw => pushToken(raw, true)
  );
  text = text.replace(/<pre(?:\s+[^>]*)?>[\s\S]*?<\/pre>/gi, raw => pushToken(raw, true));
  text = text.replace(/<nowiki>[\s\S]*?<\/nowiki>/gi, raw =>
    pushToken(
      raw,
      false,
      `<span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 font-mono text-[11px] text-gray-700 dark:text-gray-300">${escapeHtmlText(raw)}</span>`
    )
  );
  text = text.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, raw =>
    pushToken(
      raw,
      false,
      `<code class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[11px] text-pink-600 dark:text-pink-400">${escapeHtmlText(raw.replace(/^<code[^>]*>|<\/code>$/gi, ''))}</code>`
    )
  );
  text = text.replace(/<math>[\s\S]*?<\/math>/gi, raw => pushToken(raw, false));

  // 2. Transclusion control tags (<includeonly>, <noinclude>, <onlyinclude>)
  text = text.replace(/<\/?(?:includeonly|noinclude|onlyinclude)>/gi, raw =>
    pushToken(
      raw,
      false,
      `<span class="px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-mono text-[10px]">${escapeHtmlText(raw)}</span>`
    )
  );

  // 3. References <ref>...</ref> and <references />
  text = text.replace(/<ref(?:\s+[^>]*)?>([\s\S]*?)<\/ref>/gi, (raw, inner) =>
    pushToken(
      raw,
      false,
      `<sup class="px-1 py-0.2 mx-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0645ad] dark:text-[#6ba4ff] font-mono text-[10px] border border-blue-200 dark:border-blue-800" title="${escapeHtmlAttr(inner.trim())}">[ref]</sup>`
    )
  );
  text = text.replace(/<references\s*\/?>/gi, raw =>
    pushToken(
      raw,
      true,
      `<div class="p-2 rounded border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 text-[11px] font-mono text-blue-800 dark:text-blue-200">&lt;references /&gt; (Lista automática de notas de rodapé)</div>`
    )
  );

  // 4. Wikitables {| ... |}
  text = text.replace(/\{\|[\s\S]*?\|\}/g, raw => pushToken(raw, true));

  // 5. Templates, Infoboxes, ParserFunctions, Magic Words {{...}}
  const inlineTemplateNames = /^(?:sim|não|nao|parcial|atalho|pagename|sitename|currentyear|currentmonth|currentday|currentdate|numberofpages|versão|versao|!|lc:|uc:|lcfirst:|ucfirst:|#expr:)/i;
  text = extractBalancedCurlyBlocks(
    text,
    (raw, isBlock) => pushToken(raw, isBlock),
    raw => {
      const inner = raw.slice(2, -2).trim();
      if (raw.includes('\n')) return true;
      if (inlineTemplateNames.test(inner)) return false;
      if (/^(?:infobox|aviso|notice|info|nota|atenção|atencao|ambox|esboço|esboco|carece_de_fontes|atualizar|citação|citacao|portal|reflist)\b/i.test(inner)) {
        return true;
      }
      return inner.length > 35;
    }
  );

  // 6. Categories [[Categoria:...]] and Media [[Ficheiro:...]]
  text = text.replace(
    /\[\[\s*(?:Categoria|Category)\s*:\s*([^\]|]+?)(?:\s*\|[^\]]*)?\s*\]\]/gi,
    (raw, cat) => {
      const cleanCat = cat.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
      return pushToken(
        raw,
        false,
        `<span class="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">Categoria: ${escapeHtmlText(cleanCat)}</span>`
      );
    }
  );
  text = text.replace(/\[\[(?:Ficheiro|File|Imagem|Image):[^\]]+\]\]/gi, raw => pushToken(raw, true));

  // 7. Escape remaining HTML characters in plain text before converting inline wikitext
  // Keep <u> and <s> tags valid by tokenizing them first
  const inlineTagTokens: Array<{ key: string; html: string }> = [];
  text = text.replace(/<u>([\s\S]*?)<\/u>/gi, (_, inner) => {
    const k = `@@U_${inlineTagTokens.length}@@`;
    inlineTagTokens.push({ key: k, html: `<u>${escapeHtmlText(inner)}</u>` });
    return k;
  });
  text = text.replace(/<s>([\s\S]*?)<\/s>/gi, (_, inner) => {
    const k = `@@S_${inlineTagTokens.length}@@`;
    inlineTagTokens.push({ key: k, html: `<s>${escapeHtmlText(inner)}</s>` });
    return k;
  });

  // 8. Parse block structure line-by-line (headings, lists, paragraphs)
  const lines = text.split('\n');
  const htmlBlocks: string[] = [];
  let inUl = false;
  let inOl = false;
  let paraBuffer: string[] = [];

  const formatInline = (line: string): string => {
    let out = escapeHtmlText(line);

    // Restore <u> and <s>
    inlineTagTokens.forEach(t => {
      out = out.replaceAll(t.key, t.html);
    });

    // Inline code `...`
    out = out.replace(/`([^`\n]+)`/g, (_, code) => `<code>${code}</code>`);

    // Bold+Italic, Bold, Italic
    out = out.replace(/'''''(.*?)'''''/g, '<strong><em>$1</em></strong>');
    out = out.replace(/'''(.*?)'''/g, '<strong>$1</strong>');
    out = out.replace(/''(.*?)''/g, '<em>$1</em>');

    // Internal wiki links [[Target]] or [[Target|Label]]
    out = out.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      const cleanTarget = target.trim();
      const normalizedTarget = cleanTarget.replace(/^:/, '').trim();
      const displayLabel = (label || normalizedTarget).trim();
      const slug = normalizedTarget.replace(/\s+/g, '_');
      const exists = existingPages.has(slug) || existingPages.has(normalizedTarget);
      return `<a href="#/wiki/${encodeURIComponent(slug)}" data-mw-link="${escapeHtmlAttr(cleanTarget)}" class="${
        exists
          ? 'text-[#0645ad] dark:text-[#6ba4ff] underline'
          : 'text-[#ba0000] dark:text-[#ff7878] underline'
      }">${displayLabel}</a>`;
    });

    // External links [https://... Label]
    out = out.replace(/\[((?:https?:\/\/|mailto:)[^\s\]]+)(?:\s+([^\]]+))?\]/gi, (_, url, label) => {
      const displayLabel = (label || url).trim();
      return `<a href="${escapeHtmlAttr(url)}" data-mw-ext="${escapeHtmlAttr(url)}" class="text-[#3366cc] dark:text-[#729fcf] underline">${displayLabel}</a>`;
    });

    return out;
  };

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    const joined = paraBuffer.join('<br>').trim();
    if (joined) {
      // If paragraph consists solely of atomic block placeholders, emit directly without <p>
      const trimmedOnlyTokens = paraBuffer.every(l => /^@@MWATOMIC_\d+@@$/.test(l.trim()));
      const allBlocks =
        trimmedOnlyTokens &&
        paraBuffer.every(l => {
          const match = l.trim().match(/^@@MWATOMIC_(\d+)@@$/);
          return match ? tokens[Number(match[1])]?.isBlock : false;
        });

      if (allBlocks) {
        htmlBlocks.push(paraBuffer.map(l => formatInline(l)).join(''));
      } else {
        htmlBlocks.push(`<p>${formatInline(paraBuffer.join('\n')).replace(/\n/g, '<br>')}</p>`);
      }
    }
    paraBuffer = [];
  };

  const closeLists = () => {
    if (inUl) {
      htmlBlocks.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      htmlBlocks.push('</ol>');
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushPara();
      closeLists();
      continue;
    }

    // Atomic single-line block token
    const soloAtomic = trimmed.match(/^@@MWATOMIC_(\d+)@@$/);
    if (soloAtomic && tokens[Number(soloAtomic[1])]?.isBlock) {
      flushPara();
      closeLists();
      htmlBlocks.push(trimmed);
      continue;
    }

    // Headings = ... =
    const headingMatch = trimmed.match(/^(={1,4})\s*(.*?)\s*\1$/);
    if (headingMatch) {
      flushPara();
      closeLists();
      const lvl = headingMatch[1].length;
      htmlBlocks.push(`<h${lvl}>${formatInline(headingMatch[2])}</h${lvl}>`);
      continue;
    }

    // Bullet list *
    if (/^\*+\s*/.test(rawLine)) {
      flushPara();
      if (inOl) {
        htmlBlocks.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        htmlBlocks.push('<ul>');
        inUl = true;
      }
      const itemText = rawLine.replace(/^\*+\s*/, '');
      htmlBlocks.push(`<li>${formatInline(itemText)}</li>`);
      continue;
    }

    // Numbered list #
    if (/^#+\s*/.test(rawLine)) {
      flushPara();
      if (inUl) {
        htmlBlocks.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        htmlBlocks.push('<ol>');
        inOl = true;
      }
      const itemText = rawLine.replace(/^#+\s*/, '');
      htmlBlocks.push(`<li>${formatInline(itemText)}</li>`);
      continue;
    }

    closeLists();
    paraBuffer.push(rawLine);
  }

  flushPara();
  closeLists();

  let html = htmlBlocks.join('\n');

  // 9. Restore all atomic widgets
  tokens.forEach(tok => {
    html = html.replaceAll(tok.placeholder, tok.html);
  });

  return html || '<p><br></p>';
}

/**
 * Serializes the edited formatted DOM inside the contentEditable pane back into clean MediaWiki wikitext.
 */
export function formattedHtmlToWikitext(root: HTMLElement): string {
  const serializeInlineChildren = (node: Node): string => {
    let out = '';
    node.childNodes.forEach(child => {
      out += serializeNode(child, true);
    });
    return out;
  };

  const serializeNode = (node: Node, inlineContext = false): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || '').replace(/\u00a0/g, ' ');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as HTMLElement;

    // Lossless atomic MediaWiki element
    const rawEncoded = el.getAttribute('data-mw-raw');
    if (rawEncoded !== null) {
      const raw = decodeURIComponent(rawEncoded);
      const isBlock = el.classList.contains('mw-atomic-block');
      return isBlock && !inlineContext ? `${raw}\n\n` : raw;
    }

    const tag = el.tagName.toUpperCase();

    if (tag === 'BR') {
      return '\n';
    }

    if (tag === 'H1') {
      const txt = serializeInlineChildren(el).trim();
      return txt ? `= ${txt} =\n\n` : '';
    }
    if (tag === 'H2') {
      const txt = serializeInlineChildren(el).trim();
      return txt ? `== ${txt} ==\n\n` : '';
    }
    if (tag === 'H3') {
      const txt = serializeInlineChildren(el).trim();
      return txt ? `=== ${txt} ===\n\n` : '';
    }
    if (tag === 'H4') {
      const txt = serializeInlineChildren(el).trim();
      return txt ? `==== ${txt} ====\n\n` : '';
    }

    if (tag === 'B' || tag === 'STRONG') {
      // Check if single child is I/EM for '''''...'''''
      if (
        el.childNodes.length === 1 &&
        el.firstElementChild &&
        ['I', 'EM'].includes(el.firstElementChild.tagName.toUpperCase())
      ) {
        const inner = serializeInlineChildren(el.firstElementChild);
        return inner ? `'''''${inner}'''''` : '';
      }
      const inner = serializeInlineChildren(el);
      return inner ? `'''${inner}'''` : '';
    }

    if (tag === 'I' || tag === 'EM') {
      if (
        el.childNodes.length === 1 &&
        el.firstElementChild &&
        ['B', 'STRONG'].includes(el.firstElementChild.tagName.toUpperCase())
      ) {
        const inner = serializeInlineChildren(el.firstElementChild);
        return inner ? `'''''${inner}'''''` : '';
      }
      const inner = serializeInlineChildren(el);
      return inner ? `''${inner}''` : '';
    }

    if (tag === 'U') {
      const inner = serializeInlineChildren(el);
      return inner ? `<u>${inner}</u>` : '';
    }

    if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') {
      const inner = serializeInlineChildren(el);
      return inner ? `<s>${inner}</s>` : '';
    }

    if (tag === 'CODE') {
      const inner = serializeInlineChildren(el);
      return inner ? `\`${inner}\`` : '';
    }

    if (tag === 'A') {
      const mwTarget = el.getAttribute('data-mw-link');
      const label = serializeInlineChildren(el).trim();
      if (mwTarget) {
        return mwTarget === label || mwTarget.replace(/_/g, ' ') === label
          ? `[[${mwTarget}]]`
          : `[[${mwTarget}|${label}]]`;
      }
      const extUrl = el.getAttribute('data-mw-ext') || el.getAttribute('href') || '';
      if (extUrl && /^(https?:\/\/|mailto:)/i.test(extUrl)) {
        return label && label !== extUrl ? `[${extUrl} ${label}]` : `[${extUrl}]`;
      }
      return label;
    }

    if (tag === 'UL') {
      const lines: string[] = [];
      el.childNodes.forEach(li => {
        if (li.nodeType === Node.ELEMENT_NODE && (li as HTMLElement).tagName.toUpperCase() === 'LI') {
          const itemTxt = serializeInlineChildren(li).replace(/\n+/g, ' ').trim();
          if (itemTxt) lines.push(`* ${itemTxt}`);
        }
      });
      return lines.length > 0 ? lines.join('\n') + '\n\n' : '';
    }

    if (tag === 'OL') {
      const lines: string[] = [];
      el.childNodes.forEach(li => {
        if (li.nodeType === Node.ELEMENT_NODE && (li as HTMLElement).tagName.toUpperCase() === 'LI') {
          const itemTxt = serializeInlineChildren(li).replace(/\n+/g, ' ').trim();
          if (itemTxt) lines.push(`# ${itemTxt}`);
        }
      });
      return lines.length > 0 ? lines.join('\n') + '\n\n' : '';
    }

    if (tag === 'P' || tag === 'DIV' || tag === 'BLOCKQUOTE') {
      const inner = serializeInlineChildren(el).replace(/\n+$/, '');
      if (!inner.trim()) return '\n';
      return `${inner}\n\n`;
    }

    return serializeInlineChildren(el);
  };

  let rawResult = '';
  root.childNodes.forEach(child => {
    rawResult += serializeNode(child, false);
  });

  return rawResult.replace(/\n{3,}/g, '\n\n').trimEnd();
}
