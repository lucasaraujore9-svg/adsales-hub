import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd, ComparisonJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/comparativos/kommo";

const COVER_TITLE = encodeURIComponent("AdSales·Hub vs Kommo");
const COVER_SUBTITLE = encodeURIComponent(
  "WhatsApp-first ou operação completa? O comparativo honesto pra 2026"
);
const COVER_IMAGE = `/api/og?title=${COVER_TITLE}&category=Comparativos&subtitle=${COVER_SUBTITLE}`;

export const metadata = {
  title: "AdSales·Hub vs Kommo (amoCRM) — comparativo 2026",
  description:
    "Kommo eh queridinho de quem vende por WhatsApp. AdSales·Hub vai além: trafego pago, SDR de voz IA, atendimento omnichannel e contratos. Comparativo honesto.",
  alternates: { canonical: URL },
  openGraph: { url: URL, title: "AdSales·Hub vs Kommo — comparativo 2026" },
};

const FAQ = [
  {
    q: "Kommo realmente eh o melhor CRM pra WhatsApp no Brasil em 2026?",
    a: "Pra quem vive dentro do WhatsApp e não quer aprender mais nada, Kommo segue muito competente. O Salesbot eh maduro, a centralizacao de conversas funciona e a equipe brasileira entende o jogo de chat. Mas 'melhor' depende do recorte. Se sua operação tem trafego pago, multiplos canais (e-mail, SMS, Instagram DM, telefone) e precisa amarrar receita ao anuncio que gerou o lead, você vai sentir o limite. AdSales·Hub conecta WhatsApp Cloud API direto na Meta Business Platform, com a mesma profundidade de bot, e ainda cobre o que vem antes (campanha) e o que vem depois (contrato assinado).",
  },
  {
    q: "Quanto eu pago de verdade no Kommo, em real, com cambio considerado?",
    a: "Kommo cobra em USD por usuário: Base US$ 15, Avancado US$ 25 e Empresarial US$ 45. Na pratica, com cambio R$ 5,30 e 5 vendedores no plano Avancado, sao R$ 662/mes — e você não tem trafego pago, nem SDR, nem landing page, nem assinatura eletronica nesse valor. AdSales·Hub Crescimento custa R$ 690/mes fixos, em real, com 8 usuários e os módulos de CRM, Meta Ads, Social, Mensagens e BI inclusos. Conta a stack inteira que você precisaria comprar junto do Kommo e a diferenca explode.",
  },
  {
    q: "Kommo cria campanha de Meta Ads ou apenas captura lead?",
    a: "Apenas captura. O Kommo conecta com Facebook Lead Ads via integração nativa e puxa o lead pra dentro do CRM em segundos — isso ele faz bem. Mas você continua precisando do Gerenciador de Anuncios da Meta (ou de uma agencia) pra criar campanha, pensar público, gerar criativo e otimizar verba. AdSales·Hub gera a campanha completa via Claude API a partir de um briefing escrito em portugues, pública direto na Meta Marketing API v21, dispara o motor de otimização a cada 48h e envia eventos pela Conversions API pra fechar o loop de atribuição.",
  },
  {
    q: "Vale a pena migrar do Kommo pro AdSales·Hub se já estou rodando ha anos?",
    a: "Vale se você esta crescendo e o Kommo virou um silo: ele resolve a janela do WhatsApp, mas o resto da operação (anuncio, qualificação, atendimento em outros canais, contrato) vive em ferramentas separadas que não conversam. Se você contratou agencia, ferramenta de e-mail marketing, ferramenta de assinatura eletronica e tem planilha pra cruzar tudo, faz sentido consolidar. Agora, se sua operação eh enxuta, 100% por chat e você não tem dor de atribuição, ficar no Kommo eh decisão economica honesta. Nao migre por modinha.",
  },
];

