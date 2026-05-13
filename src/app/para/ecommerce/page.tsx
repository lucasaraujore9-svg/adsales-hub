import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/para/ecommerce";

export const metadata: Metadata = {
  title: "AdSales·Hub para e-commerce — ROAS por SKU e abandono recuperado",
  description:
    "Atribua receita por SKU, recupere carrinho abandonado via WhatsApp, sequencia pós-compra. Tudo conectado ao Meta Conversions API.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "Conecta com Shopify, VTEX, Nuvemshop?", a: "Sim, via API REST + webhooks. Eventos de compra, carrinho abandonado e visualização de produto entram automaticamente no funil. Plano Crescimento já inclui." },
  { q: "Tem recuperação de carrinho abandonado?", a: "Sim. Quando o evento Add to Cart sem Purchase chega no AdSales·Hub, dispara sequência: WhatsApp em 30min + e-mail em 2h + SMS em 24h. Recuperação típica 12-25%." },
  { q: "Funciona com Meta Conversions API?", a: "Sim, server-side. Eventos de Purchase com valor real e ID do pedido enviados via API, contornando bloqueios de iOS 14+ e ad-blockers." },
  { q: "Diferencia receita bruta de receita líquida com frete e cupom?", a: "Sim. O evento de Purchase enviado pra Meta carrega valor líquido (subtotal menos cupom), e o painel interno separa frete, imposto e desconto. Você decide qual número entra no cálculo de ROAS — a maioria dos lojistas usa receita líquida porque é o que de fato entra no caixa." },
  { q: "Funciona pra loja com 50 pedidos/mês ou só pra operação grande?", a: "Funciona dos dois lados. Abaixo de 100 pedidos/mês o ganho maior é organizar atribuição e recuperar carrinho — coisas que normalmente ninguém faz porque dá trabalho. Acima de 500 pedidos/mês o ganho vira cohort, atribuição por SKU e otimização de mídia em escala." },
];

