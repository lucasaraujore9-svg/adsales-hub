import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/para/prestadores-de-servico";

const COVER_TITLE = encodeURIComponent("Lead à proposta sem fricção");
const COVER_SUBTITLE = encodeURIComponent("Advogado, dentista, consultor: o sistema que segura o lead até o contrato assinado");

export const metadata: Metadata = {
  title: "AdSales·Hub para prestadores de serviço — lead à proposta",
  description:
    "Advogados, consultores, dentistas, arquitetos: do anúncio à proposta assinada num sistema só. Lead → reunião → contrato com Lei 14.063.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "Funciona pra advogado dentro das regras da OAB?", a: "Sim, mas com responsabilidade. O Provimento 205/2021 da OAB regula publicidade do advogado: nada de mercantilização, depoimento de cliente, sensacionalismo ou captação ostensiva. O AdSales·Hub não bloqueia conteúdo automaticamente porque a responsabilidade editorial é do escritório, mas oferece templates de campanha já redigidos dentro do limite informativo permitido (artigos, FAQ jurídico, calculadoras). Tem advogado tributarista usando há 8 meses sem nenhuma reclamação." },
  { q: "Tem integração com Calendly, Google Agenda ou Outlook?", a: "Sim para Google Calendar e Outlook (Microsoft 365), nativo via OAuth. Calendly não precisa: o próprio AdSales·Hub gera link público de agendamento com sua disponibilidade real, regras de buffer entre reuniões, fuso, lembrete WhatsApp automático 24h e 1h antes, e o evento já cai com o nome do lead, telefone, origem da campanha e link da reunião (Meet ou Teams) anexado. Substitui Calendly inteiro." },
  { q: "Vale pra serviço com ticket alto e ciclo longo de decisão?", a: "Vale, e honestamente é onde o sistema mais paga a conta. Quando o cliente decide em 60, 90, 120 dias e fala com você cinco vezes nesse meio tempo, você precisa do histórico inteiro à mão (cada email, cada áudio do WhatsApp, cada anotação) e da atribuição 1:1 dizendo de qual campanha aquele cliente veio lá no início. Sem isso, você não sabe onde reinvestir mídia. Atribuição multi-touch mostra quanto cada canal trouxe de receita, não só de lead." },
  { q: "O contrato com assinatura eletrônica vale na justiça mesmo?", a: "Vale. A Lei 14.063/2020 e o Decreto 10.543/2020 regulamentam três níveis de assinatura eletrônica no Brasil: simples, avançada e qualificada. O AdSales·Hub usa avançada por padrão (com hash SHA-256, IP, geolocalização, timestamp e trilha de auditoria), suficiente para 99% dos contratos comerciais privados. Para escritura pública, herança ou ato notarial, ainda precisa do cartório. Para honorários, prestação de serviço, NDA, contrato de consultoria? A assinatura eletrônica avançada do sistema basta e já foi aceita em ações de cobrança no JEC." },
  { q: "Consigo cobrar a primeira parcela junto com a assinatura do contrato?", a: "Sim. O fluxo padrão envia o contrato com botão Pix integrado ou link de cartão (Stripe). Cliente assina, paga, e o negócio entra como Ganho automaticamente no pipeline. Sem você precisar lembrar de mandar boleto separado depois." },
];

