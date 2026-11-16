import { WikiPage } from '../types/wiki';

export const CANONICAL_BASE_URL = 'https://core.wazzimagiygg.com';

export const SITE_SEO_METADATA = {
  siteName: 'WikiWazzimaGiygg',
  domain: 'core.wazzimagiygg.com',
  canonicalBase: CANONICAL_BASE_URL,
  verificationToken: 'i5qQwLoe2XPTLGPmDKsTiWL8OIVGH0iuuH1qrNj7hKU',
  verificationFile: 'googled647acff88367322.html',
  defaultTitle: 'WikiWazzimaGiygg – Enciclopédia Livre Oficial | core.wazzimagiygg.com',
  defaultDescription:
    'WikiWazzimaGiygg (core.wazzimagiygg.com) é a enciclopédia livre oficial e motor de conhecimento em TypeScript, React e Firestore com artigos, manuais técnicos e sintaxe wikitexto.',
  logoUrl: `${CANONICAL_BASE_URL}/assets/aistudio/image_19fe7a14.png`,
};

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkTag(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function stripWikitextPreview(raw: string): string {
  return raw
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/['=*#[\]{}|`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCanonicalPageUrl(slug: string): string {
  if (!slug || slug === 'Página_principal') {
    return `${CANONICAL_BASE_URL}/`;
  }
  return `${CANONICAL_BASE_URL}/#/wiki/${encodeURIComponent(slug)}`;
}

export function updateDocumentSEO(slug: string, page: WikiPage | null): void {
  const isHome = !slug || slug === 'Página_principal';
  const displayTitle = page?.title || slug.replace(/_/g, ' ');
  const canonicalUrl = getCanonicalPageUrl(slug);

  const pageTitle = isHome
    ? SITE_SEO_METADATA.defaultTitle
    : `${displayTitle} – WikiWazzimaGiygg | core.wazzimagiygg.com`;

  const rawText = page?.summary || (page?.content ? stripWikitextPreview(page.content) : '');
  const description = isHome
    ? SITE_SEO_METADATA.defaultDescription
    : rawText
    ? `${rawText.slice(0, 145)}${rawText.length > 145 ? '...' : ''} — Fonte oficial em core.wazzimagiygg.com.`
    : `Leia "${displayTitle}" na enciclopédia livre oficial WikiWazzimaGiygg em core.wazzimagiygg.com.`;

  document.title = pageTitle;
  upsertLinkTag('canonical', canonicalUrl);
  upsertMetaTag('name', 'description', description);

  upsertMetaTag('property', 'og:title', pageTitle);
  upsertMetaTag('property', 'og:description', description);
  upsertMetaTag('property', 'og:url', canonicalUrl);
  upsertMetaTag('property', 'og:site_name', SITE_SEO_METADATA.siteName);

  upsertMetaTag('name', 'twitter:title', pageTitle);
  upsertMetaTag('name', 'twitter:description', description);
  upsertMetaTag('name', 'twitter:url', canonicalUrl);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': isHome ? 'WebPage' : 'Article',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: displayTitle,
        headline: displayTitle,
        description,
        inLanguage: 'pt-BR',
        isPartOf: {
          '@id': `${CANONICAL_BASE_URL}/#website`,
        },
        publisher: {
          '@id': `${CANONICAL_BASE_URL}/#organization`,
        },
        ...(page?.updatedAt ? { dateModified: page.updatedAt } : {}),
        ...(page?.createdAt ? { datePublished: page.createdAt } : {}),
        ...(page?.author
          ? {
              author: {
                '@type': 'Person',
                name: page.author,
              },
            }
          : {}),
        ...(page?.categories && page.categories.length > 0
          ? { keywords: page.categories.join(', ') }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'WikiWazzimaGiygg (core.wazzimagiygg.com)',
            item: `${CANONICAL_BASE_URL}/`,
          },
          ...(!isHome
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: displayTitle,
                  item: canonicalUrl,
                },
              ]
            : []),
        ],
      },
    ],
  };

  let scriptEl = document.getElementById('wiki-dynamic-jsonld') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'wiki-dynamic-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLd);
}
