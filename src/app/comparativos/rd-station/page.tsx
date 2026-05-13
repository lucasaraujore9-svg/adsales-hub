import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd, ComparisonJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/comparativos/rd-station";
const OG_TITLE = encodeURIComponent("AdSales·Hub vs RD Station");
const OG_SUBTITLE = encodeURIComponent("Quem ganha em 2026: o veterano de marketing automation ou o desafiante que junta tudo num sistema só");

export const metadata = {
  title: "AdSales·Hub vs RD Station — qual escolher em 2026",
  description:
    "Comparativo direto entre AdSales·Hub e RD Station: módulos, preços em reais, integrações, atribuição e quando cada um faz sentido pra PMEs brasileiras.",
  alternates: { canonical: URL },
  openGraph: { url: URL, title: "AdSales·Hub vs RD Station — qual escolher em 2026" },
};

const FAQ = [
  {
    q: "O AdSales·Hub substitui o RD Station completamente?",
    a: "Pra 80% das PMEs que hoje pagam RD Marketing + RD CRM, sim. O AdSales·Hub cobre marketing automation, CRM, atribuição clique-a-receita, WhatsApp via Cloud API, SDR de voz IA e contratos com assinatura eletrônica (Lei 14.063) num único sistema. Onde o RD ainda ganha: lead scoring com 30+ variáveis, fluxos de e-mail com lógica condicional profunda e biblioteca de templates de inbound consolidada por uma década. Se sua operação depende disso, o RD continua sendo a escolha racional.",
  },
  {
    q: "Qual é mais barato no fim do mês?",
    a: "Depende do que você compara. O RD Marketing Light começa em torno de R$ 50/mês, mas é só e-mail — não tem CRM, não tem automation séria, não tem WhatsApp. O pacote que de fato resolve uma operação (RD Marketing Pro + RD CRM Pro) sai entre R$ 1.000 e R$ 1.800/mês dependendo da base de contatos e usuários. O AdSales·Hub começa em R$ 290 (Operação) e o plano Crescimento, em R$ 690, já entrega CRM + tráfego pago com IA + social em 6 redes + atendimento + analytics + landing pages. O Escala (R$ 1.490) inclui SDR de voz IA e contratos. No comparativo de stack equivalente, o AdSales·Hub costuma sair 40-60% mais barato.",
  },
  {
    q: "Dá pra migrar do RD Station pro AdSales·Hub sem perder histórico?",
    a: "Dá. Importamos contatos, oportunidades, tags, segmentações e histórico de e-mails via CSV ou pela API do RD. Fluxos de automação são recriados manualmente (não tem como serializar a lógica do motor do RD pro nosso de forma 1:1) — a equipe de migração reproduz cada fluxo. O plano Escala inclui especialista dedicado e o processo médio leva entre 3 e 7 dias úteis pra uma base de até 50 mil contatos.",
  },
  {
    q: "RD Station tem SDR de voz IA?",
    a: "Não nativamente. O RD oferece integrações com discadoras e plataformas de voz IA externas, mas o usuário precisa contratar e integrar separadamente. O AdSales·Hub tem agente de voz IA embutido — o número brasileiro (+55) já vem provisionado, a IA atende ou liga, qualifica em 60-90 segundos seguindo o script da empresa, agenda reunião direto na agenda do vendedor e grava a chamada. Está incluso no plano Escala ou disponível como add-on de R$ 220/mês.",
  },
];

