import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/para/agencias";

const COVER_TITLE = encodeURIComponent("Opera 30 clientes com 3 pessoas");
const COVER_SUBTITLE = encodeURIComponent("White-label, IA e cobrança que fecha a margem");
const COVER_CATEGORY = encodeURIComponent("Para sua empresa");
const COVER_IMAGE = `/api/og?title=${COVER_TITLE}&category=${COVER_CATEGORY}&subtitle=${COVER_SUBTITLE}`;

export const metadata: Metadata = {
  title: "AdSales·Hub para agências de marketing — escala sem aumentar time",
  description:
    "Plataforma white-label que permite agências operarem 30+ clientes com 3 pessoas. Workspace por cliente, branding customizável, relatórios automáticos.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "Tem white-label de verdade pra agência?", a: "Tem. Cada workspace recebe accent color customizável, logo próprio, subdomínio (ou domínio completo via CNAME) e relatórios PDF white-label com a marca da agência. O cliente nunca vê 'AdSales·Hub' em nenhum ponto da experiência — vê o nome e a cor da sua agência." },
  { q: "Como cobrar do cliente sem perder margem?", a: "O modelo que mais fecha conta na nossa base é simples: o cliente paga a assinatura da plataforma direto (R$ 690 Crescimento ou R$ 1.490 Escala) no cartão dele e a agência cobra fee mensal de gestão por fora — geralmente entre R$ 1.500 e R$ 3.500 dependendo do porte. Você fica com 100% do fee. Sem repassar custo de ferramenta. Sem barganha sobre R$ 50 de Notion." },
  { q: "Quantos clientes uma pessoa consegue operar?", a: "Com plataforma unificada e IA gerando criativo: entre 8 e 12 clientes ativos por gestor. Sem plataforma — pulando manualmente entre Meta, Google, RD, planilha do Drive e WhatsApp pessoal — a média que vemos é de 3 a 4 contas antes da qualidade de execução cair." },
  { q: "Consigo migrar clientes que já estão num CRM antigo?", a: "Consegue. O AdSales·Hub importa contatos, empresas e negócios via CSV, e em casos maiores (RD Station, HubSpot, Pipedrive) o time de onboarding faz a migração de campos customizados, etapas de pipeline e histórico das conversas." },
  { q: "E se eu trocar de plataforma depois?", a: "Você exporta tudo: contatos, negócios, conversas, criativos e relatórios. Sem trava de contrato anual, sem multa, sem refém de dados. Honestamente, isso assusta gente vendedora — mas é o que torna a proposta defensável." },
];

