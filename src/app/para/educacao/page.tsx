import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/para/educacao";

export const metadata: Metadata = {
  title: "AdSales·Hub para educação e cursos online — captação à matrícula",
  description:
    "Captação de aluno à matrícula assinada: Meta Ads e LP, qualificação por SDR de voz IA, reunião com consultor, contrato Lei 14.063 com Pix ou cartão. Tudo num sistema só.",
  alternates: { canonical: URL },
};

const COVER_TITLE = encodeURIComponent("Da campanha de Meta à matrícula assinada");
const COVER_SUBTITLE = encodeURIComponent("Captação, SDR de voz IA, reunião com consultor e contrato Lei 14.063 num só sistema");
const COVER_CATEGORY = encodeURIComponent("Para sua empresa");
const COVER_IMAGE = `/api/og?title=${COVER_TITLE}&category=${COVER_CATEGORY}&subtitle=${COVER_SUBTITLE}`;

const FAQ = [
  { q: "Funciona pra cursos online e presenciais?", a: "Os dois. Em curso online, conectamos no checkout pra liberar acesso assim que o pagamento confirma — o roadmap inclui integração nativa com Hotmart e Eduzz, e hoje a ponte funciona via API REST e Zapier. Em curso presencial, o contrato eletrônico via Lei 14.063 fecha matrícula sem cartório, e o link de Pix ou cartão chega junto." },
  { q: "Como qualificar lead de curso de R$ 5.000 sem perder a equipe?", a: "Honestamente, ticket alto não fecha por chatbot — precisa de vendedor humano em algum momento. O que muda é a triagem: o SDR de voz IA atende em segundos, faz quatro perguntas (turma de interesse, prazo de início, faixa de orçamento, quem decide) e só passa pra agenda do consultor o que tem chance real. Show rate típico nesse fluxo fica entre 60% e 80%." },
  { q: "Tem integração com plataforma de aulas?", a: "Hoje, integração nativa com Hotmart e Eduzz está no roadmap; enquanto isso, a ponte é via API REST ou Zapier — funciona pra liberar acesso, sincronizar matrícula, atualizar status. Pra LMS próprio, o webhook de matrícula ativa qualquer fluxo que você já tenha." },
  { q: "O contrato Lei 14.063 vale pra matrícula EAD?", a: "Vale. A Lei 14.063 reconhece assinatura eletrônica avançada e qualificada com validade jurídica plena pra contratos privados — incluindo matrícula em curso, termo de adesão, política de cancelamento. Sem cartório, sem reconhecimento de firma, sem PDF impresso." },
  { q: "Quanto tempo leva pra ver curva de matrícula mudar?", a: "Os dois primeiros ganhos aparecem na primeira semana: tempo de primeiro contato cai pra menos de 1 minuto e show rate de reunião sobe. Conversão final muda entre o ciclo 2 e o 3 — geralmente entre 30 e 60 dias, porque depende da nutrição de quem ainda não está no momento de comprar." },
];

