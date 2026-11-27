import { WikiPage } from '../types/wiki';

export interface CategorySeedMeta {
  name: string;
  kind: 'article' | 'page';
  revId: string;
  summary: string;
  description: string;
  parentCategories?: string[];
}

export const DEFAULT_CATEGORY_DEFINITIONS: CategorySeedMeta[] = [
  // =========================================================================
  // CATEGORIAS DE ARTIGOS (Temáticas e Enciclopédicas)
  // =========================================================================
  {
    name: 'Ciência e Tecnologia',
    kind: 'article',
    revId: 'rev_cat_ciencia_tec',
    summary: 'Categoria principal para artigos sobre ciências aplicadas, engenharia e inovação tecnológica',
    description: 'Reúne artigos enciclopédicos sobre avanços científicos, sistemas computacionais, engenharia, telecomunicações e plataformas digitais.',
  },
  {
    name: 'Computação e Programação',
    kind: 'article',
    revId: 'rev_cat_computacao',
    summary: 'Categoria para artigos sobre ciência da computação, algoritmos e desenvolvimento de software',
    description: 'Agrupa verbetes dedicados a linguagens de programação, paradigmas de engenharia de software, bancos de dados e sistemas distribuídos.',
    parentCategories: ['Ciência e Tecnologia'],
  },
  {
    name: 'TypeScript',
    kind: 'article',
    revId: 'rev_cat_typescript',
    summary: 'Artigos e documentação técnica relacionados ao ecossistema TypeScript',
    description: 'Páginas sobre tipagem estática, compilação, motores web e bibliotecas construídas em TypeScript.',
    parentCategories: ['Computação e Programação'],
  },
  {
    name: 'Firebase',
    kind: 'article',
    revId: 'rev_cat_firebase',
    summary: 'Páginas sobre Cloud Firestore, Firebase Auth, regras de segurança e arquitetura em tempo real',
    description: 'Artigos técnicos que documentam persistência em nuvem, autenticação e sincronização reativa via Firebase.',
    parentCategories: ['Computação e Programação'],
  },
  {
    name: 'Arquitetura',
    kind: 'article',
    revId: 'rev_cat_arquitetura',
    summary: 'Páginas sobre arquitetura de sistemas, módulos e design estrutural',
    description: 'Documenta padrões arquiteturais, organização modular, fluxo de dados e decisões técnicas de projeto.',
    parentCategories: ['Computação e Programação'],
  },
  {
    name: 'Direito Digital',
    kind: 'article',
    revId: 'rev_cat_direito_digital',
    summary: 'Categoria para artigos jurídicos sobre internet, proteção de dados e regulação digital',
    description: 'Reúne análises e verbetes sobre legislação aplicável a plataformas digitais, responsabilidade civil, direitos autorais e privacidade online.',
    parentCategories: ['Sociedade e Política'],
  },
  {
    name: 'Privacidade',
    kind: 'article',
    revId: 'rev_cat_privacidade',
    summary: 'Artigos e políticas sobre proteção de dados pessoais e autodeterminação informativa',
    description: 'Conteúdos dedicados à privacidade digital, minimização de coleta, criptografia e direitos dos titulares de dados.',
    parentCategories: ['Direito Digital'],
  },
  {
    name: 'LGPD',
    kind: 'article',
    revId: 'rev_cat_lgpd',
    summary: 'Artigos e documentos sobre a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)',
    description: 'Páginas relacionadas às bases legais, direitos do titular, papel do Encarregado (DPO) e conformidade com a LGPD.',
    parentCategories: ['Direito Digital', 'Privacidade'],
  },
  {
    name: 'Marco Civil',
    kind: 'article',
    revId: 'rev_cat_marco_civil',
    summary: 'Artigos e análises sobre o Marco Civil da Internet (Lei nº 12.965/2014)',
    description: 'Estudos sobre guarda de registros, neutralidade de rede, liberdade de expressão e responsabilidade de provedores.',
    parentCategories: ['Direito Digital'],
  },
  {
    name: 'Auditoria',
    kind: 'article',
    revId: 'rev_cat_auditoria',
    summary: 'Artigos investigativos, pareceres técnicos e relatórios de conformidade',
    description: 'Documenta análises comparativas, auditorias independentes e verificações de conformidade jurídica ou técnica.',
    parentCategories: ['Direito Digital'],
  },
  {
    name: 'Segurança',
    kind: 'article',
    revId: 'rev_cat_seguranca',
    summary: 'Conteúdos sobre segurança da informação, integridade de contas e proteção contra abusos',
    description: 'Páginas voltadas a práticas defensivas, prevenção de ataques, proteção de sessão e auditoria de contas.',
    parentCategories: ['Computação e Programação'],
  },
  {
    name: 'História',
    kind: 'article',
    revId: 'rev_cat_historia',
    summary: 'Categoria enciclopédica para eventos, períodos, civilizações e documentos históricos',
    description: 'Reúne artigos sobre acontecimentos históricos, marcos cronológicos e evolução social ao longo do tempo.',
  },
  {
    name: 'Geografia',
    kind: 'article',
    revId: 'rev_cat_geografia',
    summary: 'Categoria enciclopédica para países, cidades, regiões, cartografia e meio físico',
    description: 'Agrupa artigos geográficos sobre territórios, municípios, demografia, clima e coordenadas geográficas.',
  },
  {
    name: 'Biografias',
    kind: 'article',
    revId: 'rev_cat_biografias',
    summary: 'Categoria enciclopédica para biografias de personalidades históricas, cientistas e artistas',
    description: 'Reúne perfis biográficos estruturados com datas, trajetória profissional, obras e referências verificáveis.',
  },
  {
    name: 'Ciências Exatas',
    kind: 'article',
    revId: 'rev_cat_ciencias_exatas',
    summary: 'Categoria para matemática, física, química, astronomia e lógica formal',
    description: 'Agrupa artigos com fórmulas, constantes, elementos químicos, teoremas e leis físicas.',
    parentCategories: ['Ciência e Tecnologia'],
  },
  {
    name: 'Ciências Biológicas',
    kind: 'article',
    revId: 'rev_cat_ciencias_biologicas',
    summary: 'Categoria para biologia, zoologia, botânica, ecologia e saúde',
    description: 'Reúne artigos taxonômicos, estudos sobre ecossistemas, fisiologia e preservação ambiental.',
    parentCategories: ['Ciência e Tecnologia'],
  },
  {
    name: 'Cultura e Artes',
    kind: 'article',
    revId: 'rev_cat_cultura_artes',
    summary: 'Categoria para literatura, cinema, música, artes visuais e patrimônio cultural',
    description: 'Artigos sobre livros, filmes, álbuns musicais, movimentos artísticos e expressões culturais.',
  },
  {
    name: 'Sociedade e Política',
    kind: 'article',
    revId: 'rev_cat_sociedade_politica',
    summary: 'Categoria para instituições públicas, sociologia, economia e políticas públicas',
    description: 'Verbetes sobre organização social, governança, sistemas políticos e economia.',
  },
  {
    name: 'Educação',
    kind: 'article',
    revId: 'rev_cat_educacao',
    summary: 'Categoria para pedagogia, instituições de ensino e acesso aberto ao conhecimento',
    description: 'Artigos voltados ao ensino, ciência aberta, alfabetização informacional e recursos educacionais.',
    parentCategories: ['Sociedade e Política'],
  },
  {
    name: 'Eventos atuais',
    kind: 'article',
    revId: 'rev_cat_eventos_atuais',
    summary: 'Artigos sobre acontecimentos recentes ou projetos em andamento',
    description: 'Agrupa páginas marcadas com predefinições de evento atual ou futuro cujos dados recebem atualizações frequentes.',
  },
  {
    name: 'Geral',
    kind: 'article',
    revId: 'rev_cat_geral',
    summary: 'Categoria inicial para novos artigos antes da classificação temática específica',
    description: 'Categoria introdutória utilizada na criação rápida de novos verbetes até que recebam categorias temáticas específicas.',
  },

  // =========================================================================
  // CATEGORIAS DE PÁGINAS DA WIKI (Estrutura, Ajuda, Políticas, Predefinições)
  // =========================================================================
  {
    name: 'WikiWazzimaGiygg',
    kind: 'page',
    revId: 'rev_cat_wikiwazzima',
    summary: 'Páginas institucionais e principais do projeto WikiWazzimaGiygg',
    description: 'Categoria raiz que agrupa as páginas estruturais, portais e documentação oficial da plataforma WikiWazzimaGiygg.',
  },
  {
    name: 'Portais',
    kind: 'page',
    revId: 'rev_cat_portais',
    summary: 'Páginas iniciais e portais temáticos de navegação da enciclopédia',
    description: 'Reúne a Página Principal e portais introdutórios que organizam a entrada do leitor pelos principais temas do acervo.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Ajuda',
    kind: 'page',
    revId: 'rev_cat_ajuda',
    summary: 'Guias de ajuda para editores e leitores da wiki',
    description: 'Páginas do espaço nominal Ajuda: com tutoriais passo a passo de edição, wikitexto, categorias e ferramentas.',
    parentCategories: ['Documentação'],
  },
  {
    name: 'Documentação',
    kind: 'page',
    revId: 'rev_cat_documentacao',
    summary: 'Documentação técnica, manuais e guias de referência da plataforma',
    description: 'Concentra manuais técnicos, guias de uso e referências oficiais sobre o funcionamento do motor wiki.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Manual',
    kind: 'page',
    revId: 'rev_cat_manual',
    summary: 'Manuais administrativos e de configuração do sistema (Manual:)',
    description: 'Guias técnicos destinados à configuração global, parâmetros de sistema e operação avançada.',
    parentCategories: ['Documentação'],
  },
  {
    name: 'Configuração',
    kind: 'page',
    revId: 'rev_cat_configuracao',
    summary: 'Páginas sobre parâmetros de configuração global e extensões',
    description: 'Documentação sobre ajustes do LocalSettings, variáveis globais e ativação de extensões.',
    parentCategories: ['Documentação'],
  },
  {
    name: 'Tutoriais',
    kind: 'page',
    revId: 'rev_cat_tutoriais',
    summary: 'Exemplos práticos e tutoriais ilustrados passo a passo',
    description: 'Páginas demonstrativas para aprender recursos avançados na prática.',
    parentCategories: ['Ajuda'],
  },
  {
    name: 'Wikitexto',
    kind: 'page',
    revId: 'rev_cat_wikitexto',
    summary: 'Páginas sobre sintaxe de marcação wikitexto, tabelas, referências e links',
    description: 'Referências e exemplos da linguagem de marcação wikitexto suportada pelo parser.',
    parentCategories: ['Documentação'],
  },
  {
    name: 'Infobox',
    kind: 'page',
    revId: 'rev_cat_infobox',
    summary: 'Guias e modelos relacionados a caixas de informação (Infobox)',
    description: 'Documentação e páginas auxiliares sobre criação e uso de quadros informativos laterais.',
    parentCategories: ['Wikitexto', 'Predefinições'],
  },
  {
    name: 'Políticas',
    kind: 'page',
    revId: 'rev_cat_politicas',
    summary: 'Políticas oficiais, termos de uso e regras editoriais da comunidade',
    description: 'Normas oficiais do espaço nominal Wiki: que regem conduta, privacidade, arbitragem e verificação de contas.',
    parentCategories: ['Governança'],
  },
  {
    name: 'Governança',
    kind: 'page',
    revId: 'rev_cat_governanca',
    summary: 'Páginas sobre governança comunitária, mediação e conformidade institucional',
    description: 'Estrutura de decisão coletiva, órgãos de arbitragem e diretrizes de transparência.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Administração',
    kind: 'page',
    revId: 'rev_cat_administracao',
    summary: 'Páginas de políticas e procedimentos administrativos e de bloqueio',
    description: 'Documentação voltada a administradores, burocratas e revisão de restrições de edição.',
    parentCategories: ['Governança'],
  },
  {
    name: 'ArbCom',
    kind: 'page',
    revId: 'rev_cat_arbcom',
    summary: 'Páginas sobre o Conselho de Arbitragem da comunidade',
    description: 'Regulamentos e documentação de mediação arbitral de conflitos complexos.',
    parentCategories: ['Governança'],
  },
  {
    name: 'CheckUser',
    kind: 'page',
    revId: 'rev_cat_checkuser',
    summary: 'Políticas de verificação técnica de contas e prevenção a fantoches',
    description: 'Normas sobre auditoria técnica restrita e proteção contra contas múltiplas abusivas.',
    parentCategories: ['Governança', 'Segurança'],
  },
  {
    name: 'UCoC',
    kind: 'page',
    revId: 'rev_cat_ucoc',
    summary: 'Diretrizes do Código Universal de Conduta da comunidade',
    description: 'Regras fundamentais de convivência respeitosa e combate a assédio na comunidade editorial.',
    parentCategories: ['Governança', 'Políticas'],
  },
  {
    name: 'Predefinições',
    kind: 'page',
    revId: 'rev_cat_predefinicoes',
    summary: 'Guias e páginas relacionadas ao sistema de predefinições transcluíveis',
    description: 'Reúne tutoriais, índices e documentação geral sobre o uso de predefinições ({{...}}).',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Predefinições do WikiWazzimaGiygg',
    kind: 'page',
    revId: 'rev_cat_predefinicoes_wiki',
    summary: 'Catálogo completo das predefinições instaladas no espaço Predefinição:',
    description: 'Agrupa todas as predefinições prontas para transclusão no WikiWazzimaGiygg.',
    parentCategories: ['Predefinições'],
  },
  {
    name: 'Predefinições de infobox',
    kind: 'page',
    revId: 'rev_cat_tpl_infobox',
    summary: 'Predefinições de caixas informativas laterais (Info/Biografia, Info/País, etc.)',
    description: 'Modelos estruturados de ficha técnica lateral inspirados na Wikipédia em português.',
    parentCategories: ['Predefinições do WikiWazzimaGiygg', 'Infobox'],
  },
  {
    name: 'Predefinições de citação',
    kind: 'page',
    revId: 'rev_cat_tpl_citacao',
    summary: 'Predefinições bibliográficas ({{Citar web}}, {{Citar livro}}, {{ISBN}}, etc.)',
    description: 'Modelos utilizados para padronizar notas de rodapé, citações acadêmicas e verificabilidade de fontes.',
    parentCategories: ['Predefinições do WikiWazzimaGiygg'],
  },
  {
    name: 'Predefinições de manutenção',
    kind: 'page',
    revId: 'rev_cat_tpl_manutencao',
    summary: 'Banners e marcações inline de revisão e qualidade editorial',
    description: 'Predefinições usadas para sinalizar artigos que precisam de fontes, revisão, fusão ou atualização.',
    parentCategories: ['Predefinições do WikiWazzimaGiygg'],
  },
  {
    name: 'Predefinições de formatação',
    kind: 'page',
    revId: 'rev_cat_tpl_formatacao',
    summary: 'Predefinições auxiliares de tipografia, datas, moedas, fórmulas e layout',
    description: 'Utilitários para padronização visual de textos, unidades, idiomas e elementos tipográficos.',
    parentCategories: ['Predefinições do WikiWazzimaGiygg'],
  },
  {
    name: 'Predefinições de navegação',
    kind: 'page',
    revId: 'rev_cat_tpl_navegacao',
    summary: 'Hatnotes, caixas de navegação (Navbox), sucessão e links temáticos',
    description: 'Modelos que facilitam a navegação entre artigos correlatos, portais e séries temáticas.',
    parentCategories: ['Predefinições do WikiWazzimaGiygg'],
  },
  {
    name: 'Predefinições de comunidade',
    kind: 'page',
    revId: 'rev_cat_tpl_comunidade',
    summary: 'Predefinições de votação, boas-vindas, assinatura e páginas de discussão',
    description: 'Selos e mensagens voltados à comunicação entre editores nas páginas de discussão e deliberações.',
    parentCategories: ['Predefinições do WikiWazzimaGiygg'],
  },
  {
    name: 'Esboços',
    kind: 'page',
    revId: 'rev_cat_esbocos',
    summary: 'Artigos curtos marcados com {{Esboço}} que aguardam expansão',
    description: 'Páginas introdutórias ainda breves que podem ser ampliadas pela comunidade.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Desambiguação',
    kind: 'page',
    revId: 'rev_cat_desambiguacao',
    summary: 'Páginas de desambiguação que listam múltiplos significados para o mesmo título',
    description: 'Índices que direcionam o leitor quando um mesmo termo possui vários artigos distintos.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Artigos que carecem de fontes',
    kind: 'page',
    revId: 'rev_cat_carecem_fontes',
    summary: 'Páginas que precisam de referências bibliográficas ou fontes adicionais',
    description: 'Lista automática de artigos marcados com {{Carece_de_fontes}}, {{Sem_fonte}} ou {{Poucas_referências}}.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Artigos sem referências',
    kind: 'page',
    revId: 'rev_cat_sem_referencias',
    summary: 'Artigos que ainda não citam nenhuma fonte bibliográfica',
    description: 'Páginas sinalizadas com {{Sem_referências}} aguardando inclusão da seção de referências.',
    parentCategories: ['Artigos que carecem de fontes'],
  },
  {
    name: 'Artigos que carecem de revisão',
    kind: 'page',
    revId: 'rev_cat_carecem_revisao',
    summary: 'Artigos marcados para revisão ortográfica, técnica ou de estilo enciclopédico',
    description: 'Páginas que receberam marcações de revisão editorial, wikificação ou contextualização.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Artigos desatualizados',
    kind: 'page',
    revId: 'rev_cat_desatualizados',
    summary: 'Páginas com dados ou seções que precisam de atualização recente',
    description: 'Artigos sinalizados com {{Atualizar}} ou {{Desatualizado}} para revisão com informações atuais.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
  {
    name: 'Artigos sem imagens',
    kind: 'page',
    revId: 'rev_cat_sem_imagens',
    summary: 'Artigos que solicitam fotografias, diagramas ou ilustrações livres',
    description: 'Páginas marcadas com {{Sem_imagem}} para enriquecimento visual.',
    parentCategories: ['WikiWazzimaGiygg'],
  },
];

function slugifyCategoryTitle(name: string): string {
  return `Categoria:${name.trim().replace(/\s+/g, '_')}`;
}

function makeCategoryPage(def: CategorySeedMeta): WikiPage {
  const slug = slugifyCategoryTitle(def.name);
  const parentTags = (def.parentCategories || [])
    .map(p => `[[Categoria:${p}]]`)
    .join('\n');

  const kindLabel =
    def.kind === 'article' ? 'Categoria de Artigos' : 'Categoria de Páginas e Estrutura do Wiki';

  const content = `{{Nota|tipo=nota|título=${kindLabel}|texto=${def.description}}}

== Sobre esta categoria ==
${def.description}

* '''Como incluir uma página aqui:''' Adicione <code>[[Categoria:${def.name}]]</code> ao final do wikitexto do artigo ou utilize o seletor '''Categoria''' na barra do editor.
* '''Navegação:''' Consulte [[Especial:Categorias|todas as categorias]] ou acesse a central [[Especial:Páginas_especiais]].
${parentTags ? `\n${parentTags}` : ''}`;

  return {
    slug,
    title: `Categoria:${def.name}`,
    namespace: 'Category',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: def.revId,
    categories: def.parentCategories || [],
    createdAt: '2026-11-27T00:00:00.000Z',
    updatedAt: '2026-11-27T00:00:00.000Z',
    summary: def.summary,
    content,
  };
}

export const WIKI_DEFAULT_CATEGORY_PAGES: Record<string, WikiPage> = Object.fromEntries(
  DEFAULT_CATEGORY_DEFINITIONS.map(def => {
    const page = makeCategoryPage(def);
    return [page.slug, page];
  })
);
