import type { Metadata } from "next";
import Link from "next/link";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/glossario/cac";
const TITLE = "O que é CAC — Custo de Aquisição por Cliente explicado";
const SUBTITLE = "Definição, fórmula completa e benchmarks brasileiros";
const COVER_IMAGE = `/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Glossário")}&subtitle=${encodeURIComponent(SUBTITLE)}`;

export const metadata: Metadata = {
  title: TITLE,
  description:
    "CAC define se sua operação é sustentável. Definição, fórmula completa, benchmarks brasileiros e como reduzir sem cortar mídia.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "Como calcular CAC do jeito certo?", a: "CAC = (Investimento em mídia + salários da equipe de marketing e vendas + ferramentas + agência + overhead) ÷ número de novos clientes pagantes adquiridos no mesmo período. A maioria das empresas calcula errado por contar só o ad spend e ignorar o custo de gente, o que esconde o CAC real em até 4x." },
  { q: "Qual CAC é considerado bom?", a: "Depende sempre do LTV. Regra geral: LTV/CAC ≥ 3 (cada real investido em aquisição deve devolver pelo menos três em receita ao longo da vida do cliente) e payback < 18 meses para SaaS B2B ou < 6 meses para e-commerce. Abaixo disso, você está crescendo no prejuízo." },
  { q: "Qual a diferença entre CAC e CPL?", a: "CPL é Custo Por Lead — quanto custa capturar cada formulário preenchido. CAC é Custo Por Cliente — quanto custa converter cada lead em cliente pagante. A relação é direta: CAC = CPL ÷ taxa de conversão de lead em cliente. Se seu CPL é R$ 50 e 5% dos leads viram cliente, seu CAC mínimo é R$ 1.000 (sem contar o custo de gente)." },
  { q: "O que é blended CAC?", a: "Blended CAC é o CAC consolidado de todos os canais juntos (pago + orgânico + indicação). Ele dilui o CAC verdadeiro porque mistura clientes de aquisição cara com clientes que vieram de graça. Use blended CAC para a saúde geral do negócio, mas sempre tenha o paid CAC separado para decisões de mídia." },
  { q: "MQL e SQL afetam o CAC?", a: "Diretamente. MQL (Marketing Qualified Lead) é o lead que marketing entrega para vendas. SQL (Sales Qualified Lead) é o que vendas aceita trabalhar. Quanto melhor a qualificação MQL→SQL, menor o CAC, porque vendas não desperdiça tempo (e tempo de vendedor é o componente mais caro do CAC)." },
];

