# SPEC — AdSales Hub

**SaaS que substitui agencia de marketing + CRM de vendas integrado**
**Marketing inteligente com IA + Meta Ads automatizado + Pipeline de vendas completo**
**Autor:** Lucas Araujo | **Data:** 19 de Abril de 2026
**Stack:** Next.js 14+ (App Router) + Supabase (PostgreSQL + Auth + Realtime + Storage)
**Base de referencia:** DM Hub CRM (crm.destruindometas.com.br)

---

## 1. VISAO GERAL

O AdSales Hub combina dois mundos: todo o poder do CRM de vendas (baseado no DM Hub) + um modulo completo de trafego pago e marketing com IA que cria campanhas no Meta Ads automaticamente. O usuario descreve o que quer em linguagem natural e o sistema gera a campanha completa (publico, criativo, orcamento) e publica via Meta Marketing API. Marketing e vendas ficam 100% integrados — o lead que entra pela campanha ja cai no pipeline com contexto completo da origem.

**Publico-alvo:** PMEs que pagam agencia de marketing e querem internalizar, freelancers de trafego, agencias pequenas, empresarios que querem controlar seu proprio trafego pago + vendas.

**Proposta de valor:** Chega de pagar agencia + CRM + ferramentas separadas. O AdSales Hub faz tudo: cria suas campanhas com IA, gera os leads e gerencia suas vendas — tudo num unico lugar. Sistema 100% focado em vendas, do marketing pago e organico ate o fechamento do negocio.

**Modelo SaaS:** Vendido por assinatura mensal modular, cobrado por empresa (workspace). Modelo de cestas: Operacao (R$290/mes — CRM + Ads + Landing Pages), Crescimento (R$690/mes — CRM + Ads + Social + Mensagens + BI) e Escala (R$1.490/mes — todos os 8 modulos). Custom Builder permite montar cesta personalizada: base R$190 + modulos avulsos + faixa de midia gerida. CRM + Pipeline incluso em qualquer configuracao. Feature gating controla acesso por modulo contratado. Trial de 14 dias.

---

## 1B. ATORES E PERMISSOES

| Ator | Permissoes |
|------|-----------|
| **Admin** | Acesso total. Configuracoes, billing, usuarios, workspaces, integracao API, white-label, marca. Unico que pode excluir workspace ou alterar plano. |
| **Gestor** | Dashboard, relatorios, metas, visao de equipe, aprovar campanhas e posts. Pode ver todos os negocios da equipe. Nao altera billing nem usuarios. |
| **Vendedor** | Pipeline, contatos, atividades, comunicacao (email, WhatsApp, ligacoes). Ve apenas seus proprios negocios (exceto se gestor atribuir visibilidade). |
| **Media Buyer** | Campanhas, criativos, publicos, otimizador IA, social media. Acesso total ao Bloco B e C. Nao ve pipeline de vendas nem contatos. |
| **Visualizador** | Somente leitura em dashboards e relatorios. Nao cria, edita ou exclui nada. Ideal para clientes em modo white-label. |

> **Regra de ouro:** permissoes sao cumulativas por role, nunca por usuario individual. Um usuario tem exatamente 1 role por workspace.

---

## 1C. NAO-OBJETIVOS

O AdSales Hub **NAO e e NAO faz:**

- **Nao e agencia** — nao tem humanos executando campanhas. A IA gera, o usuario aprova.
- **Nao e ERP** — nao faz financeiro (contas a pagar/receber), estoque, nota fiscal, contabilidade.
- **Nao e CMS** — nao hospeda sites completos. Landing pages sao focadas em conversao, nao em conteudo editorial.
- **Nao gera certificados** — nao e plataforma de cursos ou eventos.
- **Nao faz SEO** — foco e trafego pago + social. SEO organico nao esta no escopo.
- **Nao suporta Google/TikTok Ads no MVP** — Phase 1-7 e exclusivamente Meta Ads. Multi-plataforma vem na Phase 8.
- **Nao substitui Slack/Teams** — comunicacao interna da equipe esta fora do escopo. O sistema cobre comunicacao com leads/clientes.

---

## 2. ARQUITETURA DE MODULOS

O sistema tem 4 blocos:

**Bloco A — CRM de Vendas** (herda DM Hub completo)
**Bloco B — Trafego Pago / Meta Ads com IA** (novo)
**Bloco C — Marketing / Conteudo** (novo)
**Bloco D — Analytics Unificado** (novo — cruza marketing + vendas)

---

## BLOCO A — CRM DE VENDAS

### 3. Dashboard (`/dashboard`)

**Herdado do DM Hub:**
- Total em Pipeline (R$)
- Ganhos no Mes (R$)
- Taxa de Conversao
- Atividades Hoje (pendentes)
- Negocios por Etapa (grafico por funil)
- Acoes Rapidas: Novo Negocio, Nova Atividade, Ver Relatorios

**Novos widgets de Marketing:**
- Campanhas Ativas (quantidade + spend do dia)
- Leads de Trafego Hoje (leads que entraram via Meta Ads)
- CPL Medio (custo por lead)
- ROAS (retorno sobre investimento em ads)
- Grafico "Leads por Origem" (trafego pago vs organico vs prospeccao vs indicacao)

---

### 4. Negocios / Pipeline (`/pipeline`)

**Herdado do DM Hub:**
- Visualizacao Kanban e Lista
- Filtros: Ativos / Ganhos / Perdidos
- Botoes: Exportar, Novo Negocio
- Card com valor, proprietario, indicador de atividades
- Drag-and-drop entre etapas

**Funis pre-configurados:**
- Prospeccao
- Inbound
- Social Selling
- Negociacao

**Novo funil:**
- **Trafego Pago**: Lead Captado → Tentando Contato → Qualificado → Reuniao → Proposta → Fechado

**Enriquecimento com dados de marketing:**
- Tag automatica de origem: "Meta Ads", "Google Ads", "Organico", "Prospeccao", "Indicacao"
- No card do negocio: nome da campanha de origem, custo do lead, anuncio que gerou o lead

---

### 5. Detalhe do Negocio (`/negocios/{id}`)

**Herdado 100% do DM Hub:**

**Topo:** Nome editavel, Funil + Etapa, Proprietario, botoes Perdido/Ganho

**Barra de progresso:** Botoes clicaveis para cada etapa

**Painel esquerdo — RESUMO:**
- Valor, Produtos, Previsao, Dias na etapa, Probabilidade, Etiquetas
- Vincular contato / empresa

**Painel direito — 7 ABAS:**
1. **Atividades** — Lista + Sequencias + Adicionar
2. **Notas** — Anotacoes livres
3. **Historico** — Timeline completa
4. **Ligacoes** — Ligar com script + gravacao + analise IA
5. **WhatsApp** — Enviar com template
6. **Email** — Enviar com template
7. **Jornada** (NOVA) — Timeline desde clique no anuncio ate fechamento

**Funcionalidades da comunicacao unificada (herdadas):**
- Registro automatico de atividades
- Templates pre-configurados
- Script de ligacao visivel durante call
- Anotacoes durante ligacao
- Analise de calls com IA

**Novo — Secao "Origem do Lead" no resumo:**
- Campanha de origem
- Conjunto de anuncios
- Anuncio especifico
- Formulario preenchido
- Custo do lead
- Data de captacao
- UTM completo (source, medium, campaign, content, term)

---

### 6. Contatos (`/contatos`)

**Herdado 100% do DM Hub:**
- Busca, colunas personalizaveis, exportar, novo contato

**Adiciona:**
- Campo "Origem": Meta Ads, Google Ads, Organico, Prospeccao, Indicacao
- Campo "Campanha de Origem"
- Campo "Custo de Aquisicao"

---

### 7. Atividades (`/atividades`)

**Herdado 100% do DM Hub:**
- Lista e Calendario
- Filtros por tipo e usuario
- Tipos: Ligacao, Reuniao, Videochamada, Email, WhatsApp, Instagram, LinkedIn, Outros

---

### 8. Ligacoes (`/ligacoes`)

**Herdado 100% do DM Hub:**
- Dashboard completo de chamadas
- Mapa de calor, performance por vendedor
- Historico com gravacao

---

### 9. Metas (`/metas`)

**Herdado 100% do DM Hub:**
- Metas individuais por pessoa e tipo

**Novos tipos de meta:**
- Meta de CPL (custo por lead maximo)
- Meta de ROAS
- Meta de Leads por Campanha

---

### 10. Prospeccao (`/prospeccao`)

**Herdado 100% do DM Hub:**
- Geracao de listas da base oficial brasileira
- Envio direto pro CRM

---

### 11. Automacoes (`/automacoes`)

**Herdado do DM Hub (12 modelos base):**
- Inbound pra Vendas, Prospeccao pra Vendas, Social Selling pra Vendas
- Rodizio SDRs, Criar atividade ao mudar etapa
- Webhook ao ganhar, Mover negocio, Atribuir responsavel
- Nota ao perder, Ganho na etapa final, Etiqueta com condicao, Duplicar ao ganhar

**Modelos adicionais para Marketing + Vendas:**

1. **Lead de Trafego → Pipeline**: Lead via Meta Ads → cria negocio automaticamente no funil correto
2. **Lead Scoring Automatico**: Baseado em dados do formulario + comportamento → atribui score
3. **Notificacao em Tempo Real**: Lead entra via ads → notifica vendedor por push/WhatsApp
4. **Redistribuicao por Performance**: Leads distribuidos para vendedores com melhor taxa de conversao
5. **Retargeting Automatico**: Lead sem resposta em 48h → entra em audiencia de retargeting no Meta
6. **Alerta de CPL Alto**: CPL de campanha ultrapassa limite → notifica gestor
7. **Pause Campanha Ruim**: ROAS abaixo de threshold por 3 dias → sugere pausar

---

### 12. Analise de Calls (`/analise-calls`)

**Herdado 100% do DM Hub:**
- Cold Call, Warm Call (ativos)
- Reuniao de Qualificacao, Reuniao de Fechamento (em breve)
- Creditos, nota + feedback + export PDF

---

