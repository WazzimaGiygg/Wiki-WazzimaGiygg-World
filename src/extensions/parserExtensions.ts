import { ExtensionDefinition } from './types';

export const parserFunctionsExtension: ExtensionDefinition = {
  id: 'parser-functions',
  name: 'ParserFunctions',
  category: 'parser',
  version: '1.6.0-ts',
  authors: ['Tim Starling', 'MediaWiki TS Engine'],
  description: 'Adiciona lógica condicional, operadores matemáticos e funções auxiliares ao analisador de wikitexto (ex: {{#if:}}, {{#switch:}}, {{#expr:}}).',
  url: 'https://www.mediawiki.org/wiki/Extension:ParserFunctions',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['ParserFirstCallInit', 'ParserClearState'],
  exampleWikitext: '{{#if: Sim | O parâmetro é verdadeiro! | O parâmetro é falso. }}\nResultado da expressão matemática: {{#expr: 24 * 7}} horas por semana.',
  defaultActive: true,
  installedVia: 'code',
};

export const citeExtension: ExtensionDefinition = {
  id: 'cite',
  name: 'Cite',
  category: 'parser',
  version: '2.1.0-ts',
  authors: ['Ævar Arnfjörð Bjarmason', 'MediaWiki Community'],
  description: 'Permite criar notas de rodapé acadêmicas e referências bibliográficas com as tags <ref> e <references />.',
  url: 'https://www.mediawiki.org/wiki/Extension:Cite',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['ParserFirstCallInit', 'ParserAfterTidy'],
  exampleWikitext: 'O wikitexto é a base dos projetos livres<ref>Documentação técnica da Wikimedia, 2024.</ref>.\n\n== Referências ==\n<references />',
  defaultActive: true,
  installedVia: 'code',
};

export const mathExtension: ExtensionDefinition = {
  id: 'math',
  name: 'Math (KaTeX / TeX)',
  category: 'parser',
  version: '3.0.0-ts',
  authors: ['Tomasz Wegrzanowski', 'MediaWiki Math Group'],
  description: 'Renderiza notação matemática complexa e fórmulas em LaTeX e KaTeX no navegador usando a tag <math>.',
  url: 'https://www.mediawiki.org/wiki/Extension:Math',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['ParserFirstCallInit', 'ParserBeforeInternalParse'],
  exampleWikitext: '<math>E = m c^2</math>\n\n<math>f(x) = \\int_{-\\infty}^{\\infty} \\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi</math>',
  defaultActive: true,
  installedVia: 'code',
};

export const syntaxHighlightExtension: ExtensionDefinition = {
  id: 'syntax-highlight',
  name: 'SyntaxHighlight (GeSHi / Prism)',
  category: 'parser',
  version: '2.0.0-ts',
  authors: ['Brion Vibber', 'MediaWiki TS'],
  description: 'Destaque de sintaxe de código-fonte elegante para mais de 100 linguagens através da tag <syntaxhighlight lang="...">.',
  url: 'https://www.mediawiki.org/wiki/Extension:SyntaxHighlight',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['ParserFirstCallInit'],
  exampleWikitext: '<syntaxhighlight lang="typescript">\ninterface WikiArticle {\n  title: string;\n  content: string;\n  revisions: number;\n}\n</syntaxhighlight>',
  defaultActive: true,
  installedVia: 'code',
};

export const scribuntoExtension: ExtensionDefinition = {
  id: 'scribunto',
  name: 'Scribunto (Módulos Lua & Infobox)',
  category: 'parser',
  version: '0.1.0-ts',
  authors: ['Victor Vasiliev', 'Tim Starling', 'Brad Jorsch'],
  description: 'Ambiente de execução de módulos e predefinições estruturadas através da invocação {{#invoke:Módulo|função}} e caixas {{Infobox software}} com suporte a nome, e-mail, links, versões e campos personalizados.',
  url: 'https://www.mediawiki.org/wiki/Extension:Scribunto',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['ParserFirstCallInit', 'SoftwareInfo'],
  exampleWikitext: `{{Infobox software
| nome = WikiWazzimaGiygg
| subtítulo = Motor Wiki Colaborativo
| tipo = Enciclopédia Livre / Software Web
| desenvolvedor = Comunidade WikiWazzimaGiygg
| e-mail = contato@exemplo.com
| versão = WC1.16.C7.1
| lançamento = 2026
| linguagem = TypeScript, React
| plataforma = Web, Node.js
| licença = GPL-2.0-or-later
| site = https://wikiwazzimagiygg.wazzimagiygg.com
| repositório = https://github.com/WazzimaGiygg/WikiWazzimaGiygg
| status = Ativo
}}`,
  defaultActive: true,
  installedVia: 'code',
};

export const dynamicPageListExtension: ExtensionDefinition = {
  id: 'dynamic-page-list',
  name: 'DynamicPageList (DPL)',
  category: 'parser',
  version: '3.3.0-ts',
  authors: ['Gero Scholz', 'MediaWiki Contributors'],
  description: 'Permite aos editores listar e filtrar páginas dinamicamente com base em categorias, prefixos e datas de modificação.',
  url: 'https://www.mediawiki.org/wiki/Extension:DynamicPageList',
  gitTag: 'REL1_42-ts',
  license: 'GPL-2.0-or-later',
  hooks: ['ParserFirstCallInit'],
  exampleWikitext: '[[Categoria:Portais]]\n[[Categoria:WikiWazzimaGiygg]]',
  defaultActive: true,
  installedVia: 'code',
};