export default function CACGlossaryPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="O que é CAC" description="Custo de Aquisição por Cliente, sem mistério." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Glossário"
        title="O que é CAC"
        description="CAC (Customer Acquisition Cost) é a métrica que decide se sua empresa cresce ou afunda. É o número que separa SaaS bem-sucedido de queima de caixa disfarçada."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Glossário", href: "/recursos" },
          { label: "CAC" },
        ]}
        cta={{ label: "Calcular meu CAC", href: "/calculadoras/cac" }}
        coverImage={COVER_IMAGE}
        readingMinutes={6}
      >
        <p>
          Toda semana aparece um dono de PME na call dizendo a mesma frase:
          <em> "meu CAC é R$ 30, tô voando"</em>. Aí a gente pede pra abrir a planilha
          e descobre que ele dividiu o ad spend do Meta pelo número de vendas do mês.
          Ponto. Não entrou o salário do gestor de tráfego, não entrou o vendedor que
          trabalhou 22 dias atendendo o lead, não entrou o CRM, não entrou o WhatsApp
          Business, não entrou a agência que cobra R$ 4.500 fixos. Quando a gente
          recalcula com tudo dentro, o CAC verdadeiro pula pra R$ 380. E aí o ticket
          médio de R$ 290 vira um problema sério — ele tá pagando pra adquirir cliente.
        </p>
        <p>
          Honestamente, esse é o erro mais comum que vejo no Brasil inteiro. Não é
          ignorância, é otimismo contábil. E é o motivo de muita operação parecer saudável
          no painel do Meta e quebrar no fluxo de caixa três meses depois.
        </p>

        <h2>Definição</h2>
        <p>
          <strong>CAC</strong> (Customer Acquisition Cost ou Custo de Aquisição por
          Cliente) é o quanto sua empresa gasta em média pra conquistar cada cliente
          novo pagante. A palavra-chave é <em>cliente pagante</em>, não lead, não
          oportunidade, não proposta enviada. CAC só conta quem assinou o contrato e o
          dinheiro entrou.
        </p>
        <p>
          Diferente do CPL (custo por lead), o CAC mede o trajeto inteiro: do real
          investido em anúncio até o real recebido na primeira fatura. E diferente do
          CPA genérico (custo por aquisição), o CAC inclui o custo humano — vendedor,
          SDR, gestor de tráfego — e não só a mídia.
        </p>

        <h2>Fórmula completa (a maioria erra)</h2>
        <blockquote>
          CAC = (Mídia + Salários M&amp;S + Ferramentas + Agência + Overhead) ÷ Novos clientes
        </blockquote>
        <p>
          O erro de contar só ad spend acontece porque é o número mais visível e mais
          fácil de pegar. Mas o custo verdadeiro de adquirir um cliente inclui tudo que
          contribuiu pra essa aquisição acontecer. Os componentes que ninguém soma:
        </p>
        <ul>
          <li><strong>Salários proporcionais</strong> da equipe de marketing e vendas (M&amp;S). Se o vendedor passa 70% do tempo prospectando e 30% atendendo cliente ativo, 70% do salário dele entra no CAC.</li>
          <li><strong>Ferramentas SaaS</strong> usadas em aquisição: CRM, e-mail marketing, automação, ferramenta de prospecção, WhatsApp Business API, plataforma de landing page, ferramenta de call tracking.</li>
          <li><strong>Agência ou freelancers</strong> de tráfego, design, redação, vídeo. Inclui o fixo mensal mais qualquer fee variável.</li>
          <li><strong>Eventos, brindes, materiais</strong> impressos, patrocínios, ações de campo.</li>
          <li><strong>Overhead administrativo</strong> rateado: parte do aluguel, energia, contador e RH proporcional ao tamanho do time de aquisição.</li>
          <li><strong>Custo de tecnologia de aquisição</strong>: hospedagem da landing page, domínio, certificado, integrações, custo de Conversions API.</li>
        </ul>
        <p>
          A regra prática que uso com cliente: se você cortasse esse custo amanhã, sua
          capacidade de adquirir cliente diminuiria? Se sim, ele entra no CAC. Não tem
          jeito.
        </p>

        <h2>Benchmark brasileiro por segmento</h2>
        <p>
          Os números abaixo são médias de operações reais que passaram pelo nosso radar
          nos últimos 18 meses. Use como referência, não como meta. CAC só faz sentido
          comparado ao seu próprio LTV, ticket médio e ciclo de vendas. Pra rodar com
          seus números, tem a <Link href="/calculadoras/cac">calculadora de CAC</Link>.
        </p>
        <table>
          <thead>
            <tr>
              <th>Segmento</th>
              <th>CAC típico</th>
              <th>Ticket de referência</th>
              <th>LTV/CAC saudável</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SaaS B2B PME</td>
              <td>R$ 800 a R$ 2.500</td>
              <td>R$ 4k a R$ 12k/ano</td>
              <td>≥ 3,5</td>
            </tr>
            <tr>
              <td>E-commerce moda</td>
              <td>R$ 35 a R$ 80</td>
              <td>R$ 180 a R$ 350</td>
              <td>≥ 3 (com recompra)</td>
            </tr>
            <tr>
              <td>Educação online</td>
              <td>R$ 60 a R$ 180</td>
              <td>R$ 600 a R$ 3.000</td>
              <td>≥ 4</td>
            </tr>
            <tr>
              <td>Consultoria</td>
              <td>R$ 1.500 a R$ 5.000</td>
              <td>R$ 15k a R$ 80k</td>
              <td>≥ 5</td>
            </tr>
            <tr>
              <td>Serviços locais</td>
              <td>R$ 80 a R$ 250</td>
              <td>R$ 400 a R$ 2.000</td>
              <td>≥ 3</td>
            </tr>
          </tbody>
        </table>
        <p>
          Dois casos que ilustram bem como o CAC se comporta nos extremos. Um SaaS B2B
          PME que vende ERP simples por R$ 990/mês (R$ 11.880/ano) consegue sustentar
          CAC de R$ 2.000 tranquilo, porque a retenção média do segmento passa de 24
          meses — o LTV supera R$ 23 mil. Já uma loja de moda feminina com ticket médio
          de R$ 230 e recompra de 1,8 vezes ao ano tem LTV em torno de R$ 410 no
          primeiro ano. Se o CAC dela ultrapassa R$ 80, a margem some, porque ainda
          falta tirar CMV, frete, gateway e impostos.
        </p>

        <h2>5 alavancas pra reduzir CAC sem cortar mídia</h2>
        <p>
          Cortar mídia é o caminho preguiçoso pra baixar CAC — geralmente derruba
          receita junto. As alavancas abaixo atacam o numerador (custo) ou o
          denominador (clientes), sem depender de mexer no orçamento de anúncio.
        </p>
        <ol>
          <li>
            <strong>Atribuição precisa por canal e campanha.</strong> Sem atribuição
            decente você está jogando dinheiro fora em campanhas que parecem performar
            por causa do last-click. Conecte Conversions API, tagueie origem em todos
            os formulários e olhe CAC por canal isolado, não blended.
          </li>
          <li>
            <strong>SDR automatizado por agente de voz IA.</strong> Um SDR humano júnior
            no Brasil custa R$ 4.000+ encargos. Um agente de voz IA qualificando lead
            por R$ 220/mês entrega o mesmo throughput em horário comercial estendido,
            sem dia ruim e sem turnover. Mata uma fatia gorda do componente "salários"
            do CAC.
          </li>
          <li>
            <strong>Tempo de resposta abaixo de 5 minutos.</strong> Lead atendido em
            menos de 5 minutos converte cerca de 9 vezes mais que lead atendido em 1
            hora. Mais conversão no mesmo volume de lead derruba CAC sem mexer em
            nenhuma linha de custo.
          </li>
          <li>
            <strong>Programa estruturado de indicação.</strong> Cliente trazendo cliente
            costuma custar R$ 50 a R$ 150 (a recompensa) contra R$ 1.500+ via mídia
            paga em segmentos B2B. Mesmo um programa simples com 10% de desconto
            recíproco move o ponteiro.
          </li>
          <li>
            <strong>Subir conversão do funil em vez de tráfego.</strong> Cada ponto
            percentual a mais na conversão visitante→lead pode reduzir CAC em 20 a 40%,
            dependendo da estrutura. Otimizar headline, prova social e fricção de
            formulário sai mais barato que dobrar verba.
          </li>
        </ol>

        <h2>CAC vs CPL vs CPA: três métricas, três decisões</h2>
        <p>
          Essas três siglas são confundidas direto, inclusive em pitch de agência. Vale
          fixar a diferença porque cada uma serve pra uma decisão.
        </p>
        <ul>
          <li>
            <strong>CPL (Custo por Lead)</strong> mede o custo de gerar 1 contato
            qualificado pra ser trabalhado. Serve pra decidir alocação de mídia entre
            criativos e canais no topo do funil.
          </li>
          <li>
            <strong>CPA (Custo por Aquisição)</strong> é genérico — pode ser CPL, CAC
            ou qualquer evento de conversão dependendo do contexto. Quando alguém fala
            CPA, pergunte: "aquisição de quê?". Plataforma de mídia geralmente chama de
            CPA o CPL.
          </li>
          <li>
            <strong>CAC (Custo de Aquisição por Cliente)</strong> mede o custo total de
            gerar 1 cliente pagante de verdade. Serve pra decidir se o negócio é
            sustentável e se faz sentido escalar.
          </li>
        </ul>
        <p>
          A relação matemática que conecta os três:
          <strong> CAC = CPL ÷ taxa de conversão de lead em cliente</strong>. Se você
          quer baixar CAC, pode atacar CPL (mídia mais eficiente) ou conversão
          (vendas/SDR/funil). Mexer só num lado raramente resolve.
        </p>

        <h2>Payback e LTV/CAC: o CAC nunca vive sozinho</h2>
        <p>
          CAC isolado não diz nada. Um CAC de R$ 5.000 pode ser ótimo (consultoria com
          contrato anual de R$ 80 mil) ou catastrófico (SaaS de R$ 99/mês). Sempre
          analise junto com:
        </p>
        <ul>
          <li>
            <strong>LTV/CAC</strong> — quanto retorno cada real de aquisição traz ao
            longo da vida do cliente. Mínimo aceitável: 3. Saudável: 4 a 5. Acima de 6,
            provavelmente você está investindo pouco em aquisição e deixando crescimento
            na mesa.
          </li>
          <li>
            <strong>Payback de CAC</strong> — em quantos meses a margem do cliente paga
            de volta o custo de adquiri-lo. Para SaaS B2B, mire abaixo de 18 meses. Para
            e-commerce, mire abaixo de 6 meses. Acima disso, fluxo de caixa vira gargalo
            de crescimento mesmo com unit economics positivo.
          </li>
        </ul>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
