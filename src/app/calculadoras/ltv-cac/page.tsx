import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";
import { LtvCacCalc } from "./ltv-cac-calc";

const URL = "https://adsaleshub.7iegroup.com.br/calculadoras/ltv-cac";

const COVER_TITLE = encodeURIComponent("LTV/CAC e Payback");
const COVER_SUBTITLE = encodeURIComponent(
  "A saúde unitária do seu funil em 30 segundos.",
);
const COVER_IMAGE = `/api/og?title=${COVER_TITLE}&category=Calculadoras&subtitle=${COVER_SUBTITLE}`;

export const metadata: Metadata = {
  title: "Calculadora de LTV/CAC e Payback — saúde financeira do seu funil",
  description:
    "LTV/CAC mostra se seu negócio é saudável. Payback mostra em quantos meses o investimento volta. Calcule grátis em 30 segundos.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "O que é LTV/CAC e por que é a primeira métrica que VC pede?",
    a: "LTV (Lifetime Value) é o valor bruto que um cliente devolve ao longo da relação, ajustado pela margem. CAC é o custo total pra adquirir esse cliente (mídia + time + ferramenta). LTV/CAC é o múltiplo que mostra se a operação cria ou destrói valor. Investidor pede esse número antes do MRR porque MRR pode crescer com unit economics quebrados — LTV/CAC não mente. Saudável ≥ 3, abaixo de 1 é prejuízo, acima de 5 geralmente significa que você está sub-investindo em aquisição.",
  },
  {
    q: "Como calcular o LTV em SaaS?",
    a: "LTV = (Ticket médio mensal × Margem bruta) ÷ Churn mensal. A margem bruta é crucial — ignore ela e você vai superestimar o LTV em 30-50%. Use churn de receita (revenue churn), não de logos, se seu ticket varia muito entre clientes. Se você tem expansão (upsell), considere usar churn líquido (NRR) no denominador.",
  },
  {
    q: "E em ecom, como calcula?",
    a: "LTV = Ticket médio × Frequência de compra anual × Anos de vida do cliente × Margem de contribuição. Margem de contribuição é receita menos COGS menos custo variável de envio e gateway. Cohort analysis é o caminho honesto: pega quem comprou em janeiro de 2024 e mede quanto cada cohort gastou nos 12, 24, 36 meses seguintes.",
  },
  {
    q: "O que é payback de CAC e qual o ideal?",
    a: "Quantos meses leva pra recuperar o CAC com a margem de contribuição mensal do cliente. Benchmark: SaaS B2B 12-18 meses, ecommerce 3-6 meses, serviços recorrentes 1-3 meses. Acima de 18 meses em SaaS, sua operação depende de capital externo pra crescer — funciona enquanto rodada não seca.",
  },
  {
    q: "Qual a diferença entre churn voluntário e involuntário?",
    a: "Voluntário é o cliente cancelando ativamente (não viu valor). Involuntário é o cartão recusado, fatura não paga, fim de período. Involuntário responde por 20-40% do churn total em SaaS BR e é o mais barato de resolver — dunning, retry inteligente de cartão e atualização de método de pagamento devolvem 1-3 pontos de margem mensal.",
  },
  {
    q: "NRR e GRR, o que importa mais?",
    a: "GRR (Gross Revenue Retention) mostra o piso — quanta receita você mantém ignorando upsell. NRR (Net Revenue Retention) inclui expansão. NRR > 100% é o santo graal: significa que mesmo perdendo clientes, a base existente cresce sozinha. SaaS classe mundial roda NRR 110-130%. GRR saudável é > 90% no enterprise, > 80% no SMB.",
  },
];