## BLOCO B — TRAFEGO PAGO / META ADS COM IA

### 13. Hub de Campanhas (`/campanhas`)

Tela principal do modulo de marketing.

**Header:**
- Conta de anuncios conectada (nome + status)
- Saldo disponivel
- Gasto do dia / mes

**Cards de resumo:**
- Campanhas Ativas
- Gasto Total (periodo)
- Leads Gerados
- CPL Medio
- ROAS

**Lista de campanhas:**
- Nome, Status (ativa/pausada/encerrada), Objetivo
- Orcamento diario, Gasto total, Leads, CPL, ROAS
- Acoes: Pausar, Editar, Duplicar, Excluir

**Filtros:** Periodo, Status, Objetivo

**Botao principal:** "Nova Campanha com IA"

---

### 14. Criador de Campanha com IA (`/campanhas/nova`)

**FLUXO COMPLETO DO USUARIO:**

**Passo 1 — Briefing em Linguagem Natural**

Tela com campo de texto amplo onde o usuario descreve o que quer. Exemplos:

> "Quero gerar leads para minha consultoria de RH. Meu publico sao diretores de empresas com 50-500 funcionarios em Sao Paulo. Orcamento de R$100/dia. Quero captar nome, email e telefone."

> "Preciso vender meu curso de Excel avancado. Publico: profissionais de financas, 25-45 anos, Brasil inteiro. R$50/dia."

> "Quero mais clientes para minha clinica odontologica em Curitiba. Orcamento R$30/dia."

Opcoes auxiliares (opcionais, para quem quer dar mais contexto):
- Upload de imagem/video para usar como criativo
- Selecionar produto do catalogo do CRM
- Indicar URL do site/landing page

**Passo 2 — IA Processa e Gera a Campanha Completa**

A IA (via Claude API) analisa o briefing e gera todos os componentes:

**Objetivo da Campanha:**
- Tipo: Lead Generation / Traffic / Conversions
- Justificativa da IA

**Publico-Alvo:**
- Localizacao (cidade, estado, pais)
- Idade (faixa)
- Genero (se relevante)
- Interesses (lista de interesses do Meta)
- Cargos / Comportamentos
- Tamanho da empresa (se B2B)
- Exclusoes sugeridas

**Orcamento e Duracao:**
- Orcamento diario (conforme briefing)
- Duracao sugerida (com justificativa)
- Estimativa de alcance e leads (baseada em benchmarks)

**Criativos (3 variacoes para A/B test):**
Para cada variacao:
- Headline (titulo)
- Texto primario (copy do anuncio)
- Descricao
- CTA (Call to Action)
- Sugestao de imagem/video (prompt descritivo ou upload do usuario)

**Formulario de Captacao (Lead Form):**
- Titulo do formulario
- Campos: Nome, Email, Telefone (+ campos customizados se relevante)
- Texto de contexto
- CTA do formulario
- Mensagem de agradecimento
- URL de redirecionamento (opcional)

**Configuracoes Avancadas:**
- Posicionamento: Feed, Stories, Reels, Audience Network (automatico ou manual)
- Estrategia de lance: Menor custo / Custo por resultado
- Pixel / Conversions API
- Horarios de veiculacao (se relevante)

**Passo 3 — Revisao Visual**

Tela de preview que simula como o anuncio vai aparecer:
- Preview do Feed (desktop e mobile)
- Preview do Stories/Reels
- Preview do formulario
- Todos os campos sao editaveis — usuario pode ajustar qualquer coisa

Botoes: "Editar", "Regenerar com IA" (refaz com novo prompt), "Aprovar"

**Passo 4 — Publicacao**

Com um clique, o sistema publica via Meta Marketing API:
- Cria a Campaign no Business Manager
- Cria o Ad Set com publico e orcamento definidos
- Cria os Ads com os criativos gerados
- Cria o Lead Form (Instant Form)
- Configura webhook para receber leads em tempo real
- Lead que entra via formulario → cria negocio automaticamente no pipeline

**Status pos-publicacao:**
- "Em revisao" (aguardando aprovacao do Meta)
- "Ativa" (rodando)
- "Reprovada" (com motivo e sugestao de ajuste pela IA)

---

### 15. Dashboard de Performance (`/campanhas/performance`)

**Metricas em tempo real (via Meta API):**
- Impressoes
- Alcance
- Cliques
- CTR (Click-Through Rate)
- Leads gerados
- CPL (Custo por Lead)
- Gasto total
- ROAS (se tracking de conversao configurado)
- Frequencia
- Score de Qualidade do Anuncio (Meta)

**Graficos:**
- Performance ao longo do tempo (linha — leads, gasto, CPL por dia)
- Comparativo entre campanhas (barras)
- Funil completo: Impressao → Clique → Lead → Contato no CRM → Qualificado → Venda
- Heatmap de horarios com melhor performance
- Distribuicao por posicionamento (Feed vs Stories vs Reels)

**Drill-down em 3 niveis:**
- Campanha → Conjuntos de Anuncio → Anuncios
- Cada nivel com suas metricas individuais
- Comparacao A/B de criativos (qual copy/imagem performa melhor)

---

### 16. Gestao de Publicos (`/campanhas/publicos`)

**Tipos de publico:**

- **Publicos Salvos**: criados pela IA ou manualmente (interesses, demografia, comportamentos)
- **Publicos Lookalike**: baseados em clientes que ja compraram (dados vindos do CRM)
- **Publicos de Retargeting**: visitantes do site, leads nao convertidos, engajamento em paginas
- **Publicos Personalizados**: upload de lista do CRM (email/telefone)

**Sincronizacao automatica CRM ↔ Meta:**
- Quando lead vira cliente no CRM → sai do publico de prospeccao, entra no de upsell/cross-sell
- Quando lead e marcado como perdido → entra em publico de remarketing com nova abordagem
- Sincronizacao periodica (diaria) ou em tempo real (via webhook)

---

### 17. Biblioteca de Criativos (`/campanhas/criativos`)

- Galeria de imagens e videos usados nas campanhas
- Upload de novos criativos
- Templates de criativos por nicho/segmento
- IA sugere novos criativos baseado em performance
- Historico de performance por criativo: CTR, CPL, conversoes
- Tags e categorias para organizacao
- Integracao com Canva API (fase futura) para edicao rapida

---

### 18. Otimizador com IA (`/campanhas/otimizador`)

**Motor de IA que roda a cada 2 dias (configuravel pelo usuario):**

> Nota: Este e o MESMO motor de IA que gera os insights e relatorios no Bloco D. A cada ciclo de 2 dias, a IA analisa performance das campanhas, gera insights unificados (trafego + vendas + social) e aplica otimizacoes conforme nivel configurado.

**Analises automaticas:**
- Performance por campanha, conjunto e anuncio
- Identificacao de anuncios vencedores e perdedores
- Deteccao de fadiga de criativo (frequencia alta + CTR caindo)
- Analise de publicos (quais convertem mais)
- Comparacao de posicionamentos

**Sugestoes geradas:**
- Pausar anuncios com CPL acima do limite
- Aumentar orcamento de campanhas com ROAS alto
- Trocar criativo quando detecta fadiga
- Sugerir novos publicos baseado em dados de conversao do CRM
- Sugerir novas copies baseado no que esta convertendo
- Ajustar horarios de veiculacao

**Niveis de automacao (configuravel pelo usuario):**
- **Manual**: IA sugere, usuario decide e aplica
- **Semi-Auto**: IA aplica otimizacoes menores automaticamente (ajuste de lance, pausar anuncio ruim), pede aprovacao para mudancas maiores (orcamento, publico)
- **Full Auto**: IA gerencia tudo dentro de limites definidos pelo usuario (orcamento maximo diario, CPL maximo, ROAS minimo)

**Relatorio semanal automatico:**
- Enviado por email/WhatsApp
- Resumo de performance
- Acoes tomadas (se semi/full auto)
- Recomendacoes pendentes

---

## BLOCO C — MARKETING / CONTEUDO

### 19. Landing Pages (`/marketing/landing-pages`)

- Builder de landing pages (templates prontos por nicho)
- Drag-and-drop simplificado (ou edicao de template)
- Integrado com formularios que alimentam o CRM
- Tracking automatico (UTM, Meta Pixel)
- A/B testing de paginas
- Dominio customizado
- SSL automatico
- Templates por segmento: consultoria, SaaS, e-commerce, educacao, saude, etc

---

### 20. Formularios (`/marketing/formularios`)

- Criador de formularios customizados (embedded ou standalone)
- Integrado com pipeline (lead cai direto no funil escolhido)
- Campos condicionais (mostra campo X se respondeu Y)
- Thank you page customizavel
- Notificacao em tempo real ao receber submission
- Codigo de embed para qualquer site
- Webhook de saida

---

### 21. Email Marketing (`/marketing/emails`)

- Disparo em massa para listas segmentadas
- Templates de email (drag-and-drop ou HTML)
- Segmentacao por:
  - Origem do lead
  - Etapa no pipeline
  - Tags
  - Comportamento (abriu email anterior, clicou, nao abriu)
- Automacoes de email (sequencias com condicoes)
- Metricas: taxa de abertura, cliques, descadastro, conversao
- Warmup de dominio (fase futura)

---

### 22. Social Media / Agendamento de Postagens (`/social`)

Modulo completo de agendamento, aprovacao e publicacao automatica de conteudo em redes sociais, inspirado no Reportei Flux. Integrado com o modulo de trafego pago — conteudo organico e pago no mesmo lugar.

**Redes suportadas:** Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest

#### 22.1 Calendario Visual (`/social/calendario`)

- Visualizacao mensal, semanal e diaria
- Drag-and-drop para reposicionar posts entre datas/horarios
- Filtro por rede social (icones coloridos)
- Filtro por status: Ideia, Rascunho, Pendente Aprovacao, Aprovado, Agendado, Publicado, Reprovado
- Indicadores visuais: cor por rede + icone de status
- Clique no dia para criar novo post rapidamente
- Visao de "grade" do Instagram (preview visual do feed)
- Marcacao visual de posts patrocinados (vinculados a campanhas Meta Ads)

