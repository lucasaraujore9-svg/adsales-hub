import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/glossario/atribuição";
const TITLE_OG = encodeURIComponent("O que é atribuição de marketing");
const SUBTITLE_OG = encodeURIComponent("Modelos, ROAS real e atribuição 1:1 do clique à receita");

export const metadata: Metadata = {
  title: "O que é atribuição de marketing — modelos e como escolher",
  description:
    "First-touch, last-touch, multi-touch, time-decay, U-shape, data-driven. Modelos de atribuição explicados sem enrolação, com casos reais e o que é atribuição 1:1 deterministic do clique à receita.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "O que é atribuição em marketing?", a: "É como você decide qual canal, campanha ou anúncio levou o crédito por uma venda. Sem atribuição, dois canais reportam 100% da mesma venda — e você não sabe qual está mentindo, qual está só esticando a janela e qual realmente trouxe o cliente." },
  { q: "Qual o melhor modelo de atribuição?", a: "Não existe um vencedor universal. Last-touch é prático mas dá crédito demais ao último clique. First-touch ignora todo o caminho do meio. Os multi-touch (linear, time-decay, U-shape) são mais justos mas precisam de volume e tracking decente. Pra negócio real, o que destrava decisão é atribuição 1:1 deterministic: cada lead carrega um ID do clique até o ganho no CRM." },
  { q: "Por que atribuição importa?", a: "Porque sem ela você corta canal errado. O caso clássico: ecom olha last-touch, vê 90% da receita vindo do Meta, mata Google. No mês seguinte, Meta cai junto — porque era o Google que enchia o topo de funil que o Meta fechava. Atribuição é o que separa decisão de chute." },
  { q: "Qual a diferença entre atribuição da plataforma e atribuição 1:1?", a: "A plataforma (Meta, Google, TikTok) usa o próprio modelo dela, normalmente last-click numa janela de 7 dias de clique e 1 dia de view. Como cada uma só enxerga o que aconteceu dentro dela, todas reclamam crédito por leads que se cruzaram. Atribuição 1:1 vive no seu CRM: o ID do clique entra com o lead, atravessa o funil e volta a fechar com a receita real do negócio ganho." },
  { q: "O que é Conversions API e por que ela importa pra atribuição?", a: "Conversions API (CAPI) é o tracking server-side do Meta. Em vez de depender de pixel no navegador (que iOS, AdBlock e cookies de terceiros estão matando), o seu servidor envia o evento direto pro Meta com o ID do lead. Isso devolve sinal pra otimização da campanha sem depender do navegador do usuário — e sem isso, o algoritmo do Meta otimiza no escuro." },
];

export default function AtribuicaoGlossaryPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="O que é atribuição de marketing" description="Modelos de atribuição, ROAS real e atribuição 1:1 deterministic." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Glossário"
        title="O que é atribuição de marketing"
        description="Atribuição é como você descobre qual canal, campanha ou anúncio realmente gerou cada venda. Sem atribuição, dois canais cobram 100% da mesma receita e você gasta no escuro."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Glossário", href: "/recursos" },
          { label: "Atribuição" },
        ]}
        cta={{ label: "Quero atribuição 1:1 nativa", href: "/signup" }}
        coverImage={`/api/og?title=${TITLE_OG}&category=Glossário&subtitle=${SUBTITLE_OG}`}
        readingMinutes={7}
      >
        <p>
          Você abre o painel do Meta numa segunda de manhã. Ele diz que fechou
          R$ 84 mil em vendas no mês. Você abre o Google Ads. Ele diz que fechou
          R$ 76 mil. Soma dá R$ 160 mil. Você olha o caixa da empresa no mesmo
          mês: R$ 92 mil. Bem-vindo ao problema da atribuição. Duas plataformas
          reportando 100% da mesma venda — porque cada uma só enxerga o que
          aconteceu dentro dela, e cada uma puxa o crédito pra si dentro de uma
          janela generosa. Sem um modelo do seu lado pra arbitrar essa briga,
          você vai gastar mais no canal que grita mais alto, não no que vende mais.
        </p>

        <h2>O que atribuição realmente responde</h2>
        <p>
          <strong>Atribuição de marketing</strong> é o processo de decidir
          qual canal, campanha ou interação leva o crédito por uma conversão —
          e quanto desse crédito leva. Parece técnico, mas a pergunta é
          comercial: <em>de onde veio essa venda, e onde eu coloco o próximo
          real do orçamento?</em> Se você não responde isso com método, está
          respondendo com sentimento. E sentimento, em mídia paga, custa caro.
        </p>
        <p>
          Honestamente: a maioria das empresas que conheço usa last-click do
          Google Analytics como verdade absoluta e nunca questionou. Funciona
          até o dia em que funciona. No primeiro mês ruim, ninguém sabe se o
          problema foi criativo, público, sazonalidade ou se o canal que
          alimentava o resto foi cortado seis semanas atrás porque “não convertia”.
        </p>

        <h2>Os cinco modelos clássicos — e o que cada um esconde</h2>
        <p>
          Antes de falar do que funciona pra negócio com CRM, vale entender os
          cinco modelos que toda ferramenta de analytics oferece. Eles não são
          inúteis — são lentes diferentes pra um mesmo dado. O problema é
          confundir lente com realidade.
        </p>

        <h3>First-touch — quem trouxe pra festa</h3>
        <p>
          Dá 100% do crédito pro primeiro toque. Útil quando você quer entender
          de onde vem awareness, qual canal é bom em <em>introduzir</em> a marca
          pra gente que nunca te ouviu falar. É o modelo dos times de
          branding e topo de funil. Mente sobre o fundo: faz parecer que o
          canal de descoberta está fechando vendas sozinho, quando na verdade
          ele só abriu a porta seis semanas antes.
        </p>

        <h3>Last-touch — o crédito do golpe final</h3>
        <p>
          Dá 100% pro último clique. É o padrão da maioria das ferramentas
          (incluindo Google Analytics histórico) porque é o mais fácil de
          calcular. O que ninguém te conta: ele superestima brutalmente canais
          de captura final como busca de marca, retargeting e e-mail —
          justamente os canais que aparecem no fim porque <em>outro canal</em>
          fez o trabalho pesado antes. Se você decidir orçamento por last-touch,
          vai cortar topo de funil. E aí, três meses depois, vai sentar pra
          entender por que “o retargeting parou de funcionar”.
        </p>

        <h3>Linear — democracia ingênua</h3>
        <p>
          Divide o crédito igualmente entre todos os toques. Justo na aparência,
          ingênuo na prática: trata uma impressão acidental de display com o
          mesmo peso de uma reunião agendada. Usado raramente como modelo
          principal, às vezes como sanity check contra last-touch.
        </p>

        <h3>Time-decay — quanto mais perto, mais peso</h3>
        <p>
          Toques mais recentes pesam mais que os antigos. A curva é geralmente
          exponencial — um toque de ontem vale dez vezes mais que um de trinta
          dias atrás. Bom pra ciclos de venda curtos (ecom, infoproduto), onde
          a memória da semana realmente conta mais que a memória do mês passado.
          Ainda enviesado pro fim do funil, só que de forma mais suave.
        </p>

        <h3>U-shape (position-based) — começo e fim importam</h3>
        <p>
          Dá 40% pro primeiro toque, 40% pro último, 20% distribuído no meio.
          O modelo favorito de quem vende B2B com ciclo de 30 a 90 dias: ele
          reconhece que descobrir a marca e fechar a venda são os dois momentos
          que mais movem o ponteiro, sem ignorar tudo que aconteceu no meio.
          Não é perfeito, mas é o melhor compromisso entre simplicidade e justiça
          na maioria das operações de venda consultiva.
        </p>

        <h2>Por que o ROAS da plataforma sempre engana</h2>
        <p>
          Cada plataforma tem atribuição interna própria. O Meta padroniza
          last-click numa janela de 7 dias de clique e 1 dia de view. O Google
          faz parecido com data-driven próprio. O TikTok mais agressivo ainda.
          Como cada uma só enxerga eventos dentro do seu jardim murado, e como
          todas reivindicam crédito por qualquer toque dentro da janela, é
          matematicamente garantido que <strong>a soma dos ROAS das
          plataformas vai exceder a sua receita real</strong>. Isso não é bug,
          é desenho — cada uma quer mostrar pro anunciante que está performando.
        </p>
        <p>
          O caso que sempre conto: ecom de moda, faturamento de R$ 1,2 milhão
          mês, gastando 60% do orçamento de mídia no Meta porque o relatório
          last-touch dizia que Meta gerava 90% da receita. Decidiram cortar
          Google. No mês seguinte, faturamento caiu 28%. Foram olhar atribuição
          1:1 no CRM e descobriram: o Google trazia <strong>60% do topo de
          funil</strong> — a primeira visita, o primeiro clique, o primeiro
          contato com a marca. O Meta só fechava o que o Google enchia. Cortaram
          o motor pensando que estavam cortando o pneu reserva.
        </p>

        <h2>Atribuição 1:1 deterministic — a fonte da verdade</h2>
        <p>
          Em vez de modelo estatístico que tenta adivinhar com base no
          histórico, atribuição 1:1 (também chamada de <em>deterministic
          attribution</em>) faz o caminho contrário: cria uma identidade única
          por lead e segue ela do clique no anúncio até o negócio ganho no CRM.
          O fluxo é o seguinte:
        </p>
        <ol>
          <li>O clique no anúncio gera um <code>click_id</code> único (UTM + cookie + fingerprint do navegador).</li>
          <li>O lead preenche o formulário ou abre o WhatsApp — o ID viaja junto, gravado no contato do CRM.</li>
          <li>Esse ID acompanha o lead em cada movimento do pipeline: qualificação SDR, reunião marcada, proposta enviada, contrato assinado.</li>
          <li>Em paralelo, a Conversions API devolve esse ID pro Meta a cada estágio relevante — lead, MQL, oportunidade, ganho — pra alimentar a otimização do algoritmo no servidor, sem depender do pixel do navegador.</li>
          <li>Quando o negócio vira “Ganho” com R$ X de receita, o sistema atribui <strong>100% desse R$ X</strong> à campanha, ad set, criativo e palavra-chave originais.</li>
        </ol>
        <p>
          Resultado: ROAS aferido em receita real recebida, não em conversão
          declarada por plataforma. Você descobre que a campanha A tem ROAS
          declarado de 8x no Meta, mas ROAS real de 2,1x. E que a campanha B,
          que parecia mediana com 3x declarado, na verdade está em 5,4x real
          porque os leads dela fecham mais rápido e com ticket maior. É outro jogo.
        </p>

        <h2>E o data-driven? E o MMM?</h2>
        <p>
          Existem dois primos mais sofisticados que merecem nota. O modelo
          <strong> data-driven</strong> (Google chama assim, Meta chama de
          “robust”) usa machine learning pra distribuir crédito comparando
          jornadas que converteram com jornadas que não converteram. Funciona
          razoavelmente bem em conta com volume — pense em centenas de
          conversões por semana. Em conta pequena, é ruído com cara de ciência.
        </p>
        <p>
          Já o <strong>MMM</strong> (Marketing Mix Modeling) é outra liga
          inteira: regressão estatística no nível de mercado, considerando
          mídia paga, mídia orgânica, sazonalidade, preço, distribuição,
          eventos macro. É o que grandes anunciantes usam pra decidir alocação
          anual entre TV, digital, OOH e trade. Não substitui atribuição 1:1
          — complementa, num horizonte de tempo diferente.
        </p>

        <h2>Quando cada modelo faz sentido</h2>
        <p>
          Não existe modelo universal. Existe modelo certo pro seu ciclo de
          venda, volume de conversão e maturidade de tracking. A tabela abaixo
          é o atalho que dou em consultoria:
        </p>
        <table>
          <thead><tr><th>Cenário</th><th>Modelo recomendado</th><th>Por quê</th></tr></thead>
          <tbody>
            <tr><td>E-commerce, ciclo &lt; 7 dias, ticket baixo</td><td>Last-touch ou time-decay</td><td>Decisão rápida, jornada curta, último toque realmente pesa muito</td></tr>
            <tr><td>E-commerce, ticket alto ou consideração longa</td><td>U-shape + atribuição 1:1 no CRM</td><td>Topo de funil importa, mas o fechamento ainda acontece em sessão única</td></tr>
            <tr><td>SaaS B2B, ciclo de 30 a 90 dias</td><td>Multi-touch U-shape no analytics + 1:1 no CRM</td><td>Awareness e fechamento têm peso real; meio do funil precisa nome no contato</td></tr>
            <tr><td>Operação consultiva com WhatsApp + ads</td><td>Atribuição 1:1 deterministic</td><td>Sem ID viajando, WhatsApp vira buraco negro de tracking</td></tr>
            <tr><td>Conta com volume alto e budget &gt; R$ 100k/mês</td><td>Data-driven da plataforma + MMM trimestral</td><td>Volume permite ML; MMM responde alocação macro</td></tr>
            <tr><td>Mid-market enterprise multi-canal</td><td>Data-driven + MMM + 1:1 no CRM</td><td>Cada lente responde uma pergunta diferente</td></tr>
          </tbody>
        </table>

        <h2>O que você devia fazer hoje</h2>
        <p>
          Se sua operação tem CRM e mídia paga, a verdade incômoda é simples:
          atribuição 1:1 deterministic não é luxo, é o mínimo viável pra
          decisão de orçamento. A plataforma vai continuar mentindo (porque
          tem incentivo pra isso). O Google Analytics vai continuar mostrando
          last-touch como padrão. E você vai continuar adivinhando — a menos
          que o ID do clique entre no seu CRM, viaje com o lead e volte a fechar
          com a receita do negócio. É isso que o AdSales Hub faz nativamente,
          sem você ter que costurar três ferramentas e rezar pra que o pixel
          tenha disparado no navegador certo.
        </p>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
