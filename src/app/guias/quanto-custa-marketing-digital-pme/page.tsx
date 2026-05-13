import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/guias/quanto-custa-marketing-digital-pme";
const TITLE = "Quanto custa marketing digital pra PME em 2026 — números reais";
const SUBTITLE = "Faixas reais por porte, agência vs internalizado e onde PMEs queimam dinheiro";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Faixas reais de investimento em marketing digital pra PME brasileira: agência vs internalizado, mídia, ferramentas e ROI esperado por porte.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "Quanto uma PME deveria investir em marketing por mês?",
    a: "Regra prática que funciona no Brasil: 5-10% do faturamento bruto pra empresa estabelecida e 15-25% em fase de crescimento agressivo. Empresa de R$ 50k/mês de faturamento investe entre R$ 2.500 (manutenção) e R$ 12.500 (modo crescimento). E 'investimento' aqui é tudo somado: mídia + pessoas + ferramentas + conteúdo, não só o que vai pro Meta.",
  },
  {
    q: "Vale mais agência ou internalizar com plataforma?",
    a: "Agência cobra R$ 5.000-15.000/mês de fee + mídia. Internalizar com plataforma unificada + 1 pessoa interna fica em R$ 1.500-3.000/mês de stack + salário (R$ 4.000-8.000) + mídia. Ponto de virada: a partir de R$ 3.000-5.000/mês de mídia, internalizar quase sempre paga em 4-8 meses. Abaixo disso, freelancer + plataforma faz mais sentido que agência.",
  },
  {
    q: "Quanto custam só as ferramentas no modelo tradicional?",
    a: "Stack fragmentado típico: CRM (R$ 600), e-mail marketing (R$ 400), automação (R$ 600), WhatsApp Business API (R$ 300), agendamento (R$ 100), analytics/BI (R$ 200). Total perto de R$ 2.200/mês, sem contar tempo de conciliar planilha entre as ferramentas. Plataforma unificada como AdSales·Hub começa em R$ 290 (Operação) e o plano Crescimento fica em R$ 690.",
  },
  {
    q: "Quanto tempo até começar a dar resultado?",
    a: "Meta Ads em conta nova: 2-4 semanas pra sair da fase de aprendizagem (50 conversões/ad set/semana). CAC payback em e-com saudável: 1-3 meses. Em B2B com ticket maior: 6-12 meses. Se passou 90 dias gastando R$ 5k+/mês e não sabe o CAC nem o ROAS, o problema não é a mídia — é instrumentação.",
  },
  {
    q: "Faz sentido pagar agência + freelancer + ferramenta ao mesmo tempo?",
    a: "Quase nunca. A gente vê isso semana sim, semana não: empresa paga agência R$ 8k, gestor freelancer R$ 2k pra 'fiscalizar' a agência e mais R$ 2k em ferramentas que ninguém usa. Resultado: R$ 12k/mês em overhead pra operação que internalizada custaria R$ 6k. Quando algo dá errado, ninguém é dono.",
  },
];