#### 22.2 Criador de Post (`/social/posts/novo`)

**Campos:**
- Texto do post (com contagem de caracteres por rede)
- Midia: imagem, carrossel, video, Reels/Shorts
- Hashtags sugeridas pela IA (baseado no nicho e dados de performance)
- Redes de destino (selecao multipla — mesmo post adaptado por rede)
- Data e hora de publicacao (agendamento)
- Primeiro comentario (Instagram)
- Link para landing page (integracao com modulo de Landing Pages)

**Personalizacao por rede:**
- Mesmo conteudo base, mas permite ajustar texto/midia por rede
- Preview visual em tempo real para cada rede (Feed, Stories, Reels, LinkedIn post, TikTok)
- Limites de caracteres e formatos respeitados automaticamente

**IA Assistente:**
- Sugerir legenda baseada no tema/objetivo do negocio
- Gerar variantes de texto para A/B test
- Sugerir melhores horarios de postagem (baseado em dados historicos)
- Adaptar tom para cada rede automaticamente
- Sugerir conteudo organico complementar as campanhas pagas ativas
- Reutilizar copy de anuncios de alta performance como posts organicos

#### 22.3 Fluxo de Aprovacao (`/social/aprovacao`)

- Post criado → status "Pendente Aprovacao"
- Link de aprovacao externo (para cliente/gestor aprovar sem login — ideal para agencias)
- Aprovador pode: Aprovar, Reprovar com comentario, Solicitar Ajuste
- Notificacao por email/WhatsApp ao aprovador
- Historico de revisoes por post
- Aprovacao em lote (multiplos posts de uma vez)

#### 22.4 Publicacao Automatica

- Post aprovado no horario agendado → sistema publica automaticamente via API de cada rede
- Status em tempo real: Publicando → Publicado (com link direto para o post)
- Retry automatico em caso de falha (3 tentativas com intervalo exponencial)
- Log de publicacao com detalhes (sucesso, erro, motivo)
- Boost automatico: opcao de transformar post organico em anuncio pago (via Meta Ads) se performance boa

#### 22.5 Contas Conectadas (`/social/contas`)

- Conectar/desconectar perfis de cada rede social
- Status de conexao (ativo, expirado, erro)
- Renovacao de tokens automatica
- Permissoes necessarias por rede
- Sincronizacao com conta Meta Ads ja conectada

#### 22.6 Biblioteca de Midia (`/social/midia`)

- Upload e organizacao de imagens, videos e templates
- Pastas por categoria
- Busca por nome e tag
- Preview e dimensoes por rede
- Reutilizar midia em multiplos posts
- Acesso aos criativos da Biblioteca de Criativos de Ads (`/campanhas/criativos`)

**Categorias sugeridas:**
- Conteudo Educativo, Promocional, Engajamento, Prova Social
- Cases de Sucesso, Bastidores, Datas Comemorativas, Trends

---

## BLOCO D — ANALYTICS UNIFICADO

### 23. Dashboard Unificado (`/analytics`)

**A tela que une marketing e vendas — o maior diferencial do AdSales Hub.**

**Funil Completo (visualizacao):**
Impressao → Clique → Lead → Contato → Qualificado → Reuniao → Proposta → Venda

**Metricas Cruzadas:**
- CAC (Custo de Aquisicao de Cliente) = gasto em ads / clientes fechados no CRM
- ROAS Real = receita fechada no CRM / gasto em ads
- Tempo medio Lead → Venda (por canal)
- Taxa de conversao por etapa do funil completo
- Receita por campanha (qual campanha gerou mais vendas efetivas, nao so leads)
- LTV vs CAC por canal de aquisicao
- Payback period por canal

**Comparativos:**
- Trafego Pago vs Prospeccao vs Organico (qual canal traz mais receita)
- Performance por vendedor x origem do lead
- Cohort de leads por mes de captacao (quanto da receita do mes veio de leads captados em qual periodo)

**Graficos:**
- Funil visual completo com taxas de conversao
- Receita por canal (pizza/barras)
- Evolucao de CAC e ROAS ao longo do tempo
- Heatmap de performance por campanha x vendedor

---

### 24. Central de Relatorios — Estilo Reportei (`/relatorios`)

Modulo completo de geracao, agendamento e envio de relatorios multi-canal com IA. O maior trunfo para quem usa o AdSales Hub como agencia.

#### 24.1 Dashboard de Relatorios (`/relatorios`)

**Painel principal:**
- Lista de relatorios gerados (recentes)
- Botao "Gerar Novo Relatorio" (geracao em ate 3 segundos)
- Filtros: periodo, tipo, canal, destinatario, cliente
- Status: Gerado, Agendado, Enviado, Rascunho

**Tipos de relatorio:**
- Relatorio de Trafego Pago (Meta Ads — campanhas, CPL, ROAS, leads)
- Relatorio de Social Media (metricas das redes conectadas — organico)
- Relatorio de Vendas/Pipeline (dados do CRM)
- Relatorio Unificado Marketing + Vendas (funil completo: ad → lead → venda)
- Relatorio para Cliente / White-Label (agencia envia para o cliente)
- Relatorio Customizado (usuario escolhe quais metricas incluir)

#### 24.2 Gerador de Relatorios (`/relatorios/novo`)

**Selecao de canais/fontes:**
- Meta Ads (campanhas, CPL, ROAS, leads, gasto)
- Instagram (seguidores, alcance, engajamento, melhores posts)
- Facebook (pagina — curtidas, alcance, posts)
- LinkedIn (seguidores, impressoes, engajamento)
- TikTok (visualizacoes, seguidores, engajamento)
- YouTube (inscritos, visualizacoes, tempo de exibicao)
- Google Ads (fase futura — cliques, conversoes, custo)
- Google Analytics GA4 (sessoes, usuarios, conversoes — fase futura)
- CRM interno (pipeline, vendas, conversoes, receita)
- Landing Pages (visitas, conversoes, taxa de conversao)
- Email Marketing (aberturas, cliques, conversoes)

**Configuracao:**
- Periodo do relatorio (ultimo mes, semana, customizado)
- Comparativo com periodo anterior (automatico)
- Idioma do relatorio
- Secoes a incluir (checkboxes)
- Logomarca customizada (white-label — logo do usuario ou do cliente)
- Cores do relatorio (paleta personalizavel)
- Informacoes do cliente (nome, logo, contato — para relatorios de agencia)

**Geracao com IA:**
- IA analisa os dados e gera resumo executivo automatico
- Destaques: melhores metricas, alertas de queda, oportunidades
- Recomendacoes baseadas em dados (ex: "Campanha X tem ROAS 4.2x, aumente o orcamento em 30%")
- Analise cruzada marketing + vendas (ex: "A campanha Y gerou mais leads, mas a campanha Z gerou leads com maior taxa de fechamento")
- Texto gerado em tom profissional e objetivo

#### 24.3 Visualizacao do Relatorio (`/relatorios/{id}`)

**Layout visual com dashboards:**
- Cards de metricas principais (KPIs) com setas de variacao
- Graficos de linha (evolucao no periodo)
- Graficos de barras (comparativos de campanhas)
- Graficos de pizza (distribuicao de gasto, leads por canal)
- Tabelas de ranking (melhores campanhas, posts, anuncios)
- Funil completo visual: Impressao → Clique → Lead → Contato → Venda
- Mapa de calor de engajamento por dia/hora

**Secoes do relatorio:**
- Resumo Executivo (gerado por IA)
- Metricas de Trafego Pago (Meta Ads detalhado)
- Metricas de Social Media Organico (por rede)
- Metricas de Vendas (pipeline, conversoes, receita)
- Funil Completo Marketing → Vendas
- Comparativo com Periodo Anterior (% variacao)
- Top Conteudos e Anuncios (performance)
- Recomendacoes de Melhoria (IA)
- ROI / ROAS consolidado

**Acoes:**
- Exportar como PDF (white-label, com logo e cores personalizadas)
- Enviar por email direto da plataforma
- Enviar por WhatsApp (link ou PDF)
- Compartilhar via link publico (com ou sem senha)
- Editar secoes manualmente antes de enviar
- Duplicar relatorio como template

#### 24.4 Agendamento de Relatorios (`/relatorios/agendamentos`)

- Criar agendamento: diario, semanal, quinzenal, mensal
- Selecionar dia e hora de envio
- Destinatarios (email e/ou WhatsApp) — um ou multiplos clientes
- Template do relatorio (quais canais e secoes incluir)
- Personalizacao por cliente (logo e branding diferentes)
- Historico de envios (com status de entrega)
- Pausar/retomar agendamento
- Notificacao de falha de envio

#### 24.5 Templates de Relatorio (`/relatorios/templates`)

- Templates pre-configurados por tipo de negocio
- Templates customizados pelo usuario
- Duplicar e editar templates existentes
- Definir template padrao para agendamentos
- Compartilhar templates entre usuarios do workspace

---

### 25. Analise de Dados com IA (`/analise`)

Modulo de analise inteligente que cruza dados de trafego pago, social media organico, CRM e vendas para gerar insights acionaveis.

#### 25.1 Dashboard de Insights (`/analise`)

**Insights automaticos (gerados pela IA periodicamente):**
- Tendencias detectadas (crescimento, queda, sazonalidade)
- Anomalias (picos ou quedas fora do padrao em campanhas ou vendas)
- Correlacoes encontradas (ex: "posts com video geram 3x mais engajamento", "leads de campanhas com formulario curto convertem 40% mais")
- Previsoes (forecast de leads, receita, ROAS)
- Score de saude do negocio (indicador geral 0-100)
- Alertas proativos (CPL subindo, campanha perdendo performance, vendedor com pipeline parado)

**Cards de insight com acoes sugeridas:**
- Cada insight mostra: o que aconteceu, por que (hipotese da IA), o que fazer
- Botao para aplicar acao sugerida (ex: "Pausar campanha X", "Redistribuir leads", "Criar retargeting")
- Integracao com Otimizador de IA — insights alimentam sugestoes de otimizacao
- Historico de insights (para consulta futura)

