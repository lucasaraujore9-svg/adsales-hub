import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";
import { RoasCalc } from "./roas-calc";

const URL = "https://adsaleshub.7iegroup.com.br/calculadoras/roas";
const TITLE = "Calculadora de ROAS";
const SUBTITLE = "Receita aferida no CRM ÷ investimento real em mídia";

export const metadata: Metadata = {
  title: "Calculadora de ROAS grátis — Retorno sobre Investimento em Anúncios",
  description:
    "Calcule o ROAS da sua campanha em segundos. Descubra se cada real investido em mídia paga está voltando em receita real — não em conversão de plataforma. Grátis, sem cadastro.",
  alternates: { canonical: URL },
  openGraph: { url: URL, title: "Calculadora de ROAS grátis — AdSales·Hub" },
};

const FAQ = [
  {
    q: "O que é ROAS e como calcular?",
    a: "ROAS (Return on Ad Spend) é a divisão entre receita gerada pela campanha e o valor investido nela. Fórmula: ROAS = Receita ÷ Investimento. Exemplo: gastou R$ 1.000 em Meta Ads, gerou R$ 4.500 em vendas fechadas no CRM, ROAS aferido = 4,5×. Cuidado: o número que aparece no Gerenciador de Anúncios costuma ser maior que o real porque conta conversões dentro de janelas generosas de atribuição (1 ou 7 dias após clique, 1 dia view-through).",
  },
  {
    q: "Qual é um bom ROAS?",
    a: "Depende exclusivamente da sua margem de contribuição. ROAS 3-4× é saudável pra produtos com 30-40% de margem. E-commerce competitivo sobrevive em 2-3×, infoproduto em 5-10×, SaaS B2B aceita 1,3-2× porque o LTV alto compensa. O número que importa é o ROAS de breakeven (1 ÷ margem) — abaixo dele, vender mais é prejuízo proporcional.",
  },
  {
    q: "ROAS de plataforma é confiável?",
    a: "Não. O ROAS reportado pelo Meta e Google considera apenas conversões dentro da janela de atribuição da própria plataforma, conta vendas que aconteceriam organicamente, ignora reembolsos e chargebacks, perde tudo que fecha por telefone ou WhatsApp, e infla via view-through (cliente que viu o anúncio sem clicar). Pra ROAS aferido na receita real, é obrigatório atribuição 1:1 — o mesmo identificador acompanha o lead do clique no anúncio até o status Ganho no CRM, com o valor real fechado. É exatamente isso que o AdSales·Hub faz.",
  },
  {
    q: "Por que meu ROAS no Meta caiu de 2025 pra cá?",
    a: "Não caiu — ele só está mais próximo da realidade. iOS 17 com App Tracking Transparency, Safari ITP bloqueando cookies third-party, fim do cookie de terceiros no Chrome e endurecimento do GDPR/LGPD reduziram drasticamente o sinal que o Pixel consegue mandar. O ROAS inflado de antigamente vinha de janelas de atribuição agressivas e view-through generoso. Com Conversions API server-side e deduplicated event_id, o número fica menor mas confiável.",
  },
  {
    q: "Qual a diferença entre ROAS e ROI?",
    a: "ROAS olha só pro gasto de mídia (receita ÷ ad spend). ROI considera todos os custos do negócio: produto, frete, equipe, software, taxa de cartão (lucro líquido ÷ investimento total). ROAS 4× pode dar ROI negativo se sua operação tem custo fixo alto. Use ROAS pra otimizar campanha; use ROI pra decidir se o negócio fecha.",
  },
];

