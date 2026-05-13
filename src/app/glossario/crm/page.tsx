import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/glossario/crm";

const TITLE = "O que é CRM — definição, exemplos e quando vale ter";
const SUBTITLE =
  "CRM explicado pra PME brasileira: o que é, tipos, quando faz sentido e os erros que matam o uso.";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "CRM (Customer Relationship Management) explicado pra PME brasileira: o que é, pra que serve, os 3 tipos principais, quando começa a fazer sentido e os erros que matam o uso na prática.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "O que significa CRM?",
    a: "CRM é a sigla de Customer Relationship Management — Gestão de Relacionamento com o Cliente. Na prática é um sistema que centraliza tudo sobre lead e cliente (contato, histórico, negociação, atividade, comunicação) pra equipe comercial não perder oportunidade nem repetir esforço. Diferente de planilha, o CRM organiza esses dados em pipeline visual (kanban), automatiza follow-up, registra cada interação e mostra em qual estágio do funil de vendas cada negócio está.",
  },
  {
    q: "Quando uma PME precisa de um CRM?",
    a: "Não é em quantidade de cliente, é em complexidade. Se o ciclo de venda passa de 5 dias, se o cliente fala com 2 ou mais pessoas antes de fechar, se você roda mídia paga e quer ROAS aferido, ou se tem mais de 30 a 50 leads ativos por mês — vale CRM. Antes disso, planilha resolve. Depois disso, planilha vira gargalo: lead se perde, follow-up esquece, vendedor sai e leva o histórico junto.",
  },
  {
    q: "Qual a diferença entre CRM e ERP?",
    a: "ERP gerencia operação interna (financeiro, estoque, NF-e, folha). CRM gerencia relacionamento externo (lead, oportunidade, cliente, comunicação). São complementares, não concorrentes. Empresa madura usa os dois integrados — ERP cuida do que já foi vendido, CRM cuida do que ainda vai ser vendido.",
  },
  {
    q: "CRM operacional, analítico ou colaborativo — qual escolher?",
    a: "Honestamente, a maioria das PMEs precisa dos três. Operacional automatiza tarefa (follow-up, sequência de email, criação de atividade). Analítico mostra relatório, lifecycle stage, conversão por etapa, previsão de receita. Colaborativo alinha marketing, vendas e atendimento na mesma timeline do cliente. Plataforma moderna entrega os três num só lugar — não precisa escolher.",
  },
  {
    q: "Planilha pode substituir CRM?",
    a: "Por um tempo, sim. Até umas 30 oportunidades ativas e um vendedor só, planilha cumpre. O problema começa quando o time cresce, quando o ciclo de venda envolve várias interações, ou quando entra mídia paga. Planilha não toca alarme de follow-up, não registra ligação, não conecta com WhatsApp e não mostra qual canal trouxe qual lead. A verdade nua é que planilha vira o lugar onde lead vai morrer.",
  },
  {
    q: "O que diferencia um CRM brasileiro de um internacional?",
    a: "Cobrança em real (sem volatilidade cambial), suporte em português, integração nativa com WhatsApp Cloud API, conformidade LGPD e — em alguns casos — integração com Pix e NF-e. Para PME que vende no Brasil, isso pesa mais do que recurso avançado de CRM gringo que ninguém vai usar.",
  },
  {
    q: "MQL e SQL: o que é?",
    a: "MQL (Marketing Qualified Lead) é o lead que marketing identificou como interessado mas ainda não está pronto pra falar com vendedor — baixou material, abriu email, visitou página de preço. SQL (Sales Qualified Lead) é o lead que já demonstrou intenção real de compra e foi aceito por vendas. CRM bom controla essa transição automaticamente, sem ninguém precisar mover lead na mão.",
  },
];

