import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";
import { CacCalc } from "./cac-calc";

const URL = "https://adsaleshub.7iegroup.com.br/calculadoras/cac";

const OG_TITLE = encodeURIComponent("Calculadora de CAC");
const OG_SUBTITLE = encodeURIComponent(
  "Quanto custa de verdade adquirir cada cliente novo da sua operação"
);
const COVER_IMAGE = `/api/og?title=${OG_TITLE}&category=Calculadoras&subtitle=${OG_SUBTITLE}`;

export const metadata: Metadata = {
  title: "Calculadora de CAC grátis — Custo de Aquisição de Cliente",
  description:
    "Quanto custa pra você adquirir cada cliente novo? Calcule CAC com investimento de mídia + custos de equipe + ferramentas. Grátis, sem cadastro.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "Como calcular CAC corretamente?",
    a: "CAC = (custo de marketing + custo de vendas) ÷ número de novos clientes adquiridos no período. O custo precisa incluir mídia, salários proporcionais da equipe de marketing e vendas, ferramentas SaaS, agência (se ainda houver) e overhead. O erro mais comum é contar só o gasto em ads e ignorar salários, ferramentas e o tempo do dono que vende e não se paga.",
  },
  {
    q: "Qual CAC é considerado bom?",
    a: "Depende do LTV (Lifetime Value). A regra clássica é LTV/CAC ≥ 3. Se um cliente paga em média R$ 6.000 ao longo da vida, seu CAC ideal fica até R$ 2.000. Em SaaS B2B saudável o payback de CAC acontece em 12 a 18 meses. Em ecommerce, recuperar o CAC já no primeiro pedido é o ideal — se demora 3 pedidos, sua margem precisa segurar a esteira.",
  },
  {
    q: "Como reduzir CAC sem cortar mídia?",
    a: "Aumente a conversão do funil (otimize landing pages, qualifique mais cedo), reduza CPL com criativos novos e públicos lookalike, automatize SDR com IA, monte um programa de indicação que dilua o custo médio e reaproveite leads frios em sequências de nutrição. Cortar mídia sem ajustar funil costuma piorar o CAC, não melhorar.",
  },
  {
    q: "Qual a diferença entre CAC, CPL e CPA?",
    a: "CPL é o custo por lead (alguém que entregou contato). CPA é o custo por ação intermediária (cadastro, trial, agendamento). CAC é o custo por cliente que efetivamente comprou. Você pode ter CPL excelente e CAC péssimo se o lead não converte — por isso CAC é a métrica que importa pra caixa.",
  },
  {
    q: "Como dividir CAC entre canais que se sobrepõem?",
    a: "Use modelos de atribuição. Last-click é simples mas injusto com canais de topo de funil. Atribuição linear divide o crédito entre todos os pontos de contato. Time-decay valoriza o que aconteceu mais perto da venda. Para a maioria das PMEs, atribuição linear ou data-driven já entrega leitura honesta sem exigir time de dados.",
  },
];

