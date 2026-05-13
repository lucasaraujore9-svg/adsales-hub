import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/guias/como-criar-campanha-no-meta-ads";
const TITLE = "Como criar campanha no Meta Ads — passo a passo 2026";
const SUBTITLE = "Do briefing à campanha publicada, sem agência";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Guia completo: do briefing à campanha publicada no Facebook e Instagram. Estrutura, criativos, públicos, lance e otimização contínua. Sem agência.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "Posso criar campanha no Meta sem agência?",
    a: "Pode, e a maioria das PMEs deveria. O Gerenciador de Anúncios é gratuito, está em português e a curva de aprendizado séria é de 2 a 3 semanas. O que agência cobra R$ 8.000/mês pra entregar você consegue fazer em 30 a 40 minutos por dia depois que entende a lógica. Se quiser pular a parte chata, plataformas como o AdSales·Hub recebem seu briefing em português e geram público, criativo e formulário automaticamente — você só aprova e publica.",
  },
  {
    q: "Quanto investir no início?",
    a: "Mínimo R$ 30/dia (cerca de R$ 900/mês) por campanha. Abaixo disso o algoritmo do Meta não tem volume suficiente pra sair da fase de aprendizado e você queima dinheiro testando no escuro. O ideal pra começar é R$ 80 a R$ 150/dia em uma única campanha bem estruturada, e dar 14 dias mínimo antes de julgar resultado.",
  },
  {
    q: "Devo escolher Vendas ou Cadastros como objetivo?",
    a: "Cadastros (Lead Forms) se você vende com SDR, vendedor ou qualquer ciclo onde alguém liga depois. Vendas (Conversões) se é e-commerce com checkout direto e Pixel + Conversions API funcionando. Errar o objetivo é o erro mais caro do Meta Ads — o algoritmo otimiza pro evento que você pediu, não pra venda em si. Se pediu cliques, vai te trazer cliques baratos e leads ruins.",
  },
  {
    q: "Quanto tempo até a campanha estabilizar?",
    a: "A fase de aprendizado dura 7 dias ou 50 conversões do evento otimizado, o que vier primeiro. Antes disso, qualquer mudança em público, orçamento ou criativo reseta o aprendizado e você volta pra estaca zero. Esse é o motivo número 1 de campanhas darem CPL alto: gente mexendo no terceiro dia porque ficou ansiosa.",
  },
  {
    q: "Vale a pena ter agência em algum cenário?",
    a: "Vale em três casos: ticket médio acima de R$ 5.000 (custo de agência se paga em 1 venda), produção de criativo de cinema (filmagem profissional, atores, locação) ou mídia acima de R$ 50k/mês (a gestão fina vira diferencial). Pra qualquer coisa abaixo disso, agência é caro demais pelo que entrega e você fica refém de alguém que não conhece seu negócio.",
  },
];