#### 25.2 Analise por Area

**Trafego Pago:**
- ROAS por campanha, por periodo, por segmento de publico
- CPL trend (evolucao do custo por lead)
- Melhores e piores anuncios (ranking por performance)
- Fadiga de criativo (deteccao automatica)
- Distribuicao de gasto vs retorno por campanha
- Benchmark: performance atual vs media historica

**Vendas:**
- Performance por vendedor (ranking, taxa de conversao, ticket medio)
- Funil com gargalos identificados
- Velocidade do pipeline (dias medio por etapa)
- Win rate por origem do lead (Meta Ads vs Organico vs Prospeccao)
- Forecast de receita (proximo mes/trimestre)
- Correlacao: tempo de resposta ao lead vs taxa de conversao

**Social Media Organico:**
- Melhor dia/horario para postar (por rede)
- Tipos de conteudo com melhor performance
- Crescimento de seguidores (tendencia)
- Engajamento vs alcance (eficiencia)
- Impacto do organico nas vendas (correlacao posts → leads → vendas)

**Marketing Unificado:**
- Comparativo: trafego pago vs organico (qual gera mais receita efetiva)
- CAC por canal (custo de aquisicao de cliente)
- LTV/CAC ratio por canal
- Melhor alocacao de orcamento (onde investir mais)

#### 25.3 Pergunte a IA (`/analise/perguntar`)

- Campo de texto onde o usuario faz perguntas em linguagem natural
- Exemplos: "Qual campanha tem o melhor ROAS este mes?", "Qual vendedor converte mais leads de trafego pago?", "Quanto gastei no Meta em marco?", "Qual o melhor dia para postar no Instagram?"
- IA consulta os dados do sistema e responde com texto + graficos
- Historico de perguntas e respostas

---

## 4B. MODULO SAAS / BILLING

### 26. Gestao de Planos e Assinaturas (`/configuracoes/billing`)

**Pagina do usuario — Billing:**
- Plano atual (nome, preco, ciclo)
- Uso atual vs limites do plano (usuarios, campanhas, contas ads)
- Barra de progresso de consumo por recurso
- Historico de faturas (com PDF para download)
- Dados de pagamento (cartao, Pix — via Stripe ou gateway BR)
- Botao "Upgrade" / "Downgrade"
- Cancelamento com pesquisa de motivo

**Cestas pre-montadas:**

| Cesta | Preco | Usuarios | Modulos inclusos |
|-------|-------|----------|-----------------|
| Operacao | R$290/mes | 3 | CRM + Pipeline, Gestao Trafego IA, Landing Pages + Forms |
| Crescimento | R$690/mes | 8 | CRM + Pipeline, Gestao Trafego IA, Social Organico, Central Atendimento, BI + Atribuicao |
| Escala | R$1.490/mes | ilimitado | Todos os 8 modulos |

**Modulos avulsos (Custom Builder):**

| Modulo | Preco unitario | Descricao |
|--------|---------------|-----------|
| CRM + Pipeline | Incluso (R$0) | Funil ilimitado, lead, atribuicao 1:1 |
| Gestao de Trafego IA | R$190/mes | Meta + Google · copy, criativo e lance por IA |
| Social Organico | R$140/mes | 5 redes · calendario + IA replicando criativo vencedor |
| Central de Atendimento | R$180/mes | WhatsApp, email e SMS com bot de qualificacao |
| SDR + Agente de Voz IA | R$220/mes | Qualificacao por voz em 90s, agenda reuniao |
| BI + Atribuicao Avancada | R$160/mes | CAC, LTV, payback · pergunte em portugues a IA |
| Landing Pages + Forms | R$90/mes | Paginas ilimitadas · editor drag-and-drop |
| Contratos e Assinatura | R$110/mes | Proposta, contrato e assinatura eletronica |

**Preco = Base (R$190) + modulos selecionados + faixa de midia gerida.**

Faixas de midia: ate R$600 (+R$0), ate R$2.000 (+R$80), ate R$8.000 (+R$220), R$8.000+ (+R$480).

**Feature gating:**
- Middleware verifica modulos contratados do workspace antes de renderizar
- Modulos nao contratados: tela de upsell com descricao do modulo + botao "Adicionar modulo"
- Custom Builder integrado na pagina de billing para adicionar/remover modulos

**Trial:**
- 14 dias com acesso a todos os modulos (equivalente ao Escala)
- Sem cartao obrigatorio para iniciar trial
- Notificacoes: 7 dias, 3 dias, 1 dia antes de expirar
- Apos expirar: bloqueio ate escolher cesta ou montar cesta custom

**Fluxo de pagamento:**
- Checkout via Stripe (cartao) ou gateway brasileiro (Pix, boleto)
- Webhook de pagamento → atualiza status da assinatura
- Retry automatico em caso de falha de pagamento (3 tentativas)
- Dunning: emails de aviso de pagamento pendente (1, 3, 7 dias)
- Grace period de 7 dias antes de suspender workspace

---

## 4C. PERSONALIZACAO DE MARCA POR WORKSPACE

Cada workspace pode personalizar a aparencia do sistema para refletir sua marca. Isso NAO e white-label (o produto continua sendo AdSales Hub), mas permite que cada empresa tenha sua identidade visual dentro da plataforma.

### 27. Configuracao de Marca (`/configuracoes/marca`)

**Cor de destaque (accent color):**
- Color picker para definir a cor primaria do workspace
- A cor substitui `var(--accent)` em todo o sistema: sidebar ativa, botoes primarios, badges, links, graficos, progress bars, toggles, tabs ativas, icones ativos, sparklines, tags de status
- Preview em tempo real ao escolher a cor
- Paleta sugerida: 8 cores pre-definidas + custom hex
- Derivacao automatica de variantes: `--accent-soft` (12% opacity), `--accent-wash` (6% opacity), `--accent-hover` (lighten 10%), `--accent-pressed` (darken 10%)
- Padrao: `#FF5E1A` (laranja AdSales Hub)
- Validacao de contraste minimo (WCAG AA) contra fundo dark e light

**Logo do workspace:**
- Upload de logo (PNG/SVG, max 2MB)
- 2 versoes: logo completa (sidebar expandida, relatorios) + icone (sidebar colapsada, favicon)
- Crop/resize automatico para formatos necessarios
- Logo aparece em: sidebar (topo), relatorios PDF, emails transacionais do workspace, landing pages (se habilitado), tela de login do workspace (futuro)
- Fallback: iniciais do nome do workspace em circulo colorido com accent color

**Aplicacao tecnica:**
- CSS custom properties injetadas via `<style>` no layout root, baseadas em `workspace_branding`
- Server Component carrega branding do workspace na sessao
- Nenhum rebuild necessario — tudo via CSS variables em runtime
- Cache do branding em cookie/session para evitar query a cada request

### Entidade: workspace_branding

```
workspace_branding
  - id, workspace_id (unique)
  - accent_color (varchar — hex, ex: #FF5E1A)
  - accent_color_light (varchar — hex para light mode, nullable — derivado automaticamente se nao definido)
  - logo_url (text, nullable — Supabase Storage)
  - logo_icon_url (text, nullable — versao icone)
  - secondary_color (varchar, nullable — futuro)
  - created_at, updated_at
```

---

## 4D. GERACAO DE CRIATIVOS COM IA

O sistema gera imagens e videos para campanhas e social media usando IA, eliminando a necessidade de designer externo.

### 28. Gerador de Criativos (`/campanhas/criativos/gerar`)

**Geracao de Imagens:**
- Input: briefing em texto livre OU selecionar template de criativo
- IA (Claude) analisa o briefing e gera prompt otimizado para geracao de imagem
- Integracao com API de geracao de imagem: modelo de imagem primario + fallback automatico
- Formatos de saida: 1:1 (feed), 9:16 (stories/reels), 16:9 (horizontal)
- Variantes: gera 3-4 opcoes de uma vez para teste A/B
- Overlay de texto: headline e CTA sobrepostos com fontes/cores configuraveis
- Brand kit: aplica automaticamente cores e logo do workspace nos criativos
- Historico de criativos gerados por IA em `/campanhas/criativos/biblioteca`

**Geracao de Videos:**
- Input: roteiro ou briefing em texto
- Templates de video via gerador de video (slideshow animado, texto animado, antes/depois)
- Duracao: 15s, 30s, 60s (otimizado para Meta Ads e Reels)
- Trilha sonora de biblioteca royalty-free
- Legendas automaticas (captions)
- Exportar para biblioteca de criativos

**Sugestao Inteligente de Criativos:**
- Ao criar campanha, IA sugere tipo de criativo baseado no objetivo e segmento
- Referencia de criativos que performam bem no mesmo segmento
- Analise de fadiga: sugere novo criativo quando frequencia > 3 e CTR cai > 20%

**Limites por plano:**
- Operacao: 20 geracoes de imagem/mes, 5 videos/mes
- Crescimento: 80 geracoes de imagem/mes, 20 videos/mes
- Escala: 300 geracoes de imagem/mes, 80 videos/mes
- Custom Builder (modulo Trafego IA): 50 imagens/mes, 15 videos/mes

### Entidades adicionais:

```
ai_creatives (criativos gerados por IA)
  - id, workspace_id, created_by_user_id
  - type (image/video)
  - prompt (text — prompt usado para gerar)
  - briefing (text — briefing original do usuario)
  - provider (image_model/image_model_fallback/video_generator/template)
  - file_url (text — Supabase Storage)
  - thumbnail_url (text)
  - dimensions (jsonb — width x height)
  - format (1x1/9x16/16x9)
  - duration_seconds (integer, nullable — para videos)
  - metadata (jsonb — parametros da geracao, seed, etc)
  - status (generating/ready/failed)
  - campaign_id (nullable — vinculo direto com campanha)
  - social_post_id (nullable — vinculo com post social)
  - created_at

ai_creative_templates (templates de criativo)
  - id, workspace_id (nullable — null = template global do sistema)
  - name, description, category (ad/social/story/reel)
  - type (image/video)
  - template_data (jsonb — layout, placeholders, animacoes)
  - preview_url (text)
  - is_active (boolean)
  - created_at
```

