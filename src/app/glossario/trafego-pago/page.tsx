import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/glossario/trafego-pago";

export const metadata: Metadata = {
  title: "O que é tráfego pago — guia 2026 (Meta, Google, TikTok)",
  description:
    "Tráfego pago explicado pra quem nunca rodou anúncio: como funciona, quanto custa começar, quais plataformas usar e como evitar queimar dinheiro.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "Quanto preciso investir pra começar tráfego pago?", a: "Mínimo realista pra Meta Ads em 2026: R$ 50/dia (R$ 1.500/mês) por campanha de conversão. Abaixo disso, o algoritmo não sai da fase de aprendizado — você precisa de 50 conversões por ad set em 7 dias pra estabilizar. Se vai testar 2 campanhas paralelas, conte R$ 3.000/mês de mídia. Google Search aceita orçamentos menores (R$ 30/dia) porque trabalha com intenção, não otimização." },
  { q: "Vale mais Meta Ads ou Google Ads?", a: "Depende do estágio do funil. Meta (Facebook + Instagram + Reels) é descoberta — você interrompe o feed de quem ainda não busca seu produto. Google Search é captura de demanda — quem já está procurando solução. Operação madura usa os dois: Meta no topo gerando consciência, Google no fundo capturando quem foi impactado e foi pesquisar. Performance Max do Google cruza os dois mundos com sinais próprios." },
  { q: "Posso fazer tráfego pago sem agência?", a: "Sim, e cada vez mais empresas estão internalizando. Plataformas modernas como o AdSales·Hub geram briefing → criativo → publicação via IA, com Conversions API e otimização contínua sem você precisar abrir o Ads Manager. PME brasileira que internaliza economiza R$ 8.000-15.000/mês de fee de agência e acelera o ciclo de teste de criativos de semanas pra horas." },
  { q: "iOS 17 ATT e ITP do Safari ainda atrapalham conversão?", a: "Atrapalham, mas menos que em 2022. Hoje você compensa com Conversions API server-side (envia evento direto do seu servidor pro Meta), enriquecimento de dados (e-mail, telefone hashed) e modelagem do próprio Meta. Quem ainda depende só do Pixel client-side está perdendo 30-40% das conversões reportadas." },
  { q: "ABO ou CBO, qual usar?", a: "CBO (Campaign Budget Optimization) virou padrão pra escala — o algoritmo distribui o orçamento entre ad sets baseado em performance. ABO (Ad Set Budget Optimization) ainda faz sentido em testes controlados, quando você quer forçar gasto igual em públicos diferentes pra comparar de verdade. Regra prática: testa em ABO, escala em CBO." },
];

const COVER_TITLE = encodeURIComponent("O que é tráfego pago");
const COVER_SUBTITLE = encodeURIComponent("Meta, Google, TikTok — guia 2026 pra PME brasileira");
const COVER_IMAGE = `/api/og?title=${COVER_TITLE}&category=Glossário&subtitle=${COVER_SUBTITLE}`;

export default function TrafegoPagoGlossaryPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="O que é tráfego pago" description="Guia 2026 para PMEs brasileiras." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Glossário"
        title="O que é tráfego pago"
        description="Tráfego pago é quando você paga uma plataforma (Meta, Google, TikTok) pra mostrar anúncios pra públicos específicos — em vez de esperar que descubram você organicamente."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Glossário", href: "/recursos" },
          { label: "Tráfego pago" },
        ]}
        cta={{ label: "Rodar campanha com IA", href: "/signup" }}
        coverImage={COVER_IMAGE}
        readingMinutes={7}
      >
        <p>
          Tráfego pago deixou de ser opcional pra PME brasileira em algum momento entre
          2021 e 2023, e a maioria dos donos de negócio não percebeu. Quem ainda depende
          de indicação, Instagram orgânico e cliente que aparece sozinho está vendo o
          faturamento estagnar enquanto concorrente menor, mas que sabe rodar Meta Ads,
          dobra de tamanho a cada seis meses. Honestamente, não tem mais como escalar uma
          operação comercial no Brasil de 2026 sem mídia paga rodando todo dia — e o
          motivo é matemático, não ideológico: alcance orgânico no Instagram caiu pra 2%,
          o Google empilhou cinco anúncios antes do primeiro resultado orgânico e o
          TikTok decide quem aparece no For You por leilão de atenção. Se você não está
          pagando pra entrar nessas filas, está fora delas.
        </p>

        <h2>Definição</h2>
        <p>
          <strong>Tráfego pago</strong> (ou <em>paid media</em>, <em>mídia paga</em>) é o
          conjunto de canais onde você paga uma plataforma pra colocar conteúdo na frente
          de pessoas específicas. Diferente do tráfego orgânico (SEO, posts não
          impulsionados, indicação), tráfego pago é controlado: você decide quanto
          gastar, quem ver, o que mostrar e em que momento. A contrapartida é que o
          aprendizado é caro — toda plataforma cobra você enquanto descobre quem converte
          no seu negócio, e a curva de aprendizado pode queimar R$ 3.000-8.000 antes da
          conta começar a fechar.
        </p>
        <p>
          O ecossistema cresceu além de "anúncio no Facebook". Hoje, tráfego pago inclui
          Meta Ads (Facebook, Instagram, Reels, Messenger), Google Ads (Search,
          Performance Max, Demand Gen, YouTube), TikTok Ads, LinkedIn Ads, Pinterest e
          retargeting via redes programáticas. Cada plataforma tem sua própria API —
          Meta opera via Marketing API v21, Google via Google Ads API — e suas próprias
          regras de leilão, formato de criativo e janela de atribuição. Operação séria
          em 2026 também conversa server-side via Conversions API (Meta) e Enhanced
          Conversions (Google), porque o Pixel sozinho perdeu confiabilidade depois do
          iOS 17 ATT e do ITP no Safari.
        </p>

        <h2>Plataformas principais (Brasil 2026)</h2>
        <p>
          Os números abaixo são CPL (custo por lead) médio observado no mercado
          brasileiro em ticket médio R$ 500-5.000. Eles variam violentamente por nicho,
          qualidade do criativo e maturidade da conta — use como referência, não como meta.
        </p>
        <table>
          <thead><tr><th>Plataforma</th><th>Forte em</th><th>CPL típico (BR)</th></tr></thead>
          <tbody>
            <tr><td>Meta Ads (FB+Instagram+Reels)</td><td>Descoberta, B2C, Lead Forms, Lookalike</td><td>R$ 8-80</td></tr>
            <tr><td>Google Search</td><td>Captura de demanda, intenção alta, B2B</td><td>R$ 25-180</td></tr>
            <tr><td>Google Performance Max</td><td>E-commerce automatizado, multi-canal</td><td>R$ 18-70</td></tr>
            <tr><td>Google Demand Gen</td><td>YouTube + Discover, descoberta visual</td><td>R$ 12-55</td></tr>
            <tr><td>YouTube Ads (TrueView)</td><td>Storytelling longo, branding, infoproduto</td><td>R$ 0,03-0,15/view</td></tr>
            <tr><td>TikTok Ads</td><td>Geração Z, descoberta viral, criativo nativo</td><td>R$ 6-25</td></tr>
            <tr><td>LinkedIn Ads</td><td>B2B enterprise, ticket alto, ABM</td><td>R$ 80-400</td></tr>
            <tr><td>Pinterest Ads</td><td>Decoração, moda, casamento, intenção visual</td><td>R$ 12-45</td></tr>
          </tbody>
        </table>
        <p>
          Casos reais que vimos rodando: ecom de moda feminina ticket R$ 180 fechando
          campanha de Meta com CPL de R$ 18 usando Lookalike 1% de compradores; B2B SaaS
          de gestão financeira pagando CPL de R$ 95 no Google Search em palavras-chave
          de fundo de funil ("software de fluxo de caixa"); infoprodutor de inglês
          gerando lead a R$ 8 no TikTok com criativo UGC de 12 segundos. Os três rodam
          margem saudável porque ajustaram LTV e CAC ao canal — não escolheram canal
          baseado em moda.
        </p>

        <h2>Como funciona o leilão</h2>
        <p>
          Toda plataforma de mídia paga roda um leilão em tempo real. Quando alguém abre
          o feed do Instagram às 19h47, o Meta calcula em 200 milissegundos quem vai ver
          qual anúncio considerando três variáveis: lance do anunciante, qualidade
          esperada do anúncio (CTR previsto, taxa de conversão, sinal de Pixel) e
          relevância pro usuário específico. O anunciante que vence é o que oferece o
          maior <em>total value</em>, não o maior lance. O que ninguém te conta no
          curso de Meta Ads é que esse cálculo penaliza pesadamente criativos sem
          engajamento — anúncio com CTR baixo precisa lancear 3-4x mais pra competir.
        </p>
        <p>
          <strong>Lance maior nem sempre vence</strong>. Em pelo menos metade dos
          leilões observados, o anúncio com CTR alto ganha de lance menor porque a
          plataforma lucra mais com engajamento sustentado (mais sessão, mais ad
          impressions ao longo do dia). Por isso criativo é a alavanca mais barata pra
          baixar CPL — antes de mexer em público, em lance ou em otimização, melhora o
          criativo. Diferença entre um vídeo medíocre e um vídeo bom no mesmo público
          costuma ser 40-60% no CPM.
        </p>

        <h2>Anatomia de uma campanha</h2>
        <p>
          Toda campanha de Meta Ads (e o raciocínio vale pro Google e TikTok com
          adaptações) tem cinco camadas que precisam estar alinhadas. Erro em qualquer
          uma delas estoura a conta:
        </p>
        <ol>
          <li><strong>Objetivo</strong>: Awareness, Tráfego, Engajamento, Leads, Conversões, Vendas. Define como o algoritmo otimiza. Escolher Tráfego quando você quer venda é o erro número 1 — você compra cliques, não compradores.</li>
          <li><strong>Público</strong>: quem vai ver. Salvo (interesses + dados demográficos), Lookalike (parecido com lista própria), Custom Audience (lista de e-mails, visitantes do site, base de clientes) ou Advantage+ (Meta escolhe). Lookalike 1% de compradores ainda é o público mais previsível pra escalar.</li>
          <li><strong>Criativo</strong>: imagem ou vídeo + copy + CTA. O que mais impacta CPL é o criativo — não o lance, não o público. Operação madura testa 6-10 variantes por semana, mata o que não passa de 0,8% de CTR no terceiro dia.</li>
          <li><strong>Lance e otimização</strong>: bidding manual (você define teto) ou automático (Lowest Cost, Cost Cap, Bid Cap). Comece em automático pra coletar dados, migra pra Cost Cap quando souber seu CPL alvo.</li>
          <li><strong>Orçamento</strong>: ABO (por ad set) ou CBO (por campanha). CBO virou padrão pra escala porque deixa o Meta realocar entre ad sets em tempo real. ABO ainda serve pra teste limpo onde você quer forçar gasto igual.</li>
        </ol>

        <h2>Cinco erros que custam dinheiro de verdade</h2>
        <p>
          Esses cinco padrões aparecem em praticamente toda conta nova que auditamos. São
          os ralos de verba que mais aparecem em PME brasileira:
        </p>
        <ul>
          <li><strong>Audiência grande demais</strong>. 5M+ pessoas dilui o sinal de aprendizado, o Meta nunca encontra o subgrupo que converte e o CPL fica preso num platô. Em descoberta, mire 500k-2M; em conversão, deixe Lookalike 1-3% mandar.</li>
          <li><strong>Audiência pequena demais</strong>. Menos de 50k pessoas satura em duas semanas — você reimpacta as mesmas pessoas, frequência sobe pra 6-8, CTR despenca e CPL dobra mês a mês.</li>
          <li><strong>Um criativo só rodando</strong>. Não dá pro algoritmo escolher e a fadiga vem rápido. Mínimo realista são 3 variantes por ad set, idealmente 5-6 com formatos diferentes (estático, carrossel, vídeo curto, vídeo longo).</li>
          <li><strong>Pixel mal instalado ou só client-side</strong>. Sem Conversions API server-side, você está cego em 30-40% das conversões depois do iOS 17 ATT. Resultado: o Meta otimiza pro público errado porque acha que ninguém comprou.</li>
          <li><strong>Mexer todo dia na campanha</strong>. O algoritmo precisa de 7 dias e 50 conversões pra sair da fase de aprendizado. Edição constante (mudou orçamento, trocou criativo, ajustou público) reseta o aprendizado e você nunca chega no CPL estável. Regra: se vai mexer, mexa uma vez por semana e espere.</li>
        </ul>

        <h2>Quando IA realmente ajuda no tráfego pago</h2>
        <p>
          IA virou jargão de venda em 2024 e a maioria das promessas é vaporware. O que
          funciona de verdade hoje, e que plataformas como o AdSales·Hub já entregam em
          produção, é específico:
        </p>
        <ul>
          <li>Geração de copy e imagem do anúncio a partir de briefing escrito em português, com variantes A/B prontas pra publicar via Meta Marketing API.</li>
          <li>Detecção de criativo vencedor antes de queimar verba — modelo cruza CTR, CPM e thumb-stop ratio nas primeiras 48 horas e prevê qual variante vai escalar.</li>
          <li>Realocação automática de orçamento entre ad sets a cada 2 dias, respeitando a janela de aprendizado do Meta (não muda mais que 20% pra não resetar).</li>
          <li>Sugestão de novas variantes baseadas no que está performando — pega o ângulo do criativo vencedor e gera 5 variações de hook diferente.</li>
          <li>Pausa automática de anúncios com fadiga (CTR caindo 30% em 3 dias, frequência acima de 4) antes de você notar no dashboard.</li>
          <li>Briefing reverso: a partir do criativo que está vencendo, IA reescreve a página de destino pra alinhar promessa do anúncio com promessa da landing — costuma destravar 15-25% de conversão.</li>
        </ul>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