export default function EducacaoPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="AdSales·Hub para educação" description="Captação de aluno até matrícula assinada com IA, contrato eletrônico e pagamento integrado." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Para educação"
        title="Da campanha de Meta à matrícula assinada"
        description="Curso brasileiro vendido em 5 a 12 dias do clique no anúncio até o contrato eletrônico assinado, com show rate de reunião entre 15% e 45% — dependendo de como o funil é operado. AdSales·Hub é o sistema que conecta os quatro momentos: captação no Meta, qualificação por voz IA, reunião com consultor e matrícula com pagamento."
        coverImage={COVER_IMAGE}
        readingMinutes={6}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Para", href: "/recursos" },
          { label: "Educação" },
        ]}
        cta={{ label: "Testar para meu curso", href: "/signup" }}
      >
        <p>
          Quem vende curso no Brasil — técnico, MBA, idiomas, preparatório, EAD próprio — opera num funil que parece simples no slide e é brutal na execução. Lead chega às 22h pelo Meta, ninguém atende até as 9h do dia seguinte, o lead já comprou do concorrente. Reunião marcada sem qualificação vira no-show de 60%. Contrato vai pra cartório e o aluno desiste no caminho do reconhecimento de firma. Honestamente, o que mata curso brasileiro não é a campanha ruim — é a costura entre os pedaços.
        </p>
        <p>
          A proposta deste sistema é colar os pedaços. Captação no Meta com Lead Form ou landing page, SDR de voz IA atendendo em segundos, reunião com consultor já pré-qualificada, contrato Lei 14.063 com Pix ou cartão fechando no celular. Quatro etapas, um só lugar pra ver, medir e ajustar.
        </p>

        <h2>O funil típico de educação, etapa por etapa</h2>
        <p>
          Antes de entrar nas alavancas, vale destrinchar o funil — porque cada etapa tem seu gargalo próprio e a otimização precisa ser cirúrgica. Tratar o funil como caixa-preta é o jeito mais rápido de gastar mídia sem entender por quê.
        </p>
        <ol>
          <li><strong>Captação no Meta Ads.</strong> Anúncio com Lead Form (formulário dentro do Facebook ou Instagram) ou tráfego pra landing page com formulário próprio. O lead entra com nome, e-mail, WhatsApp e — idealmente — uma resposta de qualificação inicial (turma de interesse, faixa de investimento). Quanto mais rico o formulário, menor o volume e maior a qualidade. Saudável: CPL entre R$ 8 e R$ 25 em B2C de ticket médio.</li>
          <li><strong>Qualificação imediata.</strong> SDR de voz IA liga em menos de 5 minutos depois do lead entrar — idealmente em menos de 60 segundos. Faz quatro perguntas estruturadas e classifica o lead em quente, morno ou frio. Lead morno entra em sequência de nutrição por WhatsApp e e-mail. Lead frio é descartado ou volta pro topo.</li>
          <li><strong>Reunião comercial com consultor humano.</strong> Lead quente vai direto pra agenda de um vendedor (em menos de 24h, idealmente). O consultor abre a reunião sabendo exatamente o que o lead respondeu na ligação com a IA — turma, prazo, orçamento, dor. A reunião não começa do zero.</li>
          <li><strong>Matrícula com contrato e pagamento.</strong> Proposta gerada com variáveis preenchidas, contrato eletrônico via Lei 14.063 assinado pelo celular em 90 segundos, link de Pix ou cartão na sequência. Sem cartório, sem PDF impresso, sem fricção. Em curso online, o gatilho de pagamento libera acesso na plataforma de aulas via webhook.</li>
        </ol>

        <h2>O que IA muda em cada alavanca</h2>
        <p>
          IA aplicada à educação não é "chatbot que responde dúvida no rodapé" — é redistribuição de tempo do time comercial e cobertura de horários que humano não cobre. Quatro alavancas concretas, sem jargão:
        </p>
        <ul>
          <li><strong>Tempo até primeiro contato cai de 12h pra 30s.</strong> SDR humano não atende às 22h, no fim de semana, no feriado — IA atende. E o tempo de resposta é o número que mais correlaciona com taxa de fechamento em B2C de educação. Atender em 5 minutos vs. 1 hora dobra a chance de conversão.</li>
          <li><strong>Triagem antes do consultor humano.</strong> Entre 60% e 70% dos leads de Meta Ads em curso de ticket médio (R$ 1.500 a R$ 8.000) não têm budget, não decidem ou não estão no momento de compra. IA filtra essas conversas antes do consultor humano perder 20 minutos por lead frio.</li>
          <li><strong>Reunião pré-qualificada chega aberta.</strong> O consultor entra na call sabendo turma desejada, prazo de início, faixa de investimento e quem decide. Não começa do "me conta um pouco sobre você" — começa do "vi que você quer começar em março, tem R$ 5.000 e o orçamento depende do seu marido". A reunião dura 25 minutos em vez de 50, e fecha mais.</li>
          <li><strong>Sequência de retenção pós-matrícula.</strong> Aluno que matricula em curso online tem taxa de desistência alta nos primeiros 30 dias — assiste duas aulas, some, pede reembolso. Sequência automática de check-in nos dias 3, 7, 14 e 21 com mensagens personalizadas reduz churn precoce e protege a margem da matrícula.</li>
        </ul>

        <h2>Métricas que importam — e o que é saudável em cada uma</h2>
        <p>
          Vender curso sem olhar essas cinco métricas é dirigir no escuro. Cada uma tem uma faixa saudável que muda conforme o ticket — abaixo, a referência pra curso B2C entre R$ 1.500 e R$ 18.000.
        </p>

        <table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Faixa saudável</th>
              <th>O que olhar quando sai da faixa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CPL (Custo por Lead)</td>
              <td>R$ 8 a R$ 25</td>
              <td>Criativo cansado, segmentação ampla demais, formulário curto demais</td>
            </tr>
            <tr>
              <td>Taxa de qualificação no SDR</td>
              <td>25% a 40%</td>
              <td>Anúncio promete mais do que entrega; lead chega no perfil errado</td>
            </tr>
            <tr>
              <td>Show rate de reunião</td>
              <td>60% a 80%</td>
              <td>Tempo entre marcação e reunião grande demais; falta de lembrete por WhatsApp</td>
            </tr>
            <tr>
              <td>Conversão reunião → matrícula</td>
              <td>25% a 45% (R$ 1.500 a R$ 3.000); 15% a 25% (R$ 5.000+)</td>
              <td>Falta de prova social, condição comercial fraca, vendedor sem treinamento de fechamento</td>
            </tr>
            <tr>
              <td>Tempo médio do funil</td>
              <td>5 a 12 dias do lead à matrícula</td>
              <td>Lead esfriou no caminho; reunião marcada longe demais; contrato travado em cartório</td>
            </tr>
          </tbody>
        </table>

        <h2>Os 3 momentos que matam matrícula</h2>
        <p>
          Tem três pontos no funil onde curso brasileiro perde aluno de forma quase invisível — não aparece no relatório de mídia, aparece no relatório de matrícula. Vale chamar pelo nome:
        </p>
        <p>
          <strong>Atendimento que demora mais de 12 horas.</strong> Lead que entra à noite e só recebe contato no outro dia já viu três anúncios de concorrente, já entrou em outro grupo de WhatsApp, já decidiu que "vai pensar". Os dados de B2C educacional são consistentes: cada hora a mais entre o lead entrar e o primeiro contato derruba a taxa de conversão em alguns pontos. Acima de 12 horas, o lead virou estatística. SDR de voz IA existe pra esse buraco — atende em segundos, qualifica e marca a reunião antes do lead esfriar.
        </p>
        <p>
          <strong>Reunião marcada sem pré-qualificação.</strong> Vendedor abre a call e descobre que o lead nem sabe qual turma quer, ainda não falou com o cônjuge sobre o investimento ou pensava que o curso era online quando é presencial. São 50 minutos perdidos pros dois lados, e o vendedor sai da reunião desmotivado pra próxima. Reunião que chega pré-qualificada — turma, prazo, orçamento, decisor — converte mais e cansa menos o time.
        </p>
        <p>
          <strong>Contrato que precisa ir pro cartório.</strong> Esse é o silencioso. Aluno fecha verbalmente, vendedor manda o PDF, o aluno olha "preciso reconhecer firma onde?" e a matrícula entra em coma. Em curso de ticket alto (MBA, técnico de longa duração), entre marcação no cartório, fila e digitalização, o aluno revisa a decisão. A Lei 14.063 reconhece assinatura eletrônica avançada e qualificada com validade jurídica plena — contrato fica pronto, lead assina pelo celular em 90 segundos e o pagamento sai junto. O ciclo de fechamento sai de 12 dias pra 3.
        </p>

        <h2>Casos reais</h2>
        <p>
          Três cenários que vimos rodando — sem nome de cliente, mas com os números reais:
        </p>
        <ul>
          <li><strong>Curso técnico semestral, ticket R$ 4.800.</strong> Operação tinha um consultor humano fazendo qualificação de manhã e vendas à tarde. Show rate de reunião travado em 50%, com lead esfriando entre marcação e dia da call. Plugaram SDR de voz IA pra qualificação e lembrete: economia de 4 horas por dia do consultor (que voltou pra fechar) e show rate subiu de 50% pra 75% em três semanas.</li>
          <li><strong>MBA executivo, ticket R$ 18.000.</strong> Fechamento travava no contrato — proposta aceita, contrato impresso, vai pro cartório, aluno some por dias. Migraram pra contrato Lei 14.063 com link de Pix ou cartão na mesma janela. Tempo médio entre proposta aceita e matrícula efetivada caiu de 12 dias pra 3 dias. Sem mexer em nada do funil de cima.</li>
          <li><strong>Inglês para concursos, ticket R$ 980.</strong> Operação 100% online, alto volume, muito carrinho abandonado. Configuraram sequência de WhatsApp pra quem clicou em pagar e não finalizou: três mensagens em 48 horas, com objeção, prova social e link novo de Pix. Recuperaram 18% das matrículas que tinham abandonado o checkout.</li>
        </ul>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