---

## 4E. SDR + AGENTE DE VOZ IA

Modulo de qualificacao automatizada de leads por voz usando IA conversacional. O agente liga para o lead, qualifica em ate 90 segundos e agenda reuniao com o vendedor — tudo automatico.

### 29. Configuracao do Agente de Voz (`/configuracoes/sdr-ia`)

- Ativar/desativar agente de voz
- Definir script de qualificacao (perguntas-chave, criterios de qualificacao, respostas para objecoes)
- Tom de voz: formal, casual, tecnico (por segmento)
- Idioma: Portugues BR (padrao), com suporte futuro a ES e EN
- Horario de funcionamento (ex: seg-sex 9h-18h)
- Numero de telefone dedicado (comprado via provedor DID, conectado ao motor de voz via SIP credentials)
- Calendario para agendamento: integracao Google Calendar / Calendly
- Limite de tentativas por lead (padrao: 3)
- Intervalo entre tentativas (padrao: 2h, 6h, 24h)

### 30. Painel SDR IA (`/prospeccao/sdr-ia`)

**Dashboard:**
- Leads na fila de qualificacao
- Chamadas em andamento (real-time)
- Taxa de qualificacao (% leads qualificados / total contactado)
- Taxa de agendamento (% reunioes agendadas / qualificados)
- Tempo medio de qualificacao (meta: < 90s)
- Fila por prioridade (leads quentes primeiro — baseado em lead score)

**Fluxo de qualificacao automatica:**
1. Lead entra no pipeline (via Meta Ads, formulario, importacao)
2. Lead e classificado por score (baseado em dados do formulario + origem)
3. Agente de Voz IA liga para o lead no horario configurado
4. Conversa segue script de qualificacao com desvios inteligentes
5. IA avalia respostas em tempo real e decide: qualificado / nao qualificado / inconclusivo
6. Se qualificado: agenda reuniao no calendario do vendedor atribuido
7. Se nao qualificado: marca como perdido com motivo
8. Se inconclusivo: reagenda tentativa
9. Gravacao da chamada salva automaticamente + transcricao
10. Analise de sentimento e resumo da conversa gerados por IA

**Acoes manuais:**
- Pausar/retomar fila de um lead especifico
- Reatribuir lead para outro vendedor
- Ouvir gravacao + ver transcricao
- Override: marcar manualmente como qualificado/desqualificado

**Integracao com Pipeline CRM:**
- Lead qualificado move automaticamente para etapa "Qualificado" ou "Reuniao Agendada"
- Atividade "Qualificacao por IA" registrada no historico do negocio
- Notas da qualificacao adicionadas automaticamente
- Vendedor notificado (push + email) quando reuniao e agendada

### Entidades adicionais:

```
sdr_configs (configuracao do agente por workspace)
  - id, workspace_id
  - is_active (boolean)
  - qualification_script (jsonb — perguntas, criterios, objecoes)
  - tone (formal/casual/technical)
  - language (pt-BR/en/es)
  - working_hours (jsonb — dias e horarios)
  - phone_number (varchar — numero provisionado)
  - max_attempts (integer, default 3)
  - attempt_intervals (jsonb — [2h, 6h, 24h])
  - calendar_integration (jsonb — tipo + credenciais)
  - created_at, updated_at

sdr_calls (chamadas do agente IA)
  - id, workspace_id, deal_id, contact_id
  - phone_number_called
  - attempt_number (integer)
  - status (queued/ringing/in_progress/completed/failed/no_answer/busy)
  - duration_seconds (integer)
  - qualification_result (qualified/not_qualified/inconclusive)
  - disqualification_reason (varchar, nullable)
  - recording_url (text, nullable)
  - transcript (text, nullable)
  - ai_summary (text — resumo da conversa)
  - ai_sentiment (positive/neutral/negative)
  - meeting_scheduled_at (timestamptz, nullable)
  - meeting_calendar_event_id (varchar, nullable)
  - voice_call_id (varchar — ID da chamada no motor de voz)
  - started_at, ended_at
  - created_at

sdr_queue (fila de leads para qualificar)
  - id, workspace_id, deal_id, contact_id
  - priority (integer — menor = mais urgente)
  - lead_score (integer)
  - status (pending/in_progress/completed/paused)
  - next_attempt_at (timestamptz)
  - attempts_made (integer, default 0)
  - assigned_user_id (UUID — vendedor atribuido)
  - created_at, updated_at
```

---

## 4F. CONTRATOS E ASSINATURA ELETRONICA

Modulo para criar propostas comerciais, contratos e coletar assinatura eletronica — tudo integrado ao pipeline de vendas.

### 31. Propostas (`/negocios/[id]/propostas`)

**Criacao de proposta:**
- Templates de proposta customizaveis (arrastar blocos: capa, sobre, escopo, investimento, prazo, termos)
- Dados do negocio/contato pre-preenchidos automaticamente do CRM
- Produtos/servicos do catalogo com precos
- Calculos automaticos: subtotal, desconto, impostos, total
- Condicoes de pagamento configuraveis
- Validade da proposta (padrao: 7 dias)
- Preview da proposta em PDF antes de enviar
- Versionamento: v1, v2... (historico de propostas enviadas)

**Envio e acompanhamento:**
- Enviar por email (link seguro) ou WhatsApp
- Link publico com token unico (expira com a validade)
- Tracking: visualizou, tempo na pagina, secoes lidas
- Notificacao ao vendedor quando proposta e aberta
- Lembrete automatico antes da validade expirar
- Status: rascunho / enviada / visualizada / aceita / recusada / expirada

### 32. Contratos (`/negocios/[id]/contratos`)

**Criacao de contrato:**
- Templates de contrato com clausulas padrao
- Variaveis dinamicas: {{nome_empresa}}, {{valor}}, {{prazo}}, etc.
- Editor de texto rico para personalizar clausulas
- Anexar proposta aceita como base do contrato
- Versao para impressao (PDF)

**Assinatura eletronica:**
- Assinatura com validade juridica (Lei 14.063/2020 — assinatura eletronica avancada)
- Fluxo: enviar para assinatura → signatario recebe email/WhatsApp → abre link → le contrato → assina (desenho ou digitacao) → certificado gerado
- Multiplos signatarios com ordem definida
- Autenticacao do signatario: email + codigo SMS ou email + selfie (opcional)
- Certificado de assinatura com hash SHA-256 + timestamp + IP + geolocation
- Documento final em PDF com selo de assinatura e QR code de verificacao
- Armazenamento seguro no Supabase Storage (criptografado)

**Integracao com Pipeline:**
- Proposta aceita → move negocio para etapa "Contrato"
- Contrato assinado → move negocio para etapa "Fechado Ganho" automaticamente
- Historico de documentos visivel na aba do negocio
- Alertas de propostas proximas de expirar

### Entidades adicionais:

```
proposal_templates (templates de proposta)
  - id, workspace_id
  - name, description
  - blocks (jsonb — blocos arrastáveis: capa, escopo, investimento, termos)
  - default_validity_days (integer, default 7)
  - is_active (boolean)
  - created_at, updated_at

proposals (propostas enviadas)
  - id, workspace_id, deal_id, contact_id, created_by_user_id
  - template_id (nullable)
  - version (integer, default 1)
  - title, content (jsonb — blocos renderizados)
  - products (jsonb — itens com qtd, preco, desconto)
  - subtotal, discount, tax, total (numeric)
  - payment_terms (text)
  - validity_date (date)
  - share_token (UUID — link publico)
  - status (draft/sent/viewed/accepted/declined/expired)
  - viewed_at, accepted_at, declined_at
  - decline_reason (text, nullable)
  - pdf_url (text)
  - created_at, updated_at

contracts (contratos)
  - id, workspace_id, deal_id, proposal_id (nullable)
  - template_id (nullable)
  - title, content (text — HTML/rich text com variaveis resolvidas)
  - variables (jsonb — variaveis e valores)
  - status (draft/pending_signature/partially_signed/signed/canceled)
  - signed_document_url (text, nullable — PDF final com assinaturas)
  - verification_hash (varchar — SHA-256)
  - created_at, updated_at

contract_signatories (signatarios de contrato)
  - id, contract_id
  - name, email, phone (varchar)
  - role (signer/witness/approver)
  - sign_order (integer)
  - status (pending/signed/declined)
  - signature_type (draw/type)
  - signature_data (text — base64 da assinatura)
  - signed_at (timestamptz, nullable)
  - ip_address (varchar, nullable)
  - geolocation (jsonb, nullable)
  - auth_method (email_code/sms_code/selfie)
  - certificate_url (text, nullable)
  - created_at

contract_templates (templates de contrato)
  - id, workspace_id
  - name, description
  - content (text — HTML com {{variaveis}})
  - variables (jsonb — lista de variaveis esperadas)
  - is_active (boolean)
  - created_at, updated_at
```

---

## 5. CONFIGURACOES

### 5.1 Minha Conta
- `/configuracoes/perfil` — Dados do usuario
- `/configuracoes/billing` — Planos e faturamento

### 5.2 Workspace

**Herdado 100% do DM Hub:**
- `/configuracoes/empresa`
- `/configuracoes/usuarios` (Admin, Gestor, Vendedor, Visualizador, Media Buyer)
- `/configuracoes/campos`
- `/configuracoes/importar`
- `/configuracoes/produtos`
- `/configuracoes/motivos-perda`
- `/configuracoes/duplicatas`
- `/configuracoes/sequencias`
- `/configuracoes/email-templates`
- `/configuracoes/whatsapp-templates`
- `/configuracoes/scripts-ligacao`

### 5.3 Integracoes

**Herdado do DM Hub:**
- `/configuracoes/whatsapp`
- `/configuracoes/gmail`
- `/configuracoes/telefone`
- `/configuracoes/calendario`
- `/configuracoes/integracoes` (Meta Lead Ads, Elementor, Typeform, Google Forms, HTML)
- `/configuracoes/api`
- `/configuracoes/webhooks`

