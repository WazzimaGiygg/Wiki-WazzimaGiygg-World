import { ExtensionDefinition } from './types';

export const visualEditorExtension: ExtensionDefinition = {
  id: 'visual-editor',
  name: 'VisualEditor (Lado a Lado & Formatado)',
  category: 'media',
  version: '0.2.0-ts',
  authors: ['Trevor Parscal', 'Inez Korczyński', 'Roan Kattouw'],
  description: 'Habilita a edição formatada interativa e o modo Lado a Lado (código wikitexto + edição formatada sincronizada) no editor de artigos.',
  url: 'https://www.mediawiki.org/wiki/Extension:VisualEditor',
  gitTag: 'REL1_42-ts',
  license: 'MIT',
  hooks: ['CustomEditor', 'BeforePageDisplay'],
  exampleWikitext: 'Edição lado a lado com sincronização instantânea entre código wikitexto e visualização formatada.',
  defaultActive: true,
  installedVia: 'code',
};

export const wikiEditorExtension: ExtensionDefinition = {
  id: 'wiki-editor',
  name: 'WikiEditor (Barra de Ferramentas)',
  category: 'media',
  version: '0.5.1-ts',
  authors: ['Trevor Parscal', 'Roan Kattouw', 'Nimish Gautam'],
  description: 'Barra de ferramentas visual acima do editor com formatação de texto, construtor de links, atalhos de teclado e guia rápido para novos editores.',
  url: 'https://www.mediawiki.org/wiki/Extension:WikiEditor',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['EditPage::showEditForm:initial'],
  exampleWikitext: "'''Texto em negrito''', ''texto em itálico'' e ligações rápidas [[Página]].",
  defaultActive: true,
  installedVia: 'code',
};

export const uploadWizardExtension: ExtensionDefinition = {
  id: 'upload-wizard',
  name: 'UploadWizard',
  category: 'media',
  version: '2.1.0-ts',
  authors: ['Neil Kandalgaonkar', 'Mark Holmquist', 'Equipe WikiWazzimaGiygg'],
  description: 'Assistente oficial de envio de arquivos e upload de imagens para a wiki (Especial:Carregar_arquivo e botão de imagem no editor).',
  url: 'https://www.mediawiki.org/wiki/Extension:UploadWizard',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['UploadComplete', 'BeforePageDisplay', 'SpecialUpload::execute'],
  exampleWikitext: '[[Ficheiro:Exemplo_logo.png|thumb|Legenda da imagem carregada na wiki]]',
  defaultActive: true,
  installedVia: 'code',
  config: {
    blazePlanEnabled: false,
    maxUploadSizeMB: 10,
    allowedFormats: ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'],
  },
};

export const liveDiffExtension: ExtensionDefinition = {
  id: 'live-diff',
  name: 'Pré-visualização & Comparador Diff',
  category: 'media',
  version: '1.1.0-ts',
  authors: ['MediaWiki Core', 'Equipe WikiWazzimaGiygg'],
  description: 'Disponibiliza os painéis de pré-visualização completa do artigo e comparação linha a linha (Diff) antes de publicar alterações.',
  url: 'https://www.mediawiki.org/wiki/Help:Diff',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['EditPageGetPreviewContent', 'DifferenceEngineViewHeader'],
  exampleWikitext: 'Compare alterações antes de gravar no histórico de revisões.',
  defaultActive: true,
  installedVia: 'code',
};

export const googleSearchGroundingExtension: ExtensionDefinition = {
  id: 'google-search-grounding',
  name: 'Fontes Google Search (Grounding)',
  category: 'media',
  version: '1.0.0-ts',
  authors: ['Equipe WikiWazzimaGiygg'],
  description: 'Integra pesquisa de fontes atualizadas na Web dentro do editor de artigos e da barra de busca global para citação rápida com <ref>.',
  url: 'https://www.mediawiki.org/wiki/Extension:Cite',
  gitTag: 'REL1_42-ts',
  license: 'MIT',
  hooks: ['EditPage::showEditForm:initial', 'SearchResultsPrepend'],
  exampleWikitext: 'Pesquise fontes confiáveis na web e insira referências bibliográficas com 1 clique.',
  defaultActive: true,
  installedVia: 'code',
};