export default function EcommercePage() {
  const coverTitle = encodeURIComponent("AdSales·Hub para e-commerce");
  const coverSubtitle = encodeURIComponent("ROAS por SKU e abandono recuperado");
  const coverImage = `/api/og?title=${coverTitle}&category=Para sua empresa&subtitle=${coverSubtitle}`;

  return (
    <>
      <ArticleJsonLd url={URL} headline="AdSales·Hub para e-commerce" description="ROAS por SKU e abandono recuperado." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Para e-commerce"
        title="ROAS por SKU. Carrinho abandonado recuperado. Tudo conectado."
        description="E-commerce brasileiro com 50-5.000 pedidos/mês: a plataforma conecta seu checkout ao Meta + WhatsApp + e-mail e mostra qual produto cada anúncio vende — não só quanta receita total."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Para", href: "/recursos" },
          { label: "E-commerce" },
        ]}
        cta={{ label: "Testar grátis com seu e-commerce", href: "/signup" }}
        coverImage={coverImage}
        readingMinutes={6}
      >
        <p>
          Tem um número que todo dono de e-commerce vê e, no fundo, sabe que é mentira: o ROAS bonito do Gerenciador de Anúncios. O Meta jura que sua campanha rodou 6,2x. Aí você abre a Shopify, abre a VTEX, abre o painel da Nuvemshop, e a receita real da semana é metade do que o painel do Facebook prometeu. Honestamente, isso acontece porque o Meta atribui a si mesmo todo clique que tocou no funil — inclusive o cara que ia comprar de qualquer jeito porque já te seguia há seis meses. E porque o pixel do navegador, depois do iOS 14.5 e da febre de ad-blocker, perde entre 15% e 40% dos eventos de compra dependendo do seu público.
        </p>
        <p>
          AdSales·Hub pra e-commerce existe pra fechar essa distância entre o painel do Meta e o que de fato entrou no caixa. Não é mais um relatório. É uma camada que pega o evento de compra direto do seu checkout — Shopify, VTEX, Nuvemshop, Woocommerce, Magento — manda server-side via Conversions API com valor real, ID do pedido, SKU comprado e content category. O Meta passa a otimizar campanha em cima de receita que aconteceu, não em cima de pixel que disparou. Em 30-45 dias o algoritmo recalibra e o ROAS reportado começa a bater com o financeiro. Quem nunca rodou CAPI bem feito costuma ver oscilação grande nas duas primeiras semanas — é o algoritmo reaprendendo, e isso é normal.
        </p>

        <h2>O que muda no e-commerce quando o servidor passa a falar com o Meta</h2>
        <p>
          Três coisas mudam, e cada uma sozinha já paga a assinatura. A primeira é a Conversions API server-side: o evento de Purchase sai do seu servidor com hash de e-mail, telefone, IP e user agent, e chega íntegro no Meta mesmo se o usuário tiver bloqueador. Recuperação típica de eventos: 18-35% acima do que o pixel sozinho enxerga. Isso significa que campanhas que pareciam mortas voltam a aparecer no relatório como rentáveis, e campanhas que pareciam ótimas se revelam canibalizando vendas orgânicas.
        </p>
        <p>
          A segunda é atribuição por SKU. O painel do Meta te diz que a campanha A vendeu R$ 38 mil. Bonito. Mas a campanha A vendeu o quê? Camiseta de R$ 89 com 32% de margem? Tênis de R$ 459 com 12% de margem? Kit promocional do estoque parado? Sem essa decomposição, você está investindo no escuro. AdSales·Hub puxa o line item de cada pedido e amarra ao ad_id que originou a venda. Em duas semanas você descobre que campanha de carrossel rende margem alta, campanha de coleção liquida estoque, e que aquela criativo que parecia campeão estava vendendo só o produto isca de R$ 19,90.
        </p>
        <p>
          A terceira é recuperação de carrinho omnichannel. O Add to Cart entra, dispara um timer. Trinta minutos sem Purchase: WhatsApp com link do carrinho montado e foto do produto. Duas horas: e-mail com prova social. Vinte e quatro horas: SMS curto, sem link encurtado, com cupom de 5%. Cadência testada com centenas de lojas e ajustada pra não queimar lista. Recuperação típica de 12% a 25% dos abandonos, dependendo de ticket médio e categoria. O que ninguém te conta de e-commerce é que a maioria dos carrinhos abandonados não é desistência — é distração. A pessoa estava no transporte público, o ônibus parou, fechou a aba. WhatsApp em 30 minutos pega ela ainda quente.
        </p>

        <h2>Integrações nativas com as plataformas brasileiras</h2>
        <p>
          A integração não exige plugin pago, dev externo nem migração de checkout. Cada plataforma tem um caminho próprio e a gente já mapeou os atritos. Shopify aceita webhook nativo de orders/create e orders/paid. VTEX exige autenticação via App Key/Token e expõe Master Data pra puxar histórico. Nuvemshop tem webhook oficial mas com limite de retry — a gente recompõe via polling se o evento perder. Woocommerce vai por plugin REST oficial. Magento 2 por REST customizado, e aqui o tempo de setup é maior, honestamente.
        </p>
        <table>
          <thead><tr><th>Plataforma</th><th>Conexão</th><th>Eventos capturados</th><th>Tempo de setup</th></tr></thead>
          <tbody>
            <tr><td>Shopify</td><td>Webhook nativo + Admin API</td><td>Purchase, AddToCart, ViewContent, Refund</td><td>10 minutos</td></tr>
            <tr><td>VTEX</td><td>App Key + Master Data API</td><td>Pedido criado, faturado, cancelado, devolvido</td><td>30 minutos</td></tr>
            <tr><td>Nuvemshop</td><td>Webhooks oficiais + polling backup</td><td>Order created, paid, cancelled, fulfilled</td><td>15 minutos</td></tr>
            <tr><td>Woocommerce</td><td>Plugin REST + WC Webhooks</td><td>Order, cart, product view, refund</td><td>20 minutos</td></tr>
            <tr><td>Magento 2</td><td>REST API customizada</td><td>Eventos custom via observer</td><td>2-3 horas</td></tr>
          </tbody>
        </table>

        <h2>Casos reais que já rodaram dentro da plataforma</h2>
        <p>
          Loja de moda feminina, 800 pedidos por mês, ticket médio de R$ 187. O dono jurava que o carro-chefe era a linha de vestidos. Quando ligamos atribuição por SKU e olhamos 60 dias, descobrimos que 22% do faturamento vinha de três SKUs específicos — duas blusas básicas e uma calça wide leg que ninguém promovia ativamente. A campanha de vestido tinha ROAS de 2,4. Os três SKUs escondidos rodavam orgânico com ROAS implícito acima de 7. Concentramos R$ 8 mil de mídia nesses três produtos, com criativo dedicado, e em 45 dias o ROAS médio da conta subiu de 3,1 pra 4,8. O segredo não foi mídia, foi parar de investir no produto errado.
        </p>
        <p>
          Loja de suplementos esportivos, ticket médio R$ 240, taxa de abandono de carrinho de 73% (normal pra categoria). Antes de ligar a recuperação omnichannel, eles tinham só um e-mail enviado em 4 horas, com taxa de recuperação de 4%. Ligamos a sequência completa: WhatsApp em 30 minutos com foto do produto e link clicável, e-mail em 2 horas com prova social de outros clientes da mesma cidade, SMS em 24 horas com cupom de R$ 15. Recuperação saltou pra 19% no segundo mês estabilizado. Em valor absoluto, R$ 14 mil por mês que ia direto pro lixo voltou pro caixa. O custo da plataforma se pagou em onze dias.
        </p>
        <p>
          Pet shop online, foco em ração e medicamento de uso contínuo. O problema deles não era aquisição — era manter o cliente ativo. A maioria comprava ração uma vez, sumia, e voltava três meses depois quando lembrava. Programamos uma régua que cruza data da última compra com peso médio do animal e estimativa de consumo: 7 dias antes do fim provável do produto, dispara WhatsApp ofertando recompra com link um-clique. Churn caiu 38% em quatro meses. Esse é um caso clássico de cohort: você só consegue fazer essa régua se sabe quem comprou o quê e quando — sem isso, é tiro no escuro.
        </p>

        <h2>Pós-compra: o jogo invisível que decide LTV</h2>
        <p>
          A indústria inteira fala de CAC. Quase ninguém fala do que acontece nos 90 dias depois que o cliente compra. Que é justamente onde o e-commerce médio brasileiro perde dinheiro. O cliente recebe o produto, fica feliz, esquece de você, e o próximo CAC pra trazer ele de volta é três vezes maior do que o de manter ele engajado.
        </p>
        <p>
          A sequência pós-compra do AdSales·Hub é montada em três toques calibrados. Em D+3, NPS curto com uma pergunta só, via WhatsApp, com o nome do produto comprado no texto. Resposta abre uma régua: nota 9-10 vai pra fluxo de pedido de review na plataforma; nota 0-6 vai pra atendimento humano antes de virar reclamação no Reclame Aqui. Em D+14, cross-sell baseado no que ele comprou — não algoritmo genérico, regra editável que o lojista define ("quem comprou ração, recebe oferta de petisco; quem comprou tênis, recebe meia esportiva"). Em D+60, recompra com cupom decrescente: começa em 12%, cai pra 8%, depois pra 5% se a pessoa não engajar.
        </p>
        <p>
          Detalhe que parece bobo mas muda número: a gente não dispara nenhum desses se a pessoa entrou em contato no atendimento por reclamação nos últimos 7 dias. Nada queima base mais rápido que oferta promocional pra quem está reclamando que o produto chegou quebrado.
        </p>

        <h2>Cohort analysis que separa lojista amador de operação profissional</h2>
        <p>
          Cohort não é coisa de SaaS, embora tenha virado moda lá. Cohort em e-commerce é o relatório mais subutilizado do mercado. A pergunta que todo dono de loja deveria fazer toda segunda de manhã é: dos clientes que entraram em janeiro vindos do Meta, quantos voltaram a comprar até hoje, qual ticket médio na recompra, e quanto isso difere dos clientes que entraram pelo Google ou orgânico?
        </p>
        <p>
          A resposta muda tudo. Se cliente vindo do Meta tem LTV de R$ 340 e cliente vindo do Google tem LTV de R$ 580, você está pagando CAC errado nos dois canais — pode investir mais no Google e ainda assim ter retorno melhor que o Meta no terceiro mês. Sem cohort, ninguém vê isso. Você fica olhando ROAS da semana e acha que o Meta está melhor porque o pixel está mais agressivo.
        </p>
        <p>
          AdSales·Hub gera cohort por mês de aquisição cruzado com canal de origem, mostrando taxa de recompra em 30/60/90/180 dias e LTV acumulado. O painel não é genérico — ele te diz, em linguagem direta: "clientes que entraram em fevereiro pela campanha X tiveram LTV 47% maior que a média; vale escalar criativo similar". É a diferença entre rodar e-commerce no instinto e rodar sabendo o que está fazendo.
        </p>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
