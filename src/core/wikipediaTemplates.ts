import { WikiPage } from '../types/wiki';

interface WikipediaTemplateSeed {
  slug: string;
  title: string;
  revId: string;
  summary: string;
  content: string;
  extraCategories?: string[];
}

function makeTemplatePage(seed: WikipediaTemplateSeed): WikiPage {
  return {
    slug: seed.slug,
    title: seed.title,
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: seed.revId,
    categories: ['Predefinições do WikiWazzimaGiygg', ...(seed.extraCategories || [])],
    createdAt: '2026-11-27T00:00:00.000Z',
    updatedAt: '2026-11-27T00:00:00.000Z',
    summary: seed.summary,
    content: seed.content,
  };
}

const TEMPLATE_SEEDS: WikipediaTemplateSeed[] = [
  // =========================================================================
  // 1. CITAÇÕES E REFERÊNCIAS INLINE (Os mais usados da Wikipédia)
  // =========================================================================
  {
    slug: 'Predefinição:Citar_web',
    title: 'Predefinição:Citar web',
    revId: 'rev_wp_tpl_citar_web',
    summary: 'Formata referências a páginas e artigos da web no padrão bibliográfico da Wikipédia (compatível com <ref>)',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|''[{{{url}}} {{{título|{{{titulo|Página web}}}}}}]''|''{{{título|{{{titulo|Página web}}}}}}''}}{{#if:{{{obra|{{{site|}}}}}}|. {{{obra|{{{site}}}}}}|}}{{#if:{{{publicado|{{{editora|}}}}}}|. {{{publicado|{{{editora}}}}}}|}}{{#if:{{{data|{{{ano|}}}}}}| ({{{data|{{{ano}}}}}})|}}{{#if:{{{língua|{{{idioma|}}}}}}| (em {{{língua|{{{idioma}}}}}})|}}{{#if:{{{acessodata|}}}|. Consultado em {{{acessodata}}}|}}.</span></includeonly><noinclude>
Predefinição padrão da Wikipédia para citar fontes publicadas na internet dentro de tags \`<ref>...</ref>\` ou seções de ligações externas.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar web|url=https://wikiwazzimagiygg.wazzimagiygg.com|título=Portal WikiWazzimaGiygg|autor=Equipe Editorial|obra=WikiWazzimaGiygg|data=2026|acessodata=27 de novembro de 2026|língua=pt}}</ref>
</syntaxhighlight>

== Parâmetros ==
* \`url\`: Endereço completo (https://...) da página citada.
* \`título\`: Título da página ou matéria.
* \`autor\`, \`obra\` (ou \`site\`), \`publicado\`, \`data\`, \`acessodata\`, \`língua\`.

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_livro',
    title: 'Predefinição:Citar livro',
    revId: 'rev_wp_tpl_citar_livro',
    summary: 'Formata referências bibliográficas de livros impressos ou digitais com suporte a ISBN, editora e páginas',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}''{{{título|{{{titulo|Título do livro}}}}}}''{{#if:{{{edição|}}}| ({{{edição}}} ed.)|}}{{#if:{{{local|}}}|. {{{local}}}:|}}{{#if:{{{editora|}}}| {{{editora}}}|}}{{#if:{{{ano|{{{data|}}}}}}|, {{{ano|{{{data}}}}}}|}}{{#if:{{{páginas|}}}|. p. {{{páginas}}}|}}{{#if:{{{isbn|}}}|. ISBN {{{isbn}}}|}}.</span></includeonly><noinclude>
Formata citações de livros em notas de rodapé e listas de bibliografia.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar livro|autor=SILVA, Maria|título=Arquitetura de Wikis Modernas|editora=Editora Aberta|local=São Paulo|ano=2026|edição=2ª|páginas=42-48|isbn=978-85-00000-00-0}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_jornal',
    title: 'Predefinição:Citar jornal',
    revId: 'rev_wp_tpl_citar_jornal',
    summary: 'Formata citações de reportagens e artigos publicados em jornais ou portais de notícias',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|«[{{{url}}} {{{título|{{{titulo|Reportagem}}}}}}]»|«{{{título|{{{titulo|Reportagem}}}}}}»}}{{#if:{{{jornal|{{{agência|}}}}}}|. ''{{{jornal|{{{agência}}}}}}''|}}{{#if:{{{local|}}}| ({{{local}}})|}}{{#if:{{{data|}}}|, {{{data}}}|}}{{#if:{{{páginas|}}}|, p. {{{páginas}}}|}}{{#if:{{{acessodata|}}}|. Consultado em {{{acessodata}}}|}}.</span></includeonly><noinclude>
Padroniza referências de matérias jornalísticas e periódicos de notícias.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar jornal|autor=Redação|título=Enciclopédias digitais adotam TypeScript|jornal=Jornal da Tecnologia|data=15 de novembro de 2026|url=https://exemplo.com/materia|acessodata=27 de novembro de 2026}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_periódico',
    title: 'Predefinição:Citar periódico',
    revId: 'rev_wp_tpl_citar_periodico',
    summary: 'Formata citações de artigos científicos e revistas acadêmicas com volume, número, páginas e DOI',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|«[{{{url}}} {{{título|{{{titulo|Artigo científico}}}}}}]»|«{{{título|{{{titulo|Artigo científico}}}}}}»}}{{#if:{{{periódico|{{{revista|}}}}}}|. ''{{{periódico|{{{revista}}}}}}''|}}{{#if:{{{volume|}}}|, v. {{{volume}}}|}}{{#if:{{{número|}}}|, n. {{{número}}}|}}{{#if:{{{páginas|}}}|, p. {{{páginas}}}|}}{{#if:{{{ano|{{{data|}}}}}}|, {{{ano|{{{data}}}}}}|}}{{#if:{{{doi|}}}|. [https://doi.org/{{{doi}}} doi:{{{doi}}}]|}}.</span></includeonly><noinclude>
Equivalente à \`{{Cite journal}}\` / \`{{Citar periódico}}\` da Wikipédia para artigos científicos revisados por pares.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar periódico|autor=PERES, P. H.|título=Conformidade e Privacidade em Sistemas Colaborativos|periódico=Revista Brasileira de Sistemas|volume=12|número=3|páginas=101-125|ano=2026|doi=10.1000/182}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_vídeo',
    title: 'Predefinição:Citar vídeo',
    revId: 'rev_wp_tpl_citar_video',
    summary: 'Formata citações de vídeos, documentários, palestras e transmissões audiovisuais',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|''[{{{url}}} {{{título|{{{titulo|Vídeo}}}}}}]''|''{{{título|{{{titulo|Vídeo}}}}}}''}} (vídeo){{#if:{{{plataforma|{{{publicado|}}}}}}|. {{{plataforma|{{{publicado}}}}}}|}}{{#if:{{{data|{{{ano|}}}}}}|, {{{data|{{{ano}}}}}}|}}{{#if:{{{duração|}}}|. Duração: {{{duração}}}|}}.</span></includeonly><noinclude>
Padroniza referências a vídeos, documentários e palestras gravadas.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar vídeo|autor=Conferência Web|título=Introdução ao Wikitexto|plataforma=YouTube|url=https://exemplo.com/video|data=2026|duração=14m30s}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sem_fonte',
    title: 'Predefinição:Sem fonte',
    revId: 'rev_wp_tpl_sem_fonte',
    summary: 'Marcação sobrescrita inline [carece de fontes] ao lado de uma afirmação específica sem referência',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><sup class="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] italic select-none" title="Esta afirmação precisa de uma referência fiável{{#if:{{{data|{{{1|}}}}}}| ({{{data|{{{1}}}}}})|}}">[<span class="underline decoration-dotted">carece de fontes</span>]</sup>[[Categoria:Artigos que carecem de fontes]]</includeonly><noinclude>
Insere a clássica marcação sobrescrita \`[carece de fontes]\` da Wikipédia exatamente após uma frase ou dado numérico que necessita de comprovação.

== Uso ==
<syntaxhighlight lang="text">
O projeto atingiu um milhão de leitores no primeiro mês.{{Sem_fonte|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Carece_de_esclarecimento',
    title: 'Predefinição:Carece de esclarecimento',
    revId: 'rev_wp_tpl_esclarecer',
    summary: 'Marcação inline [esclarecer] para trechos ambíguos, vagos ou difíceis de compreender',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="{{{motivo|{{{1|Este trecho necessita de maior clareza ou explicação}}}}}}">[<span class="underline decoration-dotted">esclarecer</span>]</sup>[[Categoria:Artigos que carecem de esclarecimento]]</includeonly><noinclude>
Sinaliza uma passagem ambígua ou pouco clara diretamente no texto.

== Uso ==
<syntaxhighlight lang="text">
O protocolo foi alterado posteriormente.{{Carece_de_esclarecimento|motivo=Indicar qual versão específica do protocolo foi alterada}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Quando',
    title: 'Predefinição:Quando',
    revId: 'rev_wp_tpl_quando',
    summary: 'Marcação inline [quando?] para afirmações vagas temporalmente ("recentemente", "atualmente")',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="Especifique a data ou o período exato desta afirmação">[<span class="underline decoration-dotted">quando?</span>]</sup>[[Categoria:Artigos com afirmações vagas]]</includeonly><noinclude>
Marca expressões temporais vagas (como "recentemente", "hoje em dia", "no ano passado") para que sejam substituídas por datas precisas.

== Uso ==
<syntaxhighlight lang="text">
Recentemente{{Quando}}, o sistema recebeu suporte a notificações em tempo real.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Quem',
    title: 'Predefinição:Quem',
    revId: 'rev_wp_tpl_quem',
    summary: 'Marcação inline [quem?] para atribuições vagas ("alguns especialistas", "críticos afirmam")',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="Identifique quem sustenta esta afirmação ou opinião">[<span class="underline decoration-dotted">quem?</span>]</sup>[[Categoria:Artigos com afirmações vagas]]</includeonly><noinclude>
Usada ao lado de sujeitos indeterminados ("especialistas dizem", "muitos acreditam") para solicitar atribuição nominal de fontes.

== Uso ==
<syntaxhighlight lang="text">
Muitos estudiosos{{Quem}} consideram este método o mais eficiente.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Onde',
    title: 'Predefinição:Onde',
    revId: 'rev_wp_tpl_onde',
    summary: 'Marcação inline [onde?] para afirmações sem localização geográfica definida',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="Especifique o país, região ou local ao qual esta afirmação se aplica">[<span class="underline decoration-dotted">onde?</span>]</sup>[[Categoria:Artigos com afirmações vagas]]</includeonly><noinclude>
Sinaliza passagens que omitem o país, estado ou localidade de aplicação de uma regra ou fenômeno.

== Uso ==
<syntaxhighlight lang="text">
A legislação exige retenção mínima de seis meses{{Onde}}.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Verificar_credibilidade',
    title: 'Predefinição:Verificar credibilidade',
    revId: 'rev_wp_tpl_credibilidade',
    summary: 'Marcação inline [verificar credibilidade] para fontes cuja confiabilidade ou imparcialidade é questionável',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><sup class="text-[11px] text-red-700 dark:text-red-400 italic select-none" title="{{{motivo|A fiabilidade da fonte citada aqui precisa ser verificada}}}">[<span class="underline decoration-dotted">verificar credibilidade</span>]</sup>[[Categoria:Artigos com fontes não fiáveis]]</includeonly><noinclude>
Equivalente à \`{{Fonte fiável?}}\` / \`{{Reliable source?}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
Segundo um blog pessoal...{{Verificar_credibilidade}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Ligação_inativa',
    title: 'Predefinição:Ligação inativa',
    revId: 'rev_wp_tpl_ligacao_inativa',
    summary: 'Marcação inline [ligação inativa] para URLs externas quebradas ou fora do ar (link rot)',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><sup class="text-[11px] text-red-700 dark:text-red-400 italic select-none" title="Link externo inacessível{{#if:{{{data|{{{1|}}}}}}| desde {{{data|{{{1}}}}}}|}}">[<span class="underline decoration-dotted">ligação inativa</span>]</sup>[[Categoria:Artigos com ligações externas inativas]]</includeonly><noinclude>
Sinaliza ligações externas que retornam erro 404 ou deixaram de existir, preservando o registro histórico para arquivamento.

== Uso ==
<syntaxhighlight lang="text">
[https://exemplo-antigo.org Documento original]{{Ligação_inativa|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },

  // =========================================================================
  // 2. NOTAS DE TOPO / HATNOTES (Navegação entre artigos homônimos)
  // =========================================================================
  {
    slug: 'Predefinição:Não_confundir',
    title: 'Predefinição:Não confundir',
    revId: 'rev_wp_tpl_nao_confundir',
    summary: 'Nota de topo (hatnote) clássica da Wikipédia: "Não confundir com [[Outro artigo]]."',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Não confundir com [[{{{1|Página_principal}}}]]{{#if:{{{2|}}}| ou [[{{{2}}}]]|}}.</div></includeonly><noinclude>
Nota de topo clássica usada quando dois assuntos possuem nomes muito semelhantes.

== Uso ==
<syntaxhighlight lang="text">
{{Não_confundir|JavaScript|Java}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Redirecionamento',
    title: 'Predefinição:Redirecionamento',
    revId: 'rev_wp_tpl_redirecionamento',
    summary: 'Nota de topo indicando que um termo redireciona para o artigo atual e apontando outros significados',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ "{{{1|Termo}}}" redireciona para este artigo. {{#if:{{{2|}}}|Para {{{3|outros significados}}}, veja [[{{{2}}}]].|}}</div></includeonly><noinclude>
Usada no topo de artigos que recebem redirecionamentos de termos que também possuem outros sentidos.

== Uso ==
<syntaxhighlight lang="text">
{{Redirecionamento|MW|MediaWiki (desambiguação)|outros significados}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Mais_detalhes',
    title: 'Predefinição:Mais detalhes',
    revId: 'rev_wp_tpl_mais_detalhes',
    summary: 'Nota de topo de seção apontando para um subartigo aprofundado sobre o tópico',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Para mais detalhes sobre {{{2|este tópico}}}, consulte [[{{{1|Página_principal}}}]]{{#if:{{{3|}}}| e [[{{{3}}}]]|}}.</div></includeonly><noinclude>
Indica um artigo específico para aprofundamento logo abaixo de um cabeçalho de seção.

== Uso ==
<syntaxhighlight lang="text">
{{Mais_detalhes|Arquitetura_WikiWazzimaGiygg|a arquitetura no Firestore}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sobre',
    title: 'Predefinição:Sobre',
    revId: 'rev_wp_tpl_sobre',
    summary: 'Nota de topo "Este artigo é sobre X. Para Y, veja Z." (uma das mais usadas da Wikipédia)',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Este artigo é sobre {{{1|este tema}}}. Para {{{2|outros significados}}}, veja [[{{{3|Página_principal}}}]].</div></includeonly><noinclude>
Uma das notas de topo mais utilizadas da Wikipédia para orientar leitores entre temas homônimos.

== Uso ==
<syntaxhighlight lang="text">
{{Sobre|a plataforma WikiWazzimaGiygg|o protocolo homônimo|Página_principal}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Minidesambiguação',
    title: 'Predefinição:Minidesambiguação',
    revId: 'rev_wp_tpl_minidesambig',
    summary: 'Nota de topo compacta para desambiguação rápida entre dois artigos relacionados',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Se procura por {{{1|outro significado}}}, consulte [[{{{2|Página_principal}}}]].</div></includeonly><noinclude>
Versão resumida para desambiguação direta entre dois artigos.

== Uso ==
<syntaxhighlight lang="text">
{{Minidesambiguação|a política de privacidade|Wiki:Política_de_Privacidade}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },

  // =========================================================================
  // 3. MANUTENÇÃO, QUALIDADE EDITORIAL E AVISOS (Ambox Wikipédia)
  // =========================================================================
  {
    slug: 'Predefinição:Parcialidade',
    title: 'Predefinição:Parcialidade',
    revId: 'rev_wp_tpl_parcialidade',
    summary: 'Sinaliza que a neutralidade (ponto de vista imparcial / NPOV) do artigo foi questionada',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-600 bg-orange-50/80 dark:bg-orange-950/30 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">⚖️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">A neutralidade deste artigo ou seção foi questionada{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">{{#if:{{{motivo|{{{1|}}}}}}|'''Motivo apontado:''' {{{motivo|{{{1}}}}}}. |}}O texto pode não apresentar todos os pontos de vista de maneira equilibrada e imparcial. Participe do debate na aba '''Discussão''' antes de remover esta marcação.</div></div></div>[[Categoria:Artigos parciais]]</includeonly><noinclude>
Equivalente à predefinição \`{{Parcial}}\` / \`{{POV}}\` da Wikipédia quando o artigo viola o princípio do ponto de vista neutro.

== Uso ==
<syntaxhighlight lang="text">
{{Parcialidade|motivo=Apresenta apenas uma corrente historiográfica|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Contraditório',
    title: 'Predefinição:Contraditório',
    revId: 'rev_wp_tpl_contraditorio',
    summary: 'Indica inconsistências ou contradições internas entre informações do próprio artigo',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">⚡</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo ou seção parece se contradizer{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">({{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">{{#if:{{{detalhe|{{{1|}}}}}}|{{{detalhe|{{{1}}}}}}|Por favor, consulte a página de discussão e ajuste as passagens conflitantes com base em fontes fiáveis.}}</div></div></div>[[Categoria:Artigos contraditórios]]</includeonly><noinclude>
Marca artigos com informações conflitantes entre seções (ex: datas ou valores numéricos divergentes).

== Uso ==
<syntaxhighlight lang="text">
{{Contraditório|detalhe=A introdução cita 2024 como lançamento, mas o Infobox indica 2026.|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Fusão',
    title: 'Predefinição:Fusão',
    revId: 'rev_wp_tpl_fusao',
    summary: 'Propõe a fusão (incorporação) deste artigo com outra página semelhante da wiki',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-purple-300 dark:border-purple-800 border-l-[6px] border-l-purple-600 bg-purple-50/80 dark:bg-purple-950/30 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🔗</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Proposta de fusão com [[{{{1|Artigo_relacionado}}}]]{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data}}})</span>|}}</div><div class="mt-0.5 leading-relaxed">Sugere-se que o conteúdo deste artigo seja fundido com [[{{{1|Artigo_relacionado}}}]] por tratarem do mesmo assunto ou de tópicos fortemente sobrepostos. Opine na aba '''Discussão'''.</div></div></div>[[Categoria:Artigos com proposta de fusão]]</includeonly><noinclude>
Banner clássico da Wikipédia usado para propor a unificação de dois artigos redundantes.

== Uso ==
<syntaxhighlight lang="text">
{{Fusão|Arquitetura_WikiWazzimaGiygg|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Reciclagem',
    title: 'Predefinição:Reciclagem',
    revId: 'rev_wp_tpl_reciclagem',
    summary: 'Indica que o artigo necessita de reformulação estrutural de acordo com o livro de estilo',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-400 bg-amber-50/70 dark:bg-amber-950/25 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">♻️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo precisa ser reciclado{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">({{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">{{#if:{{{motivo|{{{1|}}}}}}|'''Observação:''' {{{motivo|{{{1}}}}}}. |}}O texto necessita de reorganização em seções, wikificação de links e adequação ao estilo enciclopédico. Consulte [[Ajuda:Wikitexto]].</div></div></div>[[Categoria:Artigos que precisam de reciclagem]]</includeonly><noinclude>
Equivalente à \`{{Reciclagem}}\` / \`{{Cleanup}}\` da Wikipédia para artigos mal formatados.

== Uso ==
<syntaxhighlight lang="text">
{{Reciclagem|motivo=Falta divisão em seções e links internos|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Contextualizar',
    title: 'Predefinição:Contextualizar',
    revId: 'rev_wp_tpl_contextualizar',
    summary: 'Sinaliza que a introdução não explica claramente o que é o assunto do artigo',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🧭</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo carece de contexto{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Leitores que não conhecem o tema previamente podem ter dificuldade para entender o assunto. Ajude escrevendo uma introdução clara que defina o tópico logo no primeiro parágrafo.</div></div></div>[[Categoria:Artigos sem contexto]]</includeonly><noinclude>
Banner usado quando um artigo começa diretamente em detalhes técnicos sem definir o tema.

== Uso ==
<syntaxhighlight lang="text">
{{Contextualizar|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Globalizar',
    title: 'Predefinição:Globalizar',
    revId: 'rev_wp_tpl_globalizar',
    summary: 'Alerta que o artigo adota uma perspectiva regional restrita em vez de uma visão mundial',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-sky-300 dark:border-sky-800 border-l-[6px] border-l-sky-600 bg-sky-50/80 dark:bg-sky-950/30 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🌍</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">A perspectiva deste artigo pode não representar uma visão mundial{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">({{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Os exemplos e legislações abordados concentram-se principalmente em '''{{{região|{{{1|uma região específica}}}}}}'''. Ajude a ampliar o escopo internacional do artigo.</div></div></div>[[Categoria:Artigos com foco regional]]</includeonly><noinclude>
Equivalente à \`{{Globalizar}}\` / \`{{Globalize}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Globalizar|região=Brasil e Portugal|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Traduzir',
    title: 'Predefinição:Traduzir',
    revId: 'rev_wp_tpl_traduzir',
    summary: 'Indica que o artigo pode ser expandido traduzindo conteúdo de outro idioma',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-blue-200 dark:border-blue-800 border-l-[6px] border-l-[#3366cc] bg-blue-50/75 dark:bg-blue-950/30 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🌐</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo pode ser expandido mediante tradução{{#if:{{{idioma|{{{1|}}}}}}| do '''{{{idioma|{{{1}}}}}}'''|}}.</div><div class="mt-0.5 leading-relaxed">{{#if:{{{artigo|{{{2|}}}}}}|Artigo de referência sugerido: '''{{{artigo|{{{2}}}}}}'''. |}}Ao traduzir trechos, lembre-se de importar também as referências verificáveis e atribuir o idioma de origem no resumo da edição{{#if:{{{data|}}}| ({{{data}}})|}}.</div></div></div>[[Categoria:Artigos para traduzir]]</includeonly><noinclude>
Sugere a expansão de um artigo por tradução de outra edição linguística.

== Uso ==
<syntaxhighlight lang="text">
{{Traduzir|idioma=inglês|artigo=MediaWiki|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Revisão_de_tradução',
    title: 'Predefinição:Revisão de tradução',
    revId: 'rev_wp_tpl_rev_traducao',
    summary: 'Sinaliza tradução automática ou literal que precisa de revisão idiomática em português',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">📝</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo necessita de revisão de tradução{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">({{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">O texto aparenta ter sido traduzido literalmente{{#if:{{{idioma|{{{1|}}}}}}| a partir do '''{{{idioma|{{{1}}}}}}'''|}} e requer ajustes gramaticais e terminológicos para o português natural.</div></div></div>[[Categoria:Artigos com tradução por revisar]]</includeonly><noinclude>
Banner para artigos recém-traduzidos que ainda contêm expressões literais ou erros de concordância.

== Uso ==
<syntaxhighlight lang="text">
{{Revisão_de_tradução|idioma=inglês|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Publicidade',
    title: 'Predefinição:Publicidade',
    revId: 'rev_wp_tpl_publicidade',
    summary: 'Alerta que o texto possui tom promocional, panfletário ou publicitário incompatível com uma enciclopédia',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-600 bg-orange-50/85 dark:bg-orange-950/35 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">📢</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo parece escrito em estilo publicitário{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Por favor, ajude a reescrevê-lo em tom neutro, removendo adjetivos elogiosos sem fonte e declarações promocionais.</div></div></div>[[Categoria:Artigos com tom publicitário]]</includeonly><noinclude>
Equivalente à \`{{Publicidade}}\` / \`{{Advert}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Publicidade|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Órfão',
    title: 'Predefinição:Órfão',
    revId: 'rev_wp_tpl_orfao',
    summary: 'Indica que o artigo possui poucos ou nenhum link interno apontando para ele a partir de outras páginas',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-400 bg-amber-50/70 dark:bg-amber-950/25 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🕸️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo é órfão{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Poucos ou nenhum outro artigo da wiki possui ligação interna para esta página. Ajude criando links a partir de temas relacionados para melhorar a navegabilidade.</div></div></div>[[Categoria:Artigos órfãos]]</includeonly><noinclude>
Marca artigos isolados da rede de links internos da enciclopédia.

== Uso ==
<syntaxhighlight lang="text">
{{Órfão|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sem_categoria',
    title: 'Predefinição:Sem categoria',
    revId: 'rev_wp_tpl_sem_cat',
    summary: 'Sinaliza que a página ainda não foi classificada em nenhuma categoria enciclopédica',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-400 bg-amber-50/70 dark:bg-amber-950/25 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🏷️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo ainda não possui categorias{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Ajude adicionando pelo menos uma categoria temática ao final do wikitexto no formato <code>[[Categoria:Nome]]</code>.</div></div></div>[[Categoria:Artigos sem categorias]]</includeonly><noinclude>
Equivalente à \`{{Sem categoria}}\` / \`{{Uncategorized}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Sem_categoria|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Protegido',
    title: 'Predefinição:Protegido',
    revId: 'rev_wp_tpl_protegido',
    summary: 'Exibe o cadeado clássico da Wikipédia informando que a página está protegida ou semi-protegida',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-slate-300 dark:border-slate-700 border-l-[6px] border-l-slate-500 bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">{{#switch:{{{nível|semi}}}|total|locked=🔒|#default=🔐}}</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Página {{#switch:{{{nível|semi}}}|total|locked=totalmente protegida|burocrata=protegida para burocratas|#default=semi-protegida}} contra edições</div><div class="mt-0.5 leading-relaxed">{{#if:{{{motivo|{{{1|}}}}}}|'''Motivo:''' {{{motivo|{{{1}}}}}}. |}}Sugestões de alteração podem ser propostas na aba '''Discussão'''.</div></div></div>[[Categoria:Páginas protegidas]]</includeonly><noinclude>
Informa visualmente aos leitores e editores o nível de proteção da página.

== Uso ==
<syntaxhighlight lang="text">
{{Protegido|nível=semi|motivo=Página de alta visibilidade}}
{{Protegido|nível=total|motivo=Política institucional oficial}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Eliminação_rápida',
    title: 'Predefinição:Eliminação rápida',
    revId: 'rev_wp_tpl_er',
    summary: 'Banner vermelho de Eliminação Rápida (ER) da Wikipédia indicando regra de exclusão imediata',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3.5 rounded border border-red-400 dark:border-red-800 border-l-[6px] border-l-red-600 bg-red-50/90 dark:bg-red-950/40 text-xs text-red-950 dark:text-red-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🗑️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Esta página foi marcada para Eliminação Rápida (ER)</div><div class="mt-0.5 leading-relaxed">'''Regra / Justificativa:''' {{{regra|{{{1|Conteúdo de teste ou sem sentido enciclopédico}}}}}}{{#if:{{{proponente|}}}| — proposto por '''{{{proponente}}}'''|}}. Se você criou esta página e discorda, apresente argumentos na aba '''Discussão'''.</div></div></div>[[Categoria:Páginas para eliminação rápida]]</includeonly><noinclude>
Equivalente à clássica predefinição \`{{ER}}\` da Wikipédia em Português.

== Uso ==
<syntaxhighlight lang="text">
{{Eliminação_rápida|regra=A1 - Página de teste sem conteúdo enciclopédico|proponente=Administrador}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Páginas_para_eliminar',
    title: 'Predefinição:Páginas para eliminar',
    revId: 'rev_wp_tpl_pe',
    summary: 'Banner de Páginas para Eliminar (PE) abrindo discussão comunitária sobre a permanência do artigo',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3.5 rounded border border-red-300 dark:border-red-800 border-l-[6px] border-l-red-500 bg-red-50/80 dark:bg-red-950/35 text-xs text-red-950 dark:text-red-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🗳️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo está em discussão para eliminação{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">(iniciada em {{{data}}})</span>|}}</div><div class="mt-0.5 leading-relaxed">{{#if:{{{motivo|{{{1|}}}}}}|'''Justificativa:''' {{{motivo|{{{1}}}}}}. |}}A comunidade está avaliando se este conteúdo atende aos critérios de notoriedade. Participe na aba '''Discussão''' sem remover este aviso durante a votação.</div></div></div>[[Categoria:Páginas para eliminar]]</includeonly><noinclude>
Equivalente à predefinição \`{{PE}}\` / \`{{AfD}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Páginas_para_eliminar|motivo=Tema sem cobertura em fontes secundárias independentes|data=27/11/2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Spoiler',
    title: 'Predefinição:Spoiler',
    revId: 'rev_wp_tpl_spoiler',
    summary: 'Aviso clássico de revelação de enredo (spoilers) de filmes, livros, séries ou jogos',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-2.5 rounded border border-slate-300 dark:border-slate-700 border-l-4 border-l-slate-600 bg-slate-50 dark:bg-slate-800/70 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2.5 shadow-2xs"><span class="text-base leading-none shrink-0">🎬</span><div>'''Aviso de enredo:''' As informações a seguir revelam detalhes importantes da trama{{#if:{{{obra|{{{1|}}}}}}| de ''{{{obra|{{{1}}}}}}''|}}.</div></div></includeonly><noinclude>
Alerta os leitores antes de seções que descrevem o desfecho ou reviravoltas de uma obra de ficção.

== Uso ==
<syntaxhighlight lang="text">
{{Spoiler|obra=Nome da Obra}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Médico',
    title: 'Predefinição:Médico',
    revId: 'rev_wp_tpl_medico',
    summary: 'Aviso padrão da Wikipédia para artigos sobre saúde, doenças, sintomas e medicamentos',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-teal-300 dark:border-teal-800 border-l-[6px] border-l-teal-600 bg-teal-50/80 dark:bg-teal-950/30 text-xs text-teal-950 dark:text-teal-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">⚕️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Aviso Médico e de Saúde</div><div class="mt-0.5 leading-relaxed">O conteúdo deste artigo tem finalidade exclusivamente informativa e enciclopédica, não substituindo diagnóstico, prescrição ou acompanhamento por profissional de saúde habilitado.</div></div></div></includeonly><noinclude>
Equivalente ao tradicional aviso médico da Wikipédia para verbetes da área de saúde.

== Uso ==
<syntaxhighlight lang="text">
{{Médico}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Aviso_legal',
    title: 'Predefinição:Aviso legal',
    revId: 'rev_wp_tpl_aviso_legal',
    summary: 'Aviso padrão da Wikipédia para artigos que tratam de leis, processos e temas jurídicos',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-slate-300 dark:border-slate-700 border-l-[6px] border-l-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">📜</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Aviso Jurídico</div><div class="mt-0.5 leading-relaxed">Este artigo possui caráter estritamente informativo e acadêmico. O {{SITENAME}} não presta consultoria jurídica nem garante a aplicabilidade das normas descritas a casos concretos sem assistência de advogado.</div></div></div></includeonly><noinclude>
Aviso utilizado em artigos sobre legislação, direitos e normas jurídicas.

== Uso ==
<syntaxhighlight lang="text">
{{Aviso_legal}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },

  // =========================================================================
  // 4. FORMATAÇÃO, IDIOMAS, TIPOGRAFIA E LAYOUT
  // =========================================================================
  {
    slug: 'Predefinição:Lang',
    title: 'Predefinição:Lang',
    revId: 'rev_wp_tpl_lang',
    summary: 'Identifica termos e expressões em língua estrangeira com código ISO e itálico padronizado',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span lang="{{{idioma|{{{1|en}}}}}}" class="italic" title="Termo em idioma: {{{idioma|{{{1|en}}}}}}"><span class="not-italic text-[10px] font-mono text-gray-500 dark:text-gray-400 mr-0.5">[{{{idioma|{{{1|en}}}}}}]</span>{{{texto|{{{2|texto}}}}}}</span></includeonly><noinclude>
Marca palavras ou expressões estrangeiras com seu respectivo código de idioma ISO (ex: \`en\`, \`fr\`, \`la\`, \`ja\`).

== Uso ==
<syntaxhighlight lang="text">
{{Lang|en|Open source}}
{{Lang|idioma=la|texto=Cogito, ergo sum}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Pronúncia',
    title: 'Predefinição:Pronúncia',
    revId: 'rev_wp_tpl_pronuncia',
    summary: 'Exibe a transcrição fonética AFI/IPA padronizada no estilo da Wikipédia',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">{{#if:{{{idioma|}}}|<span>pronúncia em {{{idioma}}}:</span> |}}<span class="font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" title="Alfabeto Fonético Internacional (AFI)">{{{afi|{{{1|/ˈwɪki/}}}}}}</span></span></includeonly><noinclude>
Exibe notação fonética no Alfabeto Fonético Internacional (AFI/IPA).

== Uso ==
<syntaxhighlight lang="text">
{{Pronúncia|afi=/ˈwɪki/|idioma=inglês}}
{{Pronúncia|/wi.kiˈpɛ.dʒɐ/}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Etimologia',
    title: 'Predefinição:Etimologia',
    revId: 'rev_wp_tpl_etimologia',
    summary: 'Formata a origem etimológica de um termo com idioma, étimo original, transliteração e significado',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="text-gray-800 dark:text-gray-200">(do {{{idioma|{{{1|grego antigo}}}}}} ''{{{termo|{{{2|termo}}}}}}''{{#if:{{{translit|{{{3|}}}}}}|, transl. ''{{{translit|{{{3}}}}}}''|}}{{#if:{{{significado|{{{4|}}}}}}|, «{{{significado|{{{4}}}}}}»|}})</span></includeonly><noinclude>
Padroniza a apresentação da origem etimológica logo na introdução dos verbetes.

== Uso ==
<syntaxhighlight lang="text">
{{Etimologia|grego antigo|ἐγκύκλιος παιδεία|enkýklios paideía|instrução circular}}
{{Etimologia|idioma=havaiano|termo=wiki wiki|significado=muito rápido}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Epígrafe',
    title: 'Predefinição:Epígrafe',
    revId: 'rev_wp_tpl_epigrafe',
    summary: 'Exibe uma epígrafe ou citação compacta alinhada à direita no início de artigos ou capítulos',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><div class="md:float-right md:ml-4 my-2 max-w-xs p-3 rounded border border-gray-200 dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/75 text-xs text-gray-800 dark:text-gray-200 shadow-2xs"><div class="font-serif italic leading-relaxed text-right">«{{{texto|{{{1|Epígrafe}}}}}}»</div>{{#if:{{{autor|{{{2|}}}}}}|<div class="mt-1.5 text-[11px] text-right text-gray-600 dark:text-gray-400">— '''{{{autor|{{{2}}}}}}'''{{#if:{{{obra|{{{3|}}}}}}|, ''{{{obra|{{{3}}}}}}''|}}</div>|}}</div></includeonly><noinclude>
Equivalente à \`{{Epígrafe}}\` / \`{{Quote box}}\` flutuante à direita da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Epígrafe|A simplicidade é o último grau de sofisticação.|Leonardo da Vinci}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Destaque',
    title: 'Predefinição:Destaque',
    revId: 'rev_wp_tpl_destaque',
    summary: 'Caixa de destaque tipográfico personalizável por cor (azul, verde, roxo, cinza)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><div class="my-3 p-3.5 rounded border shadow-2xs text-xs {{#switch:{{{cor|azul}}}|verde=bg-emerald-50/75 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100|roxo=bg-purple-50/75 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-100|cinza=bg-[#f8f9fa] dark:bg-gray-800/80 border-[#a2a9b1] dark:border-gray-700 text-gray-800 dark:text-gray-200|#default=bg-blue-50/75 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100}}">{{#if:{{{título|}}}|<div class="font-serif font-bold text-sm mb-1">{{{título}}}</div>|}}<div class="leading-relaxed">{{{texto|{{{1|Conteúdo em destaque.}}}}}}</div></div></includeonly><noinclude>
Cria uma caixa emoldurada de destaque com opção de título e paleta de cor.

== Uso ==
<syntaxhighlight lang="text">
{{Destaque|cor=azul|título=Resumo Técnico|texto=Os dados são replicados em tempo real.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Tecla',
    title: 'Predefinição:Tecla',
    revId: 'rev_wp_tpl_tecla',
    summary: 'Formata nomes de teclas e atalhos de teclado no visual clássico <kbd> da Wikipédia',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><kbd class="inline-block px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-semibold leading-none text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-[0_1px_0_rgba(0,0,0,0.2)]">{{{1|Enter}}}</kbd>{{#if:{{{2|}}}|+<kbd class="inline-block px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-semibold leading-none text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-[0_1px_0_rgba(0,0,0,0.2)]">{{{2}}}</kbd>|}}{{#if:{{{3|}}}|+<kbd class="inline-block px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-semibold leading-none text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-[0_1px_0_rgba(0,0,0,0.2)]">{{{3}}}</kbd>|}}</includeonly><noinclude>
Equivalente à \`{{Tecla}}\` / \`{{Key press}}\` da Wikipédia, aceitando de 1 a 3 teclas combinadas.

== Uso ==
<syntaxhighlight lang="text">
Pressione {{Tecla|Ctrl|Shift|P}} ou {{Tecla|Enter}}.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Código',
    title: 'Predefinição:Código',
    revId: 'rev_wp_tpl_codigo',
    summary: 'Formata comandos, identificadores ou trechos curtos de código inline no estilo MediaWiki',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-pink-700 dark:text-pink-300 font-mono text-xs">{{{1|código}}}</code></includeonly><noinclude>
Equivalente à \`{{Código}}\` / \`{{Code}}\` da Wikipédia para comandos e trechos de sintaxe inline.

== Uso ==
<syntaxhighlight lang="text">
Use o comando {{Código|npm run build}} para compilar.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Cor',
    title: 'Predefinição:Cor',
    revId: 'rev_wp_tpl_cor',
    summary: 'Exibe um quadrado de amostra visual de cor acompanhado do rótulo ou código hexadecimal',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="inline-flex items-center gap-1.5 text-xs align-middle"><span class="inline-block w-3.5 h-3.5 rounded-xs border border-gray-400 dark:border-gray-500 shrink-0" style="background-color: {{{1|#3366cc}}};" title="{{{1|#3366cc}}}"></span><span class="font-medium">{{{2|{{{1|#3366cc}}}}}}</span></span></includeonly><noinclude>
Equivalente à \`{{Cor}}\` / \`{{Color sample}}\` usada em artigos sobre bandeiras, design, heráldica e artes visuais.

== Uso ==
<syntaxhighlight lang="text">
{{Cor|#3366cc|Azul MediaWiki}} • {{Cor|#009c3b|Verde Bandeira}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Idade',
    title: 'Predefinição:Idade',
    revId: 'rev_wp_tpl_idade',
    summary: 'Calcula dinamicamente a idade ou diferença de anos usando ParserFunctions ({{#expr:...}})',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="font-medium" title="Calculado automaticamente com base no ano atual ({{CURRENTYEAR}})">{{#expr: {{{ano_atual|{{{2|{{CURRENTYEAR}}}}}}}} - {{{ano_nascimento|{{{1|2000}}}}}} }} anos</span></includeonly><noinclude>
Calcula automaticamente a idade (ou tempo decorrido) subtraindo o ano inicial do ano atual (\`{{CURRENTYEAR}}\`) ou de um ano final informado.

== Uso ==
<syntaxhighlight lang="text">
* Nascido em 1995 ({{Idade|1995}})
* Duração entre 1989 e 2026: {{Idade|ano_nascimento=1989|ano_atual=2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Lista_horizontal',
    title: 'Predefinição:Lista horizontal',
    revId: 'rev_wp_tpl_hlist',
    summary: 'Exibe itens alinhados horizontalmente com separadores (estilo hlist clássico da Wikipédia)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"><span>{{{1|Item 1}}}</span>{{#if:{{{2|}}}|<span class="text-gray-400 select-none">•</span><span>{{{2}}}</span>|}}{{#if:{{{3|}}}|<span class="text-gray-400 select-none">•</span><span>{{{3}}}</span>|}}{{#if:{{{4|}}}|<span class="text-gray-400 select-none">•</span><span>{{{4}}}</span>|}}{{#if:{{{5|}}}|<span class="text-gray-400 select-none">•</span><span>{{{5}}}</span>|}}{{#if:{{{6|}}}|<span class="text-gray-400 select-none">•</span><span>{{{6}}}</span>|}}</span></includeonly><noinclude>
Equivalente à \`{{Hlist}}\` / \`{{Lista horizontal}}\` da Wikipédia, ideal dentro de Navboxes e Infoboxes.

== Uso ==
<syntaxhighlight lang="text">
{{Lista_horizontal|[[Página_principal|Início]]|[[Ajuda:Wikitexto|Wikitexto]]|[[Ajuda:Predefinições|Predefinições]]}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Ocultar',
    title: 'Predefinição:Ocultar',
    revId: 'rev_wp_tpl_ocultar',
    summary: 'Caixa colapsável expansível ao clicar (equivalente a {{Collapse}} / {{Ocultar}} da Wikipédia)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><div class="my-3 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/80 text-xs overflow-hidden shadow-2xs"><details class="group"><summary class="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 bg-[#eaecf0] dark:bg-gray-800 cursor-pointer select-none flex items-center justify-between list-none"><span>{{{título|{{{1|Clique para expandir ou ocultar}}}}}</span><span class="text-[11px] font-normal text-[#0645ad] dark:text-[#6ba4ff]">[mostrar/ocultar]</span></summary><div class="p-3 bg-white dark:bg-gray-900/60 text-gray-800 dark:text-gray-200 border-t border-[#a2a9b1] dark:border-gray-700 leading-relaxed">{{{conteúdo|{{{conteudo|{{{2|Conteúdo recolhido.}}}}}}}}}</div></details></div></includeonly><noinclude>
Permite recolher listas extensas, transcrições ou dados técnicos dentro de um bloco expansível nativo.

== Uso ==
<syntaxhighlight lang="text">
{{Ocultar|título=Lista completa de versões|conteúdo=Versão 1.0, Versão 1.1 e Versão 2.0.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Limpar',
    title: 'Predefinição:Limpar',
    revId: 'rev_wp_tpl_limpar',
    summary: 'Interrompe a flutuação lateral de imagens e Infoboxes (equivalente a {{-}} e {{Clear}} da Wikipédia)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><div class="clear-both h-0 overflow-hidden" aria-hidden="true"></div></includeonly><noinclude>
Equivalente às famosas predefinições \`{{Clear}}\` e \`{{-}}\` da Wikipédia. Impede que o texto ou seções seguintes invadam o espaço ao lado de uma Infobox ou imagem flutuante.

== Uso ==
<syntaxhighlight lang="text">
{{Limpar}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },

  // =========================================================================
  // 5. NAVEGAÇÃO, CRONOLOGIA, METADADOS E DISCUSSÕES DA COMUNIDADE
  // =========================================================================
  {
    slug: 'Predefinição:Navbox',
    title: 'Predefinição:Navbox',
    revId: 'rev_wp_tpl_navbox',
    summary: 'Caixa de navegação temática horizontal clássica colocada ao rodapé dos artigos da Wikipédia',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-5 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#fdfdfd] dark:bg-gray-900 overflow-hidden text-xs shadow-2xs"><div class="px-3 py-1.5 bg-[#ccccff] dark:bg-indigo-950/80 text-gray-900 dark:text-indigo-100 font-bold text-center border-b border-[#a2a9b1] dark:border-gray-700">{{{título|{{{titulo|Navegação Temática}}}}}}</div><div class="divide-y divide-gray-200 dark:divide-gray-800">{{#if:{{{lista1|{{{1|}}}}}}|<div class="grid grid-cols-1 sm:grid-cols-4"><div class="px-3 py-1.5 bg-[#ddddff] dark:bg-indigo-950/40 font-semibold text-gray-800 dark:text-indigo-200 sm:text-right border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800">{{{grupo1|Tópicos}}}</div><div class="sm:col-span-3 px-3 py-1.5 text-gray-800 dark:text-gray-200">{{{lista1|{{{1}}}}}}</div></div>|}}{{#if:{{{lista2|}}}|<div class="grid grid-cols-1 sm:grid-cols-4"><div class="px-3 py-1.5 bg-[#ddddff] dark:bg-indigo-950/40 font-semibold text-gray-800 dark:text-indigo-200 sm:text-right border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800">{{{grupo2|Relacionados}}}</div><div class="sm:col-span-3 px-3 py-1.5 text-gray-800 dark:text-gray-200">{{{lista2}}}</div></div>|}}{{#if:{{{lista3|}}}|<div class="grid grid-cols-1 sm:grid-cols-4"><div class="px-3 py-1.5 bg-[#ddddff] dark:bg-indigo-950/40 font-semibold text-gray-800 dark:text-indigo-200 sm:text-right border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800">{{{grupo3|Documentação}}}</div><div class="sm:col-span-3 px-3 py-1.5 text-gray-800 dark:text-gray-200">{{{lista3}}}</div></div>|}}</div>{{#if:{{{rodapé|}}}|<div class="px-3 py-1 bg-[#ddddff]/70 dark:bg-indigo-950/50 text-center text-[11px] text-gray-700 dark:text-indigo-200 border-t border-gray-200 dark:border-gray-800">{{{rodapé}}}</div>|}}</div></includeonly><noinclude>
A '''Predefinição:Navbox''' cria caixas de navegação agrupadas ao final dos artigos para conectar verbetes de uma mesma série ou tema.

== Uso ==
<syntaxhighlight lang="text">
{{Navbox
| título = Ecossistema WikiWazzimaGiygg
| grupo1 = Páginas Base
| lista1 = [[Página_principal]] • [[Arquitetura_WikiWazzimaGiygg]] • [[Manual:LocalSettings.ts]]
| grupo2 = Guias
| lista2 = [[Ajuda:Wikitexto]] • [[Ajuda:Predefinições]] • [[Ajuda:Infobox]]
| rodapé = [[Especial:Todas_as_páginas|Explorar índice completo]]
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sucessão',
    title: 'Predefinição:Sucessão',
    revId: 'rev_wp_tpl_sucessao',
    summary: 'Caixa de sucessão cronológica (Antecessor / Cargo e Período / Sucessor) muito usada em biografias',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 overflow-hidden text-xs text-center shadow-2xs"><div class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-300 dark:divide-gray-700"><div class="p-2.5 flex flex-col justify-center"><span class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Precedido por</span><span class="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{{{antes|—}}}</span></div><div class="p-2.5 bg-[#eaecf0] dark:bg-gray-800 flex flex-col justify-center"><span class="font-bold text-gray-900 dark:text-gray-100">{{{título|{{{titulo|Cargo ou Título}}}}}}</span>{{#if:{{{período|}}}|<span class="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">{{{período}}}</span>|}}</div><div class="p-2.5 flex flex-col justify-center"><span class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Sucedido por</span><span class="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{{{depois|—}}}</span></div></div></div></includeonly><noinclude>
Caixa clássica de linha sucessória para cargos públicos, prêmios, lideranças e versões históricas.

== Uso ==
<syntaxhighlight lang="text">
{{Sucessão
| título = Presidência da Entidade
| antes = Antecessor Exemplo
| período = 2022–2026
| depois = Sucessor Exemplo
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Projetos_irmãos',
    title: 'Predefinição:Projetos irmãos',
    revId: 'rev_wp_tpl_projetos_irmaos',
    summary: 'Caixa lateral exibindo links para recursos e projetos irmãos relacionados ao artigo',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="md:float-right md:ml-4 my-3 w-full md:w-64 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/90 p-2.5 text-xs shadow-2xs"><div class="font-bold text-center text-gray-900 dark:text-gray-100 pb-1.5 mb-1.5 border-b border-gray-200 dark:border-gray-700">📚 Projetos e Acervos Relacionados</div><div class="space-y-1 text-[11px] text-gray-700 dark:text-gray-300">{{#if:{{{commons|}}}|<div>🖼️ '''Multimídia:''' {{{commons}}}</div>|}}{{#if:{{{wikisource|}}}|<div>📜 '''Documentos:''' {{{wikisource}}}</div>|}}{{#if:{{{wikiquote|}}}|<div>💬 '''Citações:''' {{{wikiquote}}}</div>|}}{{#if:{{{wiktionary|}}}|<div>📖 '''Dicionário:''' {{{wiktionary}}}</div>|}}{{#if:{{{wikibooks|}}}|<div>📘 '''Manuais:''' {{{wikibooks}}}</div>|}}{{#if:{{{repositório|}}}|<div>💻 '''Código-fonte:''' {{{repositório}}}</div>|}}</div></div></includeonly><noinclude>
Caixa lateral inspirada na predefinição \`{{Correlações}}\` / \`{{Sister project links}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Projetos_irmãos
| commons = Galeria de Imagens
| wikisource = Textos Originais
| wikibooks = [[Ajuda:Wikitexto|Manual Wikitexto]]
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Controle_de_autoridade',
    title: 'Predefinição:Controle de autoridade',
    revId: 'rev_wp_tpl_autoridade',
    summary: 'Barra clássica de identificadores bibliográficos internacionais (VIAF, LCCN, GND, ORCID, ISBN, BNF)',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-4 p-2.5 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/80 text-[11px] text-gray-800 dark:text-gray-200 flex flex-wrap items-center gap-x-3 gap-y-1 shadow-2xs"><span class="font-bold text-gray-900 dark:text-gray-100 px-2 py-0.5 rounded bg-[#eaecf0] dark:bg-gray-700">Controle de autoridade</span>{{#if:{{{VIAF|}}}|<span>'''VIAF:''' <code>{{{VIAF}}}</code></span>|}}{{#if:{{{LCCN|}}}|<span>'''LCCN:''' <code>{{{LCCN}}}</code></span>|}}{{#if:{{{GND|}}}|<span>'''GND:''' <code>{{{GND}}}</code></span>|}}{{#if:{{{ORCID|}}}|<span>'''ORCID:''' <code>{{{ORCID}}}</code></span>|}}{{#if:{{{BNF|}}}|<span>'''BNF:''' <code>{{{BNF}}}</code></span>|}}{{#if:{{{ISBN|}}}|<span>'''ISBN:''' <code>{{{ISBN}}}</code></span>|}}</div>[[Categoria:Artigos com controle de autoridade]]</includeonly><noinclude>
Exibe identificadores de catalogação bibliotecária e acadêmica no rodapé dos artigos, igual à \`{{Controle de autoridade}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Controle_de_autoridade|VIAF=123456789|ORCID=0000-0002-1825-0097|ISBN=978-85-00000-00-0}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Artigo_destacado',
    title: 'Predefinição:Artigo destacado',
    revId: 'rev_wp_tpl_destacado',
    summary: 'Selo dourado de Artigo Destacado reconhecendo excelência editorial, imparcialidade e fontes completas',
    extraCategories: ['Predefinições de qualidade'],
    content: `<includeonly><div class="my-3 p-2.5 rounded border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-100 flex items-center gap-2.5 shadow-2xs"><span class="text-lg leading-none text-amber-500 shrink-0" aria-hidden="true">★</span><div>'''Artigo destacado:''' Este verbete foi avaliado como um dos melhores conteúdos do {{SITENAME}}{{#if:{{{data|{{{1|}}}}}}| (eleito em {{{data|{{{1}}}}}})|}}, atendendo a altos padrões de rigor, clareza e verificabilidade.</div></div>[[Categoria:Artigos destacados]]</includeonly><noinclude>
Selo equivalente à estrela dourada de \`{{Artigo destacado}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Artigo_destacado|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Artigo_bom',
    title: 'Predefinição:Artigo bom',
    revId: 'rev_wp_tpl_artigo_bom',
    summary: 'Selo verde/azul de Artigo Bom reconhecendo qualidade editorial consistente',
    extraCategories: ['Predefinições de qualidade'],
    content: `<includeonly><div class="my-3 p-2.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-2.5 shadow-2xs"><span class="text-base leading-none text-emerald-600 dark:text-emerald-400 font-bold shrink-0" aria-hidden="true">✚</span><div>'''Artigo bom:''' Este artigo cumpre os critérios de qualidade editorial, imparcialidade e cobertura bibliográfica do {{SITENAME}}{{#if:{{{data|{{{1|}}}}}}| ({{{data|{{{1}}}}}})|}}.</div></div>[[Categoria:Artigos bons]]</includeonly><noinclude>
Selo equivalente à predefinição \`{{Artigo bom}}\` (\`Good article\`) da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Artigo_bom|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Coordenadas',
    title: 'Predefinição:Coordenadas',
    revId: 'rev_wp_tpl_coordenadas',
    summary: 'Exibe coordenadas geográficas formatadas com ligação direta para visualização em mapa',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200"><span>📍</span><span>{{#if:{{{local|}}}|'''{{{local}}}''': |}}{{#if:{{{lat|}}}|[https://www.openstreetmap.org/?mlat={{{lat}}}&mlon={{{lon|0}}}&zoom=12 {{{coordenadas|{{{1|{{{lat}}}, {{{lon|0}}}}}}}}}]|{{{coordenadas|{{{1|23° 33′ S, 46° 38′ O}}}}}}}}{{#if:{{{escala|}}}| ({{{escala}}})|}}</span></span></includeonly><noinclude>
Equivalente à \`{{Coord}}\` / \`{{Coordenadas}}\` da Wikipédia, muito utilizada em artigos de cidades, monumentos, rios e países.

== Uso ==
<syntaxhighlight lang="text">
{{Coordenadas|coordenadas=23° 33′ S, 46° 38′ O|local=São Paulo|lat=-23.5505|lon=-46.6333}}
{{Coordenadas|15° 47′ S, 47° 52′ O}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Boas-vindas',
    title: 'Predefinição:Boas-vindas',
    revId: 'rev_wp_tpl_boas_vindas',
    summary: 'Mensagem clássica de boas-vindas para inserir em páginas de discussão de novos colaboradores',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><div class="my-3 p-4 rounded border border-blue-300 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/35 text-xs text-blue-950 dark:text-blue-100 space-y-2 shadow-2xs"><div class="font-serif font-bold text-base text-[#0645ad] dark:text-[#6ba4ff]">👋 Seja bem-vindo(a) ao {{SITENAME}}{{#if:{{{usuário|{{{1|}}}}}}|, {{{usuário|{{{1}}}}}}|}}!</div><p class="leading-relaxed">Agradecemos seu interesse em colaborar com a enciclopédia livre. Aqui estão alguns guias rápidos para começar:</p><ul class="list-disc pl-5 space-y-0.5"><li>'''[[Ajuda:Wikitexto]]''' — Aprenda a formatar textos, tabelas, citações e imagens.</li><li>'''[[Ajuda:Predefinições]]''' — Conheça modelos e caixas reutilizáveis prontas.</li><li>'''[[Wiki:Código_Universal_de_Conduta]]''' — Regras de convivência respeitosa na comunidade.</li><li>'''[[Especial:Aplicativo]]''' — Ative alertas push de alterações nas páginas que você vigiar.</li></ul>{{#if:{{{mentor|}}}|<div class="text-[11px] text-gray-600 dark:text-gray-300">Mensagem enviada por '''{{{mentor}}}'''.</div>|}}</div></includeonly><noinclude>
Predefinição tradicional de recepção usada por editores experientes em páginas de discussão de novatos.

== Uso ==
<syntaxhighlight lang="text">
{{Boas-vindas|usuário=NovoEditor|mentor=Equipe Editorial}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Concordo',
    title: 'Predefinição:Concordo',
    revId: 'rev_wp_tpl_concordo',
    summary: 'Selo verde "Concordo" para votações, consensos e páginas de discussão da Wikipédia',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-[11px]">✓ Concordo</span>{{#if:{{{observação|{{{1|}}}}}}| — {{{observação|{{{1}}}}}}|}}</includeonly><noinclude>
Selo clássico utilizado em votações comunitárias e discussões de consenso.

== Uso ==
<syntaxhighlight lang="text">
* {{Concordo|Proposta clara e bem fundamentada.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Discordo',
    title: 'Predefinição:Discordo',
    revId: 'rev_wp_tpl_discordo',
    summary: 'Selo vermelho "Discordo" para votações, consensos e páginas de discussão da Wikipédia',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold text-[11px]">✗ Discordo</span>{{#if:{{{observação|{{{1|}}}}}}| — {{{observação|{{{1}}}}}}|}}</includeonly><noinclude>
Selo clássico utilizado para registrar voto contrário em deliberações comunitárias.

== Uso ==
<syntaxhighlight lang="text">
* {{Discordo|Faltam fontes independentes que comprovem a notoriedade.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Comentário',
    title: 'Predefinição:Comentário',
    revId: 'rev_wp_tpl_comentario',
    summary: 'Selo azul "Comentário" para intervenções informativas em debates e votações',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-bold text-[11px]">💬 Comentário</span>{{#if:{{{texto|{{{1|}}}}}}| — {{{texto|{{{1}}}}}}|}}</includeonly><noinclude>
Destaca uma observação neutra em meio a uma seção de discussão ou votação.

== Uso ==
<syntaxhighlight lang="text">
* {{Comentário|Verifiquei o histórico e o trecho já foi corrigido.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Feito',
    title: 'Predefinição:Feito',
    revId: 'rev_wp_tpl_feito',
    summary: 'Selo verde "Feito" indicando conclusão de pedido administrativo ou tarefa editorial',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-[11px]">✔ Feito</span>{{#if:{{{detalhe|{{{1|}}}}}}| — {{{detalhe|{{{1}}}}}}|}}</includeonly><noinclude>
Equivalente à \`{{Feito}}\` / \`{{Done}}\` usada por administradores e editores ao responder pedidos.

== Uso ==
<syntaxhighlight lang="text">
{{Feito|Links quebrados substituídos e referências atualizadas.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Em_andamento',
    title: 'Predefinição:Em andamento',
    revId: 'rev_wp_tpl_em_andamento',
    summary: 'Selo azul/âmbar "Em andamento" indicando tarefa ou análise técnica em execução',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold text-[11px]">⏳ Em andamento</span>{{#if:{{{detalhe|{{{1|}}}}}}| — {{{detalhe|{{{1}}}}}}|}}</includeonly><noinclude>
Indica que uma solicitação ou revisão está sendo tratada no momento.

== Uso ==
<syntaxhighlight lang="text">
{{Em_andamento|Revisando a tabela comparativa da seção 3.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Versão_estável',
    title: 'Predefinição:Versão estável',
    revId: 'rev_wp_tpl_versao_estavel',
    summary: 'Exibe a versão estável de um software com data de lançamento e notas de release',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="inline-flex flex-wrap items-center gap-1.5 text-xs"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono font-semibold">{{{versão|{{{1|1.0.0}}}}}}</span>{{#if:{{{software|}}}|<span>({{{software}}})</span>|}}{{#if:{{{data|{{{2|}}}}}}|<span class="text-gray-600 dark:text-gray-400">— lançada em {{{data|{{{2}}}}}}</span>|}}{{#if:{{{notas|}}}|<span class="text-gray-600 dark:text-gray-400">([[{{{notas}}}|notas de lançamento]])</span>|}}</span></includeonly><noinclude>
Muito usada em artigos sobre softwares, sistemas operacionais e linguagens de programação.

== Uso ==
<syntaxhighlight lang="text">
{{Versão_estável|software=WikiWazzimaGiygg|versão={{VERSÃO}}|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Traduzido_de',
    title: 'Predefinição:Traduzido de',
    revId: 'rev_wp_tpl_traduzido_de',
    summary: 'Registra a atribuição de tradução de outro idioma conforme exigido pela licença CC BY-SA 4.0',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/25 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5 shadow-2xs"><span class="text-base leading-none shrink-0 mt-0.5">🔄</span><div>Este artigo foi total ou parcialmente traduzido do verbete '''{{{artigo|{{{2|Artigo Original}}}}}}''' na edição em '''{{{idioma|{{{1|inglês}}}}}}'''{{#if:{{{versão|}}}| (revisão <code>{{{versão}}}</code>)|}}, preservando a atribuição de autoria sob CC BY-SA 4.0.</div></div>[[Categoria:Artigos traduzidos]]</includeonly><noinclude>
Predefinição clássica colocada em páginas de discussão para documentar traduções entre wikis.

== Uso ==
<syntaxhighlight lang="text">
{{Traduzido_de|idioma=inglês|artigo=MediaWiki|versão=2026-11-27}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Arquivo_de_discussão',
    title: 'Predefinição:Arquivo de discussão',
    revId: 'rev_wp_tpl_arquivo_disc',
    summary: 'Sinaliza que a página contém tópicos antigos arquivados apenas para consulta histórica',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-[#a2a9b1] dark:border-gray-700 border-l-4 border-l-slate-500 bg-[#f8f9fa] dark:bg-gray-800/80 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2.5 shadow-2xs"><span class="text-base leading-none shrink-0 mt-0.5">🗄️</span><div>'''Arquivo de Discussão{{#if:{{{número|{{{1|}}}}}}| nº {{{número|{{{1}}}}}}|}}:''' Esta página preserva discussões encerradas{{#if:{{{período|}}}| referentes ao período '''{{{período}}}'''|}}. Por favor, não edite tópicos arquivados; abra uma nova seção na página de discussão principal.</div></div>[[Categoria:Arquivos de discussão]]</includeonly><noinclude>
Indica que uma página contém histórico arquivado de debates anteriores.

== Uso ==
<syntaxhighlight lang="text">
{{Arquivo_de_discussão|número=1|período=2025–2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Wikificar',
    title: 'Predefinição:Wikificar',
    revId: 'rev_wp_tpl_wikificar',
    summary: 'Sinaliza que o artigo precisa ser formatado no padrão wikitexto (ligações internas, negrito, seções)',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-400 bg-amber-50/75 dark:bg-amber-950/25 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🧩</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo precisa ser wikificado{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Ajude adicionando ligações internas para outros artigos, cabeçalhos de seção (<code>== Título ==</code>), categorias e um parágrafo introdutório claro seguindo o [[Ajuda:Wikitexto|guia de wikitexto]].</div></div></div>[[Categoria:Artigos que precisam ser wikificados]]</includeonly><noinclude>
Uma das predefinições de manutenção mais tradicionais da Wikipédia em Português.

== Uso ==
<syntaxhighlight lang="text">
{{Wikificar|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Formatar_referências',
    title: 'Predefinição:Formatar referências',
    revId: 'rev_wp_tpl_formatar_refs',
    summary: 'Indica que as referências do artigo estão apenas como URLs soltas e precisam ser formatadas',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">📑</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">As referências deste artigo necessitam de formatação{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Substitua ligações nuas por predefinições bibliográficas completas como {{Código|&#123;&#123;Citar web&#125;&#125;}} ou {{Código|&#123;&#123;Citar livro&#125;&#125;}} dentro de notas <code>&lt;ref&gt;...&lt;/ref&gt;</code>.</div></div></div>[[Categoria:Artigos com referências por formatar]]</includeonly><noinclude>
Solicita a conversão de URLs simples em citações bibliográficas padronizadas.

== Uso ==
<syntaxhighlight lang="text">
{{Formatar_referências|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Expandir',
    title: 'Predefinição:Expandir',
    revId: 'rev_wp_tpl_expandir',
    summary: 'Banner indicando que uma seção específica ainda está incompleta e pode ser expandida',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-sky-300 dark:border-sky-800 border-l-[6px] border-l-sky-500 bg-sky-50/75 dark:bg-sky-950/25 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">➕</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">{{#if:{{{seção|{{{1|}}}}}}|A seção "{{{seção|{{{1}}}}}}"|Esta seção}} pode ser expandida{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">({{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Você pode colaborar acrescentando informações relevantes e referências fiáveis.</div></div></div>[[Categoria:Seções para expandir]]</includeonly><noinclude>
Equivalente à \`{{Expandir seção}}\` / \`{{Expand section}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Expandir|seção=História Recente|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Falta_de_notoriedade',
    title: 'Predefinição:Falta de notoriedade',
    revId: 'rev_wp_tpl_notoriedade',
    summary: 'Sinaliza que a relevância enciclopédica (notoriedade) do assunto ainda não foi comprovada por fontes',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-600 bg-orange-50/85 dark:bg-orange-950/35 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🔎</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">A notoriedade enciclopédica deste tema não está claramente demonstrada{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Adicione cobertura significativa proveniente de fontes secundárias independentes e fiáveis; caso contrário, o artigo poderá ser proposto para eliminação ou fusão.</div></div></div>[[Categoria:Artigos com notoriedade questionada]]</includeonly><noinclude>
Equivalente à \`{{Notoriedade}}\` / \`{{Notability}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Falta_de_notoriedade|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Conflito_de_interesses',
    title: 'Predefinição:Conflito de interesses',
    revId: 'rev_wp_tpl_coi',
    summary: 'Alerta que um contribuidor com vínculo pessoal ou institucional pode ter editado o artigo (COI)',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-500 bg-orange-50/80 dark:bg-orange-950/30 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🤝</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Possível conflito de interesses{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}</div><div class="mt-0.5 leading-relaxed">Um dos principais contribuidores deste artigo pode possuir vínculo próximo com o tema abordado. Revise o texto para assegurar neutralidade e fontes independentes.</div></div></div>[[Categoria:Artigos com possível conflito de interesses]]</includeonly><noinclude>
Equivalente à \`{{COI}}\` / \`{{Conflito de interesses}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Conflito_de_interesses|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Direitos_autorais',
    title: 'Predefinição:Direitos autorais',
    revId: 'rev_wp_tpl_vda',
    summary: 'Banner vermelho de suspeita de violação de direitos autorais (VDA / copyvio)',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3.5 rounded border border-red-400 dark:border-red-800 border-l-[6px] border-l-red-600 bg-red-50/90 dark:bg-red-950/40 text-xs text-red-950 dark:text-red-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">©️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Suspeita de violação de direitos autorais (VDA)</div><div class="mt-0.5 leading-relaxed">Trechos desta página aparentam ter sido copiados de fonte protegida{{#if:{{{fonte|{{{1|}}}}}}|: '''{{{fonte|{{{1}}}}}}'''|}}. Reescreva o conteúdo com suas próprias palavras sob licença CC BY-SA 4.0{{#if:{{{data|}}}| (marcado em {{{data}}})|}}.</div></div></div>[[Categoria:Suspeitas de violação de direitos autorais]]</includeonly><noinclude>
Equivalente à \`{{VDA}}\` / \`{{Copyright violation}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Direitos_autorais|fonte=https://exemplo.com/texto-original|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sem_imagem',
    title: 'Predefinição:Sem imagem',
    revId: 'rev_wp_tpl_sem_imagem',
    summary: 'Solicita fotografias, diagramas ou ilustrações livres para enriquecer o artigo',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-sky-200 dark:border-sky-800 border-l-4 border-l-sky-500 bg-sky-50/70 dark:bg-sky-950/25 text-xs text-sky-950 dark:text-sky-200 flex items-center gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0">📷</span><div>Este artigo{{#if:{{{tema|{{{1|}}}}}}| sobre '''{{{tema|{{{1}}}}}}'''|}} beneficiar-se-ia de uma '''fotografia ou diagrama ilustrativo'''. Você pode enviar mídia compatível em [[Especial:Carregar_ficheiro]].</div></div>[[Categoria:Artigos sem imagens]]</includeonly><noinclude>
Equivalente à \`{{Sem imagem}}\` / \`{{Image requested}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Sem_imagem|tema=arquitetura de software}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Ver_desambiguação',
    title: 'Predefinição:Ver desambiguação',
    revId: 'rev_wp_tpl_ver_desambig',
    summary: 'Nota de topo apontando para a página de desambiguação de termos homônimos',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Para outros significados, veja [[{{{1|{{PAGENAME}}_(desambiguação)}}}]].</div></includeonly><noinclude>
Equivalente à \`{{Ver desambiguação}}\` / \`{{Other uses}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Ver_desambiguação|Python (desambiguação)}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Ping',
    title: 'Predefinição:Ping',
    revId: 'rev_wp_tpl_ping',
    summary: 'Menciona outro colaborador em páginas de discussão com link para sua página de usuário (@Usuário)',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="font-medium">[[Usuário:{{{1|Usuário}}}|@{{{1|Usuário}}}]]</span>{{#if:{{{2|}}}|, <span class="font-medium">[[Usuário:{{{2}}}|@{{{2}}}]]</span>|}}{{#if:{{{3|}}}|, <span class="font-medium">[[Usuário:{{{3}}}|@{{{3}}}]]</span>|}}:</includeonly><noinclude>
Equivalente à \`{{Ping}}\` / \`{{Responder}}\` usada nas discussões da Wikipédia para notificar ou citar até 3 editores.

== Uso ==
<syntaxhighlight lang="text">
{{Ping|Maria_Silva}} Concordo com a alteração sugerida!
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Resposta',
    title: 'Predefinição:Resposta',
    revId: 'rev_wp_tpl_resposta',
    summary: 'Formata resposta direta a um editor em páginas de discussão ("↳ Em resposta a Usuário:")',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="text-xs text-gray-600 dark:text-gray-400 italic">↳ Em resposta a [[Usuário:{{{1|Usuário}}}|{{{1|Usuário}}}]]:</span></includeonly><noinclude>
Indica claramente a quem uma mensagem de discussão está respondendo em tópicos longos.

== Uso ==
<syntaxhighlight lang="text">
{{Resposta|João_Santos}} Atualizei a seção conforme combinado.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Assinado',
    title: 'Predefinição:Assinado',
    revId: 'rev_wp_tpl_assinado',
    summary: 'Atribui autoria retroativa a comentários deixados sem assinatura em páginas de discussão',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="text-xs text-gray-600 dark:text-gray-400">— ''O comentário precedente foi deixado por'' [[Usuário:{{{1|Usuário}}}|{{{1|Usuário}}}]] ([[Discussão_Usuário:{{{1|Usuário}}}|discussão]]){{#if:{{{data|{{{2|}}}}}}| em {{{data|{{{2}}}}}}|}}, ''que não o assinou''.</span></includeonly><noinclude>
Equivalente à \`{{Não assinou}}\` / \`{{Unsigned}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Assinado|Colaborador_Exemplo|27 de novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Neutro',
    title: 'Predefinição:Neutro',
    revId: 'rev_wp_tpl_neutro',
    summary: 'Selo cinza "Neutro" para abstenções ou posições intermediárias em votações comunitárias',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold text-[11px]">⚪ Neutro</span>{{#if:{{{observação|{{{1|}}}}}}| — {{{observação|{{{1}}}}}}|}}</includeonly><noinclude>
Registra posição neutra ou abstenção fundamentada em votações e consultas.

== Uso ==
<syntaxhighlight lang="text">
* {{Neutro|Ambas as alternativas têm méritos equivalentes.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Não_feito',
    title: 'Predefinição:Não feito',
    revId: 'rev_wp_tpl_nao_feito',
    summary: 'Selo vermelho "Não feito" para pedidos administrativos ou solicitações recusadas',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold text-[11px]">✘ Não feito</span>{{#if:{{{motivo|{{{1|}}}}}}| — {{{motivo|{{{1}}}}}}|}}</includeonly><noinclude>
Equivalente à \`{{Não feito}}\` / \`{{Not done}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Não_feito|Não há consenso na página de discussão para mover o título.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Fórmula',
    title: 'Predefinição:Fórmula',
    revId: 'rev_wp_tpl_formula',
    summary: 'Exibe equações matemáticas ou químicas centralizadas com numeração opcional à direita',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><div class="my-3 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/70 flex items-center justify-between gap-4"><span class="flex-1 text-center font-serif text-base tracking-wide text-gray-900 dark:text-gray-100">{{{1|E = mc²}}}</span>{{#if:{{{número|{{{2|}}}}}}|<span class="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">({{{número|{{{2}}}}}})</span>|}}</div></includeonly><noinclude>
Equivalente à \`{{Equação}}\` / \`{{Math}}\` para destacar expressões matemáticas em artigos científicos.

== Uso ==
<syntaxhighlight lang="text">
{{Fórmula|E = mc²|número=1}}
{{Fórmula|a² + b² = c²}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Unidade',
    title: 'Predefinição:Unidade',
    revId: 'rev_wp_tpl_unidade',
    summary: 'Formata grandezas numéricas acompanhadas de unidade de medida sem quebra de linha',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="whitespace-nowrap font-normal">{{{1|100}}}&nbsp;{{{2|km}}}{{#if:{{{por|}}}|/{{{por}}}|}}</span></includeonly><noinclude>
Equivalente à \`{{Unidade}}\` / \`{{Val}}\` da Wikipédia, evitando que o número e sua unidade se separem em quebras de linha.

== Uso ==
<syntaxhighlight lang="text">
A distância é de {{Unidade|384 400|km}} e a velocidade chega a {{Unidade|299 792|km|por=s}}.
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_tese',
    title: 'Predefinição:Citar tese',
    revId: 'rev_wp_tpl_citar_tese',
    summary: 'Formata citações acadêmicas de dissertações de mestrado e teses de doutorado',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|''[{{{url}}} {{{título|{{{titulo|Título da tese}}}}}}]''|''{{{título|{{{titulo|Título da tese}}}}}}''}}{{#if:{{{ano|}}}| ({{{ano}}})|}}. {{{tipo|Tese de doutorado}}}{{#if:{{{instituição|}}}| — {{{instituição}}}|}}{{#if:{{{local|}}}|, {{{local}}}|}}.</span></includeonly><noinclude>
Equivalente à \`{{Citar tese}}\` / \`{{Cite thesis}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar tese|autor=SOUZA, A.|título=Estruturas Hipertextuais Colaborativas|tipo=Dissertação de mestrado|instituição=USP|local=São Paulo|ano=2025}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_enciclopédia',
    title: 'Predefinição:Citar enciclopédia',
    revId: 'rev_wp_tpl_citar_enciclopedia',
    summary: 'Formata citações de verbetes publicados em enciclopédias, dicionários ou obras de referência',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|«[{{{url}}} {{{título|{{{verbete|Verbete}}}}}}]»|«{{{título|{{{verbete|Verbete}}}}}}»}}. In: ''{{{enciclopédia|Enciclopédia}}}''{{#if:{{{volume|}}}|, v. {{{volume}}}|}}{{#if:{{{editora|}}}|. {{{editora}}}|}}{{#if:{{{ano|}}}|, {{{ano}}}|}}{{#if:{{{páginas|}}}|. p. {{{páginas}}}|}}.</span></includeonly><noinclude>
Equivalente à \`{{Citar enciclopédia}}\` / \`{{Cite encyclopedia}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar enciclopédia|título=Hipertexto|enciclopédia=Enciclopédia da Computação|editora=Ed. Acadêmica|ano=2025|páginas=210-214}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },

  // =========================================================================
  // 6. CAIXAS DE INFORMAÇÃO TEMÁTICAS DA WIKIPÉDIA (Info/...)
  // =========================================================================
  {
    slug: 'Predefinição:Info/Biografia',
    title: 'Predefinição:Info/Biografia',
    revId: 'rev_wp_tpl_info_biografia',
    summary: 'Caixa de informação padrão da Wikipédia para biografias de personalidades históricas ou contemporâneas',
    extraCategories: ['Predefinições de infobox', 'Biografias'],
    content: `<includeonly>{{Infobox biografia
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{subtítulo|Biografia}}}
| imagem = {{{imagem|}}}
| legenda = {{{legenda|}}}
| nascimento = {{{nascimento|}}}
| local_nascimento = {{{local_nascimento|}}}
| falecimento = {{{falecimento|}}}
| local_falecimento = {{{local_falecimento|}}}
| nacionalidade = {{{nacionalidade|}}}
| ocupação = {{{ocupação|}}}
| cônjuge = {{{cônjuge|}}}
| filhos = {{{filhos|}}}
| prêmios = {{{prêmios|}}}
| site = {{{site|}}}
}}</includeonly><noinclude>
Caixa lateral padronizada para artigos biográficos (equivalente à \`{{Info/Biografia}}\`).

== Uso ==
<syntaxhighlight lang="text">
{{Info/Biografia
| nome = Ada Lovelace
| subtítulo = Matemática e escritora britânica
| nascimento = 10 de dezembro de 1815
| local_nascimento = Londres, Reino Unido
| falecimento = 27 de novembro de 1852
| nacionalidade = Britânica
| ocupação = Matemática, programadora pioneira
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/País',
    title: 'Predefinição:Info/País',
    revId: 'rev_wp_tpl_info_pais',
    summary: 'Caixa de informação geográfica e política para países e territórios soberanos',
    extraCategories: ['Predefinições de infobox', 'Geografia'],
    content: `<includeonly>{{Infobox país
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{lema|País soberano}}}
| imagem = {{{bandeira|{{{imagem|}}}}}}
| legenda = {{{legenda|}}}
| capital = {{{capital|}}}
| maior_cidade = {{{maior_cidade|}}}
| idioma_oficial = {{{idioma_oficial|}}}
| governo = {{{governo|}}}
| área = {{{área|}}}
| população = {{{população|}}}
| pib = {{{pib|}}}
| moeda = {{{moeda|}}}
| fuso_horário = {{{fuso_horário|}}}
| código_iso = {{{código_iso|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/País}}\` da Wikipédia para fichas geográficas nacionais.

== Uso ==
<syntaxhighlight lang="text">
{{Info/País
| nome = Brasil
| lema = Ordem e Progresso
| capital = Brasília
| maior_cidade = São Paulo
| idioma_oficial = Português
| governo = República federativa presidencialista
| área = 8 510 417 km²
| moeda = Real (BRL)
| código_iso = BRA
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Município',
    title: 'Predefinição:Info/Município',
    revId: 'rev_wp_tpl_info_municipio',
    summary: 'Caixa de informação geográfica para cidades, municípios e divisões administrativas locais',
    extraCategories: ['Predefinições de infobox', 'Geografia'],
    content: `<includeonly>{{Infobox município
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{estado|Município}}}
| imagem = {{{imagem|}}}
| legenda = {{{legenda|}}}
| país = {{{país|}}}
| estado = {{{estado|}}}
| fundação = {{{fundação|}}}
| área = {{{área|}}}
| população = {{{população|}}}
| densidade = {{{densidade|}}}
| gentílico = {{{gentílico|}}}
| prefeito = {{{prefeito|}}}
| fuso_horário = {{{fuso_horário|}}}
| site = {{{site|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Município}}\` / \`{{Info/Cidade}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Município
| nome = São Paulo
| país = Brasil
| estado = São Paulo
| fundação = 25 de janeiro de 1554
| população = 11 451 999 hab.
| gentílico = Paulistano
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Empresa',
    title: 'Predefinição:Info/Empresa',
    revId: 'rev_wp_tpl_info_empresa',
    summary: 'Ficha técnica institucional para empresas, corporações e startups',
    extraCategories: ['Predefinições de infobox'],
    content: `<includeonly>{{Infobox empresa
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{subtítulo|Empresa}}}
| logotipo = {{{logotipo|{{{imagem|}}}}}}
| legenda = {{{legenda|}}}
| tipo = {{{tipo|}}}
| indústria = {{{indústria|}}}
| fundação = {{{fundação|}}}
| fundadores = {{{fundadores|}}}
| sede = {{{sede|}}}
| produtos = {{{produtos|}}}
| receita = {{{receita|}}}
| funcionários = {{{funcionários|}}}
| site = {{{site|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Empresa}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Empresa
| nome = Empresa Exemplo S.A.
| tipo = Sociedade anônima
| indústria = Tecnologia da informação
| fundação = 2020
| sede = São Paulo, Brasil
| site = https://exemplo.com
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Organização',
    title: 'Predefinição:Info/Organização',
    revId: 'rev_wp_tpl_info_organizacao',
    summary: 'Ficha institucional para ONGs, fundações, associações e organismos internacionais',
    extraCategories: ['Predefinições de infobox'],
    content: `<includeonly>{{Infobox organização
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{sigla|Organização}}}
| logotipo = {{{logotipo|{{{imagem|}}}}}}
| sigla = {{{sigla|}}}
| tipo = {{{tipo|}}}
| fundação = {{{fundação|}}}
| sede = {{{sede|}}}
| propósito = {{{propósito|}}}
| membros = {{{membros|}}}
| idioma_oficial = {{{idioma_oficial|}}}
| site = {{{site|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Organização}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Organização
| nome = Fundação Conhecimento Livre
| sigla = FCL
| tipo = Organização sem fins lucrativos
| fundação = 2024
| sede = Brasil
| propósito = Educação e software livre
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Livro',
    title: 'Predefinição:Info/Livro',
    revId: 'rev_wp_tpl_info_livro',
    summary: 'Caixa de ficha bibliográfica para livros, romances, ensaios e obras literárias',
    extraCategories: ['Predefinições de infobox', 'Cultura e Artes'],
    content: `<includeonly>{{Infobox livro
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{subtítulo|Obra literária}}}
| imagem = {{{capa|{{{imagem|}}}}}}
| legenda = {{{legenda|}}}
| autor = {{{autor|}}}
| tradutor = {{{tradutor|}}}
| ilustrador = {{{ilustrador|}}}
| gênero = {{{gênero|}}}
| idioma = {{{idioma|}}}
| editora = {{{editora|}}}
| lançamento = {{{lançamento|}}}
| páginas = {{{páginas|}}}
| isbn = {{{isbn|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Livro}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Livro
| nome = Dom Casmurro
| autor = Machado de Assis
| gênero = Romance realista
| idioma = Português
| lançamento = 1899
| páginas = 256
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Filme',
    title: 'Predefinição:Info/Filme',
    revId: 'rev_wp_tpl_info_filme',
    summary: 'Caixa de ficha técnica cinematográfica para filmes e documentários',
    extraCategories: ['Predefinições de infobox', 'Cultura e Artes'],
    content: `<includeonly>{{Infobox filme
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{subtítulo|Filme}}}
| imagem = {{{pôster|{{{imagem|}}}}}}
| legenda = {{{legenda|}}}
| direção = {{{direção|}}}
| roteiro = {{{roteiro|}}}
| elenco = {{{elenco|}}}
| gênero = {{{gênero|}}}
| país = {{{país|}}}
| idioma = {{{idioma|}}}
| duração = {{{duração|}}}
| lançamento = {{{lançamento|}}}
| distribuidora = {{{distribuidora|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Filme}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Filme
| nome = O Auto da Compadecida
| direção = Guel Arraes
| gênero = Comédia dramática
| país = Brasil
| idioma = Português
| duração = 104 min
| lançamento = 2000
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Álbum',
    title: 'Predefinição:Info/Álbum',
    revId: 'rev_wp_tpl_info_album',
    summary: 'Ficha discográfica para álbuns musicais, EPs e coletâneas',
    extraCategories: ['Predefinições de infobox', 'Cultura e Artes'],
    content: `<includeonly>{{Infobox álbum
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{tipo|Álbum de estúdio}}}
| imagem = {{{capa|{{{imagem|}}}}}}
| legenda = {{{legenda|}}}
| artista = {{{artista|}}}
| tipo = {{{tipo|}}}
| lançamento = {{{lançamento|}}}
| gênero = {{{gênero|}}}
| duração = {{{duração|}}}
| gravadora = {{{gravadora|}}}
| produtor = {{{produtor|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Álbum}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Álbum
| nome = Clube da Esquina
| artista = Milton Nascimento & Lô Borges
| tipo = Álbum de estúdio
| lançamento = 1972
| gênero = MPB, rock progressivo
| gravadora = Odeon
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Jogo',
    title: 'Predefinição:Info/Jogo',
    revId: 'rev_wp_tpl_info_jogo',
    summary: 'Ficha técnica para jogos eletrônicos e videogames',
    extraCategories: ['Predefinições de infobox', 'Ciência e Tecnologia'],
    content: `<includeonly>{{Infobox jogo
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{série|Jogo eletrônico}}}
| imagem = {{{capa|{{{imagem|}}}}}}
| legenda = {{{legenda|}}}
| desenvolvedor = {{{desenvolvedor|}}}
| publicadora = {{{publicadora|}}}
| diretor = {{{diretor|}}}
| série = {{{série|}}}
| plataforma = {{{plataforma|}}}
| lançamento = {{{lançamento|}}}
| gênero = {{{gênero|}}}
| modos = {{{modos|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Jogo}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Jogo
| nome = Jogo Exemplo
| desenvolvedor = Estúdio Independente
| plataforma = PC, Web
| lançamento = 2026
| gênero = Aventura / Estratégia
| modos = Um jogador
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Taxonomia',
    title: 'Predefinição:Info/Taxonomia',
    revId: 'rev_wp_tpl_info_taxonomia',
    summary: 'Caixa de classificação biológica (Reino, Filo, Classe, Ordem, Família, Gênero, Espécie)',
    extraCategories: ['Predefinições de infobox', 'Ciências Biológicas'],
    content: `<includeonly>{{Infobox taxonomia
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{nome_binomial|Classificação científica}}}
| imagem = {{{imagem|}}}
| legenda = {{{legenda|}}}
| reino = {{{reino|}}}
| filo = {{{filo|}}}
| classe = {{{classe|}}}
| ordem = {{{ordem|}}}
| família = {{{família|}}}
| gênero = {{{gênero|}}}
| espécie = {{{espécie|}}}
| nome_binomial = {{{nome_binomial|}}}
| estado_conservação = {{{estado_conservação|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Taxonomia}}\` / \`{{Taxocaixa}}\` da Wikipédia para artigos de zoologia e botânica.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Taxonomia
| nome = Onça-pintada
| reino = Animalia
| filo = Chordata
| classe = Mammalia
| ordem = Carnivora
| família = Felidae
| gênero = Panthera
| espécie = P. onca
| nome_binomial = Panthera onca
| estado_conservação = Quase ameaçada (NT)
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Evento',
    title: 'Predefinição:Info/Evento',
    revId: 'rev_wp_tpl_info_evento',
    summary: 'Ficha resumida para acontecimentos históricos, conferências e eventos públicos',
    extraCategories: ['Predefinições de infobox', 'História'],
    content: `<includeonly>{{Infobox evento
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{tipo|Evento}}}
| imagem = {{{imagem|}}}
| legenda = {{{legenda|}}}
| data = {{{data|}}}
| local = {{{local|}}}
| tipo = {{{tipo|}}}
| participantes = {{{participantes|}}}
| resultado = {{{resultado|}}}
| consequências = {{{consequências|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Evento}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Evento
| nome = Conferência de Software Livre
| data = 2026
| local = São Paulo, Brasil
| tipo = Congresso técnico
| participantes = Comunidade aberta
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Info/Elemento_químico',
    title: 'Predefinição:Info/Elemento químico',
    revId: 'rev_wp_tpl_info_elemento',
    summary: 'Ficha técnica da tabela periódica para elementos químicos',
    extraCategories: ['Predefinições de infobox', 'Ciências Exatas'],
    content: `<includeonly>{{Infobox elemento químico
| nome = {{{nome|{{PAGENAME}}}}}
| subtítulo = {{{símbolo|Elemento químico}}}
| símbolo = {{{símbolo|}}}
| número_atômico = {{{número_atômico|}}}
| massa_atômica = {{{massa_atômica|}}}
| série_química = {{{série_química|}}}
| grupo = {{{grupo|}}}
| período = {{{período|}}}
| estado_matéria = {{{estado_matéria|}}}
}}</includeonly><noinclude>
Equivalente à \`{{Info/Elemento químico}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Info/Elemento_químico
| nome = Carbono
| símbolo = C
| número_atômico = 6
| massa_atômica = 12,011 u
| série_química = Não metal
| grupo = 14
| período = 2
| estado_matéria = Sólido
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de infobox]]
</noinclude>`,
  },

  // =========================================================================
  // 7. CITAÇÕES E IDENTIFICADORES ADICIONAIS
  // =========================================================================
  {
    slug: 'Predefinição:Referências',
    title: 'Predefinição:Referências',
    revId: 'rev_wp_tpl_referencias',
    summary: 'Insere automaticamente a seção formatada de notas de rodapé (<references />)',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><references /></includeonly><noinclude>
Equivalente à \`{{Referências}}\` / \`{{Reflist}}\` da Wikipédia para renderizar todas as notas \`<ref>...</ref>\` do artigo.

== Uso ==
<syntaxhighlight lang="text">
== Referências ==
{{Referências}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_lei',
    title: 'Predefinição:Citar lei',
    revId: 'rev_wp_tpl_citar_lei',
    summary: 'Formata referências jurídicas de leis, decretos, constituições e normas regulatórias',
    extraCategories: ['Predefinições de citação', 'Direito Digital'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{jurisdição|}}}|{{{jurisdição}}}. |}}{{#if:{{{url|}}}|[{{{url}}} '''{{{lei|{{{título|Lei}}}}}}''']|'''{{{lei|{{{título|Lei}}}}}}'''}}{{#if:{{{data|}}}|, de {{{data}}}|}}{{#if:{{{ementa|}}}|. ''{{{ementa}}}''|}}{{#if:{{{diário_oficial|}}}|. {{{diário_oficial}}}|}}{{#if:{{{acessodata|}}}|. Consultado em {{{acessodata}}}|}}.</span></includeonly><noinclude>
Formata citações de normas jurídicas como LGPD, Marco Civil da Internet e resoluções regulatórias.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar_lei|jurisdição=Brasil|lei=Lei nº 13.709 (LGPD)|data=14 de agosto de 2018|ementa=Lei Geral de Proteção de Dados Pessoais|url=https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_comunicado',
    title: 'Predefinição:Citar comunicado',
    revId: 'rev_wp_tpl_citar_comunicado',
    summary: 'Formata referências a comunicados oficiais de imprensa e notas públicas',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{publicado|}}}|{{{publicado}}}. |}}{{#if:{{{url|}}}|«[{{{url}}} {{{título|Comunicado à imprensa}}}]»|«{{{título|Comunicado à imprensa}}}»}} (Nota oficial){{#if:{{{data|}}}|, {{{data}}}|}}{{#if:{{{acessodata|}}}|. Consultado em {{{acessodata}}}|}}.</span></includeonly><noinclude>
Equivalente à \`{{Citar comunicado de imprensa}}\` / \`{{Cite press release}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar_comunicado|publicado=Assessoria|título=Lançamento da versão estável|data=27 de novembro de 2026|url=https://exemplo.com/nota}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_mapa',
    title: 'Predefinição:Citar mapa',
    revId: 'rev_wp_tpl_citar_mapa',
    summary: 'Formata citações de mapas, cartas topográficas e atlas geográficos',
    extraCategories: ['Predefinições de citação', 'Geografia'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|}}}|{{{autor}}}. |}}{{#if:{{{url|}}}|''[{{{url}}} {{{título|Mapa}}}]''|''{{{título|Mapa}}}''}} [mapa]{{#if:{{{escala|}}}|, escala {{{escala}}}|}}{{#if:{{{editora|}}}|. {{{editora}}}|}}{{#if:{{{ano|}}}|, {{{ano}}}|}}.</span></includeonly><noinclude>
Equivalente à \`{{Citar mapa}}\` / \`{{Cite map}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar_mapa|autor=IBGE|título=Mapa Político do Brasil|escala=1:5 000 000|ano=2025}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Citar_jogo',
    title: 'Predefinição:Citar jogo',
    revId: 'rev_wp_tpl_citar_jogo',
    summary: 'Formata citações diretas de obras e jogos eletrônicos como fonte primária',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{desenvolvedora|}}}|{{{desenvolvedora}}}. |}}''{{{título|Jogo eletrônico}}}''{{#if:{{{plataforma|}}}| ({{{plataforma}}})|}}{{#if:{{{publicadora|}}}|. {{{publicadora}}}|}}{{#if:{{{ano|}}}|, {{{ano}}}|}}{{#if:{{{cena|}}}|. Cena/nível: {{{cena}}}|}}.</span></includeonly><noinclude>
Equivalente à \`{{Citar jogo eletrônico}}\` / \`{{Cite video game}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Citar_jogo|desenvolvedora=Estúdio|título=Título do Jogo|plataforma=PC|ano=2026|cena=Capítulo 1}}</ref>
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:ISBN',
    title: 'Predefinição:ISBN',
    revId: 'rev_wp_tpl_isbn',
    summary: 'Formata identificador bibliográfico padrão ISBN com link de consulta',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="text-xs font-mono">ISBN [https://isbnsearch.org/isbn/{{{1|978-85-00000-00-0}}} {{{1|978-85-00000-00-0}}}]</span></includeonly><noinclude>
Equivalente à \`{{ISBN}}\` da Wikipédia para referências de livros.

== Uso ==
<syntaxhighlight lang="text">
{{ISBN|978-85-359-0277-8}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:DOI',
    title: 'Predefinição:DOI',
    revId: 'rev_wp_tpl_doi',
    summary: 'Formata identificador acadêmico DOI como ligação direta para doi.org',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="text-xs font-mono">doi:[https://doi.org/{{{1|10.1000/182}}} {{{1|10.1000/182}}}]</span></includeonly><noinclude>
Equivalente à \`{{DOI}}\` da Wikipédia para artigos científicos.

== Uso ==
<syntaxhighlight lang="text">
{{DOI|10.1000/182}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Wayback',
    title: 'Predefinição:Wayback',
    revId: 'rev_wp_tpl_wayback',
    summary: 'Cria ligação para cópia arquivada no Internet Archive (Wayback Machine)',
    extraCategories: ['Predefinições de citação'],
    content: `<includeonly><span class="text-xs">[https://web.archive.org/web/{{{data|{{{2|*}}}}}}/{{{url|{{{1|https://exemplo.com}}}}}} Cópia arquivada]{{#if:{{{título|}}}| de ''{{{título}}}''|}} no Wayback Machine</span></includeonly><noinclude>
Equivalente à \`{{Wayback}}\` da Wikipédia para preservar referências contra links quebrados.

== Uso ==
<syntaxhighlight lang="text">
{{Wayback|url=https://exemplo.com/artigo|data=20261127000000|título=Artigo Original}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de citação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Carece_de_página',
    title: 'Predefinição:Carece de página',
    revId: 'rev_wp_tpl_carece_pagina',
    summary: 'Marcação sobrescrita [carece de página] solicitando o número da página em citação de livro',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="Especifique o número da página exata desta referência">[<span class="underline decoration-dotted">carece de página</span>]</sup>[[Categoria:Artigos que carecem de fontes]]</includeonly><noinclude>
Equivalente à \`{{Carece de página}}\` / \`{{Page needed}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
Segundo o autor, o sistema foi publicado em 1995.<ref>{{Citar_livro|autor=Autor|título=Livro|ano=2020}}</ref>{{Carece_de_página}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Fonte_primária',
    title: 'Predefinição:Fonte primária',
    revId: 'rev_wp_tpl_fonte_primaria_inline',
    summary: 'Marcação inline [fonte primária] indicando necessidade de fonte secundária independente',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="Esta informação baseia-se em fonte primária e carece de fonte secundária independente">[<span class="underline decoration-dotted">fonte primária</span>]</sup>[[Categoria:Artigos com fontes primárias]]</includeonly><noinclude>
Equivalente à \`{{Fonte primária}}\` / \`{{Primary source inline}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
A empresa afirma ser líder de mercado.{{Fonte_primária}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },

  // =========================================================================
  // 8. MAIS HATNOTES, AVISOS E MANUTENÇÃO EDITORIAL
  // =========================================================================
  {
    slug: 'Predefinição:Redireciona_aqui',
    title: 'Predefinição:Redireciona aqui',
    revId: 'rev_wp_tpl_redireciona_aqui',
    summary: 'Nota de topo explicando que outro termo redireciona para o artigo atual',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ "{{{1|Termo}}}" redireciona para este artigo. {{#if:{{{2|}}}|Para outros significados, veja [[{{{2}}}]].|Para outros significados, veja [[{{{1|Termo}}}_(desambiguação)]].}}</div></includeonly><noinclude>
Equivalente à \`{{Redireciona aqui}}\` / \`{{Redirect}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Redireciona_aqui|LGPD|LGPD (desambiguação)}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Homônimos',
    title: 'Predefinição:Homônimos',
    revId: 'rev_wp_tpl_homonimos',
    summary: 'Nota de topo apontando para outros termos homônimos ou artigos com o mesmo nome',
    extraCategories: ['Predefinições de navegação'],
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ '''Nota:''' Se procura por outros significados de '''{{{1|{{PAGENAME}}}}}''', consulte [[{{{2|{{{1|{{PAGENAME}}}}}_(desambiguação)}}}]].</div></includeonly><noinclude>
Equivalente à \`{{Homônimos}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Homônimos|Wiki|Wiki (desambiguação)}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Nota_histórica',
    title: 'Predefinição:Nota histórica',
    revId: 'rev_wp_tpl_nota_historica',
    summary: 'Banner discreto contextualizando terminologia ou contexto histórico preservado',
    extraCategories: ['Predefinições de navegação', 'História'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-stone-300 dark:border-stone-700 border-l-4 border-l-stone-500 bg-stone-50/90 dark:bg-stone-900/50 text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2.5"><span class="text-base leading-none shrink-0">🏛️</span><div><span class="font-semibold">Contexto histórico:</span> {{{1|Este artigo descreve conceitos, nomenclaturas ou eventos dentro de seu contexto histórico original.}}}</div></div></includeonly><noinclude>
Útil para artigos históricos com nomes antigos de países, instituições ou leis revogadas.

== Uso ==
<syntaxhighlight lang="text">
{{Nota_histórica|Esta seção descreve a legislação vigente antes de 2018.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de navegação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Poucas_referências',
    title: 'Predefinição:Poucas referências',
    revId: 'rev_wp_tpl_poucas_refs',
    summary: 'Banner indicando que o artigo já possui algumas fontes, mas precisa de referências adicionais',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">📑</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo precisa de fontes adicionais para verificação{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Embora possua algumas referências, diversas seções ainda carecem de citações fiáveis e independentes.</div></div></div>[[Categoria:Artigos que carecem de fontes]]</includeonly><noinclude>
Equivalente à \`{{Mais fontes}}\` / \`{{More citations needed}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Poucas_referências|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Fontes_primárias',
    title: 'Predefinição:Fontes primárias',
    revId: 'rev_wp_tpl_fontes_primarias',
    summary: 'Alerta que o artigo depende excessivamente de fontes primárias e precisa de análise independente',
    extraCategories: ['Predefinições de manutenção', 'Predefinições de citação'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">📄</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo depende excessivamente de fontes primárias{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Adicione referências secundárias confiáveis e independentes para consolidar a verificabilidade e imparcialidade do verbete.</div></div></div>[[Categoria:Artigos com fontes primárias]]</includeonly><noinclude>
Equivalente à \`{{Fontes primárias}}\` / \`{{Primary sources}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Fontes_primárias|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Autobiografia',
    title: 'Predefinição:Autobiografia',
    revId: 'rev_wp_tpl_autobiografia',
    summary: 'Aviso para páginas biográficas possivelmente redigidas pelo próprio biografado',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-500 bg-orange-50/80 dark:bg-orange-950/30 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">🪪</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo parece ser uma autobiografia ou conter autopromoção{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Revise o texto para assegurar ponto de vista neutro, notoriedade enciclopédica e fontes externas independentes.</div></div></div>[[Categoria:Artigos com possível conflito de interesses]]</includeonly><noinclude>
Equivalente à \`{{Autobiografia}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Autobiografia|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Estilo_inadequado',
    title: 'Predefinição:Estilo inadequado',
    revId: 'rev_wp_tpl_estilo',
    summary: 'Sinaliza que a redação utiliza tom coloquial, opinativo ou ensaístico fora do padrão enciclopédico',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">✍️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">A redação deste artigo não segue o estilo enciclopédico{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Reescreva trechos coloquiais, opinativos ou em primeira pessoa adotando linguagem objetiva e impessoal.</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Equivalente à \`{{Estilo de texto}}\` / \`{{Tone}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Estilo_inadequado|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Falta_de_contexto',
    title: 'Predefinição:Falta de contexto',
    revId: 'rev_wp_tpl_falta_contexto',
    summary: 'Banner para artigos que iniciam sem definição clara do assunto ou público-alvo',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">🧭</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo carece de contexto introdutório{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">({{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Adicione um parágrafo inicial que defina claramente o tema, sua área de conhecimento e relevância para leitores não especialistas.</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Equivalente à \`{{Contexto}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Falta_de_contexto|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Lista_incompleta',
    title: 'Predefinição:Lista incompleta',
    revId: 'rev_wp_tpl_lista_incompleta',
    summary: 'Aviso discreto de que uma lista temática está incompleta e aberta a adições',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-2.5 p-2.5 rounded border border-sky-200 dark:border-sky-800 border-l-4 border-l-sky-500 bg-sky-50/70 dark:bg-sky-950/25 text-xs text-sky-950 dark:text-sky-200 flex items-center gap-2.5"><span class="text-base leading-none shrink-0">📋</span><div>Esta é uma '''lista incompleta'''{{#if:{{{tema|{{{1|}}}}}}| sobre '''{{{tema|{{{1}}}}}}'''|}}. Você pode ajudar ampliando-a com itens referenciados.</div></div>[[Categoria:Seções para expandir]]</includeonly><noinclude>
Equivalente à \`{{Lista incompleta}}\` / \`{{Incomplete list}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Lista_incompleta|tema=ferramentas compatíveis}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Desatualizado',
    title: 'Predefinição:Desatualizado',
    revId: 'rev_wp_tpl_desatualizado_inline',
    summary: 'Marcação inline [desatualizado] ao lado de estatísticas ou dados antigos',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><sup class="text-[11px] text-amber-700 dark:text-amber-400 italic select-none" title="Informação possivelmente desatualizada{{#if:{{{desde|{{{1|}}}}}}| (dados de {{{desde|{{{1}}}}}})|}}">[<span class="underline decoration-dotted">desatualizado</span>]</sup>[[Categoria:Artigos desatualizados]]</includeonly><noinclude>
Marcação inline discreta para dados específicos que mudaram ao longo do tempo.

== Uso ==
<syntaxhighlight lang="text">
A população estimada era de 10 milhões de habitantes.{{Desatualizado|desde=2010}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Futuro',
    title: 'Predefinição:Futuro',
    revId: 'rev_wp_tpl_futuro',
    summary: 'Banner para projetos, obras ou eventos planejados para o futuro sujeitos a alterações',
    extraCategories: ['Predefinições de manutenção', 'Eventos atuais'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-sky-300 dark:border-sky-800 border-l-[6px] border-l-sky-600 bg-sky-50/80 dark:bg-sky-950/30 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">🗓️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Evento ou lançamento futuro</div><div class="mt-0.5 leading-relaxed">Este artigo aborda {{#if:{{{assunto|{{{1|}}}}}}|'''{{{assunto|{{{1}}}}}}'''|um projeto ou evento previsto para o futuro}}. Datas e especificações podem ser alteradas até sua concretização.</div></div></div>[[Categoria:Eventos atuais]]</includeonly><noinclude>
Equivalente à \`{{Evento futuro}}\` / \`{{Future}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Futuro|assunto=Missão espacial programada}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Ficção',
    title: 'Predefinição:Ficção',
    revId: 'rev_wp_tpl_ficcao',
    summary: 'Alerta que o artigo descreve obra de ficção como se fosse realidade (perspectiva intra-universo)',
    extraCategories: ['Predefinições de manutenção', 'Cultura e Artes'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">🎭</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Perspectiva ficcional</div><div class="mt-0.5 leading-relaxed">Este artigo descreve um elemento de ficção como se fosse um fato real. Reescreva a partir da perspectiva do mundo real (autoria, publicação e recepção crítica).</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Equivalente à \`{{Ficção}}\` / \`{{In-universe}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Ficção}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Prosa',
    title: 'Predefinição:Prosa',
    revId: 'rev_wp_tpl_prosa',
    summary: 'Sugere converter uma seção em tópicos ou lista longa para texto dissertativo em prosa',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">📝</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Converter lista em prosa{{#if:{{{seção|{{{1|}}}}}}| ({{{seção|{{{1}}}}}})|}}</div><div class="mt-0.5 leading-relaxed">Esta seção contém uma lista extensa de tópicos que seria mais bem compreendida como texto enciclopédico contínuo.</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Equivalente à \`{{Prosa}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Prosa|seção=Curiosidades}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Dividir',
    title: 'Predefinição:Dividir',
    revId: 'rev_wp_tpl_dividir',
    summary: 'Propõe dividir um artigo muito extenso em subartigos especializados',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-purple-300 dark:border-purple-800 border-l-[6px] border-l-purple-600 bg-purple-50/75 dark:bg-purple-950/30 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">✂️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Proposta de divisão de artigo</div><div class="mt-0.5 leading-relaxed">Sugere-se dividir este artigo{{#if:{{{1|}}}| separando conteúdo para [[{{{1}}}]]| em artigos menores e especializados}}. Participe do consenso na página de discussão.</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Equivalente à \`{{Dividir}}\` / \`{{Split}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Dividir|História_do_Projeto}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Dicionário',
    title: 'Predefinição:Dicionário',
    revId: 'rev_wp_tpl_dicionario',
    summary: 'Sinaliza que o conteúdo atual se limita a uma definição dicionarizada e precisa de expansão enciclopédica',
    extraCategories: ['Predefinições de manutenção'],
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3"><span class="text-lg leading-none shrink-0 mt-0.5">📖</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Conteúdo em formato de dicionário</div><div class="mt-0.5 leading-relaxed">Uma enciclopédia vai além da definição lexical de um termo. Amplie com história, contexto, aplicações e fontes secundárias.</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Equivalente à \`{{Dicionário}}\` / \`{{Mover para o Wikcionário}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Dicionário}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de manutenção]]
</noinclude>`,
  },

  // =========================================================================
  // 9. FORMATAÇÃO, DATAS, MOEDAS E TIPOGRAFIA EXTRA
  // =========================================================================
  {
    slug: 'Predefinição:Pequeno',
    title: 'Predefinição:Pequeno',
    revId: 'rev_wp_tpl_pequeno',
    summary: 'Exibe trecho de texto em tamanho reduzido para notas e legendas',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="text-xs">{{{1|Texto em tamanho reduzido}}}</span></includeonly><noinclude>
Equivalente à \`{{Pequeno}}\` / \`{{Small}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Pequeno|Nota explicativa compacta}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Grande',
    title: 'Predefinição:Grande',
    revId: 'rev_wp_tpl_grande',
    summary: 'Exibe trecho de texto em tamanho ligeiramente ampliado',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="text-base font-medium">{{{1|Texto ampliado}}}</span></includeonly><noinclude>
Equivalente à \`{{Grande}}\` / \`{{Large}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Grande|Destaque tipográfico}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sublinhado',
    title: 'Predefinição:Sublinhado',
    revId: 'rev_wp_tpl_sublinhado',
    summary: 'Sublinha um trecho de texto de forma legível',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="underline decoration-gray-500 dark:decoration-gray-400 underline-offset-2">{{{1|Texto sublinhado}}}</span></includeonly><noinclude>
Equivalente à \`{{Sublinhado}}\` / \`{{Underline}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Sublinhado|Termo destacado}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sem_quebra',
    title: 'Predefinição:Sem quebra',
    revId: 'rev_wp_tpl_nowrap',
    summary: 'Impede que palavras, datas ou fórmulas curtas quebrem entre duas linhas (Nowrap)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="whitespace-nowrap">{{{1|texto sem quebra}}}</span></includeonly><noinclude>
Equivalente à \`{{Nowrap}}\` / \`{{Sem quebra}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Sem_quebra|Art. 15 da Lei nº 12.965/2014}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Data',
    title: 'Predefinição:Data',
    revId: 'rev_wp_tpl_data',
    summary: 'Formata datas enciclopédicas no padrão lusófono (dia de mês de ano)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="whitespace-nowrap">{{{1|27}}} de {{#switch:{{{2|11}}}|1|01|jan|janeiro=janeiro|2|02|fev|fevereiro=fevereiro|3|03|mar|março=março|4|04|abr|abril=abril|5|05|mai|maio=maio|6|06|jun|junho=junho|7|07|jul|julho=julho|8|08|ago|agosto=agosto|9|09|set|setembro=setembro|10|out|outubro=outubro|11|nov|novembro=novembro|12|dez|dezembro=dezembro|#default={{{2|novembro}}}}} de {{{3|2026}}}</span></includeonly><noinclude>
Equivalente à \`{{Data}}\` / \`{{Dt}}\` da Wikipédia lusófona para datas consistentes.

== Uso ==
<syntaxhighlight lang="text">
{{Data|27|11|2026}}
{{Data|14|agosto|2018}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Data_de_nascimento',
    title: 'Predefinição:Data de nascimento',
    revId: 'rev_wp_tpl_data_nascimento',
    summary: 'Exibe data de nascimento formatada acompanhada da idade calculada',
    extraCategories: ['Predefinições de formatação', 'Biografias'],
    content: `<includeonly><span class="whitespace-nowrap">{{{3|10}}} de {{#switch:{{{2|12}}}|1|01=janeiro|2|02=fevereiro|3|03=março|4|04=abril|5|05=maio|6|06=junho|7|07=julho|8|08=agosto|9|09=setembro|10=outubro|11=novembro|12=dezembro|#default={{{2|dezembro}}}}} de {{{1|1990}}} ({{#expr:{{CURRENTYEAR}}-{{{1|1990}}}}}&nbsp;anos)</span></includeonly><noinclude>
Equivalente à \`{{Dni}}\` / \`{{Data de nascimento}}\` da Wikipédia (ordem: ano | mês | dia).

== Uso ==
<syntaxhighlight lang="text">
{{Data_de_nascimento|1995|05|18}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Moeda',
    title: 'Predefinição:Moeda',
    revId: 'rev_wp_tpl_moeda',
    summary: 'Formata valores monetários acompanhados de símbolo ou código ISO (BRL, USD, EUR)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><span class="whitespace-nowrap font-normal">{{#switch:{{{2|BRL}}}|BRL|R$=R$&nbsp;|USD|US$=US$&nbsp;|EUR|€=€&nbsp;|GBP|£=£&nbsp;|JPY|¥=¥&nbsp;|#default={{{2|BRL}}}&nbsp;}}{{{1|1.000,00}}}</span></includeonly><noinclude>
Equivalente à \`{{Moeda}}\` / \`{{Currency}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Moeda|1.500,00|BRL}}
{{Moeda|250 milhões|USD}}
{{Moeda|99,90|EUR}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Bandeira',
    title: 'Predefinição:Bandeira',
    revId: 'rev_wp_tpl_bandeira',
    summary: 'Exibe ícone de bandeira acompanhado do nome do país ou região com link wiki',
    extraCategories: ['Predefinições de formatação', 'Geografia'],
    content: `<includeonly><span class="inline-flex items-center gap-1 whitespace-nowrap">{{#switch:{{{1|Brasil}}}|BR|BRA|Brasil=🇧🇷 [[Brasil]]|PT|PRT|Portugal=🇵🇹 [[Portugal]]|US|USA|EUA|Estados Unidos=🇺🇸 [[Estados Unidos]]|AR|ARG|Argentina=🇦🇷 [[Argentina]]|DE|DEU|Alemanha=🇩🇪 [[Alemanha]]|FR|FRA|França=🇫🇷 [[França]]|GB|GBR|UK|Reino Unido=🇬🇧 [[Reino Unido]]|JP|JPN|Japão=🇯🇵 [[Japão]]|ES|ESP|Espanha=🇪🇸 [[Espanha]]|IT|ITA|Itália=🇮🇹 [[Itália]]|CA|CAN|Canadá=🇨🇦 [[Canadá]]|AO|AGO|Angola=🇦🇴 [[Angola]]|MZ|MOZ|Moçambique=🇲🇿 [[Moçambique]]|#default=🏳️ [[{{{1|País}}}]]}}</span></includeonly><noinclude>
Equivalente à \`{{Bandeira}}\` / \`{{BRA}}\` / \`{{Flag}}\` da Wikipédia para tabelas esportivas, geográficas e listas.

== Uso ==
<syntaxhighlight lang="text">
{{Bandeira|Brasil}} · {{Bandeira|Portugal}} · {{Bandeira|Japão}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Tooltip',
    title: 'Predefinição:Tooltip',
    revId: 'rev_wp_tpl_tooltip',
    summary: 'Adiciona explicação flutuante ao passar o cursor sobre um termo técnico',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><abbr class="underline decoration-dotted cursor-help" title="{{{2|Explicação adicional}}}">{{{1|Termo}}}</abbr></includeonly><noinclude>
Equivalente à \`{{Tooltip}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Tooltip|LGPD|Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Abreviatura',
    title: 'Predefinição:Abreviatura',
    revId: 'rev_wp_tpl_abreviatura',
    summary: 'Formata siglas e abreviações com significado completo no atributo title (<abbr>)',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><abbr class="underline decoration-dotted cursor-help font-medium" title="{{{2|Significado completo}}}">{{{1|SIGLA}}}</abbr></includeonly><noinclude>
Equivalente à \`{{Abreviatura}}\` / \`{{Abbr}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Abreviatura|API|Application Programming Interface}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Âncora',
    title: 'Predefinição:Âncora',
    revId: 'rev_wp_tpl_ancora',
    summary: 'Cria uma âncora HTML invisível para links internos diretos (#identificador)',
    extraCategories: ['Predefinições de formatação', 'Predefinições de navegação'],
    content: `<includeonly><span id="{{{1|ancora}}}" class="sr-only"></span></includeonly><noinclude>
Equivalente à \`{{Âncora}}\` / \`{{Anchor}}\` da Wikipédia para apontar links para parágrafos ou linhas de tabela específicas.

== Uso ==
<syntaxhighlight lang="text">
{{Âncora|tabela-comparativa}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Centrar',
    title: 'Predefinição:Centrar',
    revId: 'rev_wp_tpl_centrar',
    summary: 'Centraliza horizontalmente blocos de texto, fórmulas ou legendas',
    extraCategories: ['Predefinições de formatação'],
    content: `<includeonly><div class="my-2 text-center">{{{1|Texto centralizado}}}</div></includeonly><noinclude>
Equivalente à \`{{Centrar}}\` / \`{{Center}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Centrar|'''Texto centralizado na página'''}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de formatação]]
</noinclude>`,
  },

  // =========================================================================
  // 10. COMUNIDADE, VOTAÇÃO E RECONHECIMENTO
  // =========================================================================
  {
    slug: 'Predefinição:Apoio',
    title: 'Predefinição:Apoio',
    revId: 'rev_wp_tpl_apoio',
    summary: 'Selo verde "Apoio" para votações, consultas comunitárias e pedidos de estatuto',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-[11px]">👍 Apoio</span>{{#if:{{{1|}}}| — {{{1}}}|}}</includeonly><noinclude>
Equivalente à \`{{Apoio}}\` / \`{{Support}}\` das votações da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
* {{Apoio|Proposta bem fundamentada e alinhada às políticas.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Contra',
    title: 'Predefinição:Contra',
    revId: 'rev_wp_tpl_contra',
    summary: 'Selo vermelho "Contra" para votações e deliberações comunitárias',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold text-[11px]">👎 Contra</span>{{#if:{{{1|}}}| — {{{1}}}|}}</includeonly><noinclude>
Equivalente à \`{{Contra}}\` / \`{{Oppose}}\` das votações da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
* {{Contra|Carece de maior discussão prévia.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Abstenção',
    title: 'Predefinição:Abstenção',
    revId: 'rev_wp_tpl_abstencao',
    summary: 'Selo neutro "Abstenção" para votações e decisões colegiadas',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-bold text-[11px]">➖ Abstenção</span>{{#if:{{{1|}}}| — {{{1}}}|}}</includeonly><noinclude>
Equivalente à \`{{Abstenção}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
* {{Abstenção|Sem posição formada no momento.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Pergunta',
    title: 'Predefinição:Pergunta',
    revId: 'rev_wp_tpl_pergunta',
    summary: 'Destaca uma pergunta direta ao proponente em páginas de discussão e consultas',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold text-[11px]">❓ Pergunta</span>{{#if:{{{1|}}}|: {{{1}}}|}}</includeonly><noinclude>
Equivalente à \`{{Pergunta}}\` / \`{{Question}}\` usada em debates da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
* {{Pergunta|Como esta regra interage com páginas semi-protegidas?}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Sugestão',
    title: 'Predefinição:Sugestão',
    revId: 'rev_wp_tpl_sugestao',
    summary: 'Sinaliza uma sugestão construtiva em páginas de discussão e revisões',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 font-bold text-[11px]">💡 Sugestão</span>{{#if:{{{1|}}}|: {{{1}}}|}}</includeonly><noinclude>
Destaca propostas alternativas em discussões colaborativas.

== Uso ==
<syntaxhighlight lang="text">
* {{Sugestão|Poderíamos unificar as duas tabelas na seção de comparação.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Resolvido',
    title: 'Predefinição:Resolvido',
    revId: 'rev_wp_tpl_resolvido',
    summary: 'Banner compacto indicando que uma discussão ou pedido foi concluído com sucesso',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><div class="my-2.5 px-3 py-2 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-2"><span class="font-bold">✔ Resolvido:</span><span>{{{1|Esta solicitação foi atendida e encerrada.}}}</span></div></includeonly><noinclude>
Equivalente à \`{{Resolvido}}\` / \`{{Resolved}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Resolvido|As referências solicitadas foram adicionadas ao artigo.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Em_análise',
    title: 'Predefinição:Em análise',
    revId: 'rev_wp_tpl_em_analise',
    summary: 'Selo âmbar "Em análise" para pedidos administrativos ou revisões pendentes',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-[11px]">🔎 Em análise</span>{{#if:{{{1|}}}| — {{{1}}}|}}</includeonly><noinclude>
Indica que um pedido ou denúncia está sendo avaliado pela equipe administrativa ou ArbCom.

== Uso ==
<syntaxhighlight lang="text">
{{Em_análise|Verificação de evidências em curso.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
  {
    slug: 'Predefinição:Estrela',
    title: 'Predefinição:Estrela',
    revId: 'rev_wp_tpl_estrela',
    summary: 'WikiPrêmio / Barnstar concedido a colaboradores em suas páginas de discussão ou usuário',
    extraCategories: ['Predefinições de comunidade'],
    content: `<includeonly><div class="my-3 p-3.5 rounded border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-100 flex items-start gap-3"><span class="text-2xl leading-none shrink-0">🏅</span><div class="min-w-0 flex-1"><div class="font-serif font-bold text-sm text-amber-900 dark:text-amber-200">{{{título|WikiPrêmio de Contribuição}}}</div><div class="mt-1 leading-relaxed">{{{mensagem|{{{1|Em reconhecimento às valiosas contribuições e dedicação à qualidade da enciclopédia!}}}}}}</div>{{#if:{{{de|{{{2|}}}}}}|<div class="mt-1.5 text-[11px] opacity-80">— Concedido por '''{{{de|{{{2}}}}}}'''</div>|}}</div></div></includeonly><noinclude>
Equivalente ao clássico \`{{WikiPrêmio}}\` / \`{{Barnstar}}\` da Wikipédia.

== Uso ==
<syntaxhighlight lang="text">
{{Estrela|título=WikiPrêmio de Documentação|mensagem=Obrigado por ampliar os manuais e referências!|de=Equipe Editorial}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
[[Categoria:Predefinições de comunidade]]
</noinclude>`,
  },
];

export const WIKIPEDIA_DEFAULT_TEMPLATES: Record<string, WikiPage> = Object.fromEntries(
  TEMPLATE_SEEDS.map(seed => [seed.slug, makeTemplatePage(seed)])
);