**Novas para Marketing:**
- `/configuracoes/meta-ads` — Conectar conta de anuncios Meta (Facebook Business Manager), selecionar Ad Account, conceder permissoes
- `/configuracoes/pixel` — Configurar Meta Pixel ID + Conversions API (server-side tracking)
- `/configuracoes/ia` — Nivel de automacao do otimizador (Manual/Semi/Full), limites de orcamento, CPL max, tom dos criativos, idioma
- `/configuracoes/dominio` — Dominio customizado para landing pages
- `/configuracoes/white-label` — Logo, cores, branding para relatorios de cliente
- `/configuracoes/social` — Conectar contas de redes sociais (Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest)
- `/configuracoes/relatorios` — Configurar templates padrao, frequencia de agendamento, branding
- `/configuracoes/ia-ciclo` — Frequencia do ciclo de IA (padrao: 2 dias), tipos de insight habilitados, notificacoes
- `/configuracoes/marca` — Cor de destaque (accent color) do workspace + upload de logo (aparece em sidebar, relatorios, emails)
- `/configuracoes/sdr-ia` — Configurar agente de voz IA (script de qualificacao, horarios, telefone, calendario)
- `/configuracoes/contratos` — Templates de proposta e contrato, configuracao de assinatura eletronica

---

## 6. MODELO DE DADOS

### Entidades Herdadas do DM Hub:

```
workspaces
users
pipelines
pipeline_stages
deals
contacts
companies
activities
notes
calls
call_analyses
email_templates
whatsapp_templates
call_scripts
sequences
sequence_steps
automations
automation_actions
automation_logs
goals
tags
deal_tags
custom_fields
custom_field_values
products
loss_reasons
integrations
api_keys
webhooks
webhook_logs
```

### Entidades Exclusivas do AdSales Hub:

```
ad_accounts
  - id, workspace_id, meta_account_id, name, currency, timezone
  - access_token_encrypted, token_expires_at
  - status (active/disconnected)
  - created_at, updated_at

campaigns
  - id, workspace_id, ad_account_id, meta_campaign_id
  - name, objective (lead_gen/traffic/conversions)
  - status (draft/active/paused/ended/archived)
  - daily_budget, lifetime_budget, start_date, end_date
  - ai_briefing (texto original do usuario)
  - ai_generated_config (jsonb — tudo que a IA gerou)
  - created_at, updated_at

ad_sets
  - id, campaign_id, meta_ad_set_id
  - name, status, daily_budget
  - targeting (jsonb — publico completo)
  - placements (jsonb — posicionamentos)
  - bid_strategy, schedule
  - created_at, updated_at

ads
  - id, ad_set_id, meta_ad_id
  - name, status, creative_id
  - headline, primary_text, description, cta
  - image_url, video_url
  - created_at, updated_at

ad_creatives
  - id, workspace_id, name, type (image/video/carousel)
  - file_url, thumbnail_url
  - tags, category
  - performance_data (jsonb — CTR, CPL historico)
  - created_at, updated_at

lead_forms
  - id, campaign_id, meta_form_id
  - name, headline, description
  - fields (jsonb — lista de campos)
  - thank_you_message, redirect_url
  - created_at, updated_at

audiences
  - id, workspace_id, meta_audience_id
  - name, type (saved/custom/lookalike)
  - config (jsonb — configuracao completa)
  - size_estimate, last_synced_at
  - created_at, updated_at

audience_syncs
  - id, audience_id, direction (crm_to_meta/meta_to_crm)
  - status (pending/syncing/completed/failed)
  - records_synced, last_run_at
  - created_at

campaign_metrics (granularidade por hora/dia)
  - id, campaign_id, date, hour (nullable)
  - impressions, reach, clicks, ctr
  - leads, cpl, spend, roas
  - frequency, quality_score
  - created_at

ad_set_metrics
  - id, ad_set_id, date, hour
  - (mesmos campos de campaign_metrics)

ad_metrics
  - id, ad_id, date, hour
  - (mesmos campos de campaign_metrics)

ai_optimization_logs
  - id, workspace_id, campaign_id
  - type (suggestion/auto_action)
  - action (pause_ad/increase_budget/new_creative/adjust_audience)
  - details (jsonb — o que a IA fez/sugeriu)
  - status (pending/approved/rejected/applied)
  - applied_at, created_at

landing_pages
  - id, workspace_id, name, slug
  - template_id, content (jsonb — estrutura da pagina)
  - domain, published (boolean)
  - meta_pixel_id, utm_config
  - created_at, updated_at

landing_page_versions (A/B test)
  - id, landing_page_id, version_name
  - content (jsonb), traffic_split (%)
  - visits, conversions, conversion_rate
  - created_at

form_submissions
  - id, form_id, landing_page_id (nullable)
  - data (jsonb — campos preenchidos)
  - utm_source, utm_medium, utm_campaign, utm_content, utm_term
  - ip_address, user_agent
  - deal_id (vinculado ao negocio criado)
  - created_at

email_campaigns
  - id, workspace_id, name, subject
  - from_name, from_email
  - template_id, content
  - segment_config (jsonb — filtros de audiencia)
  - status (draft/scheduled/sending/sent)
  - scheduled_at, sent_at
  - created_at, updated_at

email_campaign_metrics
  - id, email_campaign_id
  - sent, delivered, opened, clicked, unsubscribed, bounced
  - open_rate, click_rate
  - updated_at

lead_sources
  - id, deal_id, contact_id
  - source_type (meta_ads/google_ads/organic/prospecting/referral)
  - campaign_id (nullable), ad_set_id, ad_id
  - form_id, lead_form_id
  - cost (custo do lead)
  - utm_source, utm_medium, utm_campaign, utm_content, utm_term
  - captured_at, created_at

social_accounts (contas de redes sociais conectadas)
  - id, workspace_id, platform (instagram/facebook/linkedin/tiktok/youtube/pinterest)
  - account_name, account_id, profile_url, avatar_url
  - access_token_encrypted, refresh_token_encrypted
  - token_expires_at, status (active/expired/disconnected)
  - permissions (jsonb)
  - linked_ad_account_id (nullable — vinculacao com conta Meta Ads)
  - created_at, updated_at

social_posts (posts agendados/publicados)
  - id, workspace_id, created_by_user_id
  - content_text, hashtags (text[])
  - media_urls (jsonb — lista de imagens/videos)
  - platforms (jsonb — config por rede: texto adaptado, midia especifica)
  - status (idea/draft/pending_approval/approved/scheduled/publishing/published/failed/rejected)
  - scheduled_at, published_at
  - approval_token (UUID — link externo de aprovacao)
  - approved_by, approved_at, rejection_reason
  - first_comment (text — para Instagram)
  - boost_campaign_id (nullable — se transformado em anuncio pago)
  - landing_page_id (nullable — link para LP do modulo)
  - ai_suggestions (jsonb — sugestoes de legenda, hashtags, horarios)
  - created_at, updated_at

social_post_metrics (metricas por post publicado)
  - id, social_post_id, platform
  - impressions, reach, likes, comments, shares, saves
  - clicks, engagement_rate, video_views
  - collected_at, created_at

social_media_library (biblioteca de midias — compartilhada com ad_creatives)
  - id, workspace_id, name, file_url, thumbnail_url
  - type (image/video/gif), file_size
  - dimensions (jsonb — width x height)
  - folder, tags (text[])
  - ad_creative_id (nullable — vinculo com criativo de ads)
  - created_at

report_templates (templates de relatorio)
  - id, workspace_id, name, description
  - type (traffic/social/sales/unified/client/custom)
  - sections (jsonb — quais secoes incluir)
  - channels (jsonb — quais canais/fontes de dados)
  - branding (jsonb — logo, cores, fonte)
  - client_info (jsonb — nome, logo, contato do cliente — para agencias)
  - is_default (boolean)
  - created_at, updated_at

reports (relatorios gerados)
  - id, workspace_id, template_id, created_by_user_id
  - name, type, period_start, period_end
  - data_snapshot (jsonb — dados coletados no momento da geracao)
  - ai_summary (text — resumo executivo gerado pela IA)
  - ai_recommendations (jsonb — recomendacoes)
  - branding (jsonb), language
  - pdf_url (link do PDF gerado)
  - share_token (UUID — link publico)
  - share_password (hash, nullable)
  - status (generating/ready/sent/failed)
  - created_at

report_schedules (agendamentos de relatorio)
  - id, workspace_id, template_id
  - frequency (daily/weekly/biweekly/monthly)
  - day_of_week, day_of_month, send_time
  - recipients_email (text[]), recipients_whatsapp (text[])
  - is_active (boolean)
  - last_sent_at, next_send_at
  - created_at, updated_at

ai_insights (insights gerados pela IA — mesma IA que otimiza campanhas)
  - id, workspace_id, campaign_id (nullable)
  - area (traffic/sales/social/unified)
  - type (trend/anomaly/correlation/forecast/recommendation/optimization)
  - title, description, details (jsonb)
  - severity (info/warning/opportunity/critical)
  - suggested_action (text), action_type (pause_campaign/increase_budget/create_retargeting/redistribute_leads/custom)
  - action_applied (boolean), applied_at
  - optimization_log_id (nullable — vinculo com ai_optimization_logs se acao aplicada)
  - valid_until (timestamp)
  - created_at

ai_questions (perguntas feitas a IA)
  - id, workspace_id, user_id
  - question (text), answer (text)
  - data_consulted (jsonb — quais fontes a IA usou)
  - charts (jsonb — graficos gerados na resposta)
  - created_at

workspace_branding (personalizacao visual por workspace)
  - id, workspace_id (unique)
  - accent_color (varchar — hex, ex: #FF5E1A)
  - accent_color_light (varchar, nullable — hex para light mode)
  - logo_url (text, nullable — Supabase Storage)
  - logo_icon_url (text, nullable — versao icone)
  - secondary_color (varchar, nullable — futuro)
  - created_at, updated_at

ai_creatives (criativos gerados por IA)
  - id, workspace_id, created_by_user_id
  - type (image/video)
  - prompt (text), briefing (text)
  - provider (image_model/image_model_fallback/video_generator/template)
  - file_url (text), thumbnail_url (text)
  - dimensions (jsonb), format (1x1/9x16/16x9)
  - duration_seconds (integer, nullable)
  - metadata (jsonb)
  - status (generating/ready/failed)
  - campaign_id (nullable), social_post_id (nullable)
  - created_at

ai_creative_templates (templates de criativo IA)
  - id, workspace_id (nullable — null = global)
  - name, description, category (ad/social/story/reel)
  - type (image/video)
  - template_data (jsonb), preview_url (text)
  - is_active (boolean)
  - created_at

sdr_configs (configuracao do agente de voz por workspace)
  - id, workspace_id
  - is_active (boolean)
  - qualification_script (jsonb)
  - tone (formal/casual/technical), language (pt-BR/en/es)
  - working_hours (jsonb), phone_number (varchar)
  - max_attempts (integer, default 3)
  - attempt_intervals (jsonb)
  - calendar_integration (jsonb)
  - created_at, updated_at

sdr_calls (chamadas do agente IA)
  - id, workspace_id, deal_id, contact_id
  - phone_number_called, attempt_number (integer)
  - status (queued/ringing/in_progress/completed/failed/no_answer/busy)
  - duration_seconds (integer)
  - qualification_result (qualified/not_qualified/inconclusive)
  - disqualification_reason (varchar, nullable)
  - recording_url (text), transcript (text)
  - ai_summary (text), ai_sentiment (positive/neutral/negative)
  - meeting_scheduled_at (timestamptz, nullable)
  - voice_call_id (varchar)
  - started_at, ended_at, created_at

sdr_queue (fila de leads para qualificar)
  - id, workspace_id, deal_id, contact_id
  - priority (integer), lead_score (integer)
  - status (pending/in_progress/completed/paused)
  - next_attempt_at (timestamptz)
  - attempts_made (integer, default 0)
  - assigned_user_id (UUID)
  - created_at, updated_at

proposal_templates (templates de proposta)
  - id, workspace_id
  - name, description
  - blocks (jsonb), default_validity_days (integer, default 7)
  - is_active (boolean)
  - created_at, updated_at

proposals (propostas comerciais)
  - id, workspace_id, deal_id, contact_id, created_by_user_id
  - template_id (nullable), version (integer)
  - title, content (jsonb), products (jsonb)
  - subtotal, discount, tax, total (numeric)
  - payment_terms (text), validity_date (date)
  - share_token (UUID)
  - status (draft/sent/viewed/accepted/declined/expired)
  - viewed_at, accepted_at, declined_at
  - decline_reason (text, nullable), pdf_url (text)
  - created_at, updated_at

contracts (contratos)
  - id, workspace_id, deal_id, proposal_id (nullable)
  - template_id (nullable)
  - title, content (text)
  - variables (jsonb)
  - status (draft/pending_signature/partially_signed/signed/canceled)
  - signed_document_url (text, nullable)
  - verification_hash (varchar)
  - created_at, updated_at

contract_signatories (signatarios de contrato)
  - id, contract_id
  - name, email, phone (varchar)
  - role (signer/witness/approver), sign_order (integer)
  - status (pending/signed/declined)
  - signature_type (draw/type), signature_data (text)
  - signed_at, ip_address, geolocation (jsonb)
  - auth_method (email_code/sms_code/selfie)
  - certificate_url (text, nullable)
  - created_at

contract_templates (templates de contrato)
  - id, workspace_id
  - name, description
  - content (text — HTML com {{variaveis}})
  - variables (jsonb)
  - is_active (boolean)
  - created_at, updated_at

modules (modulos disponiveis no SaaS)
  - id, slug (crm/ads/social/msg/sdr/bi/site/sign)
  - display_name, description
  - price_monthly (integer — em centavos)
  - is_required (boolean — CRM e obrigatorio)
  - is_active (boolean)
  - created_at, updated_at

baskets (cestas pre-montadas)
  - id, name (operacao/crescimento/escala), display_name
  - price_monthly (integer — em centavos)
  - max_users (integer, nullable para ilimitado)
  - max_media_monthly (integer — limite de midia em reais)
  - module_ids (jsonb — array de module slugs inclusos)
  - is_featured (boolean)
  - is_active (boolean)
  - trial_days (integer, default 14)
  - created_at, updated_at

media_tiers (faixas de midia gerida)
  - id, max_monthly (integer — limite em reais)
  - fee_monthly (integer — taxa adicional em centavos)
  - is_active (boolean)

subscriptions (assinaturas ativas)
  - id, workspace_id
  - basket_id (nullable — se usar cesta pre-montada)
  - custom_modules (jsonb — array de module slugs se cesta custom)
  - media_tier_id (nullable)
  - status (trialing/active/past_due/canceled/suspended)
  - current_period_start, current_period_end
  - trial_end (nullable)
  - cancel_at_period_end (boolean)
  - canceled_at (nullable), cancel_reason
  - stripe_subscription_id (nullable)
  - stripe_customer_id (nullable)
  - created_at, updated_at

invoices (faturas)
  - id, workspace_id, subscription_id
  - amount, currency (BRL)
  - status (draft/open/paid/void/uncollectible)
  - payment_method (credit_card/pix/boleto)
  - stripe_invoice_id (nullable)
  - pdf_url, due_date, paid_at
  - created_at

usage_records (registro de uso para feature gating)
  - id, workspace_id, resource (users/ad_accounts/campaigns/landing_pages/emails_sent/social_networks/ai_generations)
  - current_count (integer)
  - limit_count (integer — do plano)
  - period_start, period_end
  - updated_at
```

