import { WikiPage } from '../types/wiki';
import { WIKIPEDIA_DEFAULT_TEMPLATES } from './wikipediaTemplates';
import { WIKI_DEFAULT_CATEGORY_PAGES } from './defaultCategories';

export const INITIAL_PAGES: Record<string, WikiPage> = {
  ...WIKIPEDIA_DEFAULT_TEMPLATES,
  ...WIKI_DEFAULT_CATEGORY_PAGES,
  'Página_principal': {
    slug: 'Página_principal',
    title: 'Página principal',
    namespace: 'Main',
    author: 'Comunidade WikiWazzimaGiygg',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_wazzima_main',
    categories: ['Portais', 'WikiWazzimaGiygg', 'Ciência e Tecnologia', 'Computação e Programação', 'TypeScript'],
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-02T12:00:00.000Z',
    summary: 'Criação da Página Principal do WikiWazzimaGiygg',
    protectionLevel: 'locked',
    isLocked: true,
    protectionReason: 'Página inicial protegida por alta visibilidade e integridade do portal',
    protectedBy: 'Administração',
    protectedByUid: 'system_admin',
    protectedAt: '2026-11-01T00:00:00.000Z',
    protectionExpiry: 'infinity',
    content: `{{Infobox software
| nome = WikiWazzimaGiygg
| subtítulo = Plataforma Wiki em TypeScript e Firestore
| logotipo = /assets/aistudio/image_19fe7a14.png
| tipo = Enciclopédia Livre / Motor Wiki
| desenvolvedor = Comunidade de Código Aberto
| versão_estável = WC1.16.C7.1
| lançamento = 2026
| linguagem = TypeScript (anteriormente PHP)
| plataforma = Web (React 19 + Node.js / Express)
| banco_de_dados = Google Cloud Firestore (em tempo real)
| licença = GPL v2.0+ / MIT
| site = https://wikiwazzimagiygg.wazzimagiygg.com
| repositório = https://github.com/WazzimaGiygg/WikiWazzimaGiygg
| status = Ativo
}}

'''Bem-vindo(a) ao WikiWazzimaGiygg''', a plataforma wiki livre desenvolvida com a interface e experiência clássica do MediaWiki, adaptada para '''TypeScript''' e '''Google Cloud Firestore'''.

Todos os artigos, revisões e discussões deste sistema são armazenados e sincronizados em tempo real diretamente com o banco de dados Firebase Firestore.

== Arquitetura e Tecnologia ==
O WikiWazzimaGiygg substitui o paradigma tradicional por tecnologias modernas:

* '''Do PHP para TypeScript:''' Lógica de negócio, analisador sintático de wikitexto e renderizador de componentes totalmente tipados e modulares.
* '''Do SQL relacional para Firestore NoSQL:''' Dados sincronizados em tempo real com escutas reativas (\`onSnapshot\`).
* '''Sintaxe Wikitexto Completa:''' Cabeçalhos, negrito, itálico, tabelas, notas de rodapé (\`<ref>\` e \`<references />\`), predefinições e links internos com verificação de páginas existentes.
* '''Tema Vector:''' Navegação inspirada no visual clássico com suporte a abas de leitura, edição wikitexto, histórico com comparação de versões (diff) e discussões.

== Por que escolher o WikiWazzimaGiygg em vez da Wikipédia? ==
{{Aviso|'''Dossiê de Auditoria (LGPD & Marco Civil):''' Enquanto a Wikimedia Foundation (WMF) e a Wikipédia Lusófona acumulam não-conformidades críticas perante a legislação brasileira — como exposição histórica de IPs (inclusive de menores), descarte precoce de logs em 90 dias, ausência de DPO e de representante legal no Brasil e recusa ao direito real de eliminação — o '''WikiWazzimaGiygg''' (wikiwazzimagiygg.wazzimagiygg.com) foi projetado com '''Privacidade por Padrão''', '''login obrigatório''' (sem exposição pública de IPs), '''guarda legal de 6 meses''', '''DPO em português''' e '''governança auditável'''. Leia o estudo completo em [[Investigação_LGPD_e_Marco_Civil_sobre_a_Wikipédia]] ou acesse o [https://wazzimagiygg.com/Investiga%C3%A7%C3%A3o%20LGPD%20e%20Marco%20Civ%C3%ADl%20WMF%20e%20Wikip%C3%A9dia.pdf relatório integral em PDF].}}

== Páginas Recomendadas ==
{| class="wikitable" style="width:100%; text-align:left;"
! Seção !! Descrição !! Link
|-
| '''Dossiê: Wikipédia vs. LGPD e Marco Civil'''
| Investigação regulatória completa sobre a WMF/Wikipédia e comparativo com o WikiWazzimaGiygg
| [[Investigação_LGPD_e_Marco_Civil_sobre_a_Wikipédia]]
|-
| '''Arquitetura do Sistema'''
| Estrutura técnica e comparação do modelo NoSQL
| [[Arquitetura_WikiWazzimaGiygg]]
|-
| '''Manual de Configuração'''
| Como gerenciar opções no LocalSettings.ts
| [[Manual:LocalSettings.ts]]
|-
| '''Guia de Edição'''
| Aprenda a formatar artigos em wikitexto
| [[Ajuda:Wikitexto]]
|-
| '''Tutorial: Infobox'''
| Como usar Infobox de usuário e de software
| [[Ajuda:Infobox]]
|-
| '''Tutorial: Predefinições'''
| Guia de transclusão, parâmetros e tags de inclusão
| [[Ajuda:Predefinições]]
|-
| '''Exemplo de Predefinições'''
| Artigo prático demonstrando {{Nome|params}} em ação
| [[Exemplo_de_Uso_de_Predefinições]]
|-
| '''Índice Geral'''
| Explore todas as páginas armazenadas no Firestore
| [[Especial:Todas_as_páginas]]
|}

[[Categoria:Portais]]
[[Categoria:WikiWazzimaGiygg]]
[[Categoria:Ciência e Tecnologia]]
[[Categoria:Computação e Programação]]
[[Categoria:TypeScript]]`
  },

  'Arquitetura_WikiWazzimaGiygg': {
    slug: 'Arquitetura_WikiWazzimaGiygg',
    title: 'Arquitetura WikiWazzimaGiygg',
    namespace: 'Main',
    author: 'Equipe de Engenharia',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_wazzima_arch',
    categories: ['Arquitetura', 'Computação e Programação', 'Ciência e Tecnologia', 'TypeScript', 'Firebase'],
    createdAt: '2026-11-01T02:00:00.000Z',
    updatedAt: '2026-11-02T11:00:00.000Z',
    summary: 'Documentação da arquitetura TypeScript e Firestore do WikiWazzimaGiygg',
    content: `{{Infobox software
| título = Arquitetura WikiWazzimaGiygg
| paradigma = Reativo, Componentizado e Orientado a Eventos
| frontend = React 19 + Tailwind CSS + Lucide
| backend = TypeScript + Express
| armazenamento = Google Cloud Firestore (NoSQL em tempo real)
}}

O '''WikiWazzimaGiygg''' foi construído adaptando o núcleo clássico de wikis para o ecossistema moderno de TypeScript e Firebase Firestore.

== Camada de Dados no Firestore ==
Todos os dados residem nas seguintes coleções do banco de dados:

* \`/wiki_pages/{slug}\`: Documento principal de cada artigo.
* \`/wiki_pages/{slug}/revisions/{revId}\`: Histórico de versões imutáveis para auditoria e reversão.
* \`/wiki_pages/{slug}/talks/{talkId}\`: Tópicos de discussão em tempo real.
* \`/recent_changes/{changeId}\`: Registro cronológico de edições.
* \`/wiki_settings/global\`: Configurações globais equivalentes ao antigo LocalSettings.php.

== O Motor de Diffs ==
O sistema inclui um algoritmo comparador de revisões em TypeScript (\`/src/core/diff.ts\`), permitindo comparar qualquer par de revisões no histórico com destaque de linhas e palavras adicionadas ou removidas.

[[Categoria:Arquitetura]]
[[Categoria:Computação e Programação]]
[[Categoria:Ciência e Tecnologia]]
[[Categoria:TypeScript]]
[[Categoria:Firebase]]`
  },

  'Manual:LocalSettings.ts': {
    slug: 'Manual:LocalSettings.ts',
    title: 'Manual:LocalSettings.ts',
    namespace: 'Manual',
    author: 'Administrador do Sistema',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_settings',
    categories: ['Manual', 'Configuração', 'Documentação', 'WikiWazzimaGiygg'],
    createdAt: '2026-11-01T03:00:00.000Z',
    updatedAt: '2026-11-02T08:00:00.000Z',
    summary: 'Configuração central do WikiWazzimaGiygg',
    content: `{{Infobox software
| título = LocalSettings.ts
| função = Arquivo de Configuração Principal
| formato = TypeScript / Objeto JSON Reativo
}}

No '''WikiWazzimaGiygg''', o arquivo de configuração é o \`LocalSettings.ts\`, operando com tipagem rigorosa e sincronização reativa com o Firestore.

== Opções Configuráveis ==
* '''sitename:''' "WikiWazzimaGiygg"
* '''languageCode:''' "pt-br"
* '''allowAnonymousEditing:''' Permite edições de convidados/anônimos.
* '''enableLivePreview:''' Habilita pré-visualização instantânea enquanto digita.
* '''defaultSkin:''' Tema padrão (Vector 2022, Vector Clássico ou Modo Escuro).

Você pode alterar estas configurações clicando em '''Ferramentas > Configurações da Wiki''' na barra lateral!

[[Categoria:Manual]]
[[Categoria:Configuração]]
[[Categoria:Documentação]]
[[Categoria:WikiWazzimaGiygg]]`
  },

  'Exemplo_de_Uso_de_Predefinições': {
    slug: 'Exemplo_de_Uso_de_Predefinições',
    title: 'Exemplo de Uso de Predefinições',
    namespace: 'Main',
    author: 'Equipe Editorial WikiWazzimaGiygg',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_template_example_article',
    categories: ['Predefinições', 'Tutoriais', 'Wikitexto', 'WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Artigo demonstrativo com exemplos reais de expansão de pré-definições {{Nome|parâmetro}} processadas pelo templateService e renderizadas no ArticleView',
    content: `{{Ver_também|Ajuda:Predefinições|Ajuda:Wikitexto|Ajuda:Infobox}}

{{Ambox
| tipo = estilo
| título = Artigo de Demonstração Prática de Pré-definições
| texto = Todo o conteúdo visual estruturado desta página — caixas de aviso, citações, notas de topo e referências — é expandido dinamicamente pelo serviço \`templateService.ts\` antes da renderização no visualizador de artigos.
| data = Novembro de 2026
}}

{{Infobox software
| nome = Sistema de Pré-definições
| subtítulo = Transclusão Dinâmica MediaWiki
| tipo = Motor de Templates Wikitexto
| plataforma = {{SITENAME}} ({{CURRENTVERSION}})
| linguagem = TypeScript + React
| armazenamento = Firebase Firestore
| status = Ativo
| documentação = [[Ajuda:Predefinições]]
}}

Um artigo bem estruturado no '''{{SITENAME}}''' utiliza '''pré-definições''' (\`templates\`) para padronizar caixas informativas, citações bibliográficas e avisos editoriais sem precisar repetir marcações complexas em cada página.<ref>{{Fonte|WazzimaGiygg Engineering|Especificação do Motor de Pré-definições e Transclusão em TypeScript|{{CURRENTYEAR}}|https://wikiwazzimagiygg.wazzimagiygg.com}}</ref>

== 1. Caixa Informativa com Parâmetros Nomeados ==
{{Artigo_principal|Ajuda:Predefinições}}

Ao utilizar parâmetros nomeados como \`título=\` e \`texto=\`, a ordem dos argumentos deixa de importar e o wikitexto do artigo permanece legível. Veja o código e o resultado renderizado logo abaixo:

<syntaxhighlight lang="text">
{{Info
| título = Exemplo de Parâmetros Dinâmicos
| texto = Esta caixa foi gerada a partir da [[Predefinição:Info]] na página '''{{PAGENAME}}''' em {{CURRENTDATE}}.
}}
</syntaxhighlight>

{{Info
| título = Exemplo de Parâmetros Dinâmicos
| texto = Esta caixa foi gerada a partir da [[Predefinição:Info]] na página '''{{PAGENAME}}''' em {{CURRENTDATE}}.
}}

== 2. Aviso Editorial com Parâmetros Posicionais e Nomeados ==
Você também pode combinar chamadas curtas posicionais ou nomeadas usando a [[Predefinição:Aviso]]:

<syntaxhighlight lang="text">
{{Aviso|título=Boas Práticas|texto=Sempre prefira pré-definições reutilizáveis para manter a consistência visual entre todos os artigos da enciclopédia.}}
</syntaxhighlight>

{{Aviso|título=Boas Práticas|texto=Sempre prefira pré-definições reutilizáveis para manter a consistência visual entre todos os artigos da enciclopédia.}}

== 3. Bloco de Citação com Autor e Fonte ==
A [[Predefinição:Citação]] aceita até três parâmetros posicionais (\`{{{1}}}\`, \`{{{2}}}\`, \`{{{3}}}\`) ou nomeados (\`texto\`, \`autor\`, \`fonte\`), além de suportar palavras mágicas como \`{{CURRENTYEAR}}\` dentro dos próprios argumentos:

<syntaxhighlight lang="text">
{{Citação|O conhecimento livre prospera quando modelos padronizados permitem que qualquer colaborador concentre esforços na qualidade das fontes.|Comunidade WikiWazzimaGiygg|Manual Editorial ({{CURRENTYEAR}})}}
</syntaxhighlight>

{{Citação|O conhecimento livre prospera quando modelos padronizados permitem que qualquer colaborador concentre esforços na qualidade das fontes.|Comunidade WikiWazzimaGiygg|Manual Editorial ({{CURRENTYEAR}})}}

== 4. Estado do Artigo e Lógica Condicional ==
Mesmo funções condicionais como \`{{#if:...}}\` e expressões matemáticas \`{{#expr:...}}\` funcionam junto das pré-definições. Por exemplo, \`21 * 2\` calculado em tempo real no servidor de parser resulta em '''{{#expr: 21 * 2}}'''.

Abaixo está um exemplo da [[Predefinição:Em_construção]] recebendo o parâmetro dinâmico \`editor\`:

<syntaxhighlight lang="text">
{{Em_construção|editor=Equipe Editorial WikiWazzimaGiygg}}
</syntaxhighlight>

{{Em_construção|editor=Equipe Editorial WikiWazzimaGiygg}}

== 5. Selos Comparativos em Tabelas e Notas Contextuais ==
As predefinições [[Predefinição:Sim]], [[Predefinição:Não]] e [[Predefinição:Parcial]] podem ser inseridas diretamente dentro de tabelas wikitexto, enquanto [[Predefinição:Nota]] exibe dicas contextuais estilizadas:

{{Nota|tipo=dica|título=Dica para Novos Editores|texto=Na tela de edição, use a barra de ferramentas visual acima do campo de texto (ou o botão '''Atalhos \`{{}}\`''') para inserir tabelas, links e pré-definições com apenas um clique!}}

{| class="wikitable" style="width:100%; text-align:left;"
! Pré-definição !! Sintaxe Utilizada !! Resultado Renderizado
|-
| [[Predefinição:Sim]] || \`{{Sim|Suportado}}\` || {{Sim|Suportado}}
|-
| [[Predefinição:Parcial]] || \`{{Parcial|Opcional}}\` || {{Parcial|Opcional}}
|-
| [[Predefinição:Não]] || \`{{Não|Desativado}}\` || {{Não|Desativado}}
|-
| [[Predefinição:Ambox]] || \`{{Ambox|tipo=estilo|título=...|texto=...}}\` || Caixa de mensagem editorial
|-
| [[Predefinição:Fonte]] || \`<ref>{{Fonte|Autor|Título|Ano|URL}}</ref>\` || Transclusão em nota de rodapé
|}

== 6. Clássicos da Wikipédia: Citações, Infoboxes, Formatação e Navegação ==
Agora o sistema também traz mais de uma centena das predefinições mais utilizadas pela Wikipédia em Português, incluindo citações bibliográficas e jurídicas (\`{{Citar_web}}\`, \`{{Citar_livro}}\`, \`{{Citar_periódico}}\`, \`{{Citar_lei}}\`, \`{{ISBN}}\`, \`{{DOI}}\`), caixas temáticas (\`{{Info/Biografia}}\`, \`{{Info/País}}\`, \`{{Info/Empresa}}\`, \`{{Info/Livro}}\`, \`{{Info/Jogo}}\`), marcações inline (\`{{Sem_fonte}}\`, \`{{Quando}}\`, \`{{Quem}}\`), formatação tipográfica (\`{{Tecla}}\`, \`{{Cor}}\`, \`{{Lang}}\`, \`{{Fórmula}}\`, \`{{Moeda}}\`, \`{{Bandeira}}\`, \`{{Data}}\`, \`{{Ocultar}}\`) e caixas de rodapé (\`{{Navbox}}\`, \`{{Controle_de_autoridade}}\`):

* '''Atalhos de teclado:''' Pressione {{Tecla|Ctrl|B}} para negrito ou {{Tecla|Ctrl|S}} para salvar.
* '''Amostras de cor, moedas, bandeiras e unidades:''' {{Cor|#3366cc|Azul MediaWiki}}, {{Moeda|1.500,00|BRL}}, {{Bandeira|Brasil}} em {{Data|27|11|2026}} e distância de {{Unidade|384 400|km}}.
* '''Idiomas, siglas e fórmulas:''' Termo {{Lang|en|Open Source}}, sigla {{Abreviatura|API|Application Programming Interface}} e equação {{Fórmula|E = mc²|número=1}}
* '''Marcações de verificação inline:''' Afirmação sem fonte comprovada{{Sem_fonte|data=Novembro de 2026}} ou data vaga{{Quando}}.
* '''Discussões e votações:''' {{Apoio|Modelo padronizado aprovado}}, {{Concordo}} e {{Feito|Integrado ao catálogo}}.

{{Resolvido|Mais de 135 pré-definições oficiais e categorias de artigos/páginas integradas ao catálogo.}}

{{Ocultar|título=Clique para expandir: Exemplo de Citação Web e Navbox da Wikipédia|conteúdo=Exemplo de citação com {{Citar_web|url=https://wikiwazzimagiygg.wazzimagiygg.com|título=Portal Oficial WikiWazzimaGiygg|autor=Equipe Editorial|obra=WikiWazzimaGiygg|data=2026}}}}

{{Navbox
| título = Guia de Pré-definições do {{SITENAME}}
| grupo1 = Citações
| lista1 = {{Lista_horizontal|[[Predefinição:Citar_web]]|[[Predefinição:Citar_livro]]|[[Predefinição:Citar_lei]]|[[Predefinição:Citar_periódico]]}}
| grupo2 = Infoboxes
| lista2 = {{Lista_horizontal|[[Predefinição:Info/Biografia]]|[[Predefinição:Info/País]]|[[Predefinição:Info/Empresa]]|[[Predefinição:Info/Livro]]}}
| grupo3 = Manutenção
| lista3 = {{Lista_horizontal|[[Predefinição:Wikificar]]|[[Predefinição:Carece_de_fontes]]|[[Predefinição:Parcialidade]]|[[Predefinição:Fusão]]}}
| rodapé = [[Ajuda:Predefinições|Ver catálogo completo das pré-definições]] · [[Especial:Categorias|Explorar categorias]]
}}

== 7. Marcação de Esboço e Portais ao Rodapé ==
Ao final do artigo, a chamada \`{{Esboço|Pré-definições MediaWiki}}\` exibe o banner de expansão e adiciona automaticamente o artigo à [[:Categoria:Esboços]]:

{{Esboço|Pré-definições MediaWiki}}

{{Portal|Wikitexto|Predefinições|TypeScript}}

{{Controle_de_autoridade|VIAF=100200300|ORCID=0000-0002-1825-0097}}

== Referências ==
<references />

[[Categoria:Predefinições]]
[[Categoria:Tutoriais]]
[[Categoria:Wikitexto]]
[[Categoria:WikiWazzimaGiygg]]`
  },

  'Ajuda:Wikitexto': {
    slug: 'Ajuda:Wikitexto',
    title: 'Ajuda:Wikitexto',
    namespace: 'Help',
    author: 'Equipe de Documentação',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_help',
    categories: ['Ajuda', 'Documentação', 'Wikitexto'],
    createdAt: '2026-11-01T04:00:00.000Z',
    updatedAt: '2026-11-02T09:00:00.000Z',
    summary: 'Guia completo de formatação de wikitexto',
    content: `{{Aviso|Este guia ensina a formatar artigos no WikiWazzimaGiygg.}}

O '''Wikitexto''' é a linguagem de formatação utilizada para estruturar artigos.

== Formatação de Texto Básica ==
{| class="wikitable"
! Você digita !! Resultado
|-
| \`''itálico''\` || ''itálico''
|-
| \`'''negrito'''\` || '''negrito'''
|-
| \`'''''negrito e itálico'''''\` || '''''negrito e itálico'''''
|-
| \`<s>tachado</s>\` || <s>tachado</s>
|-
| \`<u>sublinhado</u>\` || <u>sublinhado</u>
|}

== Cabeçalhos e Índice ==
<syntaxhighlight lang="text">
== Seção Principal (H2) ==
=== Subseção (H3) ===
</syntaxhighlight>

== Ligações (Links) ==
* '''Link Interno:''' \`[[Página_principal]]\`
* '''Link com Rótulo:''' \`[[Página_principal|Início]]\`
* '''Link Externo:''' \`[https://wikiwazzimagiygg.wazzimagiygg.com Site Oficial]\`
* '''Link de E-mail:''' \`[mailto:contato@exemplo.com Enviar e-mail]\`
* Se o artigo não existir no Firebase, o link aparecerá em '''vermelho'''!

== Caixa de Informação (Infobox software) ==
A predefinição \`{{Infobox software}}\` cria um painel lateral direito padronizado para resumir informações técnicas, institucionais e de contato de um software, projeto ou serviço.

=== Parâmetros Recomendados ===
{| class="wikitable" style="width:100%; text-align:left;"
! Parâmetro !! Obrigatório !! Descrição e Exemplo
|-
| \`nome\` (ou \`título\`) || Sim || Nome principal exibido no cabeçalho da caixa. Ex: \`WikiWazzimaGiygg\`
|-
| \`subtítulo\` || Não || Texto complementar exibido logo abaixo do nome no cabeçalho.
|-
| \`logo\` / \`logotipo\` / \`imagem\` || Não || URL da imagem ou nome de ficheiro carregado (\`Ficheiro:Logo.png\`).
|-
| \`legenda\` || Não || Legenda descritiva exibida abaixo do logotipo.
|-
| \`tipo\` / \`gênero\` || Não || Categoria do software. Ex: \`Enciclopédia Livre\`, \`Editor de Texto\`
|-
| \`desenvolvedor\` / \`autor\` || Não || Pessoa, equipe ou organização criadora do projeto.
|-
| \`mantenedor\` || Não || Responsável atual pela manutenção ou suporte.
|-
| \`e-mail\` || Não || E-mail de contato ou suporte. Endereços válidos viram links \`mailto:\` automaticamente.
|-
| \`versão\` / \`versão_estável\` || Não || Versão atual ou estável lançada. Ex: \`WC1.16.C7.1\` (ou \`{{VERSÃO}}\`)
|-
| \`lançamento\` || Não || Data ou ano de lançamento inicial. Ex: \`2026\`
|-
| \`linguagem\` || Não || Linguagens e tecnologias principais. Ex: \`TypeScript, React\`
|-
| \`plataforma\` || Não || Sistemas operacionais ou ambientes suportados. Ex: \`Web, Linux, Windows\`
|-
| \`licença\` || Não || Licença de uso ou código aberto. Ex: \`GPL v2.0+ / MIT\`
|-
| \`site\` || Não || Endereço oficial do projeto (URLs \`https://\` ficam clicáveis automaticamente).
|-
| \`repositório\` || Não || Link do código-fonte no GitHub, GitLab ou similar.
|-
| \`documentação\` || Não || Link externo ou ligação interna (\`[[Manual:LocalSettings.ts]]\`).
|-
| \`status\` || Não || Estado atual do projeto. Ex: \`Ativo\`, \`Estável\`, \`Em desenvolvimento\`
|-
| \`descrição\` || Não || Resumo curto sobre a finalidade do software.
|}

'''Dica:''' Você também pode adicionar qualquer campo personalizado utilizando sublinhados (\`_\`) no lugar de espaços — por exemplo, \`| banco_de_dados = Firestore\` ou \`| último_lançamento = 15/11/2026\`. Para exibir automaticamente a versão atual do Wiki-Site (\`WC1.16.C7.1\`) em qualquer página, utilize a palavra mágica \`{{VERSÃO}}\` ou \`{{CURRENTVERSION}}\`. No editor de páginas, utilize o botão '''Infobox''' na barra de ferramentas para preencher e inserir o bloco automaticamente. Para ver exemplos de \`{{Infobox usuário}}\` e o passo a passo completo, consulte '''[[Ajuda:Infobox]]'''.

=== Exemplo Completo de Uso ===
<syntaxhighlight lang="text">
{{Infobox software
| nome = Meu Projeto Open Source
| subtítulo = Utilitário multiplataforma de produtividade
| logotipo = /assets/aistudio/image_19fe7a14.png
| legenda = Logotipo oficial do projeto
| tipo = Aplicativo Web / Ferramenta CLI
| desenvolvedor = Equipe de Desenvolvimento
| mantenedor = Comunidade Colaborativa
| e-mail = contato@exemplo.com
| versão_estável = 2.4.1
| lançamento = 10/03/2026
| linguagem = TypeScript, Node.js
| plataforma = Web, Linux, macOS, Windows
| licença = MIT
| site = https://wikiwazzimagiygg.wazzimagiygg.com
| repositório = https://github.com/WazzimaGiygg/WikiWazzimaGiygg
| documentação = [[Arquitetura_WikiWazzimaGiygg|Arquitetura e Docs]]
| status = Ativo
| descrição = Plataforma modular com sincronização em tempo real.
}}
</syntaxhighlight>

[[Categoria:Ajuda]]
[[Categoria:Documentação]]
[[Categoria:Wikitexto]]`
  },

  'Ajuda:Infobox': {
    slug: 'Ajuda:Infobox',
    title: 'Ajuda:Infobox',
    namespace: 'Help',
    author: 'Equipe de Documentação',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_help_infobox',
    categories: ['Ajuda', 'Documentação', 'Infobox', 'Wikitexto'],
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    summary: 'Tutorial completo passo a passo de como usar {{Infobox usuário}} e {{Infobox software}}',
    content: `{{Infobox software
| nome = Tutorial de Infobox
| subtítulo = Guia prático para {{Infobox usuário}} e {{Infobox software}}
| logotipo = /assets/aistudio/image_19fe7a14.png
| tipo = Documentação Oficial
| desenvolvedor = Equipe WikiWazzimaGiygg
| versão_estável = 2.0-ts
| linguagem = Wikitexto / TypeScript
| plataforma = WikiWazzimaGiygg Web
| site = https://wikiwazzimagiygg.wazzimagiygg.com
| documentação = [[Ajuda:Wikitexto|Guia de Wikitexto]]
| status = Ativo
}}

{{Aviso|Este tutorial ensina passo a passo como usar e personalizar caixas de informação ('''Infobox''') tanto para identificar contas de usuários quanto para catalogar softwares e projetos.}}

O '''Infobox''' é um quadro lateral exibido no canto superior direito da página, ideal para destacar informações-chave de forma organizada e padronizada.

== 1. Tutorial Rápido: Como Inserir um Infobox ==
Você pode adicionar um Infobox de duas maneiras:

=== Método A: Usando o Assistente Visual no Editor (Recomendado) ===
# Abra qualquer página (ou sua página pessoal \`Usuário:SeuNome\`) e clique na aba '''Editar'''.
# Na barra de ferramentas acima do campo de texto, clique no botão '''Infobox'''.
# Escolha o modelo desejado: '''Infobox Usuário''' (para páginas de perfil) ou '''Infobox Software''' (para projetos e programas).
# Preencha os campos disponíveis ou clique em '''Preencher exemplo''' / '''Preencher com meus dados'''.
# Clique em '''Inserir Infobox no Artigo''' e depois em '''Publicar alterações'''.

=== Método B: Escrevendo Diretamente em Wikitexto ===
Digite \`{{Infobox usuário\` (ou \`{{Infobox software\`) no topo do artigo, adicione cada campo em uma linha começando com \`|\` no formato \`| nome_do_campo = valor\`, e feche com \`}}\`.

== 2. Infobox de Usuário ({{Infobox usuário}}) ==
Toda nova conta criada no '''WikiWazzimaGiygg''' recebe automaticamente uma página pessoal com o \`{{Infobox usuário}}\` para identificar cada colaborador(a) de forma única (nome, foto, e-mail, Google UID e página de discussão).

=== Parâmetros do Infobox de Usuário ===
{| class="wikitable" style="width:100%; text-align:left;"
! Parâmetro !! Descrição e Exemplo
|-
| \`nome\` || Nome de exibição no cabeçalho da caixa. Ex: \`Maria Silva\`
|-
| \`subtítulo\` || Cargo ou descrição curta abaixo do nome. Ex: \`Editor(a) do WikiWazzimaGiygg\`
|-
| \`foto\` / \`avatar\` / \`imagem\` || URL da foto de perfil ou \`Ficheiro:Avatar.png\`.
|-
| \`usuário\` || Nome de usuário na wiki.
|-
| \`e-mail\` || E-mail de contato (convertido automaticamente em link \`mailto:\`).
|-
| \`uid\` || Identificador único da conta (Google UID), formatado com crases: \`\\\`UID_AQUI\\\`\`.
|-
| \`função\` || Papel na comunidade. Ex: \`Colaborador Registrado\`, \`Administrador\`, \`Burocrata\`
|-
| \`especialidade\` || Áreas de interesse ou conhecimento. Ex: \`TypeScript, História, Biologia\`
|-
| \`idiomas\` || Idiomas falados. Ex: \`Português, Inglês\`
|-
| \`localização\` || Cidade, estado ou país. Ex: \`São Paulo, Brasil\`
|-
| \`página_de_discussão\` || Link interno para contato na wiki: \`[[Discussão_Usuário:Nome|Discussão]]\`
|-
| \`registrado_em\` || Data de entrada na comunidade.
|-
| \`status\` || Disponibilidade atual. Ex: \`Ativo\`, \`Em férias\`
|-
| \`biografia\` || Breve apresentação pessoal.
|}

=== Exemplo Pronto: Infobox de Usuário ===
<syntaxhighlight lang="text">
{{Infobox usuário
| nome = Maria Silva
| subtítulo = Colaboradora do WikiWazzimaGiygg
| foto = /assets/aistudio/image_19fe7a14.png
| usuário = Maria Silva
| e-mail = maria@exemplo.com
| uid = \`user_uid_exemplo_123\`
| função = Colaboradora Registrada
| especialidade = Documentação Técnica e Revisão
| idiomas = Português, Inglês
| localização = Brasil
| página_de_discussão = [[Discussão_Usuário:Maria_Silva|Enviar mensagem]]
| status = Ativo
}}
</syntaxhighlight>

== 3. Infobox de Software ({{Infobox software}}) ==
Utilizado em artigos de aplicativos, bibliotecas, sistemas operacionais e projetos técnicos.

=== Exemplo Pronto: Infobox de Software ===
<syntaxhighlight lang="text">
{{Infobox software
| nome = Meu Software Livre
| subtítulo = Ferramenta colaborativa multiplataforma
| logotipo = /assets/aistudio/image_19fe7a14.png
| tipo = Aplicação Web
| desenvolvedor = Comunidade Aberta
| e-mail = suporte@exemplo.com
| versão_estável = 1.2.0
| lançamento = 2026
| linguagem = TypeScript, React
| plataforma = Web, Linux, Windows, macOS
| licença = MIT
| site = https://wikiwazzimagiygg.wazzimagiygg.com
| repositório = https://github.com/WazzimaGiygg/WikiWazzimaGiygg
| status = Ativo
}}
</syntaxhighlight>

== 4. Dicas Importantes de Formatação ==
* '''E-mails clicáveis:''' Qualquer endereço válido no campo \`e-mail\` vira automaticamente um link \`mailto:\`.
* '''Sites e repositórios:''' Qualquer URL iniciada por \`https://\` ou \`http://\` vira um link externo clicável.
* '''Links internos:''' Use \`[[Nome_da_Página|Texto]]\` dentro de qualquer campo para conectar outras páginas da wiki.
* '''Campos personalizados:''' Você pode criar novos campos livremente usando sublinhados (\`_\`) no lugar de espaços — ex: \`| rede_social = ...\` ou \`| hobby_favorito = ...\`.
* '''Linhas vazias:''' Campos deixados em branco são ocultados automaticamente na leitura final.

[[Categoria:Ajuda]]
[[Categoria:Documentação]]
[[Categoria:Infobox]]`
  },

  'Wiki:Código_Universal_de_Conduta': {
    slug: 'Wiki:Código_Universal_de_Conduta',
    title: 'Wiki:Código Universal de Conduta',
    namespace: 'Wiki',
    author: 'Comitê de Governança',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_ucoc',
    categories: ['Políticas', 'Governança', 'UCoC'],
    createdAt: '2026-11-01T05:00:00.000Z',
    updatedAt: '2026-11-02T10:00:00.000Z',
    summary: 'Instituição do Código Universal de Conduta (UCoC) do WikiWazzimaGiygg',
    protectionLevel: 'semi_protected',
    isLocked: false,
    protectionReason: 'Política oficial de conduta da comunidade',
    content: `{{Aviso|Esta página define a política mandatória de convivência e conduta comunitária no WikiWazzimaGiygg.}}

== Introdução ao Código Universal de Conduta (UCoC) ==
O '''Código Universal de Conduta (UCoC)''' estabelece uma linha de base comum de comportamento aceitável para todos os editores, voluntários, administradores e burocratas do WikiWazzimaGiygg. Nosso objetivo é manter um ambiente seguro, colaborativo e livre de hostilidade.

== Princípios Fundamentais ==
# '''Respeito Mútuo:''' Trate todas as pessoas com civilidade e consideração, mesmo durante disputas editoriais acirradas.
# '''Pressuposição de Boa-fé:''' A menos que haja evidência clara e inequívoca de má intenção, assuma que os colegas editores estão tentando melhorar o projeto.
# '''Inclusão e Diversidade:''' É vedada qualquer forma de preconceito ou discriminação por motivo de raça, etnia, gênero, orientação sexual, crença ou nacionalidade.
# '''Resolução Construtiva de Conflitos:''' Discuta o conteúdo e os argumentos, nunca a pessoa do editor.

== Condutas Inaceitáveis ==
As seguintes práticas são passíveis de bloqueio imediato e sanção pelo Conselho de Arbitragem:
* '''Assédio e Perseguição (Wikihounding):''' Seguir sistematicamente as edições de outro usuário com objetivo de intimidação.
* '''Discurso de Ódio:''' Publicação de ofensas e difamações.
* '''Abuso de Poder:''' Uso indevido de ferramentas administrativas para prevalecer em disputas editoriais.
* '''Doxxing:''' Divulgação não autorizada de dados pessoais reais de qualquer editor.

== Portal de Denúncias ==
Para reportar violações ao UCoC com análise administrativa sigilosa, acesse [[Especial:UCOC]].

[[Categoria:Políticas]]
[[Categoria:Governança]]
[[Categoria:UCoC]]`
  },

  'Wiki:Conselho_de_Arbitragem': {
    slug: 'Wiki:Conselho_de_Arbitragem',
    title: 'Wiki:Conselho de Arbitragem',
    namespace: 'Wiki',
    author: 'Burocratas',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_arbcom',
    categories: ['Políticas', 'ArbCom', 'Governança'],
    createdAt: '2026-11-01T06:00:00.000Z',
    updatedAt: '2026-11-02T10:30:00.000Z',
    summary: 'Regimento do Conselho de Arbitragem (ArbCom)',
    protectionLevel: 'locked',
    isLocked: true,
    protectionReason: 'Regimento do órgão máximo de apelação e disputas comunitárias',
    content: `{{Infobox software
| título = Conselho de Arbitragem (ArbCom)
| atribuição = Última Instância de Resolução de Conflitos
| decisões = Vinculativas para todos os editores
}}

O '''Conselho de Arbitragem (ArbCom)''' atua como o tribunal de última instância para resolver disputas insolúveis de conduta e condutas editoriais graves no WikiWazzimaGiygg.

== Jurisdição ==
O Conselho não julga a veracidade factual de artigos nem atua como autoridade enciclopédica; sua competência restringe-se a:
* Conflitos de conduta persistentes não sanados por mediação regular.
* Recursos contra bloqueios e sanções prolongadas.
* Investigação de abusos de ferramentas avançadas por administradores e burocratas.

== Procedimento de um Caso ==
# '''Abertura do Caso:''' O requerente submete a petição contendo partes envolvidas, evidências e tentativas prévias de resolução.
# '''Fase de Admissibilidade:''' Os árbitros votam aceitar ou rejeitar o caso.
# '''Audiência e Evidências:''' As partes e testemunhas apresentam registros de difs e argumentos.
# '''Deliberação e Veredito:''' O conselho publica determinações e remédios obrigatórios.

Gerencie ou consulte os casos em andamento em [[Especial:Conselho_de_Arbitragem]].

[[Categoria:Políticas]]
[[Categoria:ArbCom]]`
  },

  'Wiki:Verificação_de_contas': {
    slug: 'Wiki:Verificação_de_contas',
    title: 'Wiki:Verificação de contas',
    namespace: 'Wiki',
    author: 'CheckUsers',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_checkuser',
    categories: ['Políticas', 'CheckUser', 'Segurança'],
    createdAt: '2026-11-01T07:00:00.000Z',
    updatedAt: '2026-11-02T11:00:00.000Z',
    summary: 'Política de Verificação de Contas e Contas Fantoche (Sockpuppets)',
    protectionLevel: 'semi_protected',
    isLocked: false,
    protectionReason: 'Política oficial de combate a fantoches',
    content: `{{Aviso|O uso indevido de múltiplas contas (fantoches ou sockpuppets) para forjar consenso ou burlar sanções é expressamente proibido.}}

== O que é a Verificação de Contas? ==
A ferramenta de '''Verificação de Contas''' (equivalente ao ''CheckUser'' do MediaWiki) permite que verificadores credenciados e administradores examinem padrões comportamentais, registros de alterações simultâneas e UIDs para identificar o uso indevido de contas fantoche.

== Uso Permitido vs. Proibido ==
* '''Permitido com aviso:''' Ter contas secundárias devidamente identificadas para testes de interface ou bots automatizados.
* '''Proibido:'''
** Votar mais de uma vez em consultas à comunidade ou votações de desbloqueio.
** Burlar bloqueios ou restrições de edição.
** Criar a ilusão de consenso comunitário em discussões acaloradas.
** Fazer guerras de edições coordenadas.

== Abertura de Investigações ==
Para solicitar uma apuração contra contas suspeitas, visite [[Especial:CheckUser]].

[[Categoria:Políticas]]
[[Categoria:CheckUser]]`
  },

  'Wiki:Discussão_de_bloqueio': {
    slug: 'Wiki:Discussão_de_bloqueio',
    title: 'Wiki:Discussão de bloqueio',
    namespace: 'Wiki',
    author: 'Administração',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_unblock',
    categories: ['Políticas', 'Administração'],
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-02T11:30:00.000Z',
    summary: 'Regras para pedidos de revisão e discussão de desbloqueio',
    protectionLevel: 'semi_protected',
    isLocked: false,
    content: `{{Aviso|Usuários bloqueados possuem o direito de recorrer da decisão através de um pedido formal fundamentado.}}

== Como Funciona a Discussão de Desbloqueio ==
Quando uma conta é submetida a um bloqueio disciplinar, ela pode protocolar um recurso argumentando sobre as circunstâncias da ação, eventuais mal-entendidos ou demonstrando compromisso de adesão ao [[Wiki:Código_Universal_de_Conduta]].

== Fases do Processo ==
# '''Protocolo:''' O usuário bloqueado indica o motivo pelo qual entende que a medida deve ser revogada ou atenuada.
# '''Deliberação Comunitária:''' Administradores e editores ativos emitem votos com justificativas (''Desbloquear'', ''Manter bloqueio'', ''Neutro'').
# '''Decisão e Execução:''' Um burocrata encerra a deliberação. Caso aprovado, o papel \`bloqueado\` é automaticamente revogado no Firestore.

Acesse a lista de pedidos e delibere em [[Especial:Discussão_de_desbloqueio]].

[[Categoria:Políticas]]
[[Categoria:Administração]]`
  },

  'Wiki:Política_de_Privacidade': {
    slug: 'Wiki:Política_de_Privacidade',
    title: 'Wiki:Política de Privacidade',
    namespace: 'Wiki',
    author: 'Encarregado de Dados (DPO)',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_lgpd_privacy',
    categories: ['Políticas', 'Privacidade', 'LGPD', 'Governança'],
    createdAt: '2026-11-17T00:00:00.000Z',
    updatedAt: '2026-11-17T00:00:00.000Z',
    summary: 'Política de Privacidade e Proteção de Dados Pessoais em conformidade com a LGPD (Lei nº 13.709/2018)',
    protectionLevel: 'semi_protected',
    isLocked: false,
    protectionReason: 'Documento institucional de conformidade com a LGPD',
    content: `{{Aviso|Esta Política de Privacidade descreve como o '''WikiWazzimaGiygg''' (wikiwazzimagiygg.wazzimagiygg.com) trata dados pessoais em conformidade com a '''Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)''' e o '''Marco Civil da Internet (Lei nº 12.965/2014)'''.}}

== 1. Controlador e Encarregado (DPO — Art. 41 da LGPD) ==
* '''Plataforma / Controlador:''' WikiWazzimaGiygg (wikiwazzimagiygg.wazzimagiygg.com) — Versão {{VERSÃO}}.
* '''Canal do Encarregado (DPO):''' [mailto:pedrohenriquecardonaperes@gmail.com pedrohenriquecardonaperes@gmail.com]
* '''Portal de Autoatendimento:''' [[Especial:Privacidade|Central de Privacidade e LGPD]]

== 2. Princípios e Minimização de Dados (Art. 6º e Art. 46) ==
Adotamos '''Privacidade por Padrão (Privacy by Default)''':
* Visitantes podem ler todo o conteúdo enciclopédico sem criar conta nem fornecer dados pessoais.
* Ao autenticar-se com conta Google, coletamos apenas o mínimo necessário para atribuição editorial e segurança (identificador técnico UID, nome de exibição, foto de perfil opcional e e-mail mantido privado).
* Por padrão, o '''e-mail pessoal não é publicado''' na página pública \`Usuário:<Nome>\`.
* Não comercializamos dados pessoais nem realizamos rastreamento publicitário comportamental.

== 3. Bases Legais para o Tratamento (Art. 7º da LGPD) ==
{| class="wikitable" style="width:100%; text-align:left;"
! Finalidade !! Dados Tratados !! Base Legal (LGPD)
|-
| Autenticação e acesso de editores || UID, nome de exibição, e-mail privado, foto || Execução de contrato / Termos de Uso (Art. 7º, V)
|-
| Histórico público de revisões e atribuição || Nome público do autor, data/hora e conteúdo editado || Execução de contrato e legítimo interesse editorial sob CC BY-SA 4.0 (Art. 7º, V e IX)
|-
| Guarda de registros de acesso a aplicações || Data, hora e identificador técnico || Cumprimento de obrigação legal — Art. 15 do Marco Civil (Art. 7º, II)
|-
| Preferências de tema e integrações opcionais || Escolha de tema (Vector/Escuro) e preferências de consentimento || Consentimento do titular, revogável a qualquer momento (Art. 7º, I e Art. 8º, § 5º)
|}

== 4. Direitos do Titular (Art. 18 da LGPD) ==
Você pode exercer gratuitamente, a qualquer momento, através da [[Especial:Privacidade|Central de Privacidade e LGPD]]:
# '''Confirmação e acesso''' aos dados pessoais tratados.
# '''Correção''' de dados incompletos, inexatos ou desatualizados.
# '''Anonimização, bloqueio ou eliminação''' de dados desnecessários ou excessivos.
# '''Portabilidade''' mediante exportação estruturada em formato JSON.
# '''Revogação do consentimento''' para cookies e armazenamento não essenciais.

== 5. Segurança da Informação (Art. 46 da LGPD) ==
Empregamos criptografia em trânsito (HTTPS/TLS), controle de acesso baseado em papéis e regras de isolamento de dados pessoais (PII) no Google Cloud Firestore, além de cabeçalhos HTTP de proteção de privacidade.

[[Categoria:Políticas]]
[[Categoria:Privacidade]]
[[Categoria:LGPD]]`
  },

  'Wiki:Termos_de_Uso': {
    slug: 'Wiki:Termos_de_Uso',
    title: 'Wiki:Termos de Uso',
    namespace: 'Wiki',
    author: 'Comitê de Governança',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_marco_civil_terms',
    categories: ['Políticas', 'Marco Civil', 'Governança'],
    createdAt: '2026-11-17T00:00:00.000Z',
    updatedAt: '2026-11-17T00:00:00.000Z',
    summary: 'Termos de Uso alinhados ao Marco Civil da Internet (Lei nº 12.965/2014) e licença CC BY-SA 4.0',
    protectionLevel: 'semi_protected',
    isLocked: false,
    protectionReason: 'Termos de Uso oficiais em conformidade com o Marco Civil da Internet',
    content: `{{Aviso|Estes Termos de Uso regem a utilização do '''WikiWazzimaGiygg''' (wikiwazzimagiygg.wazzimagiygg.com) em conformidade com o '''Marco Civil da Internet (Lei nº 12.965/2014)''', o '''Decreto nº 8.771/2016''' e a '''LGPD (Lei nº 13.709/2018)'''.}}

== 1. Princípios e Direitos dos Usuários (Art. 3º e Art. 7º do Marco Civil) ==
O WikiWazzimaGiygg assegura aos usuários:
* '''Liberdade de expressão e acesso ao conhecimento''' na construção colaborativa de artigos enciclopédicos.
* '''Inviolabilidade da intimidade e da vida privada''' e transparência clara sobre o tratamento de dados (consulte [[Wiki:Política_de_Privacidade]]).
* '''Informações claras e completas''' sobre coleta, uso, armazenamento e exclusão de dados.

== 2. Guarda de Registros de Acesso a Aplicações (Art. 15 e Art. 22) ==
Em cumprimento ao '''Art. 15 da Lei nº 12.965/2014''', os registros de acesso à aplicação são mantidos sob sigilo, em ambiente controlado e de segurança, pelo prazo mínimo de '''6 (seis) meses'''. A disponibilização desses registros a terceiros somente ocorre mediante '''ordem judicial específica''', nos termos do Art. 22 do Marco Civil da Internet.

== 3. Responsabilidade por Conteúdo de Terceiros e Remoção (Art. 19 e Art. 21) ==
* '''Art. 19 (Regra Geral):''' Com o intuito de assegurar a liberdade de expressão e impedir a censura, a remoção compulsória de conteúdo gerado por terceiros depende de '''ordem judicial específica''' que contenha a identificação clara e inequívoca do endereço/URL da página.
* '''Art. 21 (Exceção Urgente):''' Mediante simples notificação do participante ou de seu representante legal — com indicação clara da página/URL — será promovida a indisponibilização diligente de conteúdo contendo cenas de nudez ou atos sexuais de caráter privado divulgados sem autorização.
* '''Conduta Comunitária:''' Conteúdos que violem o [[Wiki:Código_Universal_de_Conduta]] (assédio, discurso de ódio, doxxing ou vandalismo) continuam sujeitos à moderação editorial da comunidade.

Para protocolar notificações formais ou pedidos legais, utilize a [[Especial:Privacidade|Central de Privacidade e Marco Civil]].

== 4. Licenciamento das Contribuições ==
Ao publicar textos ou edições no WikiWazzimaGiygg, o colaborador concorda em licenciá-los sob a '''Creative Commons Atribuição-CompartilhaIgual 4.0 Internacional (CC BY-SA 4.0)''' e a '''GNU General Public License v2+''', preservando-se a atribuição de autoria no histórico de revisões.

[[Categoria:Políticas]]
[[Categoria:Marco Civil]]
[[Categoria:Governança]]`
  },

  'Investigação_LGPD_e_Marco_Civil_sobre_a_Wikipédia': {
    slug: 'Investigação_LGPD_e_Marco_Civil_sobre_a_Wikipédia',
    title: 'Investigação LGPD e Marco Civil sobre a Wikipédia',
    namespace: 'Main',
    author: 'Observatório de Conformidade WikiWazzimaGiygg',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_investigacao_lgpd_wmf',
    categories: ['LGPD', 'Marco Civil', 'Auditoria', 'Privacidade', 'Direito Digital', 'Governança'],
    createdAt: '2026-11-19T00:00:00.000Z',
    updatedAt: '2026-11-19T00:00:00.000Z',
    summary: 'Dossiê investigativo sobre não-conformidades da Wikimedia Foundation (WMF) e Wikipédia Lusófona frente à LGPD e ao Marco Civil da Internet',
    protectionLevel: 'semi_protected',
    isLocked: false,
    protectionReason: 'Dossiê documental de conformidade regulatória e comparativo institucional',
    content: `{{Aviso|'''Dossiê de Conformidade Regulatória (Documento Integral):''' Este artigo sintetiza a investigação jurídica e técnica sobre a '''Wikimedia Foundation (WMF)''' e a '''Wikipédia Lusófona''' frente à '''LGPD (Lei nº 13.709/2018)''' e ao '''Marco Civil da Internet (Lei nº 12.965/2014)'''. Consulte a íntegra do relatório de 41 páginas em [https://wazzimagiygg.com/Investiga%C3%A7%C3%A3o%20LGPD%20e%20Marco%20Civ%C3%ADl%20WMF%20e%20Wikip%C3%A9dia.pdf Investigação LGPD e Marco Civil — WMF e Wikipédia (PDF)].}}

'''Por que a Wikipédia falha com o cidadão brasileiro — e por que o WikiWazzimaGiygg existe.''' Embora a Wikimedia Foundation (WMF) e a Wikipédia Lusófona operem sem fins lucrativos e divulguem princípios de minimização comercial, a auditoria documental demonstra um estado contínuo de '''não-conformidade material e regulatória''' em pontos centrais da '''LGPD (Lei nº 13.709/2018)''', do '''Marco Civil da Internet (Lei nº 12.965/2014)''', do '''Código de Processo Civil (CPC)''' e do '''Estatuto da Criança e do Adolescente (ECA)'''.

== Quadro Comparativo: Wikipédia (WMF) vs. WikiWazzimaGiygg ==
{| class="wikitable" style="width:100%; text-align:left;"
! Frente Regulatória !! Wikipédia / WMF (Auditoria) !! Risco !! WikiWazzimaGiygg (wikiwazzimagiygg.wazzimagiygg.com)
|-
| '''Exposição de IPs (LGPD Arts. 6º e 46)'''
| Expôs IPs públicos por décadas; passivo histórico permanece público, indexado e vulnerável a ''data scraping''. ''IP Masking'' atua apenas prospectivamente.
| '''CRÍTICO (AUD-01)'''
| Edições sem login são '''permanentemente bloqueadas'''. Nenhum endereço IP é publicado no histórico de artigos.
|-
| '''Proteção de Menores (LGPD Art. 14 e ECA)'''
| Sem verificação etária; IPs de editores menores que colaboraram sem login continuam expostos publicamente sem consentimento parental.
| '''CRÍTICO (Q10 / AUD-01)'''
| Exigência de conta autenticada e '''Privacidade por Padrão''' (e-mail oculto nas páginas de usuário).
|-
| '''Guarda de Logs (Marco Civil Art. 15)'''
| Expurga logs técnicos e ''CheckUser'' em '''90 dias''' (metade do prazo legal), frustrando ordens judiciais em inquéritos brasileiros.
| '''ALTO (AUD-02)'''
| Retenção configurada em conformidade com o prazo mínimo legal de '''6 meses (180 dias)''' sob sigilo.
|-
| '''Encarregado / DPO no Brasil (LGPD Art. 41)'''
| Centraliza tudo no e-mail genérico <code>privacy@wikimedia.org</code> nos EUA, sem DPO local em português (apesar de manter representante ''Bird & Bird'' na UE/UK).
| '''ALTO (ANPD)'''
| DPO formalmente designado em português (<code>pedrohenriquecardonaperes@gmail.com</code>) e portal direto [[Especial:Privacidade]].
|-
| '''Direito à Eliminação (LGPD Art. 18)'''
| ''Vanishing'' apenas renomeia a conta, mantendo intactos históricos, metadados e discussões; ''Oversight'' subordinado a filtros voluntários sob CC-BY-SA.
| '''ALTO (AUD-04)'''
| Canal direto de requisições do Art. 18 (acesso, retificação, portabilidade e eliminação/anonimização) em [[Especial:Privacidade]].
|-
| '''Representação Legal no Brasil (MCI Art. 11 e CPC Art. 75)'''
| Sem CNPJ, filial ou procurador no país (Wiki Movimento Brasil não tem poderes de representação); obriga uso de '''Cartas Rogatórias''' morosas nos EUA, mesmo arrecadando doações em BRL.
| '''ALTO (AUD-03)'''
| Governança transparente em português e aderência expressa ao ordenamento brasileiro e ao STF Tema 987.
|-
| '''Transferência Internacional (LGPD Art. 33 e Res. ANPD nº 19/2024)'''
| Processa dados nos EUA sem publicar cláusulas-padrão contratuais (CPCs) nem declaração nos moldes do Art. 17 da Resolução nº 19/2024.
| '''MÉDIO / ALTO'''
| Política de Privacidade clara em português detalhando agentes, finalidade e direitos em [[Wiki:Política_de_Privacidade]].
|-
| '''Moderação e Accountability (MCI Art. 19 e LGPD Art. 20)'''
| Moderadores pseudônimos sem vínculo formal, recusa sistemática de pedidos extrajudiciais (VRT/OTRS) e criação de uma ''"zona de anomia regulatória"''.
| '''MÉDIO / ALTO (AUD-05)'''
| Administração auditável com logs imutáveis, regras de proteção claras e protocolo formal para Art. 19 e Art. 21 do Marco Civil.
|}

== 1. Exposição de Endereços IP e Passivo Histórico (LGPD, Arts. 6º e 46 — Risco CRÍTICO) ==
* '''O IP como Dado Pessoal:''' No ordenamento brasileiro (LGPD, Marco Civil, STJ e ANPD), o endereço IP (IPv4 e IPv6) é dado pessoal por permitir a identificação direta ou indireta do cidadão.
* '''Passivo Histórico Indexado:''' Por mais de duas décadas, o MediaWiki gravou e publicou permanentemente o IP completo de editores deslogados no histórico de revisões (<code>action=history</code>) e nos registros de abusos.
* '''Insuficiência do ''IP Masking'' (Contas Temporárias):''' Embora a WMF tenha iniciado a implantação de Contas Temporárias para edições futuras, a medida é '''estritamente prospectiva''' e não corrige nem oculta o acervo histórico acumulado por décadas.
* '''Risco de Reidentificação por ''Data Scraping'':''' Terceiros podem minerar automaticamente IPs históricos da Wikipédia e cruzá-los com vazamentos externos, logs e geolocalização para desmascarar a identidade civil e a localização física de cidadãos brasileiros.

== 2. Proteção de Crianças e Adolescentes (LGPD, Art. 14 e ECA — Risco CRÍTICO) ==
* '''Ausência de Verificação Etária:''' A WMF não aplica barreiras etárias no cadastro nem na edição livre, tratando dados de menores exatamente como os de adultos, sem consentimento parental específico em destaque.
* '''Exposição Permanente de Menores:''' Jovens que editaram a Wikipédia sem login no passado tiveram seus endereços IP gravados publicamente nos históricos abertos, ficando permanentemente expostos a mineração de dados e reidentificação em violação direta ao Art. 14 da LGPD e ao ECA (Lei nº 8.069/1990).

== 3. Divergência na Retenção de Logs de Acesso (Marco Civil, Art. 15 — Risco ALTO) ==
* '''Obrigação Legal de 6 Meses (180 dias):''' O Artigo 15 do Marco Civil impõe a provedores organizados profissionalmente a guarda sigilosa de registros de acesso por 6 meses para subsidiar investigações cíveis e criminais.
* '''Expurgo Antecipado em 90 Dias:''' Pelas ''Wikimedia Data Retention Guidelines'' e logs de ''CheckUser'', a WMF destrói dados de IP e ''User-Agent'' após '''90 dias (3 meses)''' — exatamente metade do prazo legal.
* '''Frustração de Ordens Judiciais:''' Quando a polícia ou o cidadão lesado obtém decisão judicial de quebra de sigilo telemático, os registros já foram apagados. A tese de entidade sem fins lucrativos não afasta a lei, pois a WMF opera com orçamento multimilionário, estrutura profissional e captação ativa de doações em Real (BRL).

== 4. Ausência de Encarregado de Dados (DPO) no Brasil (LGPD, Art. 41 — Risco ALTO) ==
* '''Infração Formal Direta:''' O Artigo 41 da LGPD e a '''Resolução CD/ANPD nº 18/2024''' exigem a indicação formal e divulgação pública de um Encarregado (DPO) acessível aos titulares e à ANPD, vedando atendimento exclusivamente automatizado ou genérico.
* '''Assimetria Internacional:''' A WMF nomeou formalmente um representante de privacidade para a União Europeia e o Reino Unido (o escritório ''Bird & Bird'' para o GDPR), mas mantém para o Brasil apenas o e-mail genérico na Califórnia (<code>privacy@wikimedia.org</code>).
* '''Inaplicabilidade de Isenções:''' Pelo princípio da extraterritorialidade (Art. 3º da LGPD), a sede nos EUA não afasta a lei brasileira; entidades sem fins lucrativos não são isentas; e o volume massivo de centenas de milhões de acessos impede enquadramento como Agente de Pequeno Porte (Resolução CD/ANPD nº 2/2022). A associação ''Wiki Movimento Brasil'' (WMB) restringe seu DPO apenas às suas atividades internas, sem poderes sobre a WMF global.

== 5. Conflito no Direito à Eliminação: ''Vanishing'' vs. LGPD Art. 18 (Risco ALTO) ==
* '''A Ilusão do ''Vanishing'':''' A política comunitária de desaparecimento apenas renomeia a conta para um código genérico, mantendo públicos e intactos o histórico de edições, metadados de horário e páginas de discussão — onde frequentemente subsistem nomes civis e assinaturas antigas.
* '''Restrição do ''Oversight'' e Licença CC-BY-SA:''' A supressão definitiva fica subordinada a filtros restritos de moderadores voluntários sob a doutrina do ''"Right to Remember"'' e da licença Creative Commons, colocando contratos privados e regimentos internos acima de uma lei federal de ordem pública.
* '''Inaplicabilidade da Exceção Jornalística a Metadados (Art. 4º, II):''' Mesmo que artigos enciclopédicos invoquem finalidade informativa, metadados de editores, logs de IP, bloqueios e páginas de discussão comunitária não têm natureza jornalística nem acadêmica, submetendo-se integralmente à LGPD.

== 6. Ausência de Representação Legal no Brasil (Marco Civil, Art. 11 e CPC, Art. 75 — Risco ALTO) ==
* '''Evasão Jurisdicional:''' A WMF não possui CNPJ, filial ou procurador formal no Brasil. O próprio estatuto do ''Wiki Movimento Brasil'' (WMB) declara que a associação é independente e não representa judicialmente a fundação americana.
* '''Cartas Rogatórias e Ineficácia de Liminares:''' Sem representante local, cidadãos e juízes brasileiros precisam recorrer a '''Cartas Rogatórias internacionais''' via Ministério da Justiça (DRCI), cujo trâmite leva meses ou anos — inviabilizando tutelas de urgência contra difamação ou exposição de dados, em confronto direto com o Art. 11, § 2º do Marco Civil, o Art. 75, X do CPC e a tese do '''STF (Tema 987)'''.

== 7. Transferência Internacional de Dados (LGPD, Art. 33 e Res. ANPD nº 19/2024) ==
* A WMF transfere continuamente dados de usuários brasileiros para servidores nos EUA sem publicar as cláusulas-padrão contratuais (CPCs) nem a declaração detalhada em português exigida pelo Artigo 17 da Resolução CD/ANPD nº 19/2024.

== 8. Moderação Anônima, Artigo 19 e Falta de ''Accountability'' (LGPD, Art. 20) ==
* '''Zona de Anomia Regulatória:''' Decisões sobre biografias de pessoas vivas, exclusão de artigos, bloqueios e inspeção de dados não públicos (''CheckUser'') são tomadas por voluntários pseudônimos sem vínculo contratual com a WMF. Enquanto a fundação afirma não supervisionar o conteúdo, a comunidade não possui personalidade jurídica.
* '''Resistência a Pedidos Extrajudiciais:''' O Artigo 19 do Marco Civil é usado como escudo para rejeitar sistematicamente notificações extrajudiciais de cidadãos lesados, redirecionando titulares a fóruns voluntários (VRT/OTRS) sem formação jurídica ou impondo o ônus de litigar no exterior.

== Fontes e Documento Original ==
* '''Documento Completo da Investigação (PDF — 41 páginas):''' [https://wazzimagiygg.com/Investiga%C3%A7%C3%A3o%20LGPD%20e%20Marco%20Civ%C3%ADl%20WMF%20e%20Wikip%C3%A9dia.pdf Investigação LGPD e Marco Civil — WMF e Wikipédia]
* '''Legislação Brasileira:''' LGPD (Lei nº 13.709/2018), Marco Civil da Internet (Lei nº 12.965/2014), Decreto nº 8.771/2016, CPC (Lei nº 13.105/2015), ECA (Lei nº 8.069/1990), Resoluções CD/ANPD nº 2/2022, nº 18/2024 e nº 19/2024.
* '''Jurisprudência do STF:''' Repercussão Geral — Temas 987 e 533 sobre o Marco Civil da Internet.
* '''Documentos Auditados da WMF / Wikipédia Lusófona:''' ''Wikimedia Foundation Privacy Policy'', ''Data Retention Guidelines'', ''Terms of Use'', documentação de ''Temporary Accounts (IP Masking)'', ''WP:BLP'', ''WP:Vanishing'', ''WP:Oversight'', ''WP:CheckUser'', ''WP:VRT (OTRS)'' e Estatuto do ''Wiki Movimento Brasil (WMB)''.
* '''Conformidade no WikiWazzimaGiygg:''' Consulte [[Wiki:Política_de_Privacidade]], [[Wiki:Termos_de_Uso]] e o portal [[Especial:Privacidade]].

[[Categoria:LGPD]]
[[Categoria:Marco Civil]]
[[Categoria:Auditoria]]
[[Categoria:Privacidade]]
[[Categoria:Direito Digital]]
[[Categoria:Governança]]`
  },

  'Ajuda:Predefinições': {
    slug: 'Ajuda:Predefinições',
    title: 'Ajuda:Predefinições',
    namespace: 'Help',
    author: 'Equipe de Documentação',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_help_templates',
    categories: ['Ajuda', 'Documentação', 'Predefinições', 'Wikitexto'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Guia completo de Predefinições (Templates) no estilo MediaWiki: transclusão, parâmetros, tags de inclusão, subst e ParserFunctions',
    content: `{{Aviso|Este guia explica como criar, documentar e transcluir '''Predefinições''' (espaço nominal <code>Predefinição:</code>) exatamente como no MediaWiki. Veja também o artigo prático [[Exemplo_de_Uso_de_Predefinições]] para conferir todas elas renderizadas ao vivo.}}

Uma '''Predefinição''' é uma página especial do espaço nominal <code>Predefinição:</code> cujo conteúdo é projetado para ser reutilizado (''transcluído'') dentro de outros artigos por meio de chaves duplas <code>{{Nome}}</code>. Quando a predefinição é atualizada, todas as páginas que a utilizam refletem a mudança automaticamente.

== 1. Como Usar (Transcluir) uma Predefinição ==
* '''Sem parâmetros:''' \`{{Esboço}}\` ou \`{{Predefinição:Esboço}}\`
* '''Com parâmetros posicionais:''' \`{{Artigo_principal|Arquitetura_WikiWazzimaGiygg}}\`
* '''Com parâmetros nomeados:''' \`{{Ambox|tipo=aviso|título=Revisão técnica|texto=Esta seção está sendo atualizada.}}\`
* '''Transclusão de artigo comum:''' Use dois pontos no início, como \`{{:Página_principal}}\`.
* '''Assistente no Editor:''' Ao editar qualquer artigo, clique no botão '''Predefinições ({{ }})''' na barra de ferramentas para pesquisar modelos, preencher parâmetros e inserir automaticamente.

== 2. Criando suas Próprias Predefinições ==
Para criar uma nova predefinição, crie uma página começando com <code>Predefinição:</code> — por exemplo, [[Predefinição:Minha_Caixa]].

=== Parâmetros (Chaves Triplas) ===
Dentro da predefinição, utilize chaves triplas <code>{{{...}}}</code> para receber valores passados por quem a chama:
* '''Parâmetro posicional:''' \`{{{1}}}\` (primeiro argumento), \`{{{2}}}\` (segundo argumento).
* '''Parâmetro nomeado:''' \`{{{título}}}\`, \`{{{autor}}}\`, \`{{{data}}}\`.
* '''Valor padrão:''' Use uma barra vertical para definir um valor padrão caso o parâmetro seja omitido: \`{{{1|Valor padrão}}}\` ou vazio \`{{{texto|}}}\`.

=== Tags de Controle de Inclusão ===
Assim como na Wikipédia e no MediaWiki, você pode separar o código funcional da documentação da predefinição:
{| class="wikitable" style="width:100%; text-align:left;"
! Tag !! Quando é exibida no artigo (transclusão) !! Quando é exibida na página da Predefinição
|-
| \`<includeonly>...</includeonly>\` || '''Sim''' (é incluída no artigo) || Não (fica oculta na documentação)
|-
| \`<noinclude>...</noinclude>\` || Não (é ignorada no artigo) || '''Sim''' (ideal para ''== Uso =='' e categorias da predefinição)
|-
| \`<onlyinclude>...</onlyinclude>\` || '''Apenas''' o conteúdo dentro desta tag é incluído || '''Sim''' (exibida normalmente na página)
|}

== 3. Substituição Direta ({{subst:}}) ==
Se você quiser copiar o wikitexto expandido de uma predefinição diretamente para o código-fonte do artigo no momento de salvar (sem vínculo dinâmico futuro), utilize o prefixo \`subst:\`:
<syntaxhighlight lang="text">
{{subst:Esboço|Computação}}
{{subst:CURRENTDATE}}
</syntaxhighlight>

== 4. Palavras Mágicas e ParserFunctions ==
As predefinições do WikiWazzimaGiygg suportam palavras mágicas e lógica condicional nativa:
* '''Palavras Mágicas:''' \`{{PAGENAME}}\`, \`{{FULLPAGENAME}}\`, \`{{NAMESPACE}}\`, \`{{SITENAME}}\`, \`{{VERSÃO}}\`, \`{{CURRENTYEAR}}\`, \`{{CURRENTMONTH}}\`, \`{{CURRENTDAY}}\`, \`{{CURRENTDATE}}\`, \`{{NUMBEROFPAGES}}\`, \`{{!}}\` (pipe literal).
* '''Condicionais e Matemática:'''
<syntaxhighlight lang="text">
{{#if: {{{autor|}}} | Por {{{autor}}} | Autor desconhecido }}
{{#ifeq: {{{tipo|}}} | alerta | Atenção! | Nota }}
{{#switch: {{{status|}}} | ativo = Em operação | beta = Experimental | #default = Indefinido }}
{{#expr: (10 + 5) * 2 }}
</syntaxhighlight>

== 5. Predefinições Padrão Disponíveis ==
{| class="wikitable" style="width:100%; text-align:left;"
! Predefinição !! Chamada Típica !! Finalidade
|-
| [[Predefinição:Aviso]] || \`{{Aviso|Mensagem importante}}\` || Caixa de alerta estilizada
|-
| [[Predefinição:Ambox]] || \`{{Ambox|tipo=aviso|título=...|texto=...}}\` || Caixa de mensagem de artigo (Article Message Box)
|-
| [[Predefinição:Esboço]] || \`{{Esboço|Tema}}\` || Marca artigo como esboço e categoriza em Esboços
|-
| [[Predefinição:Carece_de_fontes]] || \`{{Carece_de_fontes|data=Nov/2026}}\` || Sinaliza ausência de referências verificáveis
|-
| [[Predefinição:Em_construção]] || \`{{Em_construção|editor=SeuNome}}\` || Informa que a página está em edição ativa
|-
| [[Predefinição:Desambiguação]] || \`{{Desambiguação}}\` || Identifica páginas de desambiguação
|-
| [[Predefinição:Artigo_principal]] || \`{{Artigo_principal|Nome_da_Página}}\` || Nota de topo apontando para o artigo principal
|-
| [[Predefinição:Ver_também]] || \`{{Ver_também|Página_1|Página_2}}\` || Nota de topo sugerindo leituras relacionadas
|-
| [[Predefinição:Citação]] || \`{{Citação|Texto|Autor|Fonte}}\` || Bloco de citação destacado com autoria
|-
| [[Predefinição:Fonte]] || \`{{Fonte|Autor|Título|Ano|URL}}\` || Referência formatada inline
|-
| [[Predefinição:Info]] || \`{{Info|título=Nota|texto=...}}\` || Quadro informativo azul padrão MediaWiki
|-
| [[Predefinição:Nota]] || \`{{Nota|tipo=dica|título=...|texto=...}}\` || Nota contextual com estilos (\`nota\`, \`dica\`, \`importante\`, \`cuidado\`)
|-
| [[Predefinição:Atenção]] || \`{{Atenção|título=Alerta|texto=...}}\` || Banner vermelho/laranja para alertas críticos de segurança ou quebra
|-
| [[Predefinição:Carece_de_revisão]] || \`{{Carece_de_revisão|motivo=...|data=...}}\` || Marca artigo para revisão editorial técnica
|-
| [[Predefinição:Atualizar]] || \`{{Atualizar|data=Nov/2026|seção=...}}\` || Indica conteúdo ou seção desatualizada
|-
| [[Predefinição:Evento_atual]] || \`{{Evento_atual|assunto=...}}\` || Avisa sobre evento em andamento com informações em evolução
|-
| [[Predefinição:Sem_referências]] || \`{{Sem_referências|data=Nov/2026}}\` || Banner para artigos que ainda não possuem nenhuma fonte
|-
| [[Predefinição:Atalho]] || \`{{Atalho|WP:PRE|AJ:PRE}}\` || Caixa lateral com atalhos rápidos do wiki
|-
| [[Predefinição:Sim]] || \`{{Sim}}\` ou \`{{Sim|Suportado}}\` || Selo verde positivo para tabelas comparativas
|-
| [[Predefinição:Não]] || \`{{Não}}\` ou \`{{Não|Indisponível}}\` || Selo vermelho negativo para tabelas comparativas
|-
| [[Predefinição:Parcial]] || \`{{Parcial}}\` ou \`{{Parcial|Beta}}\` || Selo âmbar para suporte parcial em tabelas
|-
| [[Predefinição:Colunas]] || \`{{Colunas|colunas=2|conteúdo=...}}\` || Distribui listas e conteúdos em 2 ou 3 colunas responsivas
|-
| [[Predefinição:Portal]] || \`{{Portal|Tecnologia|Privacidade}}\` || Caixa de rodapé indicando portais temáticos relacionados
|}

== 6. Catálogo Completo de Predefinições da Wikipédia ==
Além das predefinições básicas acima, o WikiWazzimaGiygg inclui um amplo acervo dos modelos mais populares da Wikipédia Lusófona:

=== Infoboxes Temáticos da Wikipédia (Info/...) ===
* '''Pessoas e lugares:''' [[Predefinição:Info/Biografia]], [[Predefinição:Info/País]], [[Predefinição:Info/Município]], [[Predefinição:Info/Evento]]
* '''Organizações e tecnologia:''' [[Predefinição:Info/Empresa]], [[Predefinição:Info/Organização]], [[Predefinição:Info/Jogo]], [[Predefinição:Info/Elemento_químico]], [[Predefinição:Info/Taxonomia]]
* '''Cultura e obras:''' [[Predefinição:Info/Livro]], [[Predefinição:Info/Filme]], [[Predefinição:Info/Álbum]]

=== Citações e Referências ===
* '''Bibliográficas e jurídicas:''' [[Predefinição:Citar_web]], [[Predefinição:Citar_livro]], [[Predefinição:Citar_jornal]], [[Predefinição:Citar_periódico]], [[Predefinição:Citar_vídeo]], [[Predefinição:Citar_tese]], [[Predefinição:Citar_enciclopédia]], [[Predefinição:Citar_lei]], [[Predefinição:Citar_comunicado]], [[Predefinição:Citar_mapa]], [[Predefinição:Citar_jogo]]
* '''Identificadores e lista de notas:''' [[Predefinição:Referências]], [[Predefinição:ISBN]], [[Predefinição:DOI]], [[Predefinição:Wayback]]
* '''Marcações inline:''' [[Predefinição:Sem_fonte]], [[Predefinição:Carece_de_esclarecimento]], [[Predefinição:Carece_de_página]], [[Predefinição:Fonte_primária]], [[Predefinição:Quando]], [[Predefinição:Quem]], [[Predefinição:Onde]], [[Predefinição:Verificar_credibilidade]], [[Predefinição:Ligação_inativa]], [[Predefinição:Desatualizado]]

=== Manutenção, Qualidade e Avisos ===
* '''Manutenção editorial:''' [[Predefinição:Wikificar]], [[Predefinição:Formatar_referências]], [[Predefinição:Poucas_referências]], [[Predefinição:Fontes_primárias]], [[Predefinição:Reciclagem]], [[Predefinição:Contextualizar]], [[Predefinição:Falta_de_contexto]], [[Predefinição:Estilo_inadequado]], [[Predefinição:Expandir]], [[Predefinição:Lista_incompleta]], [[Predefinição:Prosa]], [[Predefinição:Dividir]], [[Predefinição:Dicionário]], [[Predefinição:Parcialidade]], [[Predefinição:Contraditório]], [[Predefinição:Globalizar]], [[Predefinição:Publicidade]], [[Predefinição:Falta_de_notoriedade]], [[Predefinição:Conflito_de_interesses]], [[Predefinição:Autobiografia]], [[Predefinição:Fusão]], [[Predefinição:Órfão]], [[Predefinição:Sem_categoria]], [[Predefinição:Sem_imagem]]
* '''Tradução, tempo e proteção:''' [[Predefinição:Traduzir]], [[Predefinição:Revisão_de_tradução]], [[Predefinição:Futuro]], [[Predefinição:Ficção]], [[Predefinição:Protegido]], [[Predefinição:Eliminação_rápida]], [[Predefinição:Páginas_para_eliminar]], [[Predefinição:Direitos_autorais]]
* '''Avisos temáticos e selos:''' [[Predefinição:Spoiler]], [[Predefinição:Médico]], [[Predefinição:Aviso_legal]], [[Predefinição:Nota_histórica]], [[Predefinição:Artigo_destacado]], [[Predefinição:Artigo_bom]]

=== Formatação, Navegação e Comunidade ===
* '''Notas de topo (Hatnotes):''' [[Predefinição:Não_confundir]], [[Predefinição:Redirecionamento]], [[Predefinição:Redireciona_aqui]], [[Predefinição:Homônimos]], [[Predefinição:Mais_detalhes]], [[Predefinição:Sobre]], [[Predefinição:Minidesambiguação]], [[Predefinição:Ver_desambiguação]]
* '''Tipografia, datas e moedas:''' [[Predefinição:Lang]], [[Predefinição:Pronúncia]], [[Predefinição:Etimologia]], [[Predefinição:Epígrafe]], [[Predefinição:Destaque]], [[Predefinição:Pequeno]], [[Predefinição:Grande]], [[Predefinição:Sublinhado]], [[Predefinição:Sem_quebra]], [[Predefinição:Tooltip]], [[Predefinição:Abreviatura]], [[Predefinição:Tecla]], [[Predefinição:Código]], [[Predefinição:Cor]], [[Predefinição:Data]], [[Predefinição:Data_de_nascimento]], [[Predefinição:Idade]], [[Predefinição:Moeda]], [[Predefinição:Bandeira]], [[Predefinição:Fórmula]], [[Predefinição:Unidade]], [[Predefinição:Centrar]], [[Predefinição:Âncora]], [[Predefinição:Lista_horizontal]], [[Predefinição:Ocultar]], [[Predefinição:Limpar]]
* '''Navegação e rodapé:''' [[Predefinição:Navbox]], [[Predefinição:Sucessão]], [[Predefinição:Projetos_irmãos]], [[Predefinição:Controle_de_autoridade]], [[Predefinição:Coordenadas]], [[Predefinição:Versão_estável]]
* '''Discussões, votações e prêmios:''' [[Predefinição:Boas-vindas]], [[Predefinição:Ping]], [[Predefinição:Resposta]], [[Predefinição:Assinado]], [[Predefinição:Apoio]], [[Predefinição:Contra]], [[Predefinição:Abstenção]], [[Predefinição:Concordo]], [[Predefinição:Discordo]], [[Predefinição:Neutro]], [[Predefinição:Pergunta]], [[Predefinição:Sugestão]], [[Predefinição:Comentário]], [[Predefinição:Feito]], [[Predefinição:Em_andamento]], [[Predefinição:Em_análise]], [[Predefinição:Não_feito]], [[Predefinição:Resolvido]], [[Predefinição:Estrela]], [[Predefinição:Traduzido_de]], [[Predefinição:Arquivo_de_discussão]]

[[Categoria:Ajuda]]
[[Categoria:Documentação]]
[[Categoria:Predefinições]]`
  },

  'Ajuda:Categorias': {
    slug: 'Ajuda:Categorias',
    title: 'Ajuda:Categorias',
    namespace: 'Help',
    author: 'Equipe de Documentação',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_help_categories',
    categories: ['Ajuda', 'Documentação', 'WikiWazzimaGiygg', 'Wikitexto'],
    createdAt: '2026-11-27T00:00:00.000Z',
    updatedAt: '2026-11-27T00:00:00.000Z',
    summary: 'Guia completo de classificação de artigos e páginas por categorias no WikiWazzimaGiygg',
    content: `{{Aviso|As '''Categorias''' agrupam artigos e páginas por assunto, facilitando a descoberta temática em [[Especial:Categorias]] e [[Especial:Páginas_especiais]].}}

== Como Categorizar um Artigo ou Página ==
Para associar qualquer artigo, manual ou predefinição a uma categoria, adicione uma ou mais marcações ao final do wikitexto:

<syntaxhighlight lang="text">
[[Categoria:Ciência e Tecnologia]]
[[Categoria:Computação e Programação]]
</syntaxhighlight>

Você também pode utilizar o botão '''Categoria''' na barra de ferramentas do editor para pesquisar categorias de artigos e páginas já existentes e inseri-las com um clique.

== Categorias de Artigos vs. Categorias de Páginas ==
* '''Categorias de Artigos (Temáticas):''' [[:Categoria:Ciência e Tecnologia|Ciência e Tecnologia]], [[:Categoria:Computação e Programação|Computação e Programação]], [[:Categoria:Direito Digital|Direito Digital]], [[:Categoria:História|História]], [[:Categoria:Geografia|Geografia]], [[:Categoria:Biografias|Biografias]], [[:Categoria:Ciências Exatas|Ciências Exatas]], [[:Categoria:Ciências Biológicas|Ciências Biológicas]], [[:Categoria:Cultura e Artes|Cultura e Artes]], [[:Categoria:Sociedade e Política|Sociedade e Política]], [[:Categoria:Educação|Educação]].
* '''Categorias de Páginas (Estrutura e Manutenção):''' [[:Categoria:Portais|Portais]], [[:Categoria:Ajuda|Ajuda]], [[:Categoria:Documentação|Documentação]], [[:Categoria:Manual|Manual]], [[:Categoria:Políticas|Políticas]], [[:Categoria:Governança|Governança]], [[:Categoria:Predefinições|Predefinições]], [[:Categoria:Esboços|Esboços]], [[:Categoria:Desambiguação|Desambiguação]].

== Dica: Linkando uma Categoria no Texto ==
Se desejar criar um link visível para uma página de categoria no meio de uma frase (sem incluir o artigo nela), adicione dois pontos antes do prefixo: <code>[[:Categoria:História]]</code>.

[[Categoria:Ajuda]]
[[Categoria:Documentação]]
[[Categoria:Wikitexto]]
[[Categoria:WikiWazzimaGiygg]]`
  },

  'Predefinição:Aviso': {
    slug: 'Predefinição:Aviso',
    title: 'Predefinição:Aviso',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_aviso',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Exibe uma caixa de aviso destacada com ícone e mensagem personalizada',
    content: `<includeonly><div class="my-3 p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-xs"><span class="text-amber-600 dark:text-amber-400 font-bold text-base leading-none mt-0.5">ℹ</span><div class="min-w-0 flex-1">{{#if:{{{título|}}}|<div class="font-semibold mb-0.5">{{{título}}}</div>|}}<div>{{{texto|{{{1|Aviso importante.}}}}}}</div></div></div></includeonly><noinclude>
Esta predefinição exibe uma caixa de aviso ou nota destacada no corpo do artigo.

== Uso ==
<syntaxhighlight lang="text">
{{Aviso|Mensagem simples de alerta ou observação.}}
{{Aviso|título=Nota Editorial|texto=Conteúdo verificado conforme LGPD.}}
</syntaxhighlight>

== Parâmetros ==
* \`1\` ou \`texto\`: Texto principal exibido dentro da caixa de aviso.
* \`título\` (opcional): Título em negrito no topo do aviso.

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Ambox': {
    slug: 'Predefinição:Ambox',
    title: 'Predefinição:Ambox',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_ambox',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Caixa de mensagem de artigo (Article Message Box) clássica do MediaWiki com suporte a tipos (aviso, estilo, conteúdo, proteção, eliminação)',
    content: `<includeonly><div class="my-3 mx-auto max-w-4xl p-3 rounded border border-[#a2a9b1] dark:border-gray-700 border-l-[6px] {{#switch:{{{tipo|aviso}}}|eliminação|eliminacao|grave=border-l-red-600 bg-red-50/70 dark:bg-red-950/25|conteúdo|conteudo=border-l-orange-500 bg-orange-50/70 dark:bg-orange-950/25|estilo=border-l-amber-400 bg-amber-50/60 dark:bg-amber-950/20|proteção|protecao=border-l-slate-500 bg-slate-100 dark:bg-slate-800/70|#default=border-l-[#3366cc] bg-[#f8f9fa] dark:bg-gray-800/80}} text-xs text-gray-800 dark:text-gray-200 flex items-start gap-3 shadow-2xs"><div class="text-lg leading-none select-none shrink-0 mt-0.5">{{#switch:{{{tipo|aviso}}}|eliminação|eliminacao|grave=⛔|conteúdo|conteudo=⚠️|estilo=🧹|proteção|protecao=🔒|#default=ℹ️}}</div><div class="min-w-0 flex-1 space-y-0.5">{{#if:{{{título|{{{titulo|}}}}}}|<div class="font-bold text-sm text-gray-900 dark:text-gray-100">{{{título|{{{titulo|}}}}}}</div>|}}<div class="leading-relaxed">{{{texto|{{{1|Mensagem informativa do artigo.}}}}}}</div>{{#if:{{{data|}}}|<div class="text-[11px] text-gray-500 dark:text-gray-400 italic">Marcado em: {{{data}}}</div>|}}</div></div></includeonly><noinclude>
A '''Predefinição:Ambox''' (''Article Message Box'') é a caixa padronizada da MediaWiki para avisos editoriais no topo dos artigos.

== Uso ==
<syntaxhighlight lang="text">
{{Ambox
| tipo = conteúdo
| título = Este artigo necessita de atualização
| texto = As seções técnicas abaixo referem-se a uma versão anterior.
| data = Novembro de 2026
}}
</syntaxhighlight>

== Parâmetros ==
* \`tipo\`: Define cor da borda e ícone (\`aviso\`, \`conteúdo\`, \`estilo\`, \`proteção\`, \`eliminação\`).
* \`título\`: Cabeçalho em negrito da mensagem.
* \`texto\` (ou parâmetro posicional \`1\`): Descrição da mensagem.
* \`data\` (opcional): Mês/ano da marcação.

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Esboço': {
    slug: 'Predefinição:Esboço',
    title: 'Predefinição:Esboço',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_esboco',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Marca um artigo curto como esboço e o adiciona automaticamente à Categoria:Esboços',
    content: `<includeonly><div class="my-4 p-3 rounded border border-[#a2a9b1] dark:border-gray-700 border-l-4 border-l-emerald-600 bg-[#f8f9fa] dark:bg-gray-800/80 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-3 shadow-2xs"><span class="text-xl leading-none shrink-0" aria-hidden="true">🧩</span><div>Este artigo {{#if:{{{1|}}}|sobre '''{{{1}}}''' |}}é um '''esboço'''. Você pode ajudar o WikiWazzimaGiygg [[{{{FULLPAGENAME}}}|expandindo-o]] com fontes verificáveis e informações adicionais.</div></div>[[Categoria:Esboços]]</includeonly><noinclude>
Utilize esta predefinição ao final de artigos que ainda contêm apenas informações introdutórias ou breves.

== Uso ==
<syntaxhighlight lang="text">
{{Esboço}}
{{Esboço|Ciência da Computação}}
</syntaxhighlight>

== Efeito Colateral ==
Adiciona automaticamente a página à [[:Categoria:Esboços]].

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Carece_de_fontes': {
    slug: 'Predefinição:Carece_de_fontes',
    title: 'Predefinição:Carece de fontes',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_fontes',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Aviso editorial para artigos sem referências bibliográficas suficientes',
    content: `<includeonly><div class="my-3 p-3 rounded border border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-500 bg-orange-50/80 dark:bg-orange-950/30 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">📚</span><div><div class="font-bold text-sm">Este artigo ou seção necessita de fontes fiáveis{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data|{{{1}}}}}})</span>|}}.</div><p class="mt-0.5 leading-relaxed">Ajude a melhorar este conteúdo adicionando referências com <code>&lt;ref&gt;...&lt;/ref&gt;</code>. Afirmações sem verificabilidade podem ser questionadas ou removidas.</p></div></div>[[Categoria:Artigos que carecem de fontes]]</includeonly><noinclude>
Sinaliza que o conteúdo precisa de referências bibliográficas ou fontes documentais.

== Uso ==
<syntaxhighlight lang="text">
{{Carece_de_fontes}}
{{Carece_de_fontes|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Em_construção': {
    slug: 'Predefinição:Em_construção',
    title: 'Predefinição:Em construção',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_construcao',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Informa aos leitores que o artigo está em elaboração ativa',
    content: `<includeonly><div class="my-3 p-3 rounded border border-sky-300 dark:border-sky-800 border-l-[6px] border-l-sky-600 bg-sky-50/80 dark:bg-sky-950/30 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🚧</span><div><div class="font-bold text-sm">Página em construção ou grande edição</div><div class="mt-0.5 leading-relaxed">Este artigo está passando por uma expansão ativa{{#if:{{{editor|{{{1|}}}}}}| coordenada por '''{{{editor|{{{1}}}}}}'''|}}. Aguarde alguns instantes antes de realizar alterações estruturais concorrentes ou utilize a aba '''Discussão'''.</div></div></div></includeonly><noinclude>
Indica que o artigo está em desenvolvimento ativo por um editor.

== Uso ==
<syntaxhighlight lang="text">
{{Em_construção}}
{{Em_construção|editor=João Silva}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Desambiguação': {
    slug: 'Predefinição:Desambiguação',
    title: 'Predefinição:Desambiguação',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_desambig',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Identifica uma página de desambiguação com múltiplos significados para o mesmo título',
    content: `<includeonly><div class="my-3 p-3 rounded border border-[#a2a9b1] dark:border-gray-700 border-l-4 border-l-indigo-500 bg-[#f8f9fa] dark:bg-gray-800/80 text-xs text-gray-800 dark:text-gray-200 flex items-center gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0">🔀</span><div><span class="font-semibold">Desambiguação:</span> Esta página lista artigos que podem compartilhar o título '''{{{1|{{PAGENAME}}}}}'''. Caso um link interno tenha trazido você até aqui, considere ajustá-lo para apontar diretamente para o artigo específico desejado.</div></div>[[Categoria:Desambiguação]]</includeonly><noinclude>
Coloque ao topo ou rodapé de páginas de desambiguação.

== Uso ==
<syntaxhighlight lang="text">
{{Desambiguação}}
{{Desambiguação|Termo}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Artigo_principal': {
    slug: 'Predefinição:Artigo_principal',
    title: 'Predefinição:Artigo principal',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_artigo_principal',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Nota de topo (hatnote) apontando para o artigo principal de uma seção',
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Artigo principal: [[{{{1|Página_principal}}}]]{{#if:{{{2|}}}| e [[{{{2}}}]]|}}</div></includeonly><noinclude>
Cria uma nota de topo clássica indicando o artigo principal sobre o tema da seção.

== Uso ==
<syntaxhighlight lang="text">
{{Artigo_principal|Arquitetura_WikiWazzimaGiygg}}
{{Artigo_principal|Wiki:Política_de_Privacidade|Wiki:Termos_de_Uso}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Ver_também': {
    slug: 'Predefinição:Ver_também',
    title: 'Predefinição:Ver também',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_ver_tambem',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Nota de topo (hatnote) sugerindo artigos relacionados',
    content: `<includeonly><div class="my-1.5 pl-4 text-xs italic text-gray-700 dark:text-gray-300">↳ Ver também: [[{{{1|Página_principal}}}]]{{#if:{{{2|}}}|, [[{{{2}}}]]|}}{{#if:{{{3|}}}| e [[{{{3}}}]]|}}</div></includeonly><noinclude>
Sugere até 3 artigos relacionados logo abaixo de um cabeçalho de seção.

== Uso ==
<syntaxhighlight lang="text">
{{Ver_também|Ajuda:Wikitexto|Ajuda:Infobox}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Citação': {
    slug: 'Predefinição:Citação',
    title: 'Predefinição:Citação',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_citacao',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Bloco de citação destacado com atribuição opcional de autor e obra/fonte',
    content: `<includeonly><blockquote class="my-4 px-4 py-3 border-l-4 border-[#3366cc] bg-[#f8f9fa] dark:bg-gray-800/70 rounded-r text-sm text-gray-800 dark:text-gray-200 shadow-2xs"><div class="font-serif italic leading-relaxed">«{{{texto|{{{1|Citação não informada.}}}}}}»</div>{{#if:{{{autor|{{{2|}}}}}}|<footer class="mt-1.5 text-xs font-sans text-gray-600 dark:text-gray-400">— '''{{{autor|{{{2}}}}}}'''{{#if:{{{fonte|{{{3|}}}}}}|, em ''{{{fonte|{{{3}}}}}}''|}}</footer>|}}</blockquote></includeonly><noinclude>
Exibe um bloco de citação tipográfica com autor e fonte opcionais.

== Uso ==
<syntaxhighlight lang="text">
{{Citação|O conhecimento livre pertence a toda a humanidade.|Autor Exemplo|Obra de Referência}}
{{Citação|texto=Texto citado|autor=Maria Silva|fonte=Revista Científica}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Fonte': {
    slug: 'Predefinição:Fonte',
    title: 'Predefinição:Fonte',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_fonte',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Formata referências bibliográficas padronizadas (compatível com uso dentro de <ref>...</ref>)',
    content: `<includeonly><span class="mw-citation text-xs">{{#if:{{{autor|{{{1|}}}}}}|{{{autor|{{{1}}}}}}. |}}''{{{título|{{{titulo|{{{2|Título da obra}}}}}}}}}''{{#if:{{{ano|{{{3|}}}}}}| ({{{ano|{{{3}}}}}})|}}{{#if:{{{url|{{{4|}}}}}}|. [{{{url|{{{4}}}}}} Acessar fonte]|}}.</span></includeonly><noinclude>
Padroniza referências bibliográficas dentro de notas \`<ref>...</ref>\` ou listas de fontes.

== Uso ==
<syntaxhighlight lang="text">
<ref>{{Fonte|Brasil|Lei nº 13.709 (LGPD)|2018|https://www.planalto.gov.br}}</ref>
{{Fonte|autor=Autor|título=Relatório Técnico|ano=2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Info': {
    slug: 'Predefinição:Info',
    title: 'Predefinição:Info',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_info',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Quadro informativo azul no estilo clássico MediaWiki com título e descrição',
    content: `<includeonly><div class="my-3 p-3 rounded border border-blue-200 dark:border-blue-800 border-l-4 border-l-[#3366cc] bg-blue-50/70 dark:bg-blue-950/30 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5 shadow-2xs"><span class="text-[#3366cc] dark:text-[#6ba4ff] font-bold text-sm leading-none mt-0.5">ⓘ</span><div class="min-w-0 flex-1">{{#if:{{{título|{{{1|}}}}}}|<div class="font-semibold mb-0.5">{{{título|{{{1}}}}}}</div>|}}<div class="leading-relaxed">{{{texto|{{{2|Informação complementar.}}}}}}</div></div></div></includeonly><noinclude>
Exibe um quadro informativo azul para observações técnicas ou esclarecimentos.

== Uso ==
<syntaxhighlight lang="text">
{{Info|Dica Técnica|Você pode usar Predefinições aninhadas dentro de artigos!}}
{{Info|título=Observação|texto=Texto informativo aqui.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Nota': {
    slug: 'Predefinição:Nota',
    title: 'Predefinição:Nota',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_nota',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Bloco de nota contextual com variações de estilo (nota, dica, importante, cuidado)',
    content: `<includeonly><div class="my-3 p-3 rounded border border-l-4 text-xs shadow-2xs flex items-start gap-2.5 {{#switch:{{{tipo|nota}}}|dica=bg-emerald-50/75 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 border-l-emerald-600 text-emerald-950 dark:text-emerald-200|importante=bg-indigo-50/75 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 border-l-indigo-600 text-indigo-950 dark:text-indigo-200|cuidado=bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 border-l-amber-500 text-amber-950 dark:text-amber-200|#default=bg-[#f8f9fa] dark:bg-gray-800/80 border-[#a2a9b1] dark:border-gray-700 border-l-slate-500 text-gray-800 dark:text-gray-200}}"><span class="text-sm leading-none shrink-0 mt-0.5">{{#switch:{{{tipo|nota}}}|dica=💡|importante=📌|cuidado=⚠️|#default=📝}}</span><div class="min-w-0 flex-1">{{#if:{{{título|{{{titulo|}}}}}}|<div class="font-bold mb-0.5">{{{título|{{{titulo|}}}}}}</div>|}}<div class="leading-relaxed">{{{texto|{{{1|Nota editorial.}}}}}}</div></div></div></includeonly><noinclude>
Exibe um bloco de nota contextual com suporte a variações visuais.

== Uso ==
<syntaxhighlight lang="text">
{{Nota|Este recurso requer autenticação no Firestore.}}
{{Nota|tipo=dica|título=Dica para Editores|texto=Use Ctrl+B para aplicar negrito rapidamente.}}
</syntaxhighlight>

== Parâmetros ==
* \`tipo\`: \`nota\` (padrão), \`dica\`, \`importante\` ou \`cuidado\`.
* \`título\` (opcional): Título em negrito.
* \`texto\` ou \`1\`: Conteúdo da nota.

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Atenção': {
    slug: 'Predefinição:Atenção',
    title: 'Predefinição:Atenção',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_atencao',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Banner vermelho de alerta crítico para segurança, compatibilidade ou conformidade legal',
    content: `<includeonly><div class="my-3 p-3.5 rounded border border-red-300 dark:border-red-800 border-l-[6px] border-l-red-600 bg-red-50/85 dark:bg-red-950/35 text-xs text-red-950 dark:text-red-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🚨</span><div class="min-w-0 flex-1"><div class="font-bold text-sm mb-0.5">{{{título|{{{titulo|Atenção Crítica}}}}}}</div><div class="leading-relaxed">{{{texto|{{{1|Verifique cuidadosamente os procedimentos antes de prosseguir.}}}}}}</div></div></div></includeonly><noinclude>
Utilize para advertências críticas de segurança, perda de dados ou conformidade jurídica.

== Uso ==
<syntaxhighlight lang="text">
{{Atenção|Nunca compartilhe credenciais privadas no código-fonte de artigos.}}
{{Atenção|título=Alteração Incompatível|texto=Revise as regras do Firestore antes de migrar coleções.}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Carece_de_revisão': {
    slug: 'Predefinição:Carece_de_revisão',
    title: 'Predefinição:Carece de revisão',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_revisao',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Sinaliza que o artigo necessita de revisão técnica, ortográfica ou editorial',
    content: `<includeonly><div class="my-3 p-3 rounded border border-amber-300 dark:border-amber-800 border-l-[6px] border-l-amber-500 bg-amber-50/75 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🔍</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo ou seção necessita de revisão{{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">({{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">{{#if:{{{motivo|{{{1|}}}}}}|'''Motivo indicado:''' {{{motivo|{{{1}}}}}}.|O conteúdo pode conter imprecisões técnicas, lacunas estruturais ou erros de formatação em wikitexto.}}</div></div></div>[[Categoria:Artigos que carecem de revisão]]</includeonly><noinclude>
Marca uma página para revisão editorial e a adiciona à [[:Categoria:Artigos que carecem de revisão]].

== Uso ==
<syntaxhighlight lang="text">
{{Carece_de_revisão}}
{{Carece_de_revisão|motivo=Verificar sintaxe da seção de API|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Atualizar': {
    slug: 'Predefinição:Atualizar',
    title: 'Predefinição:Atualizar',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_atualizar',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Indica que um artigo ou seção contém informações desatualizadas que precisam de atualização',
    content: `<includeonly><div class="my-3 p-3 rounded border border-yellow-300 dark:border-yellow-800 border-l-[6px] border-l-yellow-500 bg-yellow-50/80 dark:bg-yellow-950/30 text-xs text-yellow-950 dark:text-yellow-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">🔄</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">{{#if:{{{seção|{{{1|}}}}}}|A seção "{{{seção|{{{1}}}}}}"|Este artigo}} precisa ser atualizado(a){{#if:{{{data|}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Os dados descritos podem refletir uma versão anterior do projeto ou da legislação vigente. Considere atualizar com fontes recentes.</div></div></div>[[Categoria:Artigos desatualizados]]</includeonly><noinclude>
Sinaliza páginas ou seções cujo conteúdo precisa de atualização e categoriza em [[:Categoria:Artigos desatualizados]].

== Uso ==
<syntaxhighlight lang="text">
{{Atualizar|data=Novembro de 2026}}
{{Atualizar|seção=Configuração do Servidor|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Evento_atual': {
    slug: 'Predefinição:Evento_atual',
    title: 'Predefinição:Evento atual',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_evento_atual',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Banner para temas ou acontecimentos em andamento sujeitos a rápidas alterações',
    content: `<includeonly><div class="my-3 p-3 rounded border border-cyan-300 dark:border-cyan-800 border-l-[6px] border-l-cyan-600 bg-cyan-50/80 dark:bg-cyan-950/30 text-xs text-cyan-950 dark:text-cyan-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">⏱️</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Evento ou tópico em andamento</div><div class="mt-0.5 leading-relaxed">Este artigo documenta {{#if:{{{assunto|{{{1|}}}}}}|'''{{{assunto|{{{1}}}}}}'''|um acontecimento recente}} cujas informações podem mudar rapidamente conforme novas fontes verificáveis são publicadas.</div></div></div>[[Categoria:Eventos atuais]]</includeonly><noinclude>
Informa ao leitor que o artigo trata de um tópico em curso.

== Uso ==
<syntaxhighlight lang="text">
{{Evento_atual}}
{{Evento_atual|assunto=Processo regulatório em curso}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Sem_referências': {
    slug: 'Predefinição:Sem_referências',
    title: 'Predefinição:Sem referências',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_sem_refs',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Banner editorial para páginas que não citam nenhuma fonte bibliográfica',
    content: `<includeonly><div class="my-3 p-3.5 rounded border border-red-300 dark:border-red-800 border-l-[6px] border-l-orange-600 bg-orange-50/90 dark:bg-orange-950/35 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-3 shadow-2xs"><span class="text-lg leading-none shrink-0 mt-0.5">📖</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Este artigo não cita nenhuma fonte ou referência{{#if:{{{data|{{{1|}}}}}}| <span class="font-normal text-[11px] opacity-80">(desde {{{data|{{{1}}}}}})</span>|}}.</div><div class="mt-0.5 leading-relaxed">Ajude a comprovar a verificabilidade deste conteúdo utilizando <code>&lt;ref&gt;{{Fonte|...}}&lt;/ref&gt;</code> e adicionando uma seção <code>== Referências ==</code> com <code>&lt;references /&gt;</code>.</div></div></div>[[Categoria:Artigos sem referências]]</includeonly><noinclude>
Utilize no topo de artigos inteiros que ainda não possuem nenhuma fonte listada.

== Uso ==
<syntaxhighlight lang="text">
{{Sem_referências}}
{{Sem_referências|data=Novembro de 2026}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Atalho': {
    slug: 'Predefinição:Atalho',
    title: 'Predefinição:Atalho',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_atalho',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Caixa lateral à direita exibindo códigos de atalho rápido da página no estilo Wikipédia',
    content: `<includeonly><div class="md:float-right md:ml-4 my-2 p-2.5 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/90 text-[11px] text-center min-w-[140px] shadow-2xs"><div class="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] pb-1 mb-1 border-b border-gray-200 dark:border-gray-700">Atalho(s)</div><div class="font-mono font-semibold text-[#0645ad] dark:text-[#6ba4ff] space-y-0.5"><div>[[{{{1|WP:ATALHO}}}]]</div>{{#if:{{{2|}}}|<div>[[{{{2}}}]]</div>|}}{{#if:{{{3|}}}|<div>[[{{{3}}}]]</div>|}}</div></div></includeonly><noinclude>
Exibe uma caixa compacta flutuando à direita com até 3 atalhos rápidos do wiki.

== Uso ==
<syntaxhighlight lang="text">
{{Atalho|Ajuda:Predefinições}}
{{Atalho|WP:LGPD|Wiki:Política_de_Privacidade}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Sim': {
    slug: 'Predefinição:Sim',
    title: 'Predefinição:Sim',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_sim',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Indicador visual verde positivo (✓ Sim) para tabelas comparativas e listas de verificação',
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold text-[11px]">✓ {{{1|Sim}}}</span></includeonly><noinclude>
Indicador verde positivo ideal para células de \`wikitable\`.

== Uso ==
<syntaxhighlight lang="text">
{{Sim}}
{{Sim|Totalmente suportado}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Não': {
    slug: 'Predefinição:Não',
    title: 'Predefinição:Não',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_nao',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Indicador visual vermelho negativo (✗ Não) para tabelas comparativas',
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 font-semibold text-[11px]">✗ {{{1|Não}}}</span></includeonly><noinclude>
Indicador vermelho negativo ideal para células de \`wikitable\`.

== Uso ==
<syntaxhighlight lang="text">
{{Não}}
{{Não|Incompatível}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Parcial': {
    slug: 'Predefinição:Parcial',
    title: 'Predefinição:Parcial',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_parcial',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Indicador visual âmbar de suporte parcial (◐ Parcial) para tabelas comparativas',
    content: `<includeonly><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold text-[11px]">◐ {{{1|Parcial}}}</span></includeonly><noinclude>
Indicador âmbar de implementação parcial para células de \`wikitable\`.

== Uso ==
<syntaxhighlight lang="text">
{{Parcial}}
{{Parcial|Em fase Beta}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Colunas': {
    slug: 'Predefinição:Colunas',
    title: 'Predefinição:Colunas',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_colunas',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Organiza listas ou blocos de texto em 2 ou 3 colunas responsivas',
    content: `<includeonly><div class="my-3 gap-6 {{#switch:{{{colunas|2}}}|3=columns-1 md:columns-3|4=columns-1 sm:columns-2 lg:columns-4|#default=columns-1 md:columns-2}}">
{{{conteúdo|{{{conteudo|{{{1|* Item 1\n* Item 2}}}}}}}}}
</div></includeonly><noinclude>
Distribui listas longas em múltiplas colunas responsivas.

== Uso ==
<syntaxhighlight lang="text">
{{Colunas|colunas=2|conteúdo=
* Primeiro tópico
* Segundo tópico
* Terceiro tópico
* Quarto tópico
}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  },

  'Predefinição:Portal': {
    slug: 'Predefinição:Portal',
    title: 'Predefinição:Portal',
    namespace: 'Template',
    author: 'Sistema MediaWiki TS',
    authorId: 'system_admin',
    revisionCount: 1,
    latestRevisionId: 'rev_initial_tpl_portal',
    categories: ['Predefinições do WikiWazzimaGiygg'],
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
    summary: 'Barra de portais temáticos relacionados ao artigo no estilo MediaWiki',
    content: `<includeonly><div class="my-4 p-2.5 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/80 text-xs text-gray-800 dark:text-gray-200 flex flex-wrap items-center gap-2 shadow-2xs"><span class="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">🧭 Portais relacionados:</span><span class="font-medium">[[Portal:{{{1|Tecnologia}}}|{{{1|Tecnologia}}}]]</span>{{#if:{{{2|}}}|<span class="text-gray-400">·</span><span class="font-medium">[[Portal:{{{2}}}|{{{2}}}]]</span>|}}{{#if:{{{3|}}}|<span class="text-gray-400">·</span><span class="font-medium">[[Portal:{{{3}}}|{{{3}}}]]</span>|}}</div></includeonly><noinclude>
Exibe links para até 3 portais temáticos ao final do artigo.

== Uso ==
<syntaxhighlight lang="text">
{{Portal|TypeScript|Firestore|Privacidade}}
</syntaxhighlight>

[[Categoria:Predefinições do WikiWazzimaGiygg]]
</noinclude>`
  }
};