export default function AgenciasPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="AdSales·Hub para agências" description="Escala sem aumentar time." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Para agências"
        title="Opera 30 clientes com 3 pessoas"
        description="A matemática da agência tradicional brasileira não fecha mais: cada cliente novo na carteira exige uma pessoa nova no time. AdSales·Hub muda essa equação — uma pessoa coordena 8 a 12 contas porque a IA assume a parte braçal e o white-label cuida da camada de marca."
        coverImage={COVER_IMAGE}
        readingMinutes={6}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Para", href: "/recursos" },
          { label: "Agências" },
        ]}
        cta={{ label: "Conhecer plano para agência", href: "/signup" }}
      >
        <p>
          Existe uma conta que toda dona de agência faz na primeira semana de janeiro
          e não fala em voz alta: pra cada cliente novo que entra na carteira,
          precisa contratar pessoa nova. Não é uma exageração — é literal. Quem
          opera 8 contas precisa de 2 gestores; quem fecha mais 4 precisa do
          terceiro. O modelo é linear, e modelo linear não escala. Honestamente,
          é o que mata margem de agência muito antes de a concorrência aparecer.
        </p>

        <h2>Por que o modelo tradicional não escala</h2>
        <p>
          Uma agência brasileira média operando 12 clientes ativos tem hoje, no
          chão, mais ou menos a seguinte estrutura: três gestores de tráfego (cada
          um cuidando de quatro contas), dois social medias dividindo a carteira
          inteira, um designer fazendo banner pra todo mundo, uma pessoa de
          atendimento, e o sócio operando como gerente de projeto, comercial e
          bombeiro de incêndio ao mesmo tempo. As ferramentas são umas sete:
          gerenciador da Meta, Google Ads, RD ou HubSpot, planilha do Google pra
          consolidar relatório, Notion pra brief, Slack pra time, e o WhatsApp
          pessoal de cada gestor pra falar com o cliente.
        </p>
        <p>
          O custo invisível desse modelo é altíssimo. Reuniões semanais com
          cliente comem cerca de duas horas por semana, vezes oito clientes por
          gestor, dão dezesseis horas só em call — quase metade da jornada útil
          jogada em Zoom. Relatório mensal toma um dia inteiro de cada gestor,
          porque consolidar Meta + Google + CRM em PDF apresentável não tem
          atalho. E o pior: quando o gestor pede demissão, sai com o
          relacionamento dos clientes na cabeça e leva semanas pra novo entrar
          no ritmo.
        </p>
        <p>
          Pra crescer de 12 pra 24 clientes, esse formato exige contratar mais
          quatro pessoas. CAC interno explode, margem cai, e a agência entra num
          ciclo onde precisa fechar cliente novo só pra pagar a folha do mês
          seguinte. É o motivo número um pelo qual agências boas operacionalmente
          continuam sendo negócios mais ou menos bons financeiramente.
        </p>

        <h2>O que muda com plataforma unificada e IA</h2>
        <p>
          A virada é estrutural, não cosmética. Em vez de jogar humano em cada
          tarefa repetitiva, você terceiriza pra IA aquilo que IA faz tão bem
          quanto júnior cansado às 18h: gerar variação de copy, montar criativo,
          escrever assunto de e-mail, redigir resumo de campanha. Em vez de
          coordenar sete ferramentas, você opera tudo numa só, com workspace
          isolado por cliente. E em vez de gastar um dia consolidando
          relatório, o PDF white-label sai em três segundos.
        </p>
        <p>
          Na prática, vemos isso acontecer com frequência. Uma agência de São
          Paulo que acompanhamos opera trinta clientes com três pessoas. O sócio
          cuida de comercial e onboarding, uma gestora coordena dezoito contas
          de tráfego usando o gerador de criativo com IA, e a terceira pessoa
          faz atendimento, social e SDR usando templates. O pulo do gato foi
          dois: terceirizar criativo pra IA (deixaram de pagar designer
          freelancer R$ 4 mil por mês) e automatizar relatório (deixaram de
          gastar três dias úteis por mês consolidando dado). Margem operacional
          que era 22% subiu pra 41% em quatro meses.
        </p>

        <h2>O modelo de cobrança que funciona</h2>
        <p>
          Aqui é onde mora a parte mais importante da conversa, e é a que a
          maioria das agências erra na largada: quem paga pela ferramenta. A
          tentação é embutir o custo da plataforma no fee da agência e cobrar
          tudo junto — parece mais simples, mas é exatamente o que afunda
          margem. O modelo que recomendamos, e que vemos funcionando em escala,
          inverte isso:
        </p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quem paga</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Plataforma AdSales·Hub Crescimento</td>
              <td>Cliente final (cartão dele)</td>
              <td>R$ 690/mês</td>
            </tr>
            <tr>
              <td>Plataforma AdSales·Hub Escala</td>
              <td>Cliente final (cartão dele)</td>
              <td>R$ 1.490/mês</td>
            </tr>
            <tr>
              <td>Fee de gestão da agência</td>
              <td>Cliente final</td>
              <td>R$ 1.500 a R$ 3.500/mês</td>
            </tr>
            <tr>
              <td>Mídia (Meta, Google, TikTok)</td>
              <td>Cliente final, cartão dele direto na plataforma</td>
              <td>variável</td>
            </tr>
          </tbody>
        </table>
        <p>
          O cliente final paga, em média, entre R$ 2.190 e R$ 4.990 mensais de
          overhead operacional — bem abaixo dos R$ 8 mil a R$ 15 mil que agência
          tradicional cobra pra entregar o mesmo escopo. E a agência fica com
          100% do fee de gestão, sem custo de ferramenta saindo do bolso e sem
          ter que justificar cada R$ 50 de assinatura na fatura. É uma
          negociação muito mais limpa: cliente vê que está pagando software no
          cartão dele e serviço humano no boleto da agência. Sem mistura, sem
          ressentimento.
        </p>

        <h2>O que entregar pro cliente</h2>
        <p>
          Plataforma sozinha não fecha negócio — entrega de serviço fecha. O
          contorno mínimo do que toda agência precisa colocar de pé pra
          justificar fee de gestão tem quatro pilares.
        </p>
        <p>
          O primeiro é onboarding curto e ritualizado, idealmente em cinco dias
          úteis. Dia 1 conexão de Meta Ads e WhatsApp Business, dia 2 setup do
          pixel e Conversions API, dia 3 importação de base e configuração de
          pipeline, dia 4 primeira campanha no ar, dia 5 reunião de alinhamento
          com o cliente já vendo dado real. Onboarding longo perde cliente —
          quem demora três semanas pra ligar a primeira campanha planta
          desconfiança.
        </p>
        <p>
          O segundo é ritual quinzenal de 30 minutos com painel ao vivo. Não é
          slide morto exportado pro PowerPoint — é o próprio dashboard do
          AdSales·Hub aberto na tela compartilhada, mostrando custo por lead da
          quinzena, comparativo com o ciclo anterior, próximas otimizações que
          a IA sugeriu. Cliente que vê dado mexendo confia mais do que cliente
          que recebe relatório bonito.
        </p>
        <p>
          O terceiro é o relatório PDF mensal automático com a marca da
          agência, enviado por e-mail no dia 5 de cada mês. Geração leva três
          segundos e o cliente recebe sem você precisar abrir laptop. Para o
          C-level do cliente que não entra no painel, esse PDF é o produto que
          ele consome.
        </p>
        <p>
          O quarto é a otimização contínua entre as reuniões. O motor de IA
          roda em ciclo de dois dias analisando criativo, público, copy e
          orçamento, e aplica as correções que tem confiança alta. Cliente vê,
          no painel, quantos reais foram economizados em CPL pela plataforma —
          e isso, na renovação, é o argumento que mantém o fee da agência
          intacto.
        </p>

        <h2>Ferramentas de white-label que importam</h2>
        <p>
          White-label virou palavra fofa que toda plataforma promete e poucas
          entregam. Na prática, agência precisa de quatro coisas, e só quatro,
          pra que o cliente nunca veja o nome da fornecedora por baixo. A
          primeira é cor de destaque customizável por workspace — o accent
          color da agência aplicado em sidebar, botões, badges, gráficos e
          toggles via CSS custom property em runtime, sem rebuild. A segunda é
          logo do workspace, exibido na sidebar do cliente, no cabeçalho dos
          relatórios PDF e no rodapé dos e-mails transacionais. A terceira é
          domínio próprio: subdomínio gratuito (cliente.suaagencia.com.br) ou
          domínio completo via CNAME se quiser ir mais longe. A quarta é o PDF
          white-label de relatório, que sai com sua marca, sua paleta e
          assinatura da equipe que atende a conta — não com logo do
          AdSales·Hub no canto.
        </p>
        <p>
          Os detalhes que parecem pequenos são os que decidem a percepção: nome
          do remetente em e-mails marketing, cor do botão de CTA nas landing
          pages do cliente, paleta dos gráficos no dashboard. Tudo isso é
          configurado uma vez por workspace e fica consistente em toda a
          experiência. O cliente fala "essa plataforma da agência" e é
          exatamente isso que ele acredita estar usando.
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