export default function CriarCampanhaMetaPage() {
  const cover = `/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Guias")}&subtitle=${encodeURIComponent(SUBTITLE)}`;

  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Como criar campanha no Meta Ads"
        description="Passo a passo 2026 sem agência."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Guia"
        title="Como criar campanha no Meta Ads — passo a passo"
        description="Você não precisa de agência pra rodar Meta Ads. Esse é o método que clientes do AdSales·Hub usam pra criar campanhas em 4 passos com IA, ou em 25 a 40 minutos manualmente no Gerenciador."
        updatedAt="01 de maio de 2026"
        coverImage={cover}
        readingMinutes={13}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Guias", href: "/recursos" },
          { label: "Criar campanha no Meta" },
        ]}
        cta={{ label: "Criar campanha com IA agora", href: "/signup" }}
      >
        <p>
          Tem dono de empresa pagando R$ 8.000/mês pra agência fazer o que ele
          conseguiria sozinho em meia hora por dia. Sério. Eu já vi contrato de
          R$ 12k mensais entregando duas campanhas mal mexidas, três criativos
          repetidos do banco de imagens e um relatório em PDF que ninguém abre.
          Se isso descreve sua relação com sua agência hoje, esse guia é o
          empurrão que você precisava pra internalizar.
        </p>
        <p>
          O Gerenciador de Anúncios da Meta é gratuito, está 100% em português e
          tem documentação melhor do que 90% dos cursos pagos sobre o assunto. A
          parte difícil não é a ferramenta — é a lógica por trás. Estrutura de
          conta, escolha de objetivo, criação de público, leitura de métrica e,
          acima de tudo, paciência pra deixar o algoritmo aprender. É isso que a
          gente vai destrinchar aqui, com números reais e os erros que custam
          caro.
        </p>
        <p>
          Honestamente: se você nunca rodou tráfego pago, separe duas semanas de
          dedicação leve (40 minutos por dia) e R$ 1.000 de orçamento de teste.
          Sai mais barato que o primeiro mês de qualquer agência decente e você
          fica com o conhecimento dentro de casa pra sempre.
        </p>

        <h2>Pré-requisitos: o que precisa estar no lugar antes</h2>
        <p>
          Não dá pra começar a montar campanha enquanto a base ainda está
          quebrada. O erro que mais vejo é gente criando anúncio com Pixel
          desinstalado, página do Facebook sem categoria e formulário de lead
          apontando pra um WhatsApp que ninguém atende. Resolve a infra antes,
          depois pensa em criativo.
        </p>
        <p>
          Você precisa de uma <strong>Página do Facebook</strong> ativa
          conectada a um <strong>Business Manager</strong> (Meta Business
          Suite), uma <strong>conta de anúncio</strong> com cartão validado e
          limite suficiente pro orçamento que você pretende gastar, o{" "}
          <strong>Pixel da Meta</strong> instalado no site ou na landing page
          com pelo menos os eventos PageView, Lead e Purchase configurados, e
          idealmente a <strong>Conversions API</strong> ligada via servidor pra
          contornar a perda de tracking causada pelo iOS 17 ATT e pelo ITP do
          Safari. Se você usa WhatsApp como destino, conecte o número via{" "}
          <strong>WhatsApp Business Platform</strong> antes — fazer pelo botão
          "click-to-WhatsApp" sem integração formal é gambiarra que perde
          leads.
        </p>
        <p>
          Por último, e isso é o que ninguém fala: tenha um briefing escrito.
          Uma frase do que você vende, uma frase de pra quem, a oferta
          principal, o link de destino e o ticket médio. Sem isso, qualquer
          campanha vira chute caro.
        </p>

        <h2>A estrutura de 3 níveis (e por que ela existe)</h2>
        <p>
          Toda campanha no Meta tem três camadas, e entender a hierarquia evita
          90% da confusão. A <strong>Campanha</strong> é onde você define o
          objetivo de negócio (Vendas, Cadastros, Tráfego). O{" "}
          <strong>Conjunto de Anúncios (Ad Set)</strong> é onde mora o público,
          o orçamento, o lance, a janela de atribuição (padrão 7-day click +
          1-day view) e os posicionamentos. E os <strong>Anúncios</strong> são a
          parte criativa: imagem ou vídeo, copy, headline e CTA.
        </p>
        <p>
          Pensa assim: a Campanha é o "porquê", o Conjunto é o "pra quem" e o
          Anúncio é o "como". Se você muda o público de uma campanha que já
          rodou bem, está mexendo no Conjunto, não na Campanha — então não
          precisa duplicar tudo. Se quer testar três variações de copy pro
          mesmo público, cria três Anúncios dentro do mesmo Conjunto. Mistura
          essas camadas e você cria um caos que nem o algoritmo consegue
          interpretar.
        </p>

        <h3>Exemplo prático de estrutura</h3>
        <p>
          Imagina um curso online pra contadores, ticket R$ 1.297, com R$
          90/dia de orçamento. A estrutura saudável seria:
        </p>
        <ul>
          <li>
            <strong>1 Campanha</strong> com objetivo Cadastros (porque você
            tem SDR pra qualificar).
          </li>
          <li>
            <strong>2 Conjuntos de Anúncios</strong>: um com público Lookalike
            1% de compradores, outro com público Salvo de interesses
            (Contabilidade, CRC, Sage, Domínio Sistemas).
          </li>
          <li>
            <strong>3 Anúncios por conjunto</strong>: um vídeo curto com
            depoimento, uma imagem com headline numérica ("3 mudanças no Simples
            que vão mexer com seu cliente") e uma imagem com a oferta direta.
          </li>
        </ul>
        <p>
          Total: 1 campanha, 2 ad sets, 6 anúncios. O algoritmo testa tudo nos
          primeiros 7 dias e estabiliza no que performa melhor.
        </p>

        <h2>Passo 1 — Escolher o objetivo certo (e por que isso decide o resultado)</h2>
        <p>
          O objetivo da campanha é a única coisa que você não consegue mudar
          depois sem criar uma nova. Errar aqui significa, na prática, jogar
          dinheiro fora — porque o algoritmo do Meta vai otimizar exatamente
          pro evento que você pediu, mesmo que esse evento não tenha nada a ver
          com venda.
        </p>
        <p>
          Caso real: rodei uma campanha pra um ecommerce de moda (200 produtos,
          ticket médio R$ 240) começando com objetivo Tráfego porque o cliente
          "queria tirar gente do nada pro site". CPC ficou em R$ 0,38, lindo no
          relatório. Conversão? 0,4%. Trocamos pra Vendas com o evento Purchase,
          CPC subiu pra R$ 1,90, e o ROAS pulou de 0,9 pra 4,1 em 12 dias. O
          algoritmo passou a entregar o anúncio pra quem efetivamente compra,
          não pra quem clica.
        </p>
        <table>
          <thead>
            <tr>
              <th>Objetivo</th>
              <th>Quando usar</th>
              <th>CPL/CPA esperado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cadastros (Lead Generation)</td>
              <td>Vendas com SDR ou vendedor. Lead Form nativo do Meta.</td>
              <td>R$ 8 a R$ 60 (B2C info), R$ 40 a R$ 200 (B2B nicho)</td>
            </tr>
            <tr>
              <td>Vendas (Conversões)</td>
              <td>E-commerce com checkout direto, Pixel + CAPI funcionando.</td>
              <td>ROAS 2,5 a 5,0 dependendo da margem</td>
            </tr>
            <tr>
              <td>Tráfego</td>
              <td>Conteúdo gratuito, blog, topo de funil puro. Quase nunca direto pra venda.</td>
              <td>CPC R$ 0,30 a R$ 1,50</td>
            </tr>
            <tr>
              <td>Engajamento</td>
              <td>Construção de prova social, comentários, salvamentos.</td>
              <td>R$ 0,05 a R$ 0,25 por engajamento</td>
            </tr>
            <tr>
              <td>Reconhecimento</td>
              <td>Branding puro. Só pra quem tem mídia acima de R$ 30k/mês.</td>
              <td>CPM R$ 8 a R$ 25</td>
            </tr>
          </tbody>
        </table>
        <p>
          Regra prática: se você tem uma equipe humana ou um WhatsApp atendendo
          do outro lado, vai de Cadastros. Se tem checkout, vai de Vendas. Os
          outros objetivos são acessórios — não comece por eles.
        </p>

        <h2>Passo 2 — Públicos: quando usar cada tipo</h2>
        <p>
          Aqui mora a maior diferença entre campanha medíocre e campanha
          excelente. O Meta tem três tipos de público, e cada um tem um momento
          certo. Quem só usa público Salvo (interesse e demografia) deixa muito
          dinheiro na mesa.
        </p>
        <p>
          O <strong>público Salvo</strong> é o que você monta com idade, gênero,
          localização e interesses. É o ponto de partida quando você ainda não
          tem dados próprios. Tamanho ideal: 500k a 5M de pessoas pra B2C, 50k a
          500k pra B2B nicho. Acima de 10M você vira refém da entrega genérica;
          abaixo de 50k você sufoca o algoritmo e o CPM dispara.
        </p>
        <p>
          O <strong>público Personalizado (Custom Audience)</strong> é onde a
          mágica começa. Você sobe sua lista de clientes (e-mails, telefones),
          visitantes do site capturados pelo Pixel, gente que assistiu vídeo,
          que abriu Lead Form sem completar, ou que interagiu com sua página.
          Esses públicos servem tanto pra remarketing direto quanto pra alimentar
          os Lookalikes.
        </p>
        <p>
          O <strong>Lookalike Audience</strong> é o que muda o jogo: o Meta
          encontra pessoas parecidas com a sua lista-semente. E aqui vai o
          conselho mais importante do guia inteiro: <strong>nunca faça
          Lookalike de lista de leads</strong>. Faça de lista de quem comprou.
          Lookalike de comprador converte 2 a 3× melhor que Lookalike de lead,
          porque você está pedindo pro Meta achar gente parecida com quem
          efetivamente abriu a carteira, não com curioso. Se você tem lista de
          200 compradores pelo menos, já dá pra fazer Lookalike 1% (mais
          parecido) e isso provavelmente vai virar seu melhor público.
        </p>

        <h3>Stack de público que funciona</h3>
        <ol>
          <li>
            <strong>Conjunto 1:</strong> Lookalike 1% de compradores (top
            performance esperada).
          </li>
          <li>
            <strong>Conjunto 2:</strong> Salvo com interesses específicos do
            nicho.
          </li>
          <li>
            <strong>Conjunto 3 (depois de 30 dias):</strong> Custom Audience de
            visitantes do site últimos 30 dias, pra remarketing.
          </li>
        </ol>

        <h2>Passo 3 — Criativo: o que mais impacta seu CPL</h2>
        <p>
          Se eu pudesse dar 1 conselho sobre Meta Ads em 2026 seria esse: o
          criativo é responsável por 70% do resultado. Público, lance e
          orçamento brigam pelos 30% restantes. Aceita isso e você vai longe.
        </p>
        <p>
          A primeira linha do anúncio (a headline ou as 3 primeiras palavras da
          copy) decide se a pessoa para de rolar ou não. Você tem cerca de 1,7
          segundo de atenção. Use número, pergunta direta ou contradição. "Como
          contadores estão cobrando 40% a mais por hora sem perder cliente" é
          200% mais clicado do que "Curso de gestão pra contadores". A primeira
          frase precisa ser específica, ter dado e gerar curiosidade — não
          adjetivo vazio.
        </p>
        <p>
          Exemplo de copy de campanha real (cursos pra contador, R$ 30/dia,
          fechou em CPL R$ 18 estável):
        </p>
        <blockquote>
          <p>
            <em>
              "3 mudanças no Simples Nacional em 2026 vão mexer com 80% dos seus
              clientes. A maioria dos contadores ainda não atualizou a base de
              cálculo. Pega o material gratuito antes do prazo de
              entrega."
            </em>
          </p>
        </blockquote>
        <p>
          Note: tem número (3, 80%), tem urgência (antes do prazo), tem
          benefício claro e zero adjetivo de marketing. Não tem "incrível",
          "revolucionário", "exclusivo".
        </p>

        <h3>Checklist do criativo que performa</h3>
        <ul>
          <li>
            <strong>Mínimo 3 variantes por conjunto:</strong> uma imagem
            estática, uma com texto sobreposto e um vídeo curto. Deixa o
            algoritmo escolher o vencedor.
          </li>
          <li>
            <strong>Formato 4:5 (1080×1350) ou 9:16 (Reels):</strong> ocupam
            mais tela no feed mobile, que é onde 92% das impressões acontecem.
            Foto quadrada 1:1 é desperdício de pixel.
          </li>
          <li>
            <strong>Body curto:</strong> 90 a 120 caracteres convertem mais que
            parágrafo longo. Quem lê o "leia mais" é quem já estava 80%
            decidido.
          </li>
          <li>
            <strong>Vídeo até 15 segundos com legenda burned-in:</strong> 85%
            assiste sem som. Sem legenda, você gasta CPM pra ninguém entender
            nada.
          </li>
          <li>
            <strong>CTA explícito e binário:</strong> "Cadastre-se", "Compre
            agora", "Quero o material". Evita "Saiba mais" que é o CTA mais
            preguiçoso do Meta.
          </li>
          <li>
            <strong>Trocar criativo a cada 14 dias:</strong> a fadiga criativa
            (frequency acima de 3,5) faz o CPM subir 30 a 60% sem você
            perceber. Programa a renovação.
          </li>
        </ul>

        <h2>Passo 4 — Lance e orçamento: CBO, ABO e quando ir manual</h2>
        <p>
          Essa parte gera mais discussão do que precisa. Vou direto ao ponto:
          comece com <strong>orçamento por conjunto (ABO)</strong> e{" "}
          <strong>lance automático (Lowest Cost)</strong>. Em 95% dos casos é o
          que entrega o melhor resultado nas primeiras 4 semanas. Você só pensa
          em CBO (Campaign Budget Optimization) ou em lance manual (Cost Cap,
          Bid Cap) depois que tem dados de pelo menos 50 conversões por conjunto
          pra calibrar.
        </p>
        <p>
          O <strong>ABO</strong> te dá controle: cada conjunto recebe seu
          próprio orçamento e você consegue ver claramente qual público está
          performando. O <strong>CBO</strong> joga tudo no caixa da campanha e
          deixa o algoritmo distribuir entre conjuntos — funciona bem quando
          você já sabe que todos os públicos são bons, mas pode "matar" um
          conjunto promissor antes da hora se outro tiver um pico inicial.
        </p>
        <p>
          Sobre orçamento: R$ 30/dia é o mínimo absoluto pra sair da fase de
          aprendizado em tempo razoável. Abaixo disso o algoritmo demora 3
          semanas pra acumular as 50 conversões necessárias e você não consegue
          ler nada. R$ 80 a R$ 150/dia é a faixa ideal pra começar uma campanha
          com 2 conjuntos. Acima de R$ 300/dia você precisa pensar em estrutura
          mais sofisticada, separar funil topo/meio/fundo e ter um plano de
          escalonamento.
        </p>

        <h2>Os 7 dias de aprendizado: a regra do "não mexe"</h2>
        <p>
          Esse é o ponto mais importante e o mais ignorado do Meta Ads. Depois
          que você publica, o algoritmo entra em <strong>fase de
          aprendizado</strong> e precisa de aproximadamente 7 dias E 50
          conversões do evento otimizado pra estabilizar. Antes disso,
          qualquer mudança em público, orçamento maior que 20%, criativo ou
          lance <strong>reseta o aprendizado</strong> e você volta pro dia
          zero.
        </p>
        <p>
          Eu sei que dá ansiedade ver R$ 200 gastos no terceiro dia sem lead
          chegando. Mas o que parece "ruim" no dia 3 muitas vezes é "ótimo" no
          dia 8 — porque o algoritmo ainda está mapeando quem responde. Já vi
          campanhas que estavam custando CPL R$ 78 no dia 5 caírem pra R$ 19 no
          dia 9 sem ninguém mexer em nada.
        </p>
        <p>
          Durante a fase de aprendizado, faça apenas três coisas:
        </p>
        <ol>
          <li>
            Confirme que o tracking está chegando (eventos no Pixel, leads no
            CRM).
          </li>
          <li>
            Pause anúncios individuais que tiveram 1.500+ impressões e zero
            clique — esses estão tecnicamente quebrados.
          </li>
          <li>
            Anote tudo que você vai querer testar no dia 8.
          </li>
        </ol>
        <p>
          Depois dos 7 dias, aí sim: mata anúncios com CTR abaixo de 1% e CPL
          acima da meta, dobra orçamento dos vencedores (escalonamento de 20% a
          cada 2-3 dias, nunca mais que isso) e duplica os melhores conjuntos
          pra testar variações de público.
        </p>

        <h2>Como acelerar tudo isso com IA</h2>
        <p>
          Tudo o que descrevemos até aqui é o método manual. Funciona, mas dá
          trabalho — uma campanha decente leva 30 a 40 minutos pra ser montada e
          mais 15 minutos por dia de acompanhamento. Pra quem tem 5, 10, 30
          campanhas rodando, isso vira um trabalho de tempo integral.
        </p>
        <p>
          O AdSales·Hub foi construído pra eliminar a parte repetitiva. Você
          escreve o briefing em português (literalmente um parágrafo: "vendo
          curso pra contadores sobre Simples Nacional, ticket R$ 1.297, quero
          R$ 90/dia, foco nordeste"), e a IA gera o público sugerido (Lookalike
          + Salvo), três criativos A/B com copy e arte, o Lead Form nativo do
          Meta e a configuração da campanha completa. Você revisa, ajusta o que
          quiser e aprova. A plataforma publica via Meta Marketing API v21,
          conecta a Conversions API automaticamente e roda o motor de
          otimização a cada 2 dias — pausando criativo cansado, redistribuindo
          orçamento e gerando insights em linguagem humana.
        </p>
        <p>
          Tempo do briefing à campanha rodando: 4 minutos. Está incluído no
          plano <strong>Crescimento (R$ 690/mês)</strong>, junto com CRM,
          formulários e pipeline de vendas. Se você está rodando mídia hoje e
          gasta mais que R$ 1.500/mês, o ROI da plataforma se paga sozinho só
          com o tempo que você economiza.
        </p>

        <h2>Os 5 erros mais comuns (e como evitar cada um)</h2>
        <p>
          Depois de auditar centenas de contas, esses são os tropeços que se
          repetem. Se você só evitar esses cinco, já fica acima da média do
          mercado brasileiro.
        </p>
        <ol>
          <li>
            <strong>Mexer na campanha durante a fase de aprendizado.</strong>{" "}
            Já falei e vou repetir: você reseta tudo. Bota um lembrete no
            calendário pra revisar só no dia 8.
          </li>
          <li>
            <strong>Escolher o objetivo errado.</strong> Tráfego pra vender, ou
            Engajamento pra gerar lead — o algoritmo entrega exatamente o que
            você pediu, e o que você pediu não era venda. Sempre escolha o
            evento mais próximo do dinheiro entrando.
          </li>
          <li>
            <strong>Público pequeno demais ou "interesses empilhados".</strong>{" "}
            Empilhar 15 interesses esperando "afinar" o público faz o oposto: o
            Meta usa OR (OU) na lógica, então quanto mais interesse você
            adiciona, maior fica o público — e mais genérico. Use no máximo 3 a
            5 interesses bem pensados.
          </li>
          <li>
            <strong>Não instalar a Conversions API.</strong> Em 2026, com iOS
            17 ATT e ITP do Safari, depender só do Pixel client-side significa
            perder 30 a 50% das conversões no relatório. A CAPI não é luxo, é
            sobrevivência. E desde 2024 ela também conversa com o Consent Mode
            v2 pra LGPD.
          </li>
          <li>
            <strong>Não trocar criativo.</strong> Frequency acima de 3,5 mata
            qualquer campanha. Programa pra renovar criativo a cada 14 dias,
            mesmo que o vencedor ainda esteja indo bem. A fadiga criativa é a
            morte silenciosa do CPL — você não percebe ele subindo até estar
            120% acima do baseline.
          </li>
        </ol>

        <h2>Quando vale ter agência (pra gente não ser ingênuo)</h2>
        <p>
          Esse guia inteiro defende a internalização, mas seria desonesto não
          falar dos cenários onde agência ainda faz sentido. São basicamente
          três:
        </p>
        <ul>
          <li>
            <strong>Ticket médio acima de R$ 5.000:</strong> uma venda paga 2 a
            3 meses de fee da agência. O custo-benefício existe.
          </li>
          <li>
            <strong>Produção de criativo de cinema:</strong> filmagem com atores,
            locação, direção de arte. Isso é produtora, não Meta Ads — mas vem
            no pacote.
          </li>
          <li>
            <strong>Mídia acima de R$ 50k/mês:</strong> nesse volume, a gestão
            fina (audiência, attribution windows customizadas, integração com
            BI) vira diferencial competitivo real.
          </li>
        </ul>
        <p>
          Pra qualquer cenário fora desses três, você está pagando overhead
          desnecessário. Internaliza, contrata o módulo certo de IA e usa o
          dinheiro que sobra pra anunciar mais.
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
