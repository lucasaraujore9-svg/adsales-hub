import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";
import { CplCalc } from "./cpl-calc";

const URL = "https://adsaleshub.7iegroup.com.br/calculadoras/cpl-ideal";
const TITLE = "CPL ideal — quanto pagar por lead em 2026";
const SUBTITLE = "Ticket × margem × conversão = teto que sua operação aguenta";
const COVER = `/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Calculadoras")}&subtitle=${encodeURIComponent(SUBTITLE)}`;

export const metadata: Metadata = {
  title: "Calculadora de CPL ideal — quanto pagar por lead em 2026",
  description:
    "Quanto você pode pagar por lead pra fechar no positivo? Calcule o CPL máximo a partir do ticket, margem e taxa de conversão.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "O que é CPL?",
    a: "CPL (Custo por Lead) é quanto cada lead capturado pela sua campanha custou. Calcula-se: investimento total ÷ número de leads gerados. Exemplo: gastou R$ 1.000 e teve 50 leads, CPL = R$ 20. Vale lembrar que CPL nu, sem contexto de ticket e conversão, é uma métrica de vaidade — só faz sentido quando comparado ao CPL máximo da sua operação.",
  },
  {
    q: "Como saber se meu CPL é bom?",
    a: "Compare com seu CPL máximo (calculadora acima). Se CPL atual ≤ CPL máximo, você está fechando no positivo. Boas operações operam em 50-70% do CPL máximo, deixando margem pra absorver oscilações de mercado, sazonalidade e variação na taxa de conversão. Se você está rodando em 95% do teto, qualquer mau dia te leva pro vermelho.",
  },
  {
    q: "Como reduzir CPL?",
    a: "Melhorar criativos (A/B test contínuo de pelo menos 3 variantes), refinar segmentação (públicos lookalike a partir de compradores e não de leads), otimizar landing page (cada campo extra no formulário derruba conversão em 7-10%), e usar IA pra detectar criativo vencedor antes de queimar verba em variantes ruins. Combinado, dá pra cortar 30-50% em 60 dias.",
  },
  {
    q: "Meu CPL subiu de R$ 20 pra R$ 45 em duas semanas. O que aconteceu?",
    a: "Quase sempre é fadiga criativa: a frequência passou de 2,5 e o CTR despencou. Verifique no Ads Manager: se a frequency está acima de 3 e o CTR caiu mais de 30%, troque criativo. Outras causas comuns: público saturado (rode lookalike novo), aumento de concorrência sazonal (Black Friday, Dia das Mães), ou queda na qualidade da landing page (Lighthouse abaixo de 70).",
  },
  {
    q: "CPL baixo sempre é melhor?",
    a: "Não. CPL baixo com lead ruim é prejuízo disfarçado: você gasta hora de SDR, hora de vendedor, paga CRM, paga telefonia, e fecha 0,5% em vez de 8%. O que importa é CAC (Custo de Aquisição de Cliente) — e CAC baixo às vezes vem com CPL alto, porque o lead já chega aquecido e converte rápido.",
  },
  {
    q: "Lead Form do Meta ou landing page externa?",
    a: "Lead Form é 30-50% mais barato e bom pra B2C de baixo ticket (curso até R$ 500, e-commerce, serviço local). Landing page externa qualifica melhor, é obrigatória pra B2B e pra ticket acima de R$ 2.000. Regra prática: se seu vendedor reclama da qualidade dos leads, mude pra LP externa mesmo pagando mais caro — o CAC final cai.",
  },
];