export default function LtvCacCalcPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Calculadora de LTV/CAC e Payback"
        description="Saúde unitária do seu funil em segundos."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Calculadora grátis"
        title="LTV/CAC e Payback"
        description="As métricas mais importantes pra saber se sua máquina de aquisição é sustentável. Preencha 4 campos e veja o veredito."
        coverImage={COVER_IMAGE}
        readingMinutes={7}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Calculadoras", href: "/recursos" },
          { label: "LTV/CAC" },
        ]}
        cta={{ label: "Reduzir CAC e aumentar LTV", href: "/signup" }}
      >
        <p>
          Quando um VC senta com um founder pela primeira vez, antes de perguntar
          MRR, antes de pedir o pitch deck, antes de qualquer coisa, a pergunta é
          a mesma: <em>qual seu LTV sobre CAC e em quantos meses paga de volta?</em>
          {" "}Não é frescura de gringo. É a única dupla de números que mostra se a
          empresa cria valor por unidade vendida ou se está apenas convertendo
          dinheiro de investidor em receita de curto prazo. Honestamente, se eu
          fosse founder hoje, esse seria o painel que eu olharia toda segunda de
          manhã, antes de abrir o painel de campanhas, antes de ler Slack.
        </p>

        <LtvCacCalc />

        <h2>Por que LTV/CAC é o sinal vital</h2>
        <p>
          MRR sobe e a empresa quebra. Parece paradoxo, mas é o roteiro mais
          repetido de SaaS brasileiro nos últimos cinco anos: time de vendas
          batendo meta, gráfico verde no board, e seis meses depois a runway
          desaparece. O que acontece embaixo do capô é simples — o CAC sobe mais
          rápido que a margem de contribuição mensal consegue devolver, e cada
          cliente novo entra no caixa como passivo, não como ativo. LTV/CAC é
          exatamente o termômetro pra detectar isso antes do estrago virar
          irreversível.
        </p>
        <p>
          A leitura é direta. Abaixo de 1, cada novo cliente custa mais do que
          devolve — você está pagando pra trabalhar. Entre 1 e 3, a operação é
          apertada e não sobra gordura pra absorver erros (uma alta de CPM, uma
          troca de algoritmo, um trimestre fraco). Entre 3 e 5 é o sweet spot:
          margem pra reinvestir, contratar, errar campanha. Acima de 5,
          contraintuitivamente, é sinal de que você está deixando crescimento na
          mesa — provavelmente sub-investe em aquisição porque tem medo do CAC.
          Aí vale acelerar mídia mesmo derrubando o múltiplo pra 3 ou 4, porque
          o ganho absoluto compensa.
        </p>
        <p>
          Outro motivo pra esse número virar obsessão é que ele força disciplina
          contábil. Pra calcular LTV direito, você precisa saber sua margem
          bruta real (não a fantasia da apresentação), seu churn voluntário e
          involuntário separados, e o ticket médio por segmento. Pra calcular
          CAC direito, precisa somar mídia paga, salário do time comercial,
          custo de ferramenta, comissão, BDR, SDR, conteúdo orgânico. Empresa
          que não sabe LTV/CAC normalmente também não sabe gross margin nem
          contribution margin — e aí o problema é maior do que parecia.
        </p>

        <h2>LTV pra SaaS</h2>
        <blockquote>
          LTV = (Ticket Mensal × Margem Bruta) ÷ Churn Mensal
        </blockquote>
        <p>
          Vamos no caso real. SaaS B2B, ticket médio R$ 690 por mês, margem
          bruta 70% (servidor, suporte, infra), churn mensal de 4% (que é alto
          mas realista pra SMB brasileiro). LTV = (690 × 0,70) ÷ 0,04 = {" "}
          <strong>R$ 12.075</strong>. Se o CAC blended (mídia + comercial)
          fechou o trimestre em R$ 1.500, o múltiplo é 8. Operação saudável
          demais — e isso quer dizer que tem espaço pra subir CAC pra R$ 2.500
          ou R$ 3.000 testando canal novo, sabendo que mesmo com múltiplo 4 ou
          5 a tese segue de pé.
        </p>
        <p>
          Cuidado com três armadilhas que matam esse cálculo. Primeira: usar
          churn de logos quando seu ticket é muito disperso. Se você perde 3
          clientes pequenos e mantém um enterprise, seu logo churn parece ruim
          mas seu revenue churn está ótimo — use sempre revenue churn pra LTV
          financeiro. Segunda: ignorar a margem bruta e usar receita pura. Isso
          infla o LTV em 30-50% e te faz autorizar CAC que a operação não
          aguenta. Terceira: não considerar expansão. Se sua base faz upsell e
          cresce 2-3% ao mês, use NRR (Net Revenue Retention) no lugar do
          churn — uma base com NRR 105% tem LTV teoricamente infinito, e o
          múltiplo passa a ser função apenas do payback.
        </p>

        <h2>LTV pra ecom</h2>
        <blockquote>
          LTV = Ticket médio × Compras por ano × Anos de vida × Margem de contribuição
        </blockquote>
        <p>
          Ecom é diferente porque não tem assinatura, então o LTV depende de
          quantas vezes o cliente volta. Caso real: marca de moda, ticket médio
          R$ 220, cliente compra 3 vezes por ano, fica em média 2,5 anos ativo,
          margem de contribuição 35% (líquida de COGS, frete subsidiado e taxa
          de gateway). LTV = 220 × 3 × 2,5 × 0,35 = <strong>R$ 577</strong>.
          Pra manter LTV/CAC ≥ 3, o CAC máximo é R$ 192 — qualquer campanha que
          rode acima disso precisa ter justificativa estratégica (lançamento,
          aquisição de público novo, defesa de market share).
        </p>
        <p>
          Em ecom, cohort analysis não é luxo, é obrigação. Pega o grupo que
          comprou pela primeira vez em janeiro, mede quanto gastou nos 12, 24,
          36 meses seguintes, e plota a curva acumulada. Você vai descobrir
          coisas desconfortáveis: que 60% da receita vem dos 20% que repetem,
          que sua categoria principal tem repetição forte mas a categoria nova
          não tem, que o cliente Meta repete menos que o cliente Google. Sem
          cohort, LTV é chute. Com cohort, LTV vira ferramenta de decisão de
          mídia — você passa a investir mais no canal que entrega cliente que
          repete, mesmo que o CAC dele pareça maior no primeiro pedido.
        </p>

        <h2>Payback: o número que VC pergunta logo depois</h2>
        <p>
          LTV/CAC alto sem payback rápido não paga conta. Conheço SaaS com
          múltiplo 6 e payback de 28 meses que quase quebrou — porque pra
          colher os R$ 12 mil de LTV ao longo de cinco anos, precisava
          financiar dois anos de prejuízo operacional na frente. Por isso
          payback é a segunda pergunta, sempre.
        </p>
        <blockquote>
          Payback = CAC ÷ (Ticket Mensal × Margem)
        </blockquote>
        <p>
          Captação seed e Series A em SaaS B2B exige payback abaixo de 18
          meses; em ecommerce a régua é mais dura, abaixo de 6 meses; em
          serviços recorrentes com ticket alto, 1 a 3 meses. Operação que paga
          o CAC no primeiro mês (caso de muitos high-ticket B2B) basicamente
          imprime dinheiro — cada real investido em mídia volta com margem no
          mês seguinte e dá pra reinvestir trinta vezes em um ano. Payback
          curto resolve liquidez antes de resolver lucratividade, e liquidez é
          o que mata startup primeiro.
        </p>

        <h2>Benchmarks de saúde</h2>
        <table>
          <thead>
            <tr>
              <th>Modelo</th>
              <th>LTV/CAC saudável</th>
              <th>Payback ideal</th>
              <th>NRR alvo</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>SaaS B2B SMB</td><td>3-5×</td><td>12-18 meses</td><td>100-110%</td></tr>
            <tr><td>SaaS B2B Mid-Market</td><td>4-6×</td><td>15-24 meses</td><td>110-120%</td></tr>
            <tr><td>SaaS B2B Enterprise</td><td>5-8×</td><td>18-30 meses</td><td>115-130%</td></tr>
            <tr><td>Ecommerce moda</td><td>3-4×</td><td>3-6 meses</td><td>n/a</td></tr>
            <tr><td>Ecommerce nicho premium</td><td>4-6×</td><td>2-4 meses</td><td>n/a</td></tr>
            <tr><td>Marketplace</td><td>4-6×</td><td>6-12 meses</td><td>105-115%</td></tr>
            <tr><td>Educação online</td><td>3-5×</td><td>1-3 meses</td><td>n/a</td></tr>
            <tr><td>Serviços recorrentes</td><td>4-8×</td><td>2-6 meses</td><td>95-105%</td></tr>
          </tbody>
        </table>

        <h2>Como melhorar LTV/CAC sem cortar mídia</h2>
        <p>
          O instinto errado quando o múltiplo cai é cortar investimento em
          tráfego. Cortar mídia derruba CAC no curto prazo (menos volume, menos
          competição interna por leads) mas mata pipeline futuro. O caminho
          honesto é trabalhar os três alavancas que melhoram o numerador: reduzir
          churn, aumentar ticket médio e ativar expansão. Cada uma move o LTV
          mais que qualquer otimização de CAC consegue mover.
        </p>
        <p>
          Reduzir churn voluntário é o trabalho de produto — onboarding mais
          claro, ativação mais rápida (time-to-value abaixo de 7 dias em SaaS
          SMB), customer success proativo no terceiro mês quando o risco de
          cancelamento bate o pico. Reduzir churn involuntário é trabalho de
          billing — dunning automático, retry inteligente de cartão recusado,
          aviso de cartão expirando 30 dias antes, pix como fallback. Em SaaS
          BR, involuntário sozinho responde por 20-40% do churn total e
          resolver isso devolve 1-3 pontos de margem mensal sem mexer em
          produto nem em comercial.
        </p>
        <p>
          Aumentar ticket médio acontece por três caminhos: empacotamento
          (subir o preço entrada e oferecer plano mais robusto), módulos
          adicionais (cobrar por feature avançada que o cliente já usa), e
          ajuste de plano por uso (cobrar por seat, por contato, por volume).
          Quando você mexe ticket de R$ 690 pra R$ 890 mantendo o mesmo churn,
          o LTV salta de R$ 12.075 pra R$ 15.575 — quase 30% só nessa alavanca.
        </p>
        <p>
          Ativar NRR acima de 100% é o jogo final. NRR positivo significa que
          sua base existente cresce mais do que perde, e isso muda a economia
          inteira: o LTV vira função do payback (e não do churn), e a empresa
          passa a poder financiar aquisição com a própria expansão. Caminhos
          práticos: cobrança por consumo (uso aumenta naturalmente), upgrade
          tier-by-tier conforme o cliente cresce, cross-sell de módulos
          complementares, e conta gerenciada pra contas grandes. SaaS classe
          mundial roda 110-130% de NRR e cresce sem precisar acelerar
          aquisição.
        </p>

        <h2>Os 3 erros que matam LTV/CAC</h2>
        <p>
          Primeiro erro: medir CAC só com gasto de mídia. CAC verdadeiro inclui
          salário comercial, comissão, BDR, SDR, custo de ferramenta de vendas,
          custo de produção de conteúdo orgânico atribuível, e qualquer
          incentivo dado pra fechar (desconto, cashback, primeiro mês grátis
          considerado como custo). Empresa que mede só mídia normalmente acha
          CAC de R$ 800 quando o real é R$ 2.200, e autoriza orçamento que
          quebra a operação.
        </p>
        <p>
          Segundo erro: LTV otimista usando receita bruta em vez de margem de
          contribuição. Quando você projeta LTV de R$ 12 mil mas a margem real
          é 50% (não os 70% do slide), o LTV verdadeiro é R$ 8.500, e o
          múltiplo que parecia 8 vira 5,7 — ainda saudável, mas o cálculo de
          quanto pode investir muda. Pior cenário é serviço com margem 30% que
          se reporta como SaaS de margem 70% e descobre dois anos depois que
          nunca foi escalável.
        </p>
        <p>
          Terceiro erro: tratar LTV/CAC como número único da empresa quando ele
          deveria ser por canal e por segmento. Lead Meta tem LTV diferente de
          lead Google, lead orgânico tem LTV maior que lead pago (quase
          sempre), e cliente SMB tem LTV completamente diferente de cliente
          mid-market. Quando você consolida tudo em um número, perde a
          informação que importa: qual canal escalar, qual segmento priorizar,
          qual perfil parar de prospectar. AdSales Hub cruza essa visão por
          canal e por segmento de forma nativa, mas mesmo no Excel dá pra
          fazer — só precisa parar de usar a média.
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