export default function PrestadoresServicoPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="AdSales·Hub para prestadores de serviço" description="Lead à proposta sem fricção." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Para prestadores de serviço"
        title="Lead → reunião → proposta → contrato. Sem fricção."
        description="Advogados, consultores, dentistas, arquitetos, agências de seguros e outros profissionais autônomos ou pequenos escritórios. Marketing + agenda + proposta + contrato no mesmo sistema."
        coverImage={`/api/og?title=${COVER_TITLE}&category=Para sua empresa&subtitle=${COVER_SUBTITLE}`}
        readingMinutes={6}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Para", href: "/recursos" },
          { label: "Prestadores de serviço" },
        ]}
        cta={{ label: "Testar grátis 14 dias", href: "/signup" }}
      >
        <p>
          Quem vende serviço perde lead pela razão mais bobinha do mundo: ninguém
          respondeu a tempo. O cara baixou a calculadora de honorários no site da
          advogada, deixou número e WhatsApp, recebeu uma mensagem automática meia
          hora depois, leu, achou meio robótica, e quando a sócia ia ligar de volta
          no fim do dia o cliente já tinha fechado com o concorrente que respondeu
          em quarenta segundos. Não foi falta de bom serviço, não foi preço, não
          foi posicionamento. Foi follow-up esquecido. Honestamente, o que mata
          escritório de prestador de serviço hoje não é falta de lead — é o lead
          que entrou e morreu na caixa de entrada porque não tinha um sistema
          empurrando o próximo passo.
        </p>
        <p>
          AdSales·Hub foi montado pra resolver exatamente esse buraco entre o
          anúncio que gerou o contato e a primeira parcela caindo na conta. É um
          fluxo só, do clique até o contrato assinado, com cada etapa amarrada na
          anterior. Marketing não vive separado do CRM, agenda não vive separada
          da proposta, contrato não vive em outro software. Tudo dentro do mesmo
          painel, com o mesmo histórico do cliente do lado.
        </p>

        <h2>O fluxo típico de prestador de serviço</h2>
        <ol>
          <li>Cliente em potencial vê anúncio no Instagram, busca no Google ou recebe indicação.</li>
          <li>Preenche formulário na landing page ou clica direto no WhatsApp.</li>
          <li>SDR de voz IA (ou humano) faz a triagem em segundos, qualifica e marca a reunião na agenda.</li>
          <li>Reunião acontece no Google Meet ou Teams, com lembrete WhatsApp automático 24h e 1h antes.</li>
          <li>Você manda a proposta personalizada, com variáveis (nome, valor, escopo, prazo) já preenchidas a partir do CRM.</li>
          <li>Cliente assina pelo celular e paga a primeira parcela no mesmo link. Negócio entra como Ganho automaticamente.</li>
        </ol>
        <p>
          Cada um desses seis passos costuma usar uma ferramenta diferente no
          escritório típico. Meta Ads no painel da Meta, formulário num Typeform,
          WhatsApp num Z-API, agenda no Calendly, proposta num PandaDoc, contrato
          num D4Sign, cobrança numa Asaas. Seis assinaturas, seis logins, seis
          lugares onde o histórico do cliente fica pela metade. AdSales·Hub
          conecta tudo num sistema só, com o lead caminhando por dentro do funil
          sem precisar ser copiado e colado entre abas.
        </p>

        <h2>O que cada etapa entrega na prática</h2>
        <table>
          <thead>
            <tr><th>Etapa</th><th>Ferramenta no AdSales·Hub</th><th>O que automatiza</th></tr>
          </thead>
          <tbody>
            <tr><td>Captação</td><td>Meta Ads + Landing Page + WhatsApp Cloud API</td><td>Anúncio publicado direto pela IA, formulário nativo, lead cai no CRM em tempo real via webhook</td></tr>
            <tr><td>Qualificação</td><td>SDR de voz IA ou roteiro humano</td><td>Liga em até 90 segundos, faz 4 perguntas-chave, descarta lixo, marca reunião com qualificados</td></tr>
            <tr><td>Agenda</td><td>Google Calendar ou Outlook nativo</td><td>Disponibilidade real do profissional, buffer entre reuniões, lembrete WhatsApp automático</td></tr>
            <tr><td>Proposta</td><td>Template com variáveis dinâmicas</td><td>Nome, escopo, valor e prazo preenchidos do CRM. Geração em PDF white-label do escritório</td></tr>
            <tr><td>Contrato</td><td>Assinatura eletrônica (Lei 14.063/2020)</td><td>Hash SHA-256, IP, timestamp, QR de verificação, trilha de auditoria, validade jurídica plena</td></tr>
            <tr><td>Pagamento</td><td>Pix ou cartão (Stripe) integrado</td><td>Link de cobrança no mesmo email do contrato. Cliente paga, negócio vira Ganho sozinho</td></tr>
          </tbody>
        </table>

        <h2>Profissões que se beneficiam mais</h2>
        <p>
          Nem todo prestador tem o mesmo perfil de funil. Advocacia trabalha com
          ciclo médio e ticket alto, decisão emocional misturada com técnica.
          Clínica odontológica trabalha com volume, ticket médio-baixo e o pior
          inimigo do mundo: no-show. Consultoria empresarial tem ciclo longo, três
          a quatro reuniões antes de fechar, e atribuição é o que decide se você
          continua investindo em LinkedIn Ads ou em palestra. Vamos a cada uma:
        </p>
        <p>
          <strong>Advocacia.</strong> Contencioso cível, tributário, trabalhista,
          consultivo empresarial, família. Reunião marcada via link público com
          confirmação WhatsApp, contrato de honorários assinado no celular sem
          deslocamento até cartório, primeira parcela paga no mesmo fluxo.
          Templates de campanha respeitando o Provimento 205/2021 da OAB
          (informativo, sem mercantilização, sem promessa de resultado).
        </p>
        <p>
          <strong>Consultoria.</strong> Empresarial, financeira, RH, tecnologia.
          Ciclo de 30 a 90 dias com três a cinco reuniões antes do fechamento. A
          atribuição multi-touch mostra que aquele cliente que assinou em março
          começou no LinkedIn em janeiro, voltou via newsletter em fevereiro, e
          fechou depois de uma reunião agendada por indicação. Sem isso, você
          desliga o LinkedIn por achar que não converte e mata sua melhor fonte.
        </p>
        <p>
          <strong>Saúde — clínicas odontológicas, estéticas, fisioterapia.</strong>{" "}
          Captação por Meta Ads, agendamento direto na agenda do profissional,
          lembrete WhatsApp 24h e 1h antes, retorno automático para procedimentos
          que precisam de follow-up. O lembrete WhatsApp sozinho derruba no-show
          em 30-40%, segundo qualquer dentista honesto que mediu antes e depois.
        </p>
        <p>
          <strong>Arquitetura e engenharia.</strong> Lead de obra com briefing
          longo, anexos pesados (planta, foto do terreno, vídeo da casa atual),
          proposta com escopo detalhado por ambiente, contrato com cronograma
          físico-financeiro. Tudo amarrado num único registro do cliente, com cada
          versão da proposta arquivada e auditável.
        </p>
        <p>
          <strong>Corretoras de seguros.</strong> Lead de cotação chega, simulação
          é montada com a proposta de cada seguradora, cliente escolhe, contrato e
          endosso saem pelo mesmo fluxo. WhatsApp Business amarrado pra renovação
          anual entrar como tarefa automática.
        </p>

        <h2>Por que o prestador de serviço sofre mais sem CRM</h2>
        <p>
          Quem vende produto de prateleira pode até sobreviver sem CRM bem
          montado: o ticket é baixo, o ciclo é curto, e se um lead cai entre
          cadeiras a margem absorve. Prestador de serviço não tem essa folga. O
          ticket é alto, o ciclo é médio ou longo, e cada lead perdido custa um
          número específico que dá pra calcular: peguei 100 leads esse mês,
          gastei R$ 4.000 em mídia, então cada lead custou R$ 40. Se eu perco um
          lead que ia fechar contrato de R$ 8.000, não perdi R$ 40 — perdi um mês
          inteiro de mídia. Esse cálculo é o que o sócio nunca faz na correria,
          mas é o que justifica a existência do sistema.
        </p>
        <p>
          Tem mais. Sem CRM, o histórico do cliente vive na cabeça do sócio que
          atendeu. Quando esse sócio sai de férias, viaja pra audiência, fica
          doente, ou simplesmente esquece, o cliente liga pra perguntar do
          andamento e cai num colega que não sabe absolutamente nada do caso.
          Aquela ligação azeda a relação inteira. Com o CRM, qualquer pessoa do
          escritório abre o registro do cliente e vê tudo: última conversa, áudio
          do WhatsApp, reunião gravada, anotações, proposta enviada, status do
          contrato. A continuidade do atendimento deixa de depender de uma única
          memória humana.
        </p>

        <h2>Casos reais</h2>
        <p>
          Uma advogada tributária do interior de São Paulo, ticket médio de R$
          8.000 por contrato de honorário fixo, estava perdendo lead todo dia
          porque atendia sozinha entre audiência e petição. Ligou o SDR de voz IA
          do AdSales·Hub pra qualificar leads que entravam pelo formulário do
          site (calculadora de tributos federais). Em 30 dias, o sistema
          recuperou quatro leads/mês que antes morriam sem retorno em 24h. Isso é
          R$ 32.000 de receita adicional por mês saindo de leads que ela nem
          sabia que estavam expirando. O custo da assinatura mensal do
          AdSales·Hub paga em três dias.
        </p>
        <p>
          Uma clínica odontológica de Belo Horizonte, três cadeiras, ticket médio
          de R$ 1.200 por procedimento estético, sofria com no-show entre 28% e
          35% nas avaliações. Ligou o lembrete WhatsApp automático 24h antes e 1h
          antes da consulta, usando o template padrão do sistema. No-show caiu
          pra 22% no primeiro mês e estabilizou em 18% no terceiro mês. Redução
          de 35% no no-show traduzida em cadeira ocupada significou R$ 11.000 de
          faturamento adicional por mês sem precisar gastar mais em marketing.
        </p>

        <h2>Métricas que importam</h2>
        <ul>
          <li>Tempo de resposta inicial ao lead novo: meta &lt; 5 minutos. Lead morno esfria em 7 dias, mas a janela de ouro é a primeira hora.</li>
          <li>Conversão lead → reunião agendada: 25-45%. Abaixo disso, a qualificação está deixando passar muito lixo ou o roteiro do SDR está fraco.</li>
          <li>Show rate de reunião (lead que aparece na reunião marcada): 70-85%. Sem lembrete WhatsApp, despenca pra 50-60%.</li>
          <li>Conversão reunião → contrato assinado: 30-50% para ticket de R$ 2-10k. Ticket maior, conversão menor mas LTV maior.</li>
          <li>Tempo lead → contrato assinado: meta &lt; 14 dias para ticket médio, &lt; 45 dias para ticket alto com decisão coletiva.</li>
          <li>Custo por contrato fechado (CAC): mídia + ferramenta dividido por contratos assinados. Tem que ser menor que 30% do ticket pra escala fazer sentido.</li>
        </ul>

        <h2>Lei 14.063 e contrato eletrônico: por que muda o jogo pra advogado</h2>
        <p>
          Vale parar dois minutos nesse ponto porque é onde mais aparece dúvida
          de cliente. A Lei 14.063/2020, regulamentada pelo Decreto 10.543/2020,
          oficializou três níveis de assinatura eletrônica no direito brasileiro:
          simples (qualquer método de identificação, tipo confirmação por email),
          avançada (com criptografia, hash, controle exclusivo do signatário e
          trilha de auditoria) e qualificada (com certificado digital ICP-Brasil).
          O AdSales·Hub usa avançada por padrão, com hash SHA-256 do documento,
          IP do signatário registrado, geolocalização aproximada, timestamp
          oficial e trilha completa armazenada por 5 anos.
        </p>
        <p>
          Pra prestador de serviço, isso muda o jogo de três formas concretas.
          Primeiro: contrato assinado em 4 minutos pelo celular do cliente, em
          vez de três dias até o cliente imprimir, assinar, escanear e devolver
          (e a cada dia desses, a chance de ele desistir aumenta). Segundo: zero
          deslocamento até cartório, zero firma reconhecida, zero papel
          arquivado. Terceiro e mais importante na visão jurídica: a assinatura
          eletrônica avançada já foi reconhecida em ações de cobrança no Juizado
          Especial Cível, em execução de título extrajudicial, e em ações
          declaratórias. Para honorário advocatício, prestação de serviço,
          contrato de consultoria, NDA, distrato e aditivo, a avançada basta. Só
          escritura pública, herança e atos notariais ainda exigem cartório
          presencial ou ICP-Brasil qualificada.
        </p>
        <p>
          Pro escritório que ainda manda contrato por PDF anexado em email
          esperando o cliente imprimir, isso é um upgrade silencioso de
          conversão: cada dia a menos entre "cliente decidiu fechar" e "cliente
          assinou" é menos chance de o cliente esfriar, repensar, ou ser fisgado
          pelo concorrente que já mandou contrato eletrônico. Em métrica simples:
          escritórios que migraram pra assinatura eletrônica reportam aumento de
          15-25% na taxa de fechamento entre proposta enviada e contrato
          assinado, só pela redução do atrito.
        </p>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