export default function ComparativoKommoPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="AdSales·Hub vs Kommo (amoCRM) — comparativo"
        description="Comparativo entre Kommo e AdSales·Hub: CRM WhatsApp-first versus plataforma unificada com IA, trafego pago, SDR de voz e contratos."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ComparisonJsonLd url={URL} productA="AdSales·Hub" productB="Kommo" description="Comparativo entre AdSales·Hub e Kommo (amoCRM)." />
      <ContentLayout
        kicker="Comparativo"
        title="AdSales·Hub vs Kommo: WhatsApp-first ou operação completa?"
        description="Kommo (antigo amoCRM) virou queridinho de quem vende por WhatsApp no Brasil. AdSales·Hub também eh WhatsApp-nativo, mas não para ali — vai do anuncio ao contrato assinado num sistema so. Veja qual cabe no seu caso, sem floreio."
        updatedAt="01 de maio de 2026"
        coverImage={COVER_IMAGE}
        readingMinutes={8}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Comparativos", href: "/recursos" },
          { label: "vs Kommo" },
        ]}
        cta={{ label: "Testar AdSales·Hub gratis", href: "/signup" }}
      >
        <p>
          O Brasil eh um pais que vende por WhatsApp. Tem clinica de estetica fechando
          procedimento de R$ 4 mil pelo audio, escritorio de advocacia mandando
          procuracao por documento PDF no chat, ecommerce de cosmetico com cinco
          vendedoras dividindo um numero so e psicologo cobrando consulta via Pix
          depois de marcar pelo bot. O Kommo entendeu isso antes de quase todo mundo
          e construiu uma das ferramentas mais competentes do mundo pra esse jogo
          especifico. Honestamente, se voce quer o melhor CRM pra fechar venda dentro
          do app verde, ele esta no top 3 fácil.
        </p>
        <p>
          O problema nao eh o Kommo. O problema eh que cresce uma hora — e quando
          cresce, a operacao deixa de ser apenas WhatsApp. Vira anuncio no Meta,
          formulario na landing page, lead que precisa ser ligado em 90 segundos,
          atendimento que tambem rola por e-mail, SDR pra qualificar, contrato pra
          assinar. Aí o Kommo continua otimo no que faz, mas voce passa a comprar
          mais cinco ferramentas em volta — Gerenciador de Anuncios, Mailchimp,
          Calendly, DocuSign, alguma planilha milagrosa de atribuicao. Eh nesse
          ponto que o AdSales·Hub aparece como alternativa: um lugar so, em real,
          com IA cobrindo do briefing ao boleto.
        </p>

        <h2>TL;DR</h2>
        <p>
          <strong>Kommo</strong> eh a escolha certa se voce vende quase 100% por
          WhatsApp, tem time pequeno (1 a 4 vendedores), nao roda midia paga in-house
          e nao precisa de qualificacao automatica nem de assinatura eletronica
          dentro do CRM. O Salesbot eh mais maduro, ponto.
        </p>
        <p>
          <strong>AdSales·Hub</strong> eh a escolha certa se voce quer cobrir o ciclo
          inteiro num sistema so: roda Meta Ads (cria, otimiza, atribui receita),
          captura lead via Cloud API ou formulario, qualifica com SDR de voz IA em
          90 segundos, atende em multiplos canais e fecha contrato com assinatura
          eletronica conforme a Lei 14.063/2020. Mesma fluencia em WhatsApp, mais
          tudo o que vem antes e depois.
        </p>

        <h2>O que cada um eh, sem marketing</h2>
        <p>
          O Kommo (antigo amoCRM, rebatizado em 2022) eh um CRM de pipeline visual
          centrado em conversas de mensageria. A interface eh leve, o onboarding
          razoavel, e o diferencial real eh o Salesbot — um construtor de fluxos
          dentro do WhatsApp que resolve qualificacao basica, agendamento e respostas
          recorrentes sem precisar de programador. A integracao com WhatsApp Cloud
          API eh oficial e estavel, suportando templates HSM, mensagens de marketing
          e atendimento humano dentro de uma janela de 24h conforme as Meta Business
          Platform Policies. Tem app mobile decente, automacoes de pipeline e um
          marketplace de integracoes parrudo.
        </p>
        <p>
          O AdSales·Hub eh uma plataforma SaaS brasileira que parte de uma
          observacao oposta: empresa que vende online em 2026 nao tem dor de "fazer
          CRM", tem dor de fazer marketing, atendimento, qualificacao e fechamento
          conversarem. Por isso o produto eh dividido em modulos — CRM, Meta Ads
          (com IA), Social, Mensagens omnichannel, BI, Landing Pages, SDR de voz IA
          e Contratos — que voce contrata por cesta. O CRM eh tao completo quanto o
          do Kommo (pipeline kanban, automacoes, sequencias, campos custom, motivos
          de perda, deduplicacao), mas o WhatsApp eh apenas um dos canais, nao o
          centro do universo.
        </p>

        <h2>Comparativo lado a lado</h2>
        <p>
          A tabela abaixo cobre o que mais aparece em ticket de pre-venda. Onde o
          Kommo ganha, esta marcado como ganha — sem maquiagem.
        </p>
        <table>
          <thead>
            <tr>
              <th>Recurso</th>
              <th>AdSales·Hub</th>
              <th>Kommo</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Preco inicial</td><td>R$ 290/mes (3 usuarios, em BRL)</td><td>~R$ 80/usuario (USD, sujeito a cambio)</td></tr>
            <tr><td>WhatsApp Cloud API nativo</td><td>Sim, oficial Meta</td><td>Sim, oficial Meta</td></tr>
            <tr><td>Bot conversacional no WA</td><td>Construtor visual + IA generativa</td><td>Salesbot (mais maduro, mais flexivel)</td></tr>
            <tr><td>Meta Ads — criar campanha</td><td>IA gera a partir de briefing em PT</td><td>Nao cria, so captura via Lead Ads</td></tr>
            <tr><td>Meta Ads — otimizar verba</td><td>Motor IA roda a cada 48h</td><td>Nao</td></tr>
            <tr><td>Conversions API server-side</td><td>Configurada nativamente</td><td>Nao</td></tr>
            <tr><td>Landing page builder</td><td>Editor incluso, A/B nativo</td><td>Nao</td></tr>
            <tr><td>SDR de voz IA (liga e qualifica)</td><td>Sim — agente IA por telefone</td><td>Nao</td></tr>
            <tr><td>Atendimento e-mail unificado</td><td>Inbox omnichannel</td><td>Limitado, foco WA</td></tr>
            <tr><td>SMS marketing/transacional</td><td>Sim, integrado</td><td>Via terceiros</td></tr>
            <tr><td>Atribuicao 1:1 anuncio→receita</td><td>Nativa, dashboard Analytics</td><td>Limitada, sem closed loop</td></tr>
            <tr><td>Assinatura eletronica (Lei 14.063)</td><td>Modulo Contratos nativo</td><td>Via DocuSign/Clicksign avulso</td></tr>
            <tr><td>Cobranca</td><td>Real (BRL), nota fiscal BR</td><td>Dolar (USD), risco cambial</td></tr>
            <tr><td>Suporte em PT-BR humano</td><td>Sim, time no Brasil</td><td>Sim (parceiros locais)</td></tr>
            <tr><td>Meta Business Verification</td><td>Acompanhamento incluso</td><td>Por sua conta</td></tr>
          </tbody>
        </table>

        <h2>Quando o Kommo continua sendo a escolha mais inteligente</h2>
        <p>
          Vou ser justo. Existe um perfil de empresa pra qual migrar do Kommo eh
          besteira economica. Se voce eh uma confeitaria que vende bolo de
          aniversario, recebe pedido pelo Instagram que vira chat no WhatsApp e
          fecha tudo em quatro mensagens, voce nao precisa de SDR de voz IA nem de
          atribuicao. Voce precisa de um CRM leve, que centralize o chat, com bot
          que pergunte data e sabor enquanto voce dorme. O Kommo faz isso melhor do
          que muito sistema premium e cobra barato pra um time pequeno.
        </p>
        <p>
          Cenarios em que ficar no Kommo eh a decisao certa:
        </p>
        <ul>
          <li>Operacao com 1 a 4 vendedores, 100% dentro do WhatsApp, sem trafego pago in-house.</li>
          <li>Demanda inbound organica (Instagram, indicacao, Google Meu Negocio) que ja chega quente.</li>
          <li>Ticket medio baixo a medio, sem necessidade de proposta formal nem contrato assinado.</li>
          <li>Time apaixonado pelo Salesbot e que ja tem fluxos complexos rodando ha meses.</li>
          <li>Empresa que tem agencia de marketing externa e nao quer trazer trafego pra dentro de casa.</li>
        </ul>
        <p>
          Nesses cenarios, AdSales·Hub seria overkill. Voce ia pagar por modulos que
          nao usaria — Meta Ads, SDR, Contratos — e iria sentir saudade da
          simplicidade. A verdade eh que ferramenta boa eh a que cabe no problema,
          nao a mais robusta.
        </p>

        <h2>Quando AdSales·Hub vence (e nao eh perto)</h2>
        <p>
          Agora pegue o caso oposto. Imagina uma clinica de terapia online com seis
          psicologos e uma recepcionista. Eles rodam R$ 8 mil/mes em Meta Ads,
          capturam lead via formulario na landing page, mandam pro WhatsApp
          automaticamente, qualificam (especialidade, plano de saude, urgencia) e
          agendam consulta. Hoje a stack tipica: Kommo (CRM + WA), Gerenciador da
          Meta na mao do socio que entende um pouco, Webflow ou WordPress pra
          landing, Calendly pra agendamento, RD Station pra e-mail de nutricao,
          DocuSign pro contrato terapeutico LGPD-compliant. Total: ~R$ 1.800/mes em
          ferramentas, mais agencia de R$ 3.500/mes pra cuidar do trafego.
        </p>
        <p>
          O mesmo fluxo no AdSales·Hub Escala (R$ 1.490/mes, usuarios ilimitados):
          briefing escrito em portugues vira campanha de Meta Ads publicada via
          Marketing API v21, criativo gerado por IA, lead captura na landing
          interna, entra no CRM, SDR de voz IA liga em 90 segundos pra confirmar
          dados, agenda na agenda do psicologo, dispara contrato com assinatura
          eletronica conforme Lei 14.063/2020, e o dashboard de Analytics mostra
          que a campanha "Ansiedade — Adultos 25-40" gerou 14 consultas com CAC de
          R$ 213 e LTV de R$ 2.800. Tudo isso num login so, em real, sem agencia.
        </p>
        <p>
          Cenarios em que AdSales·Hub vence o Kommo de lavada:
        </p>
        <ul>
          <li>Empresa que ja roda ou quer rodar Meta Ads sem depender de agencia.</li>
          <li>Operacao multi-canal — WhatsApp eh importante mas nao eh o unico canal.</li>
          <li>Demanda por qualificacao automatizada (volume alto de leads frios que precisam ser triados).</li>
          <li>Necessidade de fechar contrato/proposta com assinatura juridicamente valida no Brasil.</li>
          <li>Time de gestao que cobra atribuicao financeira: "qual anuncio fechou esse negocio?".</li>
          <li>Preocupacao com risco cambial — pagar SaaS estrangeiro virou despesa imprevisivel.</li>
        </ul>

        <h2>Custo real: stack Kommo + extras vs AdSales·Hub</h2>
        <p>
          Comparar so o ticket do CRM eh injusto com os dois lados. O que pesa eh a
          stack inteira. Vou fazer a conta honesta de uma operacao tipica de PME
          brasileira: 5 vendedores, R$ 5 mil/mes em Meta Ads, ~300 leads/mes, 2
          contratos fechados por semana.
        </p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Stack com Kommo</th>
              <th>AdSales·Hub Crescimento</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>CRM (5 usuarios)</td><td>Kommo Avancado: US$ 125/mes ≈ R$ 662</td><td>Incluso (8 usuarios)</td></tr>
            <tr><td>Gestao de Meta Ads</td><td>Agencia: R$ 1.800/mes</td><td>Incluso (modulo Ads + IA)</td></tr>
            <tr><td>Landing page</td><td>Webflow Business: ~R$ 200/mes</td><td>Incluso</td></tr>
            <tr><td>E-mail marketing</td><td>RD Light: ~R$ 270/mes</td><td>Incluso</td></tr>
            <tr><td>Assinatura eletronica</td><td>Clicksign Pro: ~R$ 199/mes</td><td>Add-on R$ 90/mes</td></tr>
            <tr><td>SDR (humano ou nao tem)</td><td>Vendedor Jr: R$ 2.500/mes</td><td>Add-on SDR Voz: R$ 290/mes</td></tr>
            <tr><td><strong>Total mensal</strong></td><td><strong>~R$ 5.631</strong></td><td><strong>R$ 1.070</strong></td></tr>
          </tbody>
        </table>
        <p>
          Olhando friamente, a economia eh de ~80%. Mas o ponto mais importante nem
          eh o preco — eh o fato de que numa stack o lead vive em silos
          desconectados, e na outra ele tem um historico unico do clique no
          anuncio ate a parcela paga. Isso muda como voce decide investir verba no
          mes seguinte.
        </p>

        <h2>Migracao do Kommo: o que esperar</h2>
        <p>
          Migrar CRM da medo. Nao precisa. Quem ja migrou do Kommo conta que a
          parte chata eh psicologica — sair do conhecido — porque tecnicamente a
          troca eh tranquila. O AdSales·Hub tem importador nativo que aceita o
          export padrao do Kommo (CSV de leads, contatos, empresas, pipelines com
          estagios) e mapeia campos custom. A janela de 24h da Meta Business
          Platform Policies para conversas ativas no WhatsApp continua valendo na
          troca, entao planeja a virada num horario de baixo trafego.
        </p>
        <ol>
          <li>Export de leads, contatos, empresas e pipelines via API REST do Kommo (ou CSV manual).</li>
          <li>Importacao guiada com mapeamento de campos custom no AdSales·Hub.</li>
          <li>Migracao do numero WhatsApp Cloud API entre WABAs (suporte da Meta resolve em 24-72h).</li>
          <li>Reescrita dos fluxos do Salesbot pro construtor de automacoes do AdSales·Hub (estrutura parecida, sintaxe diferente).</li>
          <li>Re-teste das integracoes (Pix, agenda, formularios externos).</li>
          <li>No plano Escala, especialista de migracao acompanha por 30 dias sem custo extra.</li>
        </ol>
        <p>
          A verdade eh que a maior parte das operacoes leva entre 7 e 14 dias pra
          virar a chave inteira, e pelo menos a primeira semana eh saudavel rodar
          os dois em paralelo. Quem entende a logica do Kommo pega o AdSales·Hub
          em poucas horas — nao eh um produto que pune o usuario com curva ingrime.
        </p>

        <h2>Veredito honesto</h2>
        <p>
          Kommo eh excelente no que se propoe a fazer: ser o melhor CRM pra quem
          vive dentro do WhatsApp. Se sua operacao cabe nessa frase, fica nele de
          coracao tranquilo. AdSales·Hub eh excelente em outra coisa: ser o sistema
          unico de uma empresa brasileira que vende online em 2026 — anuncio,
          captura, qualificacao, atendimento, fechamento e contrato. A pergunta nao
          eh "qual eh melhor", eh "qual problema você esta resolvendo agora". Se
          voce respondeu "tudo isso", o ponteiro pende pra ca.
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
