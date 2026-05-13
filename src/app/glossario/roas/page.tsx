import type { Metadata } from "next";
import Link from "next/link";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/glossario/roas";
const TITLE = "O que é ROAS — fórmula, breakeven e por que o número da plataforma mente";
const SUBTITLE = "Atribuição 1:1 do clique à receita real";
const COVER = `/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Glossário")}&subtitle=${encodeURIComponent(SUBTITLE)}`;

export const metadata: Metadata = {
  title: "O que é ROAS — fórmula, breakeven e benchmarks reais 2026",
  description:
    "ROAS explicado sem firula: fórmula, breakeven por margem, por que o número que aparece no Meta Ads Manager está inflado e como medir o ROAS aferido na receita real do CRM.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "Qual a diferença entre ROAS e ROI?",
    a: "ROAS é receita bruta gerada dividida pelo gasto em mídia — ignora custo de produto, salário, ferramentas e impostos. ROI considera o lucro líquido sobre o investimento total. Use ROAS para comparar campanhas dentro do mesmo modelo de negócio; use ROI para decidir se vale a pena continuar pagando aquela operação inteira.",
  },
  {
    q: "ROAS 2x é bom ou ruim?",
    a: "Depende exclusivamente da margem. Para um infoproduto com 90% de margem, ROAS 2x é caixa entrando com folga. Para um e-commerce de moda com 30% de margem de contribuição, ROAS 2x é prejuízo: o breakeven está em 3,33×. Antes de decidir se um ROAS é bom, calcule o seu breakeven (1 ÷ margem) e adicione pelo menos 50% de gordura.",
  },
  {
    q: "Por que o ROAS do Meta Ads Manager é diferente do ROAS do meu CRM?",
    a: "A plataforma considera qualquer venda dentro da janela de atribuição (7 dias clique, 1 dia view por padrão) como mérito do anúncio, mesmo que o cliente já viesse de orgânico, indicação ou e-mail. Soma também conversões duplicadas entre ad sets, não desconta reembolsos, não conhece offline. O ROAS aferido na receita real do CRM costuma ser 30-60% menor — e é o número que paga a folha.",
  },
  {
    q: "Como melhorar ROAS sem cortar verba?",
    a: "Atacar o denominador raramente resolve. Suba o ticket médio com order bumps e upsell, melhore a taxa de qualificação para vendedor não perder tempo, reduza o ciclo de venda com SDR de IA atendendo em segundos, e reaproveite criativo vencedor em públicos similares antes de gastar com novos. ROAS sobe por eficiência operacional, não por cortar mídia.",
  },
  {
    q: "iOS 17 ATT, ITP do Safari e Consent Mode v2 mudam o ROAS?",
    a: "Mudam o que a plataforma consegue ver, não o que entrou na conta. Sem Conversions API server-side, parte das vendas some do relatório do Meta e o ROAS reportado cai artificialmente — você acha que a campanha morreu quando ela só ficou invisível. Atribuição 1:1 do clique até o status Ganho no CRM contorna esse buraco.",
  },
];

