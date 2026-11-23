import { ExtensionDefinition } from './types';

export const vectorModernSkinExtension: ExtensionDefinition = {
  id: 'skin-vector-2022',
  name: 'Skin: Vector Moderno (2022)',
  category: 'skin',
  version: '1.42.0-ts',
  authors: ['Wikimedia Design Team', 'MediaWiki Web Team'],
  description: 'O tema padrão do MediaWiki e da Wikipédia moderna, com tipografia aprimorada, índice fixo retrátil e layout flexível.',
  url: 'https://www.mediawiki.org/wiki/Skin:Vector/2022',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['SkinTemplateNavigation::Universal', 'SkinPageReady'],
  exampleWikitext: 'Layout responsivo padrão da WikiWazzimaGiygg com suporte a abas de histórico e edição.',
  defaultActive: true,
  installedVia: 'code',
};

export const timelessSkinExtension: ExtensionDefinition = {
  id: 'skin-timeless',
  name: 'Skin: Clássico (Vector Legacy / Timeless)',
  category: 'skin',
  version: '1.0.0-ts',
  authors: ['Isarra Yos', 'MediaWiki Community'],
  description: 'Tema clássico em caixas inspirado no layout tradicional Vector/Monobook da década de 2010.',
  url: 'https://www.mediawiki.org/wiki/Skin:Timeless',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['SkinTemplateNavigation'],
  exampleWikitext: 'Visual clássico em moldura com navegação lateral destacada.',
  defaultActive: true,
  installedVia: 'code',
};

export const mobileFrontendExtension: ExtensionDefinition = {
  id: 'mobile-frontend',
  name: 'MobileFrontend & Modo Escuro',
  category: 'skin',
  version: '2.3.0-ts',
  authors: ['Patrick Reilly', 'Max Semenik', 'Jon Robson'],
  description: 'Otimização responsiva para dispositivos móveis e seletor de tema Modo Escuro no cabeçalho e rodapé.',
  url: 'https://www.mediawiki.org/wiki/Extension:MobileFrontend',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['EnterMobileMode', 'BeforePageDisplayMobile'],
  exampleWikitext: 'Adaptação responsiva e alternância para Modo Escuro.',
  defaultActive: true,
  installedVia: 'code',
};

export const footerBadgesExtension: ExtensionDefinition = {
  id: 'footer-badges',
  name: 'Selos & Chamadas do Rodapé (88x31)',
  category: 'skin',
  version: '1.0.0-ts',
  authors: ['Equipe WikiWazzimaGiygg'],
  description: 'Exibe os selos 88x31, a frase principal da Wiki e a chamada do Dossiê LGPD no rodapé institucional.',
  url: 'https://www.mediawiki.org/wiki/Manual:Footer',
  gitTag: 'REL1_42-ts',
  license: 'MIT',
  hooks: ['SkinAddFooterLinks'],
  exampleWikitext: 'Selos oficiais WikiWazzimaGiygg, CC BY-SA 4.0 e Firebase no rodapé.',
  defaultActive: true,
  installedVia: 'code',
};