export default function ROASCalcPage() {
  const coverImage = `/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Calculadoras")}&subtitle=${encodeURIComponent(SUBTITLE)}`;

  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Calculadora de ROAS grátis"
        description="Calcule o ROAS das suas campanhas em segundos — com a métrica aferida na receita real."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Calculadora grátis"
        title={TITLE}
        description="Quanto cada real investido em anúncios virou receita real fechada no CRM? Preencha dois campos e veja o resultado, mais o ROAS de breakeven que separa lucro de prejuízo no seu modelo de negócio."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Calculadoras", href: "/recursos" },
          { label: "ROAS" },
        ]}
        cta={{ label: "Quero ROAS aferido na receita real", href: "/signup" }}
        coverImage={coverImage}
        readingMinutes={7}
      >
        <p>
          Existem dois ROAS no seu negócio. O ROAS bonito que aparece no Gerenciador
          de Anúncios do Meta — geralmente entre 6× e 10× pros gestores que adoram
          posto print no LinkedIn — e o ROAS aferido, aquele que sai da divisão
          honesta entre receita real fechada no CRM e o investimento real cobrado no
          cartão da empresa. Quase sempre, o segundo é metade do primeiro. Em alguns
          casos, um terço.
        </p>
        <p>
          A diferença não é uma falha do Meta, é arquitetura. A plataforma precisa
          provar que funciona pra você continuar gastando, então usa janelas de
          atribuição generosas (7 dias após clique, 1 dia view-through), conta
          conversões orgânicas que aconteceriam de qualquer jeito, ignora reembolso e
          chargeback, e simplesmente não enxerga vendas que fecharam no WhatsApp,
          telefone ou na loja física. Honestamente: o número da plataforma é uma
          estimativa otimista, não uma medição.
        </p>
        <p>
          O que separa profissional de amador é entender que o único ROAS que paga
          boleto é o ROAS aferido — receita real ÷ ad spend real. A calculadora
          abaixo te dá essa conta. Mais embaixo, mostro como subir o número, qual ROAS
          perseguir por modelo de negócio, e por que o Meta vai parecer pior em 2026
          (não vai — só vai parar de mentir).
        </p>

        <RoasCalc />

        <h2>O que é ROAS, sem dar volta</h2>
        <p>
          <strong>ROAS</strong> (Return on Ad Spend) é uma divisão. Em cima, a receita
          que a campanha gerou. Embaixo, quanto você gastou em mídia paga pra gerar
          essa receita. O resultado é um múltiplo: ROAS 4× quer dizer que cada R$ 1
          investido virou R$ 4 de receita bruta. Não é margem, não é lucro, não é o
          que sobra no caixa. É só receita sobre gasto de anúncio.
        </p>
        <p>
          Diferente do ROI — que considera custo de produto, equipe, taxa de cartão,
          software, frete, devolução — o ROAS isola exclusivamente a eficiência da
          mídia. Por isso é a métrica favorita de quem opera trafego pago: você quer
          saber se o canal está performando, não se a empresa inteira está dando lucro
          (essa é outra conta).
        </p>
        <p>
          Tem uma armadilha clássica: confundir ROAS com lucratividade. Um ROAS de
          5× num produto com 15% de margem ainda é prejuízo proporcional, porque o
          breakeven seria 6,67×. Já um ROAS 1,5× num SaaS com 80% de margem e LTV
          longo é jackpot. ROAS no vácuo não diz nada — ROAS contra a margem do seu
          produto diz tudo.
        </p>

        <h2>A fórmula que mente vs a fórmula que paga</h2>
        <p>
          A fórmula é a mesma, o que muda é o numerador. Quando o Meta calcula seu
          ROAS, ele soma o valor de todas as conversões que o Pixel registrou dentro
          da janela de atribuição configurada — padrão atual de 7 dias após clique e
          1 dia view-through. Isso significa que se o cliente viu seu anúncio na
          quarta, ignorou, e comprou na terça seguinte porque um amigo recomendou no
          WhatsApp, o Meta ainda atribui aquela venda à campanha. Multiplique isso por
          milhares de eventos e você tem um ROAS que parece mágico.
        </p>
        <p>
          O ROAS aferido funciona diferente. Cada clique no anúncio recebe um
          identificador único (fbclid no Facebook, gclid no Google) que viaja com o
          lead pelo formulário, pela primeira mensagem no WhatsApp, pela ligação do
          SDR, pela proposta enviada e pelo status &quot;Ganho&quot; no CRM. Quando
          a venda fecha, o sistema sabe exatamente qual anúncio originou aquela
          receita — e, importante, sabe quando o lead veio orgânico mesmo (não conta
          como pago).
        </p>
        <table>
          <thead>
            <tr>
              <th>O que o Meta conta</th>
              <th>O que o ROAS aferido conta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Conversão dentro de janela de 7 dias após clique</td>
              <td>Venda real fechada no CRM com fbclid/gclid rastreado</td>
            </tr>
            <tr>
              <td>View-through de 1 dia (viu o anúncio, não clicou, comprou)</td>
              <td>Apenas leads que efetivamente clicaram</td>
            </tr>
            <tr>
              <td>Valor estimado da conversão (modelado)</td>
              <td>Valor exato da venda fechada (R$ negociado)</td>
            </tr>
            <tr>
              <td>Não desconta reembolso, chargeback, cancelamento</td>
              <td>Subtrai automaticamente quando o status muda</td>
            </tr>
            <tr>
              <td>Perde venda por telefone, WhatsApp, loja física</td>
              <td>Captura via Conversions API server-side e deduplicated event_id</td>
            </tr>
          </tbody>
        </table>
        <p>
          Na prática, agências de respeito sabem que precisam aplicar um fator de
          correção em cima do ROAS reportado. Geralmente entre 0,4 e 0,7, dependendo
          do canal de venda. Quem opera com atribuição 1:1 ligada ao CRM não precisa
          chutar — o número certo está na tela.
        </p>

        <h2>Qual ROAS perseguir por modelo de negócio</h2>
        <p>
          Não existe ROAS bom universal. Existe ROAS bom <em>pro seu produto</em>. A
          conta começa pelo ROAS de breakeven (1 ÷ margem de contribuição), que é o
          ponto onde você empata: receita igual a (custo do produto + ad spend). A
          partir dali, cada décimo a mais é margem real.
        </p>
        <table>
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Margem típica</th>
              <th>ROAS de breakeven</th>
              <th>ROAS saudável</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>E-commerce moda/acessório</td>
              <td>50-65%</td>
              <td>~1,8×</td>
              <td>3-4×</td>
              <td>Margem boa, recompra valoriza LTV</td>
            </tr>
            <tr>
              <td>E-commerce moda saudável/nicho</td>
              <td>40-55%</td>
              <td>~2×</td>
              <td>4-5×</td>
              <td>Ticket maior, conversão menor</td>
            </tr>
            <tr>
              <td>E-commerce eletrônico</td>
              <td>10-20%</td>
              <td>~6×</td>
              <td>8-12×</td>
              <td>Margem fina, depende de volume</td>
            </tr>
            <tr>
              <td>SaaS B2B</td>
              <td>70-85%</td>
              <td>~1,3×</td>
              <td>2-3× (no primeiro mês)</td>
              <td>LTV de 18-36 meses paga CAC alto</td>
            </tr>
            <tr>
              <td>Infoproduto / curso digital</td>
              <td>85-95%</td>
              <td>~1,1×</td>
              <td>5-8×</td>
              <td>Lançamentos chegam a 10× no pico</td>
            </tr>
            <tr>
              <td>Serviços (consultoria, agência)</td>
              <td>40-60%</td>
              <td>~2×</td>
              <td>3-5×</td>
              <td>Custo de equipe é o que pesa</td>
            </tr>
            <tr>
              <td>Educação (graduação, pós)</td>
              <td>50-70%</td>
              <td>~1,5×</td>
              <td>4-7×</td>
              <td>Ticket alto, ciclo longo</td>
            </tr>
            <tr>
              <td>Saúde (clínicas, estética)</td>
              <td>50-70%</td>
              <td>~1,5×</td>
              <td>4-6×</td>
              <td>Recompra forte, depende do procedimento</td>
            </tr>
          </tbody>
        </table>
        <p>
          Detalhe importante: esses números são pra <strong>ROAS aferido</strong>. Se
          você está olhando ROAS do Meta sem correção, pode somar uns 30-50% nessa
          coluna pra chegar no equivalente — um e-commerce de moda saudável que
          opera ROAS aferido 4-5× costuma ver 6-8× no Gerenciador de Anúncios. Quem
          confunde os dois superestima o canal e quebra a operação na primeira queda
          de algoritmo.
        </p>

        <h2>5 alavancas pra subir o ROAS de verdade</h2>
        <p>
          Subir ROAS não é mexer no lance ou trocar criativo aleatoriamente. É
          trabalhar cinco alavancas que se multiplicam — cada uma sozinha rende
          pouco; combinadas, dobram o número em 60-90 dias.
        </p>
        <ol>
          <li>
            <strong>Subir ticket médio (a alavanca mais subestimada).</strong> ROAS
            sobe linearmente com ticket. Order bump de R$ 47 num produto de R$ 197
            sobe ticket em 24% e ROAS no mesmo percentual, sem mexer em nada da
            campanha. Upsell pós-compra, kit, frete grátis acima de X, parcelamento
            sem juros — tudo isso é ROAS escondido.
          </li>
          <li>
            <strong>Aumentar taxa de conversão da landing page.</strong> Mesma
            quantidade de cliques, mais vendas, mesmo gasto = ROAS maior. Página
            rápida (sub-2s), prova social no topo (não no rodapé), CTA único e
            primário, formulário de 3 campos máximo, vídeo de 30s do produto em uso.
            Saltar de 1,8% pra 2,5% de conversão é 39% a mais de ROAS.
          </li>
          <li>
            <strong>Reduzir CPM com criativo nativo.</strong> Anúncio que parece UGC
            (vídeo vertical sem corte, áudio cru, sem logo gigante no canto) tem CPM
            30-50% menor porque o algoritmo entende como conteúdo, não publicidade.
            Mesmo budget compra mais impressão, mais clique, mais venda. ROAS sobe
            sem você fazer nada além de gravar diferente.
          </li>
          <li>
            <strong>Otimizar pra evento de fundo, não topo.</strong> Otimizar pra
            ViewContent ou Lead enche a campanha de gente curiosa. Otimizar pra
            Purchase ou InitiateCheckout (com Conversions API ligada e
            event_match_quality acima de 7) faz o Meta encontrar quem realmente
            compra. Custo por lead sobe, custo por venda cai, ROAS dispara.
          </li>
          <li>
            <strong>Cortar a cauda longa de campanhas zumbi.</strong> 80% do ROAS
            costuma vir de 20% das campanhas. O resto é budget vazando. Auditoria
            mensal: tudo abaixo do ROAS de breakeven é desligado, budget vai pras
            campanhas vencedoras (com cuidado pra não saturar audiência). Esse
            movimento sozinho recupera 15-25% de eficiência.
          </li>
        </ol>

        <h2>Por que o número da Meta vai cair em 2026 (e tudo bem)</h2>
        <p>
          Quem opera trafego pago há 5+ anos lembra de quando o Pixel via tudo. Cookie
          de terceiro funcionava, browser não bloqueava nada, ATT da Apple ainda não
          existia. ROAS reportado batia razoavelmente com ROAS real. Aqueles tempos
          acabaram, e 2026 é o ano em que os últimos restos de tracking client-side
          vão pro caixão.
        </p>
        <p>
          Três forças jogando contra o número que você vê na tela:
        </p>
        <ul>
          <li>
            <strong>iOS 17+ e App Tracking Transparency.</strong> Cerca de 75% dos
            usuários de iPhone no Brasil clicam &quot;Pedir ao app que não rastreie&quot; quando
            abrem Instagram ou Facebook. Sem o IDFA, o Meta perde a capacidade de
            confirmar conversão em quase metade da audiência mobile premium. Modela
            (estima) o que falta — e modelo subestima ou superestima dependendo do
            algoritmo do mês.
          </li>
          <li>
            <strong>Safari ITP e Chrome sem cookie third-party.</strong> Intelligent
            Tracking Prevention bloqueia cookies de domínio terceiro em 7 dias no
            Safari. O Chrome, depois de adiar três vezes, está finalmente
            descomissionando o cookie 3rd party em 2026. Resultado: o Pixel
            client-side perde sinal massivo no desktop também, não só no mobile.
          </li>
          <li>
            <strong>LGPD e cookie consent obrigatório.</strong> Banner de cookie com
            opção real de recusar (não aquele botão escondido) reduz coleta de evento
            em 20-40% dependendo da implementação. Quem ainda usa dark pattern vai
            apanhar de processo em 2026.
          </li>
        </ul>
        <p>
          A solução é tracking server-side via <strong>Conversions API</strong> com
          deduplicated event_id (mesmo evento mandado pelo Pixel e pelo servidor, com
          ID único pra Meta saber que é a mesma conversão e não contar duas vezes). E,
          principalmente, atribuição 1:1 ligada ao CRM — porque mesmo a Conversions
          API depende de você dizer ao Meta &quot;essa venda aqui veio daquele
          clique&quot;. O AdSales·Hub faz exatamente isso de forma nativa: captura
          fbclid no formulário, persiste no contato, dispara Purchase via CAPI quando
          o negócio entra em &quot;Ganho&quot;, e devolve o valor real fechado pro
          algoritmo otimizar.
        </p>
        <p>
          Quem vai chorar em 2026 é quem nunca olhou ROAS aferido. O Gerenciador vai
          mostrar números 30-50% piores que em 2024 e o gestor sem CRM integrado vai
          achar que a operação quebrou. Quem já trabalha com receita aferida no CRM
          desde sempre, não vê diferença — porque pra ele, Meta nunca foi a fonte da
          verdade. Era só uma ferramenta de compra de mídia.
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