### Relacionamentos-chave:

```
ad_accounts 1:N campaigns
campaigns 1:N ad_sets
ad_sets 1:N ads
campaigns 1:N lead_forms
campaigns 1:N campaign_metrics (por data/hora)
ad_sets 1:N ad_set_metrics
ads 1:N ad_metrics
deals N:1 lead_sources (cada negocio tem uma origem)
contacts N:1 lead_sources
audiences N:N audience_syncs
landing_pages 1:N landing_page_versions
landing_pages 1:N form_submissions
email_campaigns 1:1 email_campaign_metrics
campaigns 1:N ai_optimization_logs
social_accounts 1:N social_posts (posts publicados por conta)
social_posts 1:N social_post_metrics (metricas por post por plataforma)
social_posts N:1 campaigns (post pode ser boost de campanha)
social_posts N:1 landing_pages (post pode linkar para LP)
report_templates 1:N reports (template gera varios relatorios)
report_templates 1:N report_schedules (template usado em agendamentos)
ai_insights N:1 campaigns (insight pode ser sobre campanha especifica)
ai_insights N:1 ai_optimization_logs (insight pode gerar otimizacao)
workspaces 1:N ai_questions (perguntas feitas por workspace)
workspaces 1:1 workspace_branding (personalizacao visual)
workspaces 1:N ai_creatives (criativos gerados por IA)
ai_creatives N:1 campaigns (criativo pode ser de campanha)
ai_creatives N:1 social_posts (criativo pode ser de post social)
workspaces 1:1 sdr_configs (configuracao do agente de voz)
workspaces 1:N sdr_calls (chamadas do agente IA)
workspaces 1:N sdr_queue (fila de qualificacao)
sdr_calls N:1 deals (chamada vinculada a negocio)
sdr_calls N:1 contacts (chamada vinculada a contato)
deals 1:N proposals (negocio pode ter multiplas propostas)
proposals N:1 proposal_templates
deals 1:N contracts (negocio pode ter contratos)
contracts 1:N contract_signatories (contrato tem signatarios)
contracts N:1 contract_templates
contracts N:1 proposals (contrato pode derivar de proposta)
workspaces 1:1 subscriptions (cada workspace tem uma assinatura)
subscriptions N:1 baskets (assinatura vinculada a cesta)
subscriptions 1:N invoices (assinatura gera faturas)
workspaces 1:N usage_records (uso por recurso por workspace)
```

---

## 7. INTEGRACAO META MARKETING API — DETALHAMENTO TECNICO

### 7.1 Autenticacao

- OAuth 2.0 via Facebook Login
- Permissoes necessarias: `ads_management`, `ads_read`, `leads_retrieval`, `pages_manage_ads`, `pages_read_engagement`, `business_management`
- Token de longa duracao (60 dias) com refresh automatico
- Token armazenado criptografado no Supabase Vault

### 7.2 Endpoints Utilizados

**Campanhas:**
- `POST /{ad_account_id}/campaigns` — Criar campanha
- `POST /{ad_account_id}/adsets` — Criar conjunto de anuncios
- `POST /{ad_account_id}/ads` — Criar anuncio
- `POST /{page_id}/leadgen_forms` — Criar formulario de lead
- `GET /{campaign_id}/insights` — Metricas da campanha
- `POST /{campaign_id}` — Atualizar campanha (pausar, editar)

**Publicos:**
- `POST /{ad_account_id}/customaudiences` — Criar publico personalizado
- `POST /{custom_audience_id}/users` — Adicionar usuarios ao publico
- `DELETE /{custom_audience_id}/users` — Remover usuarios

**Leads:**
- Webhook subscription para `leadgen` — receber leads em tempo real
- `GET /{form_id}/leads` — Buscar leads (fallback)

### 7.3 Fluxo de Recebimento de Leads

1. Lead preenche formulario no Meta (Facebook/Instagram)
2. Meta envia webhook para AdSales Hub
3. Edge Function recebe e valida o webhook
4. Busca dados completos do lead via API
5. Cria contato no Supabase (se nao existe)
6. Cria negocio no pipeline configurado
7. Vincula lead_source com dados completos de origem
8. Dispara automacao configurada (notificacao, sequencia, etc)
9. Processo completo em < 5 segundos

### 7.4 Limites e Rate Limiting

- Respeitar rate limits da Meta API (200 calls/hour/user default)
- Queue de requests com retry exponencial
- Cache de dados de publico e metricas
- Metricas coletadas a cada 1h (nao real-time — limitacao do Meta)
- Batch requests onde possivel