export default function QuantoCustaPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Quanto custa marketing digital pra PME em 2026"
        description="Números reais por faixa de operação, comparativo agência vs internalizado e roteiro pra cortar 30-40% do custo."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Guia"
        title="Quanto custa marketing digital pra PME em 2026"
        description="Sem estimativa por baixo nem otimismo de vendedor de SaaS. Números reais de operações brasileiras de R$ 30k até R$ 500k/mês de faturamento — e onde a maioria queima 30-40% do orçamento sem perceber."
        updatedAt="01 de maio de 2026"
        readingMinutes={12}
        coverImage={`/api/og?title=${encodeURIComponent(TITLE)}&category=Guias&subtitle=${encodeURIComponent(SUBTITLE)}`}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Guias", href: "/recursos" },
          { label: "Quanto custa marketing digital" },
        ]}
        cta={{ label: "Reduzir custo da operação", href: "/signup" }}
      >
        <p>
          A PME brasileira média que paga agência hoje gasta entre <strong>R$ 12.000 e R$ 28.000 por mês</strong>{" "}
          em marketing — e cerca de 30 a 40% disso some em overhead que não vira venda. Não é mídia ruim,
          não é criativo fraco: é estrutura. É a soma de cinco SaaS que não conversam, fee de agência que
          paga reunião, freelancer fiscalizando freelancer, e a planilha de domingo à noite tentando
          descobrir qual canal trouxe quais leads.
        </p>
        <p>
          Esse guia abre os números reais por faixa de faturamento, com casos concretos de operações que
          a gente acompanha. Não é teoria de blog gringo nem benchmark do Gartner: é o que sai do
          extrato bancário de PME brasileira em 2026, com câmbio, com imposto, com Pix de freelancer
          atrasado. No fim, tem um plano objetivo pra cortar 30-40% do custo sem cortar resultado —
          que é o que a maioria descobre quando para pra olhar a planilha de verdade.
        </p>

        <h2>Os 5 componentes do custo (e onde cada centavo vai parar)</h2>
        <p>
          Quando o dono da PME pergunta "quanto gasto em marketing?", ele normalmente responde só com a
          mídia paga — o que sai do cartão pro Meta e pro Google. Esse é o erro número um. O custo real
          da operação tem cinco componentes, e em quase toda PME brasileira a mídia é menos da metade
          do total. As outras quatro categorias somadas pesam mais — e são exatamente as que ninguém
          mede direito.
        </p>
        <p>
          Antes de comparar faixas e modelos, vale destrinchar. Cada R$ 1 que entra em marketing
          digital vai pra um destes cinco baldes:
        </p>
        <ol>
          <li>
            <strong>Mídia paga</strong> — Meta Ads, Google Ads, TikTok Ads, LinkedIn. Pago direto pra
            plataforma. É o componente mais visível e o único que aparece em dashboard. PME pequena
            costuma representar 30-50% do bolo total; PME grande, 50-70%.
          </li>
          <li>
            <strong>Pessoas</strong> — agência (fee fixo), gestor de tráfego freelancer, social media,
            redator, designer, ou time CLT/PJ interno. É o componente mais caro e o mais subestimado.
            Honestamente, a maioria das PMEs descobre que paga 2-3 prestadores duplicando função.
          </li>
          <li>
            <strong>Ferramentas SaaS</strong> — CRM, e-mail marketing, automação, WhatsApp Business
            API, agendamento, analytics, encurtador de link, ferramenta de criativo, banco de imagem.
            Stack tradicional fragmentado fica em R$ 2.000-4.000/mês fácil, e ninguém sabe quais
            assinaturas ainda estão ativas.
          </li>
          <li>
            <strong>Conteúdo</strong> — produção de vídeo, foto de produto, copywriting, edição,
            legendagem, locução, design de criativo. Pode ser interno, pode ser pacote de agência, pode
            ser freelancer por demanda. Em e-com de moda e beleza, esse balde explode rápido.
          </li>
          <li>
            <strong>Outros</strong> — eventos, brindes, patrocínio local, participação em feira,
            material impresso, influenciador. Não é digital puro, mas tem que entrar na conta porque
            disputa o mesmo orçamento.
          </li>
        </ol>
        <p>
          Quem nunca separou esses cinco baldes, separe agora antes de continuar lendo. Vai ver coisa
          esquisita — assinatura de R$ 400/mês de ferramenta que ninguém abre desde 2024, freelancer
          recebendo R$ 1.500 fixo pra "ajudar com posts" sem entregável definido. Esse é o ponto de
          partida.
        </p>

        <h2>Faixa 1: PME pequena (faturamento até R$ 50k/mês)</h2>
        <p>
          Aqui é a fase de validar canais. A pergunta que importa não é "quanto gastar?", é "consigo
          provar que mídia paga gera retorno antes de escalar?". Operação enxuta, dono ainda metendo a
          mão, time de 2 a 5 pessoas, sem CMO, sem head de marketing. Se eu tivesse uma loja de moda
          fazendo 80 pedidos por mês, ou uma consultoria de TI com ticket de R$ 5k fechando 3
          contratos no trimestre, é nessa faixa que eu estaria.
        </p>
        <p>
          O erro mais comum nessa fase é contratar agência cara achando que vai virar o jogo. Não vira.
          Agência boa custa R$ 5k+ de fee, e numa operação que fatura R$ 30-50k/mês, isso é 10-15% do
          faturamento só de honorário, antes de gastar R$ 1 em mídia. O que funciona aqui é
          freelancer bom + plataforma unificada + dono próximo da operação. Os números:
        </p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Investimento mensal</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mídia paga (Meta + Google)</td>
              <td>R$ 1.500 - 3.000</td>
              <td>70% Meta, 30% Google na média</td>
            </tr>
            <tr>
              <td>Plataforma unificada (CRM + e-mail + WA)</td>
              <td>R$ 290 - 690</td>
              <td>AdSales·Hub Operação ou Crescimento</td>
            </tr>
            <tr>
              <td>Gestor freelancer (10-15h/semana)</td>
              <td>R$ 1.500 - 3.000</td>
              <td>Por projeto, não exclusividade</td>
            </tr>
            <tr>
              <td>Conteúdo avulso (foto/vídeo/copy)</td>
              <td>R$ 500 - 1.500</td>
              <td>Pacote mensal de 8-12 peças</td>
            </tr>
            <tr>
              <td><strong>Total típico</strong></td>
              <td><strong>R$ 3.800 - 8.200</strong></td>
              <td>~10-16% do faturamento</td>
            </tr>
          </tbody>
        </table>
        <p>
          Caso real do tipo: pet shop com loja física + delivery, faturamento de R$ 42k/mês, gasta R$
          2.200 em Meta Ads, R$ 290 na plataforma, R$ 1.800 num freelancer que mexe campanha 3x por
          semana e R$ 800 num pacote de criativo. Total R$ 5.090. CPL de R$ 18, taxa de conversão
          lead-cliente de 22%, CAC de R$ 82, ticket médio R$ 240, payback no primeiro pedido. É
          operação saudável e replicável.
        </p>

        <h2>Faixa 2: PME média (R$ 50k - R$ 200k/mês de faturamento)</h2>
        <p>
          Essa é a faixa onde a decisão de internalizar ou contratar agência fica mesmo dura — e onde
          a maioria erra. A operação já validou que mídia paga funciona, o volume começou a justificar
          dedicação exclusiva, mas montar time interno parece risco e contratar agência parece
          desperdício. Olha, a gente vê isso semana sim, semana também: empresário trava nessa
          decisão por meses, paga agência sem saber direito o que recebe, e quando vai medir descobre
          que poderia ter internalizado economizando R$ 10k/mês.
        </p>
        <p>
          O comparativo abaixo é com números reais de duas operações de R$ 120k/mês de faturamento que
          a gente acompanha — uma com agência tradicional, outra internalizada com plataforma. Mesmo
          segmento (e-commerce de moda), mesmo ticket médio (R$ 280), mesmo investimento de mídia.
        </p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Modelo Agência</th>
              <th>Modelo Internalizado + Plataforma</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mídia paga (Meta + Google)</td>
              <td>R$ 8.000 - 15.000</td>
              <td>R$ 8.000 - 15.000</td>
            </tr>
            <tr>
              <td>Fee da agência</td>
              <td>R$ 6.500 - 12.000</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Salário interno (1 gestor + 1 social)</td>
              <td>—</td>
              <td>R$ 7.500 - 13.000</td>
            </tr>
            <tr>
              <td>Plataforma + ferramentas</td>
              <td>R$ 800 - 1.400 (CRM básico só)</td>
              <td>R$ 690 (Crescimento, tudo incluso)</td>
            </tr>
            <tr>
              <td>Produção de conteúdo</td>
              <td>incluso (mas limitado)</td>
              <td>R$ 1.500 - 3.500</td>
            </tr>
            <tr>
              <td>Gestor freelancer "fiscalizando"</td>
              <td>R$ 1.500 - 3.000 (comum)</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>Total mensal</strong></td>
              <td><strong>R$ 16.800 - 31.400</strong></td>
              <td><strong>R$ 17.690 - 32.190</strong></td>
            </tr>
          </tbody>
        </table>
        <p>
          Custo nominal parecido, mas tem três diferenças que decidem o jogo no médio prazo. Primeira:
          o conhecimento fica em casa. Quando o gestor interno otimiza um público que converte, esse
          aprendizado vira processo da empresa. Quando a agência otimiza, o aprendizado sai junto se
          você trocar de agência (e você vai trocar — média de retenção é 18 meses). Segunda:
          velocidade de iteração. Time interno testa criativo no mesmo dia; agência testa no próximo
          ciclo de aprovação. Terceira: economia de escala. Próxima pessoa interna custa marginal
          baixo (R$ 4-6k); próxima linha de fee de agência custa mais que isso.
        </p>
        <p>
          <strong>Quando a agência ainda vale nessa faixa:</strong> ticket muito alto (B2B enterprise
          de R$ 50k+), necessidade de criativo nível cinema (vídeo com locação, modelo, direção), ou
          marca que precisa de estratégia robusta de posicionamento. Pra e-commerce de moda, beleza,
          serviço local, infoproduto, SaaS com ticket até R$ 5k — internalizar quase sempre ganha.
        </p>

        <h2>Faixa 3: PME grande (R$ 200k+/mês de faturamento)</h2>
        <p>
          Operação madura, time de marketing já existe, agência (se houver) é parceira pontual de
          estratégia ou criativo, não dona da operação. Aqui o problema deixou de ser "quanto investir"
          e passou a ser "como medir bem o que estou investindo". A preocupação muda de eficiência
          tática (CPL, CTR) pra eficiência estratégica (LTV/CAC, payback consolidado, contribuição de
          canal). Os números:
        </p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Investimento mensal</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mídia paga (multi-canal)</td>
              <td>R$ 25.000 - 80.000</td>
              <td>Meta + Google + TikTok + LinkedIn</td>
            </tr>
            <tr>
              <td>Time interno (3-5 pessoas)</td>
              <td>R$ 22.000 - 40.000</td>
              <td>Head + 2 gestores + social + designer</td>
            </tr>
            <tr>
              <td>Plataforma Escala + integrações</td>
              <td>R$ 1.490 - 3.500</td>
              <td>AdSales·Hub Escala + APIs custom</td>
            </tr>
            <tr>
              <td>Agência (estratégia/criativo pontual)</td>
              <td>R$ 5.000 - 15.000</td>
              <td>Por projeto, não fee fixo</td>
            </tr>
            <tr>
              <td>Produção pesada (vídeo, design, foto)</td>
              <td>R$ 5.000 - 15.000</td>
              <td>Casa de produção ou freelancer dedicado</td>
            </tr>
            <tr>
              <td><strong>Total mensal</strong></td>
              <td><strong>R$ 58.490 - 153.500</strong></td>
              <td>~7-12% do faturamento</td>
            </tr>
          </tbody>
        </table>
        <p>
          Caso real do tipo: SaaS B2B com ticket médio anual de R$ 18k, faturamento de R$ 380k/mês,
          gasta R$ 65k em mídia (30% Google, 30% Meta, 25% LinkedIn, 15% testes), tem head de
          marketing + 2 gestores + designer interno (R$ 32k de folha), R$ 1.490 de plataforma, R$ 8k
          em agência pontual pra campanha trimestral e R$ 9k em produção. Total R$ 115k/mês. ROAS
          consolidado de 4,2x, CAC payback em 11 meses, LTV/CAC de 6,8x. Operação saudável que justifica
          escalar mais.
        </p>

        <h2>Os 4 erros que custam caro (e que quase toda PME comete)</h2>
        <p>
          Antes de falar do plano de corte, é honesto listar os erros que a gente vê com mais
          frequência. Não são erros teóricos — são padrões reais que aparecem em mais da metade das
          operações que a gente audita. Se você reconhecer um, já vale o tempo de leitura.
        </p>
        <h3>1. Stack fragmentado de 5 a 7 SaaS que não conversam</h3>
        <p>
          CRM num lugar, e-mail marketing em outro, automação em terceiro, WhatsApp Business numa
          ferramenta gringa, agendamento separado, BI improvisado em planilha. Custa R$ 2.500 a 4.500
          por mês só de assinatura, e ninguém consegue responder "qual canal trouxe esse cliente?"
          sem montar planilha no domingo. Mais grave: a falta de atribuição faz você gastar mais no
          canal errado por meses. Plataforma unificada resolve as duas dores: corta o custo do stack
          e devolve a atribuição nativa.
        </p>
        <h3>2. Agência + gestor freelancer + social media freela ao mesmo tempo</h3>
        <p>
          Empilhar prestadores cria zona cinzenta de responsabilidade. Quando a campanha derrete, a
          agência diz que o problema é o criativo do social, o social diz que o problema é o público
          que o gestor mexeu, o gestor diz que o problema é o briefing da agência. Ninguém é dono.
          Custo somado fica entre R$ 10k e R$ 18k/mês pra fazer trabalho que um time interno de duas
          pessoas faz por R$ 8k com mais clareza.
        </p>
        <h3>3. Gastar mídia sem instrumentação de atribuição</h3>
        <p>
          Esse é o mais caro de todos. Empresa gasta R$ 15k/mês em Meta Ads há 18 meses, dashboard
          mostra ROAS de 4x, mas quando cruza com vendas reais no CRM descobre que metade dos leads
          que o Meta atribui já era cliente da base orgânica. ROAS real fica em 2,1x. Sem Conversions
          API, sem UTM consistente, sem CRM ligado à mídia, você está pilotando no escuro com mapa
          desatualizado. Cada mês desse vale R$ 5-10k em mídia mal alocada.
        </p>
        <h3>4. Comprar ferramenta pela funcionalidade individual, não pela operação</h3>
        <p>
          PME de 8 funcionários assinando HubSpot Enterprise porque "tem tudo" e usando 8% das
          features. Salesforce porque o consultor recomendou. RD Station + Pipedrive + Mailchimp
          porque cada um resolve uma dor isolada. O custo agregado fica em R$ 3-5k/mês pra capacidade
          que uma plataforma unificada de PME entrega por R$ 690. Não é falta de feature — é excesso
          de feature paga e não usada.
        </p>

        <h2>ROI esperado por faixa (e o que é sinal de problema)</h2>
        <p>
          Marketing digital saudável tem benchmarks razoavelmente estáveis no Brasil — variam por
          segmento, mas as faixas de "tá saudável" vs "tem problema" são parecidas. Use isso como
          régua, não como meta absoluta:
        </p>
        <ul>
          <li>
            <strong>Faixa 1 (até R$ 50k/mês de faturamento):</strong> ROAS 3-4x consolidado, CAC
            payback de 1-3 meses em e-com e 4-6 meses em serviço, CPL razoável pro segmento (R$
            10-50 em B2C local, R$ 50-150 em B2B de ticket médio).
          </li>
          <li>
            <strong>Faixa 2 (R$ 50-200k/mês):</strong> ROAS 3-5x, CAC payback de 3-6 meses, MQL/dia
            consistente (8-25), taxa MQL→SQL acima de 30%, taxa SQL→cliente acima de 20%.
          </li>
          <li>
            <strong>Faixa 3 (R$ 200k+/mês):</strong> ROAS 4-6x consolidado multi-canal, CAC payback
            de 6-12 meses (e-com) ou 12-18 meses (SaaS B2B), LTV/CAC de pelo menos 3x, churn mensal
            abaixo de 3% em SaaS.
          </li>
        </ul>
        <p>
          Se você está significativamente abaixo desses números por mais de 90 dias, o problema
          raramente é mídia — é instrumentação, atribuição ou estrutura de operação. Trocar de
          agência não resolve. Aumentar verba não resolve. O que resolve é parar e olhar os 5
          componentes do custo com calma.
        </p>

        <h2>Plano pra cortar 30-40% do custo sem cortar resultado</h2>
        <p>
          Esse é o plano que a gente aplica quando uma PME chega com operação inflada. Não é mágica,
          é faxina. Funciona em qualquer faixa, e na média devolve R$ 4-12k/mês de gordura sem
          mexer em uma única campanha. Os passos, em ordem:
        </p>
        <ol>
          <li>
            <strong>Audite o stack de SaaS — todas as assinaturas dos últimos 12 meses.</strong>{" "}
            Liste tudo, custo unitário e mensal, e marque quem realmente usa cada uma. A média que a
            gente encontra: 30-40% das ferramentas pagas há mais de 6 meses não têm uso ativo.
            Cancelar isso é dinheiro de volta no caixa no mês seguinte.
          </li>
          <li>
            <strong>Mapeie os prestadores e o que cada um entrega de fato.</strong> Agência, gestor
            freelancer, social media, redator. Pra cada um, escreva em uma linha o que ele entregou
            no último mês. Se não couber em uma linha objetiva (ou se duas pessoas fazem a mesma
            coisa), tem sobreposição pra resolver.
          </li>
          <li>
            <strong>Decida o modelo: agência, internalizado ou híbrido.</strong> Use a régua dos R$
            3-5k/mês de mídia como ponto de virada. Acima disso, internalizar quase sempre ganha.
            Abaixo, freelancer + plataforma é mais eficiente.
          </li>
          <li>
            <strong>Consolide ferramentas em plataforma unificada.</strong> CRM + pipeline +
            e-mail + WhatsApp + automação + relatórios numa única assinatura. Economia média de R$
            1.500-3.500/mês só nesse passo, e ganho enorme de atribuição porque os dados ficam
            conectados nativamente.
          </li>
          <li>
            <strong>Instrumente atribuição antes de mexer em campanha.</strong> Conversions API
            ativa, UTM padronizado, CRM ligado à mídia, eventos de fundo de funil mapeados. Sem isso
            você não consegue cortar com segurança — vai cortar o canal errado.
          </li>
          <li>
            <strong>Reavalie o orçamento de mídia por canal com dados de 60-90 dias.</strong> Quase
            sempre 1 ou 2 canais carregam 70% do resultado. Realoque verba do canal fraco pro canal
            forte e teste 1 canal novo por trimestre, não 4 ao mesmo tempo.
          </li>
        </ol>
        <p>
          Aplicado de ponta a ponta, esse plano costuma devolver 30-40% do custo da operação no
          primeiro trimestre, sem perder volume de lead nem queda de venda. A maior parte da
          economia vem dos passos 1, 2 e 4 — que não dependem de mexer em campanha, dependem de
          parar e olhar a planilha de verdade.
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