export default function ComparativoRDPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="AdSales·Hub vs RD Station — qual escolher em 2026"
        description="Comparativo direto entre AdSales·Hub e RD Station: módulos, preços, integrações, atribuição e quando cada um faz sentido."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ComparisonJsonLd
        url={URL}
        productA="AdSales·Hub"
        productB="RD Station"
        description="Comparativo entre AdSales·Hub e RD Station para PMEs brasileiras."
      />
      <ContentLayout
        kicker="Comparativo"
        title="AdSales·Hub vs RD Station: qual escolher em 2026"
        description="Duas plataformas brasileiras tentando resolver o mesmo problema — marketing e vendas pra PME — com filosofias opostas. O RD Station construiu autoridade em marketing automation ao longo de uma década. O AdSales·Hub nasceu unificado, IA-first, com atribuição 1:1 do clique à receita. Esse texto compara as duas sem rodeio."
        updatedAt="01 de maio de 2026"
        readingMinutes={9}
        coverImage={`/api/og?title=${OG_TITLE}&category=Comparativos&subtitle=${OG_SUBTITLE}`}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Comparativos", href: "/recursos" },
          { label: "vs RD Station" },
        ]}
        cta={{ label: "Testar AdSales·Hub grátis", href: "/signup" }}
      >
        <p>
          A pergunta que aparece toda semana na nossa caixa de entrada é a mesma: <em>"a gente já paga RD Station, vale trocar?"</em>. A resposta honesta nunca é um sim ou um não cravado. Depende do que você usa de fato dentro do RD, do tamanho do time, de quanto da operação está em tráfego pago, e de quão centralizado você quer ter o dado da venda. Esse comparativo foi escrito pra você decidir com base no caso real, não no marketing de quem vende.
        </p>
        <p>
          Antes de qualquer tabela, um número: a maioria das PMEs brasileiras que assina o RD Marketing usa menos de 30% das funcionalidades do produto. Pagam o pacote completo e rodam três fluxos de e-mail, uma landing page por trimestre e meia dúzia de segmentações. Esse é o ponto cego que abriu o espaço pra plataformas como o AdSales·Hub existirem.
        </p>

        <h2>TL;DR</h2>
        <p>
          <strong>Use RD Station</strong> se sua operação vive de inbound, você tem time dedicado de marketing (mínimo dois analistas), roda fluxos de nutrição com 10+ etapas e lógica condicional, e seu orçamento mensal pra ferramentas passa de R$ 1.500. <strong>Use AdSales·Hub</strong> se você roda mídia paga (Meta principalmente), opera com time enxuto, quer ROAS aferido na receita real (não na conversão da plataforma de ad), atende lead por WhatsApp e cansou de ter quatro ferramentas conversando por Zapier.
        </p>

        <h2>O que cada um é, sem rodeio</h2>
        <p>
          O <strong>RD Station</strong> nasceu em Florianópolis em 2011 como uma ferramenta de marketing automation pra inbound. A premissa: atrair com conteúdo, capturar com landing page, nutrir com e-mail, qualificar com lead scoring, passar pra vendas. Por uma década foi o produto mais maduro do Brasil nessa categoria. Em 2018-2019 lançou o RD CRM como produto separado, e em 2024 começou a empacotar os dois. Hoje o portfólio inclui RD Marketing (Light, Basic, Pro), RD CRM (Basic, Pro), RD Conversas (chat) e RD Mentor IA. A força do RD está no que ele construiu por anos: biblioteca de templates, comunidade, base de cases, certificações, integrações com 200+ ferramentas.
        </p>
        <p>
          O <strong>AdSales·Hub</strong> nasceu em 2025 com uma tese diferente: a PME brasileira não precisa de oito ferramentas, precisa de uma. O produto unifica oito módulos num sistema só — CRM, Tráfego com IA (Meta Ads), Social em 6 redes, Atendimento (WhatsApp Cloud API + e-mail + SMS), SDR de Voz IA, Analytics com atribuição 1:1, Landing Pages e Contratos com assinatura eletrônica (Lei 14.063). Nasceu IA-first: a mesma IA que escreve a campanha analisa o resultado e propõe ajuste, e a Meta Conversions API é configurada por padrão pra que o ROAS seja medido na venda fechada, não no clique.
        </p>
        <p>
          Olhando friamente: o RD é um produto de marketing automation que ganhou um CRM. O AdSales·Hub é um sistema de vendas que ganhou um motor de marketing. A diferença filosófica explica praticamente tudo o que vem a seguir.
        </p>

        <h2>Comparativo lado a lado</h2>
        <table>
          <thead>
            <tr>
              <th>Recurso</th>
              <th>AdSales·Hub</th>
              <th>RD Station</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Preço inicial</td><td>R$ 290/mês (Operação, 3 usuários)</td><td>~R$ 50/mês (Light, só e-mail)</td></tr>
            <tr><td>Preço pacote completo</td><td>R$ 690 (Crescimento) — R$ 1.490 (Escala, ilimitado)</td><td>R$ 1.000 a R$ 1.800/mês (Marketing Pro + CRM Pro)</td></tr>
            <tr><td>CRM nativo</td><td>Incluso em todos os planos</td><td>Produto separado, cobrado à parte</td></tr>
            <tr><td>Tráfego pago com IA</td><td>Briefing → campanha publicada na Meta em 4 passos</td><td>Não nativo (RD Mentor sugere, não publica)</td></tr>
            <tr><td>SDR de Voz IA</td><td>Agente liga, qualifica em 60-90s, agenda reunião</td><td>Inexistente</td></tr>
            <tr><td>WhatsApp Business</td><td>Nativo via WhatsApp Cloud API</td><td>Via integração externa ou RD Conversas</td></tr>
            <tr><td>Atribuição</td><td>1:1 do clique à receita (Meta Conversions API + CRM)</td><td>Last-touch + multi-touch limitado</td></tr>
            <tr><td>Contratos + assinatura eletrônica</td><td>Nativo, conformidade com Lei 14.063</td><td>Não tem</td></tr>
            <tr><td>Landing pages</td><td>Drag-and-drop com 40+ blocos</td><td>Editor maduro, biblioteca extensa</td></tr>
            <tr><td>Lead scoring</td><td>Básico (5 variáveis)</td><td>Avançado (30+ variáveis, regras compostas)</td></tr>
            <tr><td>Fluxos de automação</td><td>Visual, 8 gatilhos, lógica até 5 ramos</td><td>Visual, 20+ gatilhos, lógica condicional profunda</td></tr>
            <tr><td>Maturidade do produto</td><td>1 ano, IA-first</td><td>14 anos no mercado BR</td></tr>
            <tr><td>Suporte</td><td>WhatsApp em até 4h, sem escalonamento</td><td>Ticket em até 24h, atendimento prioritário só nos planos altos</td></tr>
            <tr><td>Base de templates</td><td>Crescendo</td><td>Centenas, com cases por segmento</td></tr>
            <tr><td>Comunidade e certificações</td><td>Em construção</td><td>RD University, RD Summit, comunidade consolidada</td></tr>
          </tbody>
        </table>

        <h2>Quando o RD Station continua sendo a escolha certa</h2>
        <p>
          Existe uma faixa específica de operação onde o RD ainda é o melhor produto do mercado brasileiro, e é importante reconhecer isso. Se você tem dois ou mais analistas de marketing dedicados, roda inbound como canal principal de aquisição (não tráfego pago) e depende de fluxos longos de nutrição com lógica condicional encadeada — por exemplo, lead baixou material X, não abriu e-mail Y em 7 dias, mas visitou página Z, então recebe oferta W — você está no público-alvo histórico do RD e não tem por que migrar.
        </p>
        <p>
          O lead scoring do RD é objetivamente mais sofisticado. Você consegue combinar dados demográficos (cargo, porte da empresa, segmento), comportamentais (páginas visitadas, materiais baixados, e-mails abertos) e contextuais (origem da visita, dispositivo, recência) em regras compostas com pesos. O AdSales·Hub tem lead scoring, mas é mais simples — cinco variáveis, pesos predefinidos. Pra operações de inbound B2B com ciclo longo isso pesa.
        </p>
        <p>
          Outro ponto: a biblioteca de templates do RD. Quatorze anos de produto significam centenas de modelos de e-mail, landing pages, fluxos prontos por segmento (educação, saúde, indústria, serviço, e-commerce). Se você é um time pequeno sem repertório próprio, começar do zero no AdSales·Hub exige mais trabalho criativo. No RD você abre, escolhe um template do seu segmento, customiza e publica.
        </p>
        <p>
          Resumindo: <strong>fica no RD se você é uma operação inbound-first com time dedicado de marketing automation</strong>. É pra isso que ele foi construído e ele continua bom nisso.
        </p>

        <h2>Quando o AdSales·Hub vence</h2>
        <p>
          A história muda completamente quando o canal principal é tráfego pago e o ciclo de venda passa por WhatsApp. Aqui o RD nunca foi forte e o AdSales·Hub nasceu pra resolver justamente esse fluxo. A demanda típica: PME que paga agência (R$ 3-8 mil/mês), um gestor de tráfego freelancer (R$ 2-4 mil), uma ferramenta de WhatsApp (R$ 200-500), uma de CRM (R$ 300-800), e ainda assim não consegue dizer qual anúncio gerou qual venda fechada. Isso é o pão de cada dia do AdSales·Hub.
        </p>
        <p>
          A integração com a Meta Conversions API é nativa e configurada no onboarding. Quando o lead vira venda no CRM, o evento volta pra Meta com o valor real e a IA da Meta passa a otimizar pra receita, não pra lead. Em três meses de operação típica isso reduz CPA em 20-35% sem você mexer em mais nada. Pra fazer o mesmo com RD você precisa de RD + ferramenta de tráfego + integração custom + time técnico que mantenha o pipeline. É possível, mas é projeto.
        </p>
        <p>
          Caso concreto: um cliente do segmento de cursos profissionalizantes saiu de um stack RD Marketing Pro + Pipedrive + Take Blip + Builderall (~R$ 2.100/mês total) pro AdSales·Hub Escala (R$ 1.490). Ganhou SDR de voz IA que ele não tinha, atribuição 1:1 que ele tentava montar com planilha, e cortou três logins do dia-a-dia do time. ROAS subiu de 4,2 pra 5,8 em 90 dias — não porque o AdSales·Hub é mágico, mas porque o tráfego passou a otimizar pra venda real e o time deixou de perder lead em handoff entre ferramentas.
        </p>
        <p>
          Outro cenário onde a diferença é gritante: contratos. O AdSales·Hub gera proposta a partir do negócio no CRM, dispara assinatura eletrônica conforme a Lei 14.063 (que regula assinatura digital no Brasil), e quando o cliente assina o negócio fecha automaticamente. No RD isso simplesmente não existe — você precisa de Clicksign, D4Sign ou ZapSign integrado por API. Mais um login, mais uma fatura, mais uma integração que quebra quando alguém atualiza algo.
        </p>

        <h2>Custo real comparado, com a calculadora aberta</h2>
        <p>
          A discussão de preço fica esquisita quando você só compara mensalidade base. O que importa é o custo total do stack que de fato resolve a operação. Vamos montar:
        </p>
        <table>
          <thead>
            <tr>
              <th>Necessidade</th>
              <th>Stack RD equivalente</th>
              <th>Custo/mês</th>
              <th>AdSales·Hub</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Marketing automation</td><td>RD Marketing Pro</td><td>R$ 1.099</td><td rowSpan={6} style={{ verticalAlign: "middle", fontWeight: 600 }}>R$ 1.490 (Escala)<br /><span style={{ fontWeight: 400, fontSize: "0.9em", opacity: 0.7 }}>tudo incluso, sem add-on</span></td></tr>
            <tr><td>CRM de vendas</td><td>RD CRM Pro</td><td>R$ 599</td></tr>
            <tr><td>WhatsApp atendimento</td><td>Take Blip / Octadesk</td><td>R$ 449</td></tr>
            <tr><td>Social media (6 redes)</td><td>mLabs / Etus</td><td>R$ 249</td></tr>
            <tr><td>Assinatura eletrônica</td><td>ZapSign / D4Sign</td><td>R$ 199</td></tr>
            <tr><td>SDR de voz IA</td><td>Não disponível pronto</td><td>R$ 800-2000 (custom)</td></tr>
            <tr><td colSpan={2}><strong>Total stack RD + add-ons</strong></td><td><strong>R$ 3.395 a R$ 4.595/mês</strong></td><td><strong>R$ 1.490/mês</strong></td></tr>
          </tbody>
        </table>
        <p>
          Honestamente: a economia bruta é parte da história, não toda. O ganho real está em ter um único lugar onde o lead entra, é distribuído, atendido, qualificado por IA, transformado em proposta, contratado e medido. O custo de coordenação entre ferramentas (handoff perdido, dado duplicado, integrações quebradas) some. Pra times de até 15 pessoas isso costuma valer mais que a diferença na fatura.
        </p>

        <h2>Como migrar do RD sem perder dado</h2>
        <p>
          Migração assusta mais do que deveria. O processo médio leva entre 3 e 7 dias úteis pra uma base de até 50 mil contatos, e o plano Escala inclui especialista dedicado conduzindo o trabalho. Os passos:
        </p>
        <ol>
          <li><strong>Exportação do RD</strong> — contatos, oportunidades, tags, segmentações e histórico de e-mails em CSV. A API do RD permite extrair tudo programaticamente; pra bases grandes a gente usa direto.</li>
          <li><strong>Mapeamento de campos customizados</strong> — o AdSales·Hub aceita campos custom ilimitados, então não há perda. Os tipos (texto, número, data, dropdown, multi-select) são preservados.</li>
          <li><strong>Importação via API</strong> — endpoint <code>POST /api/v1/contacts/bulk</code> aceita até 2.000 contatos por chamada com validação de schema (Zod). Erros voltam por linha pra correção pontual.</li>
          <li><strong>Recriação de fluxos</strong> — fluxos de e-mail e automações são reconstruídos manualmente (não dá pra serializar a lógica do motor do RD pro nosso 1:1). É a etapa mais demorada e onde o especialista de migração agrega mais valor.</li>
          <li><strong>Reconfiguração de pixel e Conversions API</strong> — substituímos o pixel do RD pelo da Meta direto, conectamos a Conversions API e validamos os primeiros 50 eventos no Events Manager antes de redirecionar tráfego.</li>
          <li><strong>Período de paralelo</strong> — recomendamos 14 dias com as duas ferramentas ativas em modo de leitura, pra confirmar que nenhum lead caiu no vão. Depois desliga o RD.</li>
        </ol>
        <p>
          O risco real de migração não é técnico, é organizacional. Time acostumado com a UI do RD leva duas a três semanas pra ficar fluente em outra ferramenta. Considere isso no cronograma e não migre na semana de campanha de Black Friday.
        </p>

        <h2>O veredito honesto</h2>
        <p>
          Se você é uma agência ou consultoria de inbound marketing vendendo serviço pra cliente final, o RD continua sendo a escolha óbvia — é o produto mais maduro do mercado brasileiro nessa categoria, tem comunidade, certificação e cases por segmento. Não tem por que migrar.
        </p>
        <p>
          Se você é a PME que <em>contrata</em> agência, paga gestor de tráfego, atende lead no WhatsApp, fecha negócio em ligação e quer parar de pagar quatro ferramentas que não conversam direito, o AdSales·Hub provavelmente vai resolver mais por menos. O trial de 14 dias é grátis, sem cartão. Importe 100 contatos, conecte a conta de Meta Ads, dispare uma campanha e veja se faz sentido pra sua realidade — é o único jeito honesto de decidir.
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