export default function CplCalcPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Calculadora de CPL ideal"
        description="Quanto pagar por lead pro funil fechar no positivo."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Calculadora grátis"
        title="CPL ideal"
        description="Qual é o CPL máximo que sua operação aguenta sem dar prejuízo? Resposta em 30 segundos."
        coverImage={COVER}
        readingMinutes={6}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Calculadoras", href: "/recursos" },
          { label: "CPL ideal" },
        ]}
        cta={{ label: "Atribuir CPL real à receita", href: "/signup" }}
      >
        <p>
          Honestamente, a maior parte dos gestores de tráfego que conversamos não
          sabe o teto de CPL que a operação aguenta — e por causa disso paga
          qualquer coisa por lead, reza pra fechar venda no fim do mês e culpa o
          algoritmo do Meta quando o resultado vem ruim. O cálculo que ninguém faz
          é o mais simples do funil: quanto cada cliente novo deixa de margem, e
          quantos leads precisam entrar pra um virar cliente. A diferença entre
          esses dois números é o que você pode gastar por lead. Tudo acima disso é
          prejuízo. Tudo muito abaixo disso é tráfego subescala, dinheiro deixado
          na mesa pra concorrência. A calculadora abaixo resolve isso em meia
          dúzia de campos. Depois dela, vamos abrir cada peça da fórmula, mostrar
          casos reais, comparar canais, e explicar por que CPL alto às vezes é o
          melhor negócio que você vai fazer no semestre.
        </p>

        <CplCalc />

        <h2>O que é CPL e por que CPL máximo importa mais</h2>
        <p>
          CPL é Custo por Lead — investimento dividido por leads gerados. Simples
          assim. Mas o número solto não significa nada. Um CPL de R$ 80 pode ser
          excelente pra quem vende consultoria de R$ 15 mil e péssimo pra quem
          vende camiseta de R$ 79. O que importa é o <strong>CPL máximo</strong>:
          o teto que sua matemática suporta antes do funil virar prejuízo.
        </p>
        <p>
          Pensar em CPL máximo muda a forma como você opera. Em vez de chegar no
          Ads Manager e baixar lance porque "tá caro", você sabe se ainda tem
          folga. Em vez de matar campanha porque o CPL subiu R$ 5, você confere
          se está em 50% ou em 95% do teto. E principalmente: você sabe quanto
          pode pagar pra escalar sem quebrar a unit economics — porque escalar
          quase sempre encarece o lead, e operar sem essa referência é navegar no
          escuro.
        </p>

        <h2>A fórmula do CPL máximo</h2>
        <blockquote>
          CPL máximo = Ticket × Margem × Conversão de Lead em Cliente
        </blockquote>
        <p>
          Três variáveis, nenhum mistério. <strong>Ticket</strong> é quanto o
          cliente paga (use LTV se houver recorrência ou recompra previsível —
          assinatura, cursos com upsell, e-commerce com taxa de recompra alta).
          <strong> Margem</strong> é o que sobra depois de custo de produto,
          impostos, taxa de meio de pagamento e custo operacional direto — não
          confunda com margem bruta de catálogo. <strong>Conversão</strong> é a
          taxa real de lead que vira cliente pago, medida no seu CRM nos últimos
          90 dias, não a taxa que você acha que tem.
        </p>
        <p>
          Caso 1, infoproduto. Curso digital de R$ 990, margem real 60% (depois
          de plataforma, suporte e impostos do Simples), conversão de lead em
          aluno de 8% no funil mais quente. CPL máximo = 990 × 0,60 × 0,08 =
          <strong> R$ 47,52</strong>. Se o tráfego está rodando a R$ 28, sobra
          margem pra escalar agressivo. Se está em R$ 60, cada lead novo é um
          rombo de R$ 12,50 — mesmo fechando venda.
        </p>
        <p>
          Caso 2, e-commerce de moda. Ticket médio R$ 220, margem operacional 30%
          (frete, devolução, gateway, taxa de marketplace incluídos), conversão
          de lead capturado em comprador 1,5%. CPL máximo = 220 × 0,30 × 0,015 =
          <strong> R$ 0,99</strong>. Sim, menos de um real. Por isso e-commerce
          de moda raramente faz captura de lead — o jogo é direct response,
          venda no clique. Se for insistir em CPL, só com taxa de recompra e LTV
          de 6 meses no cálculo.
        </p>
        <p>
          Caso 3, B2B de software. Ticket anual R$ 18.000, margem 70%, conversão
          lead → cliente 4%. CPL máximo = 18.000 × 0,70 × 0,04 ={" "}
          <strong>R$ 504</strong>. CPL de R$ 250 no LinkedIn parece absurdo até
          você fazer essa conta — aí vira pechincha. É por isso que B2B
          enterprise paga sem reclamar o que B2C considera escândalo.
        </p>

        <h2>CPL típico por canal no Brasil em 2026</h2>
        <p>
          Os números abaixo são faixas reais que vemos em operações ativas no
          Brasil ao longo dos últimos 12 meses, ponderadas por nicho. Use como
          referência de mercado, não como meta — sua meta sai do CPL máximo, não
          da média do setor.
        </p>
        <table>
          <thead>
            <tr>
              <th>Canal</th>
              <th>CPL típico (Brasil)</th>
              <th>Quando vale</th>
              <th>Cuidado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Meta Ads (Lead Form)</td>
              <td>R$ 8-35</td>
              <td>B2C escalável, e-commerce, serviço local</td>
              <td>Lead frio, taxa de show baixa</td>
            </tr>
            <tr>
              <td>Meta Ads (LP externa)</td>
              <td>R$ 15-80</td>
              <td>Lead qualificado, B2B PME, infoproduto</td>
              <td>Exige LP rápida (Lighthouse 80+)</td>
            </tr>
            <tr>
              <td>Google Search</td>
              <td>R$ 25-180</td>
              <td>Intenção alta, ticket médio, fundo de funil</td>
              <td>Concorrência por keyword sobe rápido</td>
            </tr>
            <tr>
              <td>Google Performance Max</td>
              <td>R$ 18-70</td>
              <td>E-commerce com feed bom, mid-funnel</td>
              <td>Caixa preta — pouco controle de público</td>
            </tr>
            <tr>
              <td>LinkedIn Ads</td>
              <td>R$ 80-400</td>
              <td>B2B enterprise, ticket acima de R$ 10k</td>
              <td>CPM alto, criativo cansa rápido</td>
            </tr>
            <tr>
              <td>TikTok Ads</td>
              <td>R$ 6-25</td>
              <td>B2C jovem, descoberta, viralização</td>
              <td>Conversão pior que Meta no Brasil</td>
            </tr>
          </tbody>
        </table>
        <p>
          Note que TikTok aparece com o CPL mais baixo da tabela — e ainda assim
          a maioria das operações de B2C que tentaram escalar 100% no TikTok em
          2025 voltou pro Meta. CPL barato com lead que não fecha não é vitória,
          é maquiagem de relatório. Sempre que comparar canais, compare CAC e
          ROAS, não CPL.
        </p>

        <h2>Cinco alavancas pra reduzir CPL sem perder qualidade</h2>
        <p>
          Reduzir CPL é tarefa de quem entende que o lance no Ads Manager é só a
          ponta. As alavancas reais estão em criativo, público, página e fluxo de
          dados. Quem mexe nessas quatro coisas em ciclo curto consegue cortes de
          30-50% em dois meses sem queimar conta.
        </p>
        <ol>
          <li>
            <strong>Criativo vencedor por A/B contínuo.</strong> Suba sempre 3
            variantes simultâneas, deixe rodar 3-5 dias até atingir significância
            estatística (mínimo 50 conversões por variante), mate as 2 piores e
            substitua por novas. Criativo é a alavanca de maior impacto:
            mudanças de criativo respondem por 60-70% da variação de CPL em
            campanhas maduras. Variar gancho, formato (vídeo curto vs estático
            vs carrossel) e prova social.
          </li>
          <li>
            <strong>Lookalike Audience de compradores, não de leads.</strong>{" "}
            Subir lookalike a partir da Custom Audience de quem comprou nos
            últimos 180 dias converte 2-3× melhor que lookalike de quem só
            preencheu formulário. Comece com lookalike 1% e expanda pra 3% só
            quando esgotar. Para operações com menos de 500 compradores, use
            lookalike de leads quentes (que pelo menos chegaram a uma reunião).
          </li>
          <li>
            <strong>Landing page focada em uma única decisão.</strong> Uma
            oferta, um CTA, formulário curto — nome, email, WhatsApp e no máximo
            uma pergunta de qualificação. Cada campo extra derruba a conversão
            de visitante em lead em 7-10%. LP precisa carregar abaixo de 2,5s no
            4G (LCP), senão o Meta penaliza no leilão e o CPL sobe sozinho. Roda
            o Lighthouse, mira 80+ em performance.
          </li>
          <li>
            <strong>Lead Form nativo do Meta pra B2C de baixo ticket.</strong>{" "}
            Sai 30-50% mais barato que LP externa porque o usuário não sai do
            app. Em compensação, lead vem mais frio e a taxa de show em
            atendimento cai. Use pra produto que vende no automático (curso de
            R$ 197, e-book, consulta agendada) e adicione pelo menos uma
            pergunta de qualificação custom dentro do formulário pra filtrar
            curioso.
          </li>
          <li>
            <strong>Otimização IA em ciclos de 2 dias.</strong> Em vez de mexer
            em campanha de 30 em 30 dias quando o resultado já piorou, use IA pra
            analisar criativo, lance e público a cada 48h e aplicar ajustes
            pequenos antes da fadiga. Operações que rodam ciclo curto cortam
            CPL 20-40% em 30 dias e estendem vida útil do criativo em
            2-3×. (É exatamente isso que o Tráfego IA do AdSales Hub faz, mas o
            princípio vale com ou sem ferramenta.)
          </li>
        </ol>

        <h2>Por que CPL alto não é necessariamente ruim</h2>
        <p>
          Existe uma obsessão equivocada por CPL baixo no mercado brasileiro de
          tráfego, herdada de 2018-2020 quando lead era barato e qualquer coisa
          fechava. O cenário mudou, e CPL baixo virou frequentemente sinal de
          problema, não de vitória. Lead vindo a R$ 4 num criativo genérico de
          "deixe seu contato e ganhe um e-book" enche o CRM, mata produtividade
          do SDR, sobrecarrega vendedor com lixo e fecha 0,3%. CAC final?
          Estratosférico.
        </p>
        <p>
          A métrica que paga conta no fim do mês é CAC (Custo de Aquisição de
          Cliente), não CPL. CAC = Investimento total em mídia ÷ clientes
          fechados. Operação A com CPL R$ 80 e conversão lead → cliente de 12%
          tem CAC R$ 667. Operação B com CPL R$ 18 e conversão de 1,8% tem CAC
          R$ 1.000. Mesmo investimento, B parece "mais eficiente" no relatório
          porque traz mais leads, mas A fecha mais clientes pelo mesmo dinheiro
          — e ainda gasta menos hora de equipe comercial por venda.
        </p>
        <p>
          Quando aceitar CPL alto deliberadamente: ticket alto (acima de R$
          3.000), ciclo de venda longo (B2B, imóvel, automotivo), oferta
          complexa que exige educação, ou nicho com pouco volume disponível.
          Quando exigir CPL baixo: produto de impulso, baixo ticket (até R$
          200), conversão one-shot no checkout, e-commerce de massa. O erro é
          aplicar a régua do segundo grupo no primeiro.
        </p>

        <h2>Como CPL muda em iOS 17, Conversions API e cookieless 2026</h2>
        <p>
          Desde o iOS 14.5 em 2021, mas principalmente após o iOS 17 (2023) e o
          fim definitivo do cookie de terceiros no Chrome em 2025, o cenário de
          atribuição mudou de forma estrutural. O Pixel sozinho perdeu entre 30
          e 50% da capacidade de rastrear conversão fora do app. Isso significa
          duas coisas que afetam CPL diretamente.
        </p>
        <p>
          Primeiro, o algoritmo do Meta passa a otimizar com dados incompletos.
          Sem evento de conversão chegando do servidor, ele não consegue achar
          padrões de quem realmente compra — e gasta mais pra trazer o mesmo
          resultado. CPL aparente sobe. Segundo, a janela de atribuição padrão
          caiu pra 7 dias clique e 1 dia view, então venda que antes era
          creditada pra um anúncio agora aparece como "orgânica" e infla o CPL
          do canal pago.
        </p>
        <p>
          A solução é dupla. A <strong>Conversions API</strong> (server-side
          tracking) recupera entre 20 e 35% dos eventos perdidos pelo Pixel — é
          praticamente obrigatória em 2026, não é mais opcional. Configure com
          deduplication via event_id, mande pelo menos os eventos de Lead,
          ViewContent e Purchase, e use o Event Match Quality acima de 7 (envie
          email hasheado, telefone, IP e user agent). Depois, ajuste o
          attribution window pra 7d clique + 1d view e olhe a coluna "Conversões
          atribuídas pela CAPI" no Ads Manager.
        </p>
        <p>
          A segunda peça é <strong>frequency cap</strong> mais agressivo. Como o
          algoritmo está mais cego, ele tende a re-impactar muito a mesma
          pessoa. Cap de 2 impressões por usuário por semana em prospecção e 4
          em remarketing evita queima de público e segura o CPM. Combinado, CAPI
          + frequency cap + Event Match Quality alto recuperam a maior parte da
          atribuição perdida e devolvem o CPL pra patamares pré-2021.
        </p>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => (
          <div key={i}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </ContentLayout>
    </>
  );
}
