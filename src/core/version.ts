export const WIKI_SITE_VERSION = 'W1.16.6J.1';
export const WIKI_SITE_NAME = 'WikiWazzimaGiygg';
export const WIKI_SITE_DOMAIN = 'core.wazzimagiygg.com';
export const WIKI_VERSION_LABEL = `Wiki-Site ${WIKI_SITE_VERSION}`;

export const WIKI_VERSION_INFO = {
  version: WIKI_SITE_VERSION,
  series: 'W1.16',
  buildCode: '6J.1',
  siteName: WIKI_SITE_NAME,
  domain: WIKI_SITE_DOMAIN,
  engine: 'WikiWazzimaGiygg TS (MediaWiki + Firebase Firestore)',
  license: 'GPL-2.0-or-later',
} as const;