---

## 8. MOTOR DE IA — DETALHAMENTO

### 8.1 Geracao de Campanha

**Input:** Briefing em texto livre do usuario
**Modelo:** Claude API (claude-sonnet-4-20250514 ou superior)
**System Prompt:** Especialista em Meta Ads com conhecimento de:
- Objetivos de campanha e quando usar cada um
- Targeting do Meta (interesses, comportamentos, demographics)
- Best practices de copywriting para ads
- Estrutura de formularios de lead
- Benchmarks de CPL por segmento

**Output estruturado (JSON):**
```json
{
  "campaign": {
    "name": "string",
    "objective": "LEAD_GENERATION",
    "special_ad_categories": []
  },
  "ad_set": {
    "name": "string",
    "targeting": {
      "geo_locations": {},
      "age_min": 30,
      "age_max": 55,
      "genders": [],
      "flexible_spec": [{"interests": [], "behaviors": []}],
      "exclusions": {}
    },
    "daily_budget": 10000,
    "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
    "placements": "automatic"
  },
  "ads": [
    {
      "name": "Variacao A",
      "headline": "string",
      "primary_text": "string",
      "description": "string",
      "cta": "LEARN_MORE",
      "image_prompt": "string (prompt otimizado para geracao de imagem via IA)",
      "image_style": "string (estilo visual: minimalista, bold, fotografia, ilustracao)",
      "video_suggestion": "string (descricao de video se aplicavel)"
    }
  ],
  "lead_form": {
    "name": "string",
    "headline": "string",
    "fields": ["FULL_NAME", "EMAIL", "PHONE_NUMBER"],
    "context_card": {},
    "thank_you_page": {}
  },
  "reasoning": "string (explicacao das escolhas da IA)"
}
```

### 8.2 Otimizacao Continua

**Frequencia:** A cada 2 dias (mesmo ciclo dos insights e relatorios)
**Input:** Metricas das ultimas 24-72h + dados historicos do CRM
**Analises:**
- CPL por anuncio (quais pausar, quais escalar)
- Fadiga de criativo (frequencia > 3 + CTR caindo > 20%)
- Publicos saturados (alcance proximo do limite)
- Horarios de melhor performance
- Conversao no CRM (quais campanhas geram leads que realmente compram)

**Output:** Lista de acoes sugeridas ou automaticas (conforme nivel configurado)

---

## 9. ARQUITETURA TECNICA

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes + Supabase Edge Functions |
| Banco de Dados | Supabase (PostgreSQL) com Row Level Security |
| Autenticacao | Supabase Auth (email, Google OAuth, Facebook OAuth) |
| Realtime | Supabase Realtime (notificacoes, leads em tempo real) |
| Storage | Supabase Storage (criativos, gravacoes, relatorios) |
| IA (Texto) | Claude API (Anthropic) — geracao de campanhas, otimizacao, insights, relatorios, qualificacao por voz, pergunte a IA |
| IA (Imagem) | Modelos de imagem (primario + fallback) — geracao de criativos visuais |
| Assinatura Eletronica | Modulo proprio (hash SHA-256 + timestamp + IP + geo) — Lei 14.063/2020 |
| Social Media | Instagram Graph API, Facebook Pages API, LinkedIn API, TikTok API, YouTube Data API |
| PDF / Relatorios | Puppeteer ou react-pdf (geracao de PDFs white-label) |
| Meta Ads | Meta Marketing API v21+ |
| Meta Leads | Meta Webhooks (leadgen) |
| Meta Pixel | Conversions API (server-side) |
| Telefonia IA | Motor de voz IA (ligacoes IA inbound/outbound via API — transparente ao usuario) |
| SIP / Numeros | Provedor DID BR (numeros BR +55 via API, SIP credentials conectadas ao motor de voz, white-label, SMS) |
| WhatsApp | Meta Cloud API (WhatsApp Business) |
| Email Transacional | Resend ou SendGrid |
| Email Marketing | Resend (bulk) ou Amazon SES |
| Landing Pages | Next.js (SSR) com dominio customizado |
| Filas/Jobs | Supabase Edge Functions + pg_cron |
| Pagamentos | Stripe (cartao, assinaturas, invoices) + gateway BR (Pix, boleto) |
| Deploy | Vercel (frontend + landing pages) + Supabase Cloud (backend) |

### Seguranca

- Row Level Security (RLS) em todas as tabelas
- Roles: Admin, Gestor, Vendedor, Media Buyer, Visualizador
- Tokens Meta criptografados em Supabase Vault
- API Keys com escopo limitado
- Webhook com verificacao de assinatura (Meta + HMAC)
- Rate limiting
- Audit log
- LGPD: consentimento de leads, opcao de exclusao de dados

### Multi-Tenancy

- Isolamento por `workspace_id`
- RLS no banco
- Cada workspace conecta sua propria conta Meta Ads
- Subdominio ou dominio customizado (landing pages + white-label)

---

## 10. PRECIFICACAO

### Cestas pre-montadas

| Cesta | Preco | Usuarios | Midia gerida | Modulos |
|-------|-------|----------|-------------|---------|
| Operacao | R$ 290/mes | 3 | ate R$ 600/mes | CRM + Trafego IA + Landing Pages |
| Crescimento | R$ 690/mes | 8 | ate R$ 2.000/mes | CRM + Trafego IA + Social + Mensagens + BI |
| Escala | R$ 1.490/mes | ilimitado | ate R$ 8.000/mes | Todos os 8 modulos |

### Modulos avulsos (Custom Builder)

Base da plataforma: R$ 190/mes (inclui CRM + Pipeline com atribuicao 1:1).

| Modulo | Preco |
|--------|-------|
| Gestao de Trafego IA | R$ 190/mes |
| Social Organico | R$ 140/mes |
| Central de Atendimento (WA + Email + SMS) | R$ 180/mes |
| SDR + Agente de Voz IA | R$ 220/mes |
| BI + Atribuicao Avancada | R$ 160/mes |
| Landing Pages + Forms | R$ 90/mes |
| Contratos e Assinatura Eletronica | R$ 110/mes |

### Faixas de midia gerida

| Faixa | Taxa adicional |
|-------|---------------|
| Ate R$ 600/mes | R$ 0 |
| Ate R$ 2.000/mes | R$ 80/mes |
| Ate R$ 8.000/mes | R$ 220/mes |
| Acima de R$ 8.000/mes | R$ 480/mes |

### Comparativo com modelo tradicional

| Item | Custo mensal tipico |
|------|-------------------|
| Agencia de marketing | R$ 9.500 |
| Gestor de trafego freelancer | R$ 3.200 |
| 5 ferramentas (CRM + social + email + BI + forms) | R$ 2.140 |
| **AdSales Hub (cesta Crescimento)** | **R$ 690** |

---

## 11. ROADMAP

### Fase 1 — MVP CRM (8-12 semanas)
- Auth + Workspace + Usuarios
- Pipeline Kanban + Detalhe do Negocio (7 abas)
- Contatos + Empresas
- Atividades + Calendario
- Comunicacao: Email + WhatsApp
- Dashboard basico

### Fase 2 — Core CRM (6-8 semanas)
- Automacoes (engine de triggers/actions)
- Sequencias de atividades
- Templates (email, WhatsApp, scripts)
- Relatorios e Metricas
- Metas
- Importacao de dados

### Fase 3 — Meta Ads + IA (8-12 semanas)
- Conexao com Meta Business Manager (OAuth)
- Criador de Campanha com IA (briefing → publicacao)
- Recebimento de leads via webhook
- Dashboard de Performance (metricas em tempo real)
- Gestao de Publicos
- Integracao Lead → Pipeline automatica
- Lead Source tracking (UTM + campanha)

### Fase 4 — Marketing Avancado + Criativos IA (6-8 semanas)
- Otimizador com IA (sugestoes + automacao)
- Landing Page Builder
- Formularios
- Gerador de Criativos com IA (imagens + videos)
- Biblioteca de Criativos (manual + gerado por IA)
- Email Marketing
- Personalizacao de marca por workspace (accent color + logo)

### Fase 5 — Social Media + Relatorios (8-10 semanas)
- Conexao com redes sociais (Instagram, Facebook, LinkedIn)
- Calendario visual de posts + criador de post
- Fluxo de aprovacao (interno + link externo para clientes)
- Publicacao automatica via APIs
- Biblioteca de midia (compartilhada com criativos de ads)
- Central de Relatorios (geracao em 3 segundos)
- Templates de relatorio + branding white-label por cliente
- Exportacao PDF white-label
- Agendamento de envio de relatorios (email/WhatsApp)
- Boost automatico (post organico → anuncio pago)

### Fase 6 — Analise de Dados com IA Unificada (6-8 semanas)
- Motor de IA unificado (mesmo que otimiza campanhas — ciclo de 2 dias)
- Insights automaticos cruzando trafego + vendas + social
- Analise por area (trafego pago, vendas, social, marketing unificado)
- Pergunte a IA (consultas em linguagem natural)
- Resumo executivo com IA nos relatorios
- Forecast de receita e leads
- Score de saude do negocio
- Analytics Unificado (marketing + vendas — funil completo)

### Fase 7 — CRM Avancado + SDR IA (6-8 semanas)
- Telefonia IA integrada (inbound/outbound)
- Analise de Calls com IA
- Prospeccao (base de dados)
- SDR + Agente de Voz IA (qualificacao automatica por telefone)
- Contratos e Assinatura Eletronica (propostas, contratos, e-signature)
- Google Analytics integrado nos relatorios

### Fase 8 — Multi-Plataforma (6-8 semanas)
- TikTok Ads API (criar campanhas + receber leads)
- TikTok, YouTube e Pinterest (publicacao social)
- Google Ads API (campanhas de pesquisa + display + YouTube)
- Google Analytics 4 como fonte de dados nos relatorios

### Fase 9 — Escala
- App mobile (React Native)
- Marketplace de integracoes
- API publica documentada
- Integracao com Canva (importar designs)
- Multi-idioma (PT-BR, EN, ES)