export default function CACCalcPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Calculadora de CAC grátis"
        description="Calcule o Custo de Aquisição por Cliente da sua operação."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Calculadora grátis"
        title="Calculadora de CAC"
        description="Quanto custa adquirir um cliente novo, considerando mídia, equipe e ferramentas? Preencha os campos e veja o número real."
        coverImage={COVER_IMAGE}
        readingMinutes={7}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Calculadoras", href: "/recursos" },
          { label: "CAC" },
        ]}
        cta={{ label: "Reduzir meu CAC com IA", href: "/signup" }}
      >
        <p>
          Existe uma métrica que decide silenciosamente se a sua empresa cresce ou
          afunda nos próximos doze meses, e quase ninguém calcula direito. É o CAC
          — o custo real de cada cliente novo que entra. Quando ele sobe sem você
          perceber, o caixa some antes do balanço acusar; quando ele cai de
          verdade, a operação começa a girar sozinha. Honestamente, o problema
          quase nunca é "investir mais em mídia" — é não saber quanto custa cada
          cliente quando você soma mídia, salários, ferramentas e agência.
        </p>
        <p>
          A maioria dos donos de PME que olham o gerenciador da Meta acha que
          paga R$ 80 por cliente. Quando a gente abre a planilha e soma o
          vendedor que custa R$ 4.500, o CRM de R$ 600, a agência de R$ 9.000 e
          o tempo do sócio que ainda fecha venda, o CAC real raramente é menor
          que R$ 600. Esse delta entre o CAC imaginado e o CAC real é onde a
          margem evapora — e é por isso que essa calculadora existe.
        </p>

        <CacCalc />

        <h2>O que é CAC, sem rodeio</h2>
        <p>
          CAC (Customer Acquisition Cost, ou Custo de Aquisição por Cliente) é
          quanto sua empresa gasta, em média, pra colocar um cliente novo
          dentro de casa. É a métrica mais importante depois de receita porque
          ela define se você tem operação sustentável ou se está queimando caixa
          pra manter o gráfico bonito. Receita sem CAC saudável é miragem: dá
          pra crescer 200% num trimestre e quebrar no próximo se cada cliente
          custa mais do que paga.
        </p>
        <p>
          O ponto que pouca gente fala: CAC não é um número, é três. Existe o
          CAC blended (custo total ÷ todos os clientes novos, independente da
          origem), o paid CAC (só clientes vindos de mídia paga, dividindo só
          custos de mídia + ferramentas + equipe alocada em paid) e o organic
          CAC (clientes vindos de SEO, indicação, brand, divididos pelos custos
          de produção de conteúdo, time de SEO e parcerias). Olhar só o blended
          esconde o fato de que seu canal pago pode estar dando prejuízo
          enquanto o orgânico segura a média.
        </p>
        <p>
          Junto do CAC vivem dois primos que você precisa entender: payback de
          CAC (quantos meses até o cliente devolver o que custou) e LTV/CAC
          (quantas vezes o cliente vai pagar mais do que custou ao longo da
          vida). Sem essas três métricas conversando entre si, qualquer decisão
          de aumentar mídia é chute.
        </p>

        <h2>A fórmula que ninguém faz direito</h2>
        <p>
          A fórmula é boba. O que ninguém faz direito é o numerador.
        </p>
        <blockquote>
          CAC = (Mídia + Salários M&S + Ferramentas + Agência + Overhead) ÷
          Número de clientes novos no período
        </blockquote>
        <p>
          O erro mais comum é contar só o que aparece na fatura da Meta ou do
          Google. CAC real precisa incluir absolutamente tudo que existe pra
          aquele cliente chegar até você. Vai muito além de ads:
        </p>
        <ul>
          <li>
            Investimento em Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads e
            qualquer outra mídia paga, somando taxa de gerenciamento se houver
          </li>
          <li>
            Salários e encargos da equipe de marketing e vendas, proporcional
            ao tempo dedicado a aquisição (não à retenção)
          </li>
          <li>
            Ferramentas SaaS: CRM, automação de marketing, plataforma de email,
            ferramentas de SEO, design, edição de vídeo, encurtadores
          </li>
          <li>
            Agência ou freelancers de tráfego, social media, copywriting, SEO,
            design — tudo que você paga pra alguém de fora gerar demanda
          </li>
          <li>
            Eventos, brindes, materiais impressos, patrocínios, mídia offline
            quando aplicável
          </li>
          <li>
            Tempo do dono ou sócio que ainda vende — se o sócio gasta 30% do
            tempo fechando deal, 30% do pró-labore dele entra no CAC
          </li>
        </ul>
        <p>
          Agora vem a parte que separa cálculo amador de cálculo profissional:
          quebrar isso em paid CAC, organic CAC e blended CAC. O paid CAC pega
          só o custo de aquisição paga (mídia + ferramentas de paid + parte do
          time alocada em paid) dividido pelos clientes que vieram de mídia
          paga. O organic CAC faz a mesma conta para SEO, indicação e brand. O
          blended é a média ponderada de tudo. Quando você compara os três, o
          diagnóstico aparece: às vezes o paid está em prejuízo e o orgânico
          está pagando a conta — e basta uma queda no SEO pra empresa entrar em
          colapso.
        </p>

        <h2>Benchmark BR de CAC por segmento</h2>
        <p>
          Os números abaixo são faixas observadas em operações reais brasileiras
          em 2025. Use como referência, não como meta — sua realidade depende
          de ticket, ciclo de venda e maturidade do funil. Se seu CAC estiver
          muito abaixo da faixa, desconfie do cálculo (provavelmente está
          subestimado). Se estiver muito acima, há gordura pra cortar.
        </p>
        <table>
          <thead>
            <tr>
              <th>Segmento</th>
              <th>CAC típico (BR)</th>
              <th>Ticket médio</th>
              <th>Payback ideal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SaaS B2B PME</td>
              <td>R$ 800–2.500</td>
              <td>R$ 4.000–12.000/ano</td>
              <td>12–18 meses</td>
            </tr>
            <tr>
              <td>SaaS B2B Enterprise</td>
              <td>R$ 8.000–35.000</td>
              <td>R$ 60.000–250.000/ano</td>
              <td>18–24 meses</td>
            </tr>
            <tr>
              <td>Ecommerce moda</td>
              <td>R$ 35–80</td>
              <td>R$ 180–350</td>
              <td>1º pedido</td>
            </tr>
            <tr>
              <td>Ecommerce beleza/cosmético</td>
              <td>R$ 25–60</td>
              <td>R$ 120–280</td>
              <td>1º ou 2º pedido</td>
            </tr>
            <tr>
              <td>Ecommerce eletrônicos</td>
              <td>R$ 80–180</td>
              <td>R$ 600–2.500</td>
              <td>1º pedido</td>
            </tr>
            <tr>
              <td>Educação / cursos online</td>
              <td>R$ 60–180</td>
              <td>R$ 600–3.000</td>
              <td>Imediato</td>
            </tr>
            <tr>
              <td>Educação superior / pós</td>
              <td>R$ 250–800</td>
              <td>R$ 8.000–30.000</td>
              <td>1º semestre</td>
            </tr>
            <tr>
              <td>Consultoria B2B</td>
              <td>R$ 1.500–5.000</td>
              <td>R$ 15.000–80.000</td>
              <td>1º contrato</td>
            </tr>
            <tr>
              <td>Serviços locais (estética, odonto, pet)</td>
              <td>R$ 80–250</td>
              <td>R$ 400–2.000</td>
              <td>2–3 atendimentos</td>
            </tr>
            <tr>
              <td>Serviços jurídicos / contábeis</td>
              <td>R$ 400–1.200</td>
              <td>R$ 1.500–8.000/ano</td>
              <td>3–6 meses</td>
            </tr>
            <tr>
              <td>Imobiliário (corretagem)</td>
              <td>R$ 600–2.500</td>
              <td>R$ 15.000–60.000 (comissão)</td>
              <td>1ª venda</td>
            </tr>
            <tr>
              <td>Saúde (clínicas premium)</td>
              <td>R$ 180–500</td>
              <td>R$ 800–4.000</td>
              <td>2–4 consultas</td>
            </tr>
          </tbody>
        </table>
        <p>
          Casos concretos pra calibrar a leitura: um SaaS B2B PME que vende
          plano de R$ 290/mês precisa de CAC abaixo de R$ 1.000 pra fazer
          payback em menos de 12 meses; uma loja de moda com ticket médio de R$
          220 e três pedidos por ano de cada cliente pode pagar até R$ 80 de
          CAC e ainda ter LTV/CAC saudável; uma consultoria B2B que fecha
          projeto de R$ 40.000 pode tranquilamente pagar R$ 4.000 de CAC porque
          a margem cobre. O número absoluto importa menos que a relação com LTV
          e payback.
        </p>

        <h2>5 alavancas pra reduzir CAC sem cortar mídia</h2>
        <p>
          Cortar mídia é o reflexo errado quando o CAC sobe. Funciona no curto
          prazo e estraga tudo no médio: você perde topo de funil, o pipeline
          seca dois meses depois e aí o CAC sobe ainda mais porque o time fica
          ocioso. As alavancas reais estão em outros lugares.
        </p>
        <ol>
          <li>
            <strong>Atribuição honesta antes de qualquer corte.</strong> Antes
            de mexer em verba, descubra qual canal tem CPL razoável mas CAC
            péssimo (ou vice-versa). É comum ter campanha de Meta com CPL de R$
            12 e CAC de R$ 1.800 porque o lead não fecha — enquanto uma
            campanha de Google com CPL de R$ 80 entrega CAC de R$ 400. Sem essa
            visão, você corta o canal errado.
          </li>
          <li>
            <strong>SDR de IA no lugar de SDR humano.</strong> SDR humano
            qualificado custa R$ 3.500–5.000/mês mais comissão e rotatividade.
            SDR de voz com IA custa em torno de R$ 220/mês, atende em menos de
            30 segundos, trabalha 24/7 e nunca fica de folga em véspera de
            feriado. Pra operações com mais de 200 leads/mês, a economia
            mensal já paga uma campanha inteira.
          </li>
          <li>
            <strong>Velocidade de resposta no primeiro contato.</strong> Lead
            que recebe contato em menos de 5 minutos converte 9× mais que lead
            atendido em 1 hora — isso é estudo da Harvard Business Review, não
            achismo. Se você tem 100 leads/mês e melhora a velocidade de
            resposta, a conversão sobe de 8% pra ~20% e o CAC cai pela metade
            sem você ter mexido em mídia.
          </li>
          <li>
            <strong>Programa de indicação estruturado.</strong> Cliente
            existente trazendo cliente novo custa entre R$ 50 e R$ 150 (custo
            do incentivo) — versus R$ 1.500 ou mais via mídia paga. Ecommerces
            que estruturam programa de referral chegam a 15-25% de aquisição
            via indicação em 6 meses. SaaS B2B faz isso virar até 40% do
            pipeline.
          </li>
          <li>
            <strong>Otimização de funil antes de mais tráfego.</strong> Subir a
            conversão de visitante em lead em 1 ponto percentual pode reduzir
            CAC em 20–40%, dependendo do funil. Mexer em hero de landing page,
            simplificar formulário (de 7 campos pra 3) e adicionar prova social
            costuma render mais que dobrar o budget de ads.
          </li>
        </ol>

        <h2>Como calcular CAC quando você tem múltiplos canais</h2>
        <p>
          Aqui mora o diabo. Quando o lead entra pela busca do Google, depois
          vê três anúncios na Meta, recebe um email de remarketing, conversa
          com o SDR e fecha — qual canal levou o crédito? Last-click vai dar
          tudo pro último anúncio que ele clicou; first-click vai dar tudo pro
          Google; e nenhum dos dois conta a história inteira. A escolha do
          modelo de atribuição muda completamente a leitura de CAC por canal e
          pode te fazer cortar exatamente o que sustenta o resto.
        </p>
        <p>
          Os modelos mais usados em PMEs brasileiras são:
        </p>
        <ul>
          <li>
            <strong>Last-click:</strong> simples, todo CRM faz nativamente, mas
            penaliza canais de topo (SEO, brand, social orgânico) que plantam a
            semente
          </li>
          <li>
            <strong>First-click:</strong> oposto — supervaloriza topo e ignora
            quem fechou. Útil pra entender descoberta, ruim pra decisão de
            verba
          </li>
          <li>
            <strong>Linear:</strong> divide o crédito igualmente entre todos os
            pontos de contato. Honesto, simples, suficiente pra maioria das
            operações
          </li>
          <li>
            <strong>Time-decay:</strong> dá mais peso pros toques mais próximos
            da conversão. Funciona bem em ciclos longos de B2B
          </li>
          <li>
            <strong>Data-driven (algorítmico):</strong> usa machine learning
            pra distribuir crédito com base em padrões reais de conversão.
            Padrão-ouro, mas exige volume (500+ conversões/mês) pra fazer
            sentido
          </li>
        </ul>
        <p>
          Recomendação prática: comece com atribuição linear como visão padrão
          e mantenha last-click como visão paralela. Quando os dois divergem
          muito, é sinal de que você tem canais de topo que estão sendo
          subvalorizados. Para granularidade real, conecte UTMs em todas as
          campanhas, registre o lead source na primeira interação e mantenha
          esse campo intocado mesmo quando o lead reaparece — caso contrário,
          remarketing rouba crédito de aquisição.
        </p>

        <h2>CAC vs CPL vs CPA — três siglas que confundem todo mundo</h2>
        <p>
          Honestamente, ver gente boa misturando essas três siglas é
          frustrante, porque a confusão custa dinheiro. CPL (Custo por Lead) é
          quanto você paga por alguém que entregou contato — preencheu form,
          mandou WhatsApp, baixou material. CPA (Custo por Ação) mede uma ação
          intermediária mais qualificada: cadastro completo, agendamento de
          demo, início de trial, primeira sessão. CAC (Custo de Aquisição por
          Cliente) é o custo por cliente que efetivamente pagou.
        </p>
        <p>
          O erro clássico é otimizar CPL achando que está reduzindo CAC. Você
          baixa o CPL de R$ 80 pra R$ 25 trocando o criativo por um isca-fácil,
          aí descobre que esses leads convertem em 1% (vs 8% antes) e o CAC
          dobrou. Bom CAC quase sempre vem de CPL ligeiramente mais caro com
          lead muito mais qualificado. Acompanhe os três sempre juntos: CPL no
          dia, CPA na semana, CAC no mês.
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