export default function RoasGlossaryPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="O que é ROAS"
        description="Definição, fórmula, breakeven por margem e por que o ROAS de plataforma quase sempre está inflado."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Glossário"
        title="O que é ROAS"
        description="ROAS é a métrica mais simples do marketing digital — e a mais fácil de mentir. O número bonito que o Meta Ads Manager devolve raramente é o número que entra na conta."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Glossário", href: "/recursos" },
          { label: "ROAS" },
        ]}
        cta={{ label: "Calcular meu ROAS aferido", href: "/calculadoras/roas" }}
        coverImage={COVER}
        readingMinutes={5}
      >
        <p>
          Honestamente, se você gerencia mídia paga há mais de seis meses já passou pela
          cena: a campanha aparece com ROAS 6× no Meta Ads Manager, o cliente comemora,
          e no fim do mês o financeiro mostra que entrou bem menos do que a planilha
          previa. Não é mágica nem fraude — é o desenho do número. O ROAS que a
          plataforma reporta e o ROAS que paga salário são duas métricas diferentes, e
          confundir uma com a outra é o erro mais caro que um time de tráfego comete.
        </p>

        <h2>Definição e fórmula</h2>
        <p>
          ROAS, sigla para <strong>Return on Ad Spend</strong>, é a razão entre a
          receita gerada por uma campanha e o investimento em mídia daquela campanha. Em
          português direto: para cada real gasto em anúncio, quantos reais voltaram em
          venda. Se você investiu R$ 1.000 no Meta Ads e gerou R$ 3.500 em pedidos
          fechados, seu ROAS é 3,5×. A leitura é multiplicativa, nunca percentual — ROAS
          1× significa empatar receita bruta com gasto, e isso ainda é prejuízo na
          esmagadora maioria dos negócios porque receita bruta não é lucro.
        </p>
        <p>
          Diferente do ROI, que olha lucro líquido sobre investimento total e considera
          custo de produto, folha, ferramentas, impostos e overhead, o ROAS é uma
          métrica deliberadamente bruta. Ela existe para responder uma pergunta tática:
          esse anúncio, isolado, está gerando receita maior que seu custo? Quando você
          quer responder se o negócio inteiro vale a pena, troca para ROI ou margem de
          contribuição. A confusão entre as duas é a porta de entrada da maior parte das
          decisões ruins de orçamento.
        </p>
        <p>
          Para rodar com seus números reais — incluindo margem, custo de produto e
          ticket médio — use a <Link href="/calculadoras/roas">calculadora de ROAS</Link>{" "}
          e pare de estimar de cabeça.
        </p>

        <h2>ROAS bom é relativo: depende da margem</h2>
        <p>
          Não existe benchmark universal de ROAS. Existe um piso matemático abaixo do
          qual qualquer real investido derrete caixa, e esse piso é definido pela margem
          de contribuição do produto vendido. A fórmula é tão simples que cabe num
          guardanapo: <strong>ROAS de breakeven = 1 ÷ margem</strong>. Se sua margem de
          contribuição é 30%, o breakeven é 1 ÷ 0,30 = 3,33×. Abaixo disso a campanha
          consome mais caixa do que devolve, mesmo que o ROAS reportado pareça saudável.
        </p>
        <p>
          Olha, o erro mais caro que vejo gestor cometer é tratar ROAS 4× como bom em
          qualquer lugar. Para uma loja de moda com margem de 30%, ROAS 4× deixa só 20%
          de gordura sobre o breakeven — uma flutuação ruim de conversão e a operação
          vira prejuízo. Para um infoproduto com margem 90%, ROAS 4× é um cartão de
          desligar a campanha porque está performando sub-otimizada. Mesmo número, leitura
          oposta.
        </p>

        <h2>Tabela: ROAS de breakeven por modelo de negócio</h2>
        <table>
          <thead>
            <tr>
              <th>Modelo de negócio</th>
              <th>Margem típica</th>
              <th>Breakeven ROAS</th>
              <th>ROAS saudável (+50%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>E-commerce de moda</td>
              <td>30%</td>
              <td>3,33×</td>
              <td>5,0×</td>
            </tr>
            <tr>
              <td>E-commerce de eletrônicos</td>
              <td>15%</td>
              <td>6,67×</td>
              <td>10,0×</td>
            </tr>
            <tr>
              <td>Suplementos e cosméticos</td>
              <td>55%</td>
              <td>1,82×</td>
              <td>2,7×</td>
            </tr>
            <tr>
              <td>SaaS B2B (LTV anual)</td>
              <td>70%</td>
              <td>1,43×</td>
              <td>2,1×</td>
            </tr>
            <tr>
              <td>Infoproduto / curso</td>
              <td>90%</td>
              <td>1,11×</td>
              <td>1,7×</td>
            </tr>
            <tr>
              <td>Serviço de alta margem (consultoria)</td>
              <td>80%</td>
              <td>1,25×</td>
              <td>1,9×</td>
            </tr>
          </tbody>
        </table>
        <p>
          A coluna da direita é a leitura que importa: ficar 50% acima do breakeven é o
          que dá oxigênio para absorver oscilação de conversão, sazonalidade, mudança no
          CPM e os reembolsos que o Meta nunca vai descontar do seu ROAS reportado.
          Operação que vive colada no breakeven quebra na primeira semana ruim.
        </p>

        <h2>Por que o ROAS da plataforma mente</h2>
        <p>
          O ROAS que aparece no Meta Ads Manager, no Google Ads e no TikTok Ads não é
          uma medição de receita real — é uma estimativa baseada em modelos
          probabilísticos, atribuição inflada e dados de Pixel cada vez mais furados.
          Tem três falhas estruturais que ninguém da plataforma vai te contar.
        </p>
        <p>
          A primeira é <strong>atribuição inflada</strong>. A janela padrão de
          atribuição do Meta é 7 dias clique e 1 dia view. Qualquer venda que aconteça
          dentro dessa janela, mesmo que o cliente já estivesse no carrinho via orgânico,
          mesmo que tenha vindo de e-mail marketing, mesmo que seja recompra, entra no
          ROAS da campanha como se fosse mérito do anúncio. Em conta com volume, isso
          infla o número entre 30% e 70%. Some múltiplos ad sets disputando a mesma
          conversão e você tem ROAS contado em duplicidade.
        </p>
        <p>
          A segunda é <strong>cegueira a reembolso, chargeback e pedido cancelado</strong>.
          O Pixel dispara o evento <code>Purchase</code> no momento do checkout
          confirmado. Se 15% dos pedidos forem cancelados, devolvidos ou estornados, o
          Meta nunca fica sabendo. Seu ROAS reportado segue lindo enquanto o financeiro
          processa o estorno. Essa diferença, em e-commerce, sozinha derruba o ROAS
          aferido em 15-25%.
        </p>
        <p>
          A terceira, e a que vai piorar nos próximos anos, é a{" "}
          <strong>perda progressiva de sinal</strong>. iOS 17 com ATT (App Tracking
          Transparency), ITP do Safari, Consent Mode v2 obrigatório no GDPR, bloqueio de
          third-party cookies no Chrome — cada uma dessas camadas remove eventos do
          Pixel. Sem Conversions API enviando os mesmos eventos server-side, a
          plataforma passa a modelar conversões em vez de medir, e o ROAS reportado vira
          uma estimativa estatística com margem de erro larga. Você pode estar vendendo
          igual e ver o ROAS cair 40% no relatório só porque o Pixel parou de captar.
        </p>

        <h2>ROAS aferido na receita real</h2>
        <p>
          O ROAS que importa é o que sai da divisão entre a receita confirmada no CRM
          (status Ganho, com valor real fechado, depois de descontar cancelamento e
          reembolso) e o gasto em mídia da fonte que originou cada negócio. Para chegar
          nesse número você precisa de três coisas que a plataforma sozinha não entrega.
        </p>
        <p>
          Primeiro, <strong>atribuição 1:1 do clique até o CRM</strong>. Cada lead
          carrega um identificador único (UTM + click ID) que persiste do anúncio até o
          status final do negócio. Quando o vendedor marca como Ganho com R$ 4.800, esse
          valor volta para a campanha de origem — não para a estimativa do Meta.
          Segundo, <strong>Conversions API server-side</strong> enviando os mesmos
          eventos do Pixel pelo backend, com hash de e-mail e telefone, para sobreviver
          aos bloqueios de browser e mobile. Terceiro, <strong>conciliação contínua</strong>{" "}
          entre Ganho, Cancelado e Reembolso, para o ROAS aferido subir e descer junto
          com a realidade do caixa.
        </p>
        <p>
          É exatamente esse o desenho do AdSales·Hub: o lead entra pelo anúncio, percorre
          o pipeline, e o valor real fechado volta amarrado à campanha que gerou o
          clique. O dashboard mostra dois ROAS lado a lado — o reportado pelo Meta e o
          aferido pelo CRM — e a diferença entre eles é normalmente o que separa o time
          que escala com confiança do time que escala no escuro.
        </p>

        <h2>Como subir ROAS sem cortar mídia</h2>
        <p>
          Quando o ROAS está abaixo do breakeven, o instinto é cortar verba. Quase
          sempre é o movimento errado: cortar mídia derruba volume, derruba aprendizado
          do algoritmo, derruba aproveitamento de fixos (vendedor, ferramenta, agência)
          e o ROAS continua ruim, agora com receita menor. Subir ROAS quase nunca passa
          por reduzir o denominador. Passa por aumentar o numerador.
        </p>
        <p>
          O primeiro alvo é <strong>ticket médio</strong>. Order bump no checkout, upsell
          pós-compra, combo, frete grátis a partir de X — cada real adicional no pedido
          médio entra direto na receita atribuída à campanha sem custar mais clique.
          Subir ticket de R$ 180 para R$ 240 é uma variação de 33% no ROAS sem mexer no
          gasto.
        </p>
        <p>
          O segundo é <strong>taxa de qualificação e fechamento</strong>. Lead caro que
          não vira venda destrói ROAS. SDR de IA respondendo em segundos, roteiro de
          qualificação amarrado, lead score filtrando o que chega no vendedor — tudo
          isso aumenta a fração de leads que viram receita sem aumentar o CPL. Em
          operação de serviço, sair de 8% de fechamento para 12% é um salto de 50% no
          ROAS.
        </p>
        <p>
          O terceiro é <strong>reaproveitamento de criativo vencedor</strong>. Antes de
          gastar com produção nova, leve o criativo que está performando para públicos
          similares (lookalike), retargeting estratificado por estágio do funil, e
          formatos diferentes (reels, stories, feed). Criativo que provou ROAS num
          contexto costuma sustentar em 2-3 contextos adjacentes antes de cansar.
        </p>
        <p>
          O quarto, e o que mais escala, é <strong>cortar canais ineficientes com base
          em atribuição real</strong>. Se você tem 6 ad sets ativos e o relatório aferido
          mostra que 2 deles concentram 80% da receita ganha, redireciona orçamento
          desses 4 fracos para os 2 fortes. Sem dado de receita real isso é impossível —
          você mantém os 6 vivos com medo de cortar o errado, e o ROAS continua
          medíocre.
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
