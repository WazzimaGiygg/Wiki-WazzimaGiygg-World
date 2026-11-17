export const WIKI_SITE_VERSION = 'WC1.16.C7.1';
export const WIKI_SITE_NAME = 'WikiWazzimaGiygg';
export const WIKI_SITE_DOMAIN = 'core.wazzimagiygg.com';
export const WIKI_VERSION_LABEL = `Wiki-Site ${WIKI_SITE_VERSION}`;

export const WIKI_VERSION_INFO = {
  version: WIKI_SITE_VERSION,
  series: 'WC1.16',
  buildCode: 'C7.1',
  siteName: WIKI_SITE_NAME,
  domain: WIKI_SITE_DOMAIN,
  engine: 'WikiWazzimaGiygg TS (MediaWiki + Firebase Firestore)',
  license: 'GPL-2.0-or-later',
} as const;