export default function CRMGlossaryPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline={TITLE}
        description="CRM explicado pra PME brasileira: definição, tipos, quando começa a valer a pena, diferenças do CRM brasileiro e os erros que matam o uso."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Glossário"
        title="O que é CRM"
        description="CRM (Customer Relationship Management) é o sistema que centraliza tudo sobre lead e cliente pra ninguém perder oportunidade, esquecer follow-up ou ligar no contato errado. Na teoria. Na prática, a maioria das PMEs diz que tem CRM e vive numa planilha disfarçada."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Glossário", href: "/recursos" },
          { label: "CRM" },
        ]}
        cta={{ label: "Testar CRM grátis 14 dias", href: "/signup" }}
        coverImage={`/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Glossário")}&subtitle=${encodeURIComponent(SUBTITLE)}`}
        readingMinutes={6}
      >
        <p>
          Pergunte a dez donos de PME se a empresa tem CRM. Nove vão dizer que sim.
          Abra o sistema deles e você vai encontrar uma planilha do Google Sheets com
          colunas chamadas <em>nome</em>, <em>telefone</em>, <em>status</em> e uma
          coluna <em>obs</em> onde está escrito coisa tipo <em>&quot;ligar
          quarta&quot;</em> de seis meses atrás. Isso não é CRM. Isso é um cemitério de
          lead com cara de planilha, e ele custa caro — só que ninguém consegue
          calcular quanto, porque o que se perde nele nunca foi medido.
        </p>
        <p>
          Esse texto é pra desfazer essa confusão. Vamos definir o que CRM realmente é,
          quais são os três tipos, o que ele resolve de verdade, quando começa a valer
          a pena (spoiler: não é em quantidade de cliente, é em complexidade), o que
          muda quando o CRM é brasileiro e quais são os três erros mais comuns que
          fazem PME comprar CRM, pagar mensalidade e voltar pra planilha em três meses.
        </p>

        <h2>O que é CRM, na prática (não na definição de livro)</h2>
        <p>
          A sigla é <strong>Customer Relationship Management</strong> — Gestão de
          Relacionamento com o Cliente. A definição formal cabe em uma frase: software
          que centraliza dados sobre contatos comerciais. Mas isso não diz nada sobre
          o que ele faz no dia a dia.
        </p>
        <p>
          Na prática, CRM é o sistema onde você responde, em segundos, perguntas que
          numa planilha levam meia hora ou nunca são respondidas: quantos negócios
          estão na fase de proposta agora? Qual vendedor está com mais lead parado há
          mais de sete dias? Que canal trouxe o cliente que fechou o maior contrato do
          mês? Qual etapa do funil tem a maior taxa de evasão? O lifecycle stage de um
          contato mudou de MQL pra SQL automaticamente quando ele entrou na reunião?
        </p>
        <p>
          Um CRM bom organiza isso em <strong>pipeline visual</strong> (geralmente em
          formato kanban), registra <strong>cada interação</strong> com o cliente
          (email, ligação, WhatsApp, reunião), <strong>automatiza tarefa repetitiva
          </strong> (criar follow-up, enviar email de boas-vindas, mover negócio entre
          etapas) e <strong>mede</strong> tudo isso em relatório que mostra onde está
          ganhando e onde está sangrando.
        </p>

        <h2>3 tipos de CRM e qual você precisa</h2>
        <p>
          A literatura clássica divide CRM em três categorias. Na prática, você
          provavelmente precisa dos três — mas vale entender pra que serve cada um:
        </p>
        <ol>
          <li>
            <strong>CRM operacional</strong> — automatiza tarefa do dia a dia.
            Sequência de email, criação automática de atividade quando lead entra,
            distribuição de lead entre vendedores, lembrete de follow-up. É o tipo mais
            comum e o que entrega resultado mais rápido. Se o seu time perde lead
            porque ninguém lembrou de ligar, é aqui que mora a solução.
          </li>
          <li>
            <strong>CRM analítico</strong> — foca em relatório, segmentação avançada,
            previsão de receita, lead scoring (pontuação automática de qualidade do
            lead) e análise de churn (taxa de cancelamento). Útil pra quem já tem
            volume de dado histórico suficiente pra encontrar padrão. PME no início não
            precisa desse poder todo, mas precisa do básico: conversão por etapa, ROAS
            por canal, ticket médio por origem.
          </li>
          <li>
            <strong>CRM colaborativo</strong> — alinha marketing, vendas e atendimento
            na mesma timeline. Quando o vendedor abre a ficha do cliente, ele vê o que
            marketing prometeu na campanha, o que pós-venda já resolveu de chamado e
            qual NPS o cliente deu na última pesquisa. Sem isso, o cliente recebe três
            mensagens diferentes da mesma empresa e cada vendedor trata o cliente como
            se fosse a primeira conversa.
          </li>
        </ol>
        <p>
          Plataforma moderna combina os três num só sistema, com IA atuando em
          automação operacional, análise preditiva e sugestão de próxima ação. Não
          precisa contratar três ferramentas.
        </p>

        <h2>O que CRM bom resolve</h2>
        <p>
          Sai do abstrato. Aqui vai uma lista do que muda na prática quando uma PME
          troca planilha por CRM bem implantado:
        </p>
        <ul>
          <li>
            <strong>Lead que cai e ninguém atende em menos de 5 minutos.</strong> Lead
            atendido nesse intervalo tem 9 vezes mais chance de fechar do que lead
            atendido depois de uma hora. CRM com webhook do Meta Ads dispara alarme no
            celular do vendedor de plantão no momento que o formulário é enviado.
          </li>
          <li>
            <strong>Vendedor que esquece follow-up depois de 2 dias sem resposta.</strong>{" "}
            Sequência automática toma conta. Dia 2 manda WhatsApp, dia 5 manda email,
            dia 10 cria atividade pro vendedor ligar. Sem ninguém precisar lembrar.
          </li>
          <li>
            <strong>Diretor que não sabe qual canal está gerando receita.</strong> Caso
            real: ecom de cosmético rodava Meta Ads, Google Ads e influenciador. Sem
            CRM com atribuição, perdia 30% do orçamento em canal que não convertia
            porque ninguém conseguia provar de onde vinha o cliente que fechou. Com
            CRM conectado a UTM e Custom Audience, ficou claro em uma semana qual
            canal era custo e qual era investimento.
          </li>
          <li>
            <strong>Cliente que recebe 3 mensagens da mesma empresa.</strong> Porque
            cada vendedor não vê o que o outro fez. CRM colaborativo elimina isso
            mostrando a timeline completa na ficha do contato.
          </li>
          <li>
            <strong>Histórico de cliente que se perde quando o vendedor sai.</strong>{" "}
            Sem CRM, o conhecimento do cliente sai junto com o vendedor (geralmente pra
            concorrência). Com CRM, o histórico fica na empresa, e o próximo vendedor
            assume o relacionamento sem reset.
          </li>
          <li>
            <strong>Conversão pequena que ninguém entende por quê.</strong> Caso real:
            consultoria com 5 vendedores migrou de planilha pra CRM e <strong>dobrou a
            taxa de conversão em 90 dias</strong>. Não foi mágica — foi descobrir que
            42% dos leads morriam na etapa de proposta porque ninguém fazia o segundo
            contato. Com CRM, esse gargalo virou regra de automação.
          </li>
        </ul>

        <h2>Quando CRM começa a valer a pena</h2>
        <p>
          Esse é o ponto que mais confunde dono de PME. A pergunta certa não é
          <em> &quot;quantos clientes eu preciso ter pra justificar?&quot;</em> — é{" "}
          <em>&quot;quão complexo está o processo de vender?&quot;</em>.
        </p>
        <p>
          Você precisa de CRM quando pelo menos uma dessas situações é verdade:
        </p>
        <ul>
          <li>O ciclo de venda dura mais de 5 dias do primeiro contato ao fechamento.</li>
          <li>O cliente conversa com 2 ou mais pessoas antes de fechar (vendedor, gestor, técnico).</li>
          <li>Você roda mídia paga e quer saber ROAS por campanha aferido com receita real.</li>
          <li>Tem mais de 30 a 50 leads ativos por mês simultaneamente.</li>
          <li>Você ou seus vendedores já esqueceram lead importante por falta de lembrete.</li>
          <li>Vendedor já saiu e levou cliente porque o relacionamento nunca esteve registrado.</li>
        </ul>
        <p>
          Se nada disso é verdade — você vende ticket único, à vista, no balcão, com
          ciclo de minutos — planilha está ótima. Não compre CRM por moda. Mas se uma
          dessas situações soa familiar, cada mês sem CRM é dinheiro indo embora numa
          conta que você não vê na DRE.
        </p>

        <h2>CRM brasileiro vs internacional</h2>
        <p>
          Existe uma tendência de PME brasileira contratar CRM gringo (HubSpot,
          Pipedrive, Salesforce) achando que produto americano é sempre melhor.
          Honestamente, depende. CRM internacional tem ecossistema maior, mais
          integração e mais maturidade de produto. Mas paga preço alto pelo seguinte:
        </p>
        <ul>
          <li>
            <strong>Cobrança em dólar.</strong> Mensalidade que oscila com o câmbio.
            Plano de R$ 200 hoje vira R$ 280 amanhã sem aviso.
          </li>
          <li>
            <strong>WhatsApp tratado como secundário.</strong> No Brasil, WhatsApp é o
            canal principal de venda. CRM gringo trata WhatsApp como integração de
            terceiro, com fricção. CRM brasileiro integra Meta Cloud API nativo.
          </li>
          <li>
            <strong>LGPD nem sempre coberta.</strong> Conformidade com LGPD brasileira
            é diferente de GDPR europeia. CRM gringo cobre GDPR, mas a interpretação
            local da LGPD é mais rigorosa em certos pontos (consentimento, retenção,
            direito de portabilidade).
          </li>
          <li>
            <strong>Suporte em horário e idioma estrangeiro.</strong> Bug crítico na
            sexta-feira às 18h no Brasil é noite no escritório americano. Suporte em
            inglês via chat com fila de 6 horas é rotina.
          </li>
          <li>
            <strong>Falta de Pix e NF-e.</strong> Para integração com financeiro e
            faturamento, CRM brasileiro chega mais perto do que PME precisa.
          </li>
        </ul>
        <p>
          Não é xenofobia — é pragmatismo. Para PME que vende no Brasil, esses
          detalhes pesam mais do que recurso avançado de CRM gringo que ninguém vai
          usar.
        </p>

        <h2>Os 3 erros que matam o uso de CRM</h2>
        <p>
          A verdade nua: a maioria das PMEs que compra CRM volta pra planilha em até
          seis meses. Não é culpa do CRM. É um dos três erros abaixo:
        </p>
        <ol>
          <li>
            <strong>Vendedor não atualiza.</strong> O CRM só serve se a informação
            está dentro dele. Quando o vendedor faz a ligação e não registra, o
            sistema vira ficção. Erro de implantação: faltou treinar vendedor pra
            entender que CRM não é trabalho extra, é a ferramenta principal. Solução:
            integração que registra automaticamente (gravação de ligação, sincronia
            de WhatsApp, captura de email) — vendedor não precisa lembrar de nada.
          </li>
          <li>
            <strong>Sem playbook de vendas.</strong> Empresa compra CRM, configura
            etapas do pipeline copiando algum template e nunca define o que precisa
            acontecer em cada etapa. Resultado: cada vendedor mexe no funil de um
            jeito, lead fica parado em etapa errada, relatório vira lixo. Solução:
            antes de mexer no CRM, escrever o playbook — quais etapas, qual critério
            pra avançar, qual atividade obrigatória em cada uma.
          </li>
          <li>
            <strong>Processo manual disfarçado de automação.</strong> Empresa compra
            CRM com automação, mas continua mandando email no Outlook, ligando no
            celular pessoal e cadastrando lead na mão. CRM vira só relatório, nunca
            tira trabalho repetitivo do vendedor. Solução: na implantação, mapear
            cada tarefa repetitiva e automatizar antes de liberar pro time. Se o
            vendedor entra num CRM que já economiza tempo dele, ele usa. Se entra num
            CRM que adiciona tempo, ele abandona.
          </li>
        </ol>

        <h2>Resumo prático</h2>
        <p>
          CRM não é planilha bonita — é sistema operacional do comercial. Existem três
          tipos (operacional, analítico, colaborativo), mas plataforma moderna entrega
          os três junto. Vale a pena quando o processo de venda fica complexo, não
          quando o número de cliente cresce. CRM brasileiro tende a servir melhor PME
          que vende no Brasil. E o CRM só funciona se vendedor atualiza, se existe
          playbook por trás e se a automação tira trabalho — não adiciona.
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
