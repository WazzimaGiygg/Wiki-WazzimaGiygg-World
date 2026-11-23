import { ExtensionDefinition } from './types';
import {
  parserFunctionsExtension,
  citeExtension,
  mathExtension,
  syntaxHighlightExtension,
  scribuntoExtension,
  dynamicPageListExtension,
  templatesTransclusionExtension,
  wikitableParserExtension,
  autoTocExtension,
  wikiSignaturesExtension,
} from './parserExtensions';
import {
  visualEditorExtension,
  wikiEditorExtension,
  uploadWizardExtension,
  liveDiffExtension,
  googleSearchGroundingExtension,
} from './mediaExtensions';
import { echoExtension, checkUserExtension, abuseFilterExtension } from './adminExtensions';
import {
  vectorModernSkinExtension,
  timelessSkinExtension,
  mobileFrontendExtension,
  footerBadgesExtension,
} from './skinExtensions';
import { actionApiExtension, graphQlApiExtension } from './apiExtensions';
import {
  talkPagesExtension,
  revisionHistoryExtension,
  recentChangesExtension,
  allPagesIndexExtension,
  pageWatchlistExtension,
  pageProtectionExtension,
  randomPageExtension,
  globalSearchExtension,
  printableVersionExtension,
  lgpdPrivacySuiteExtension,
  arbcomUcocGovernanceExtension,
  githubSyncExtension,
  seoManagerExtension,
  pwaAppExtension,
  pushNotificationsExtension,
} from './featureExtensions';

/**
 * ========================================================================
 * REGISTRO CENTRAL DE EXTENSÕES DO CÓDIGO (src/extensions)
 * ========================================================================
 * Todos os recursos da Wiki são registráveis e alternáveis como extensões,
 * vindo ativados por padrão (defaultActive: true).
 */
export const CODEBASE_EXTENSIONS: ExtensionDefinition[] = [
  // Analisadores / Parsers
  parserFunctionsExtension,
  citeExtension,
  mathExtension,
  syntaxHighlightExtension,
  scribuntoExtension,
  dynamicPageListExtension,
  templatesTransclusionExtension,
  wikitableParserExtension,
  autoTocExtension,
  wikiSignaturesExtension,

  // Mídia e Edição
  visualEditorExtension,
  wikiEditorExtension,
  uploadWizardExtension,
  liveDiffExtension,
  googleSearchGroundingExtension,

  // Administração, Colaboração e Segurança
  echoExtension,
  checkUserExtension,
  abuseFilterExtension,
  talkPagesExtension,
  revisionHistoryExtension,
  recentChangesExtension,
  pageWatchlistExtension,
  pageProtectionExtension,
  lgpdPrivacySuiteExtension,
  arbcomUcocGovernanceExtension,
  pushNotificationsExtension,

  // Temas e Skins
  vectorModernSkinExtension,
  timelessSkinExtension,
  mobileFrontendExtension,
  footerBadgesExtension,
  printableVersionExtension,
  pwaAppExtension,

  // APIs, Busca e Conectividade
  actionApiExtension,
  graphQlApiExtension,
  allPagesIndexExtension,
  randomPageExtension,
  globalSearchExtension,
  githubSyncExtension,
  seoManagerExtension,
];

export function getCodebaseExtensions(): ExtensionDefinition[] {
  return [...CODEBASE_EXTENSIONS];
}

export * from './types';

