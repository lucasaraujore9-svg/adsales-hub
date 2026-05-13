import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politica de Privacidade · AdSales Hub",
  description:
    "Como o AdSales Hub coleta, usa e protege seus dados pessoais. Em conformidade com a LGPD (Lei nº 13.709/2018) e GDPR.",
};

const sections: { id: string; title: string }[] = [
  { id: "quem-somos", title: "1. Quem somos" },
  { id: "dados-que-coletamos", title: "2. Dados que coletamos" },
  { id: "como-usamos", title: "3. Como usamos seus dados" },
  { id: "compartilhamento", title: "4. Compartilhamento com terceiros" },
  { id: "integracoes", title: "5. Integracoes (Meta, Google, WhatsApp)" },
  { id: "armazenamento", title: "6. Armazenamento e seguranca" },
  { id: "retencao", title: "7. Retencao de dados" },
  { id: "seus-direitos", title: "8. Seus direitos (LGPD)" },
  { id: "cookies", title: "9. Cookies e rastreamento" },
  { id: "menores", title: "10. Menores de idade" },
  { id: "alteracoes", title: "11. Alteracoes nesta politica" },
  { id: "contato", title: "12. Contato e Encarregado (DPO)" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      kicker="Legal"
      title="Politica de Privacidade"
      updatedAt="01 de maio de 2026"
    >
      <nav className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <div className="kicker">Conteudo</div>
        <ol className="mt-3 space-y-1 text-xs">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="quem-somos">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          1. Quem somos
        </h2>
        <p className="mt-3">
          O <strong>AdSales Hub</strong> (&quot;nos&quot;, &quot;nossa plataforma&quot;) e um
          servico SaaS oferecido pela <strong>7iE Group</strong>, com sede no Brasil, que combina
          marketing digital (trafego pago, social media, landing pages) com CRM de vendas.
        </p>
        <p className="mt-3">
          Esta politica explica quais dados coletamos, com que finalidade, como protegemos e quais
          sao seus direitos. Se voce e usuario do AdSales Hub, voce e o &quot;Titular dos
          dados&quot; conforme a Lei Geral de Protecao de Dados (LGPD - Lei nº 13.709/2018).
        </p>
      </section>

      <section id="dados-que-coletamos">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          2. Dados que coletamos
        </h2>
        <p className="mt-3">
          <strong>Dados que voce nos fornece diretamente:</strong>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Cadastro</strong>: nome, email, senha (armazenada com hash bcrypt), telefone,
            nome da empresa.
          </li>
          <li>
            <strong>Workspace</strong>: dados de contatos, empresas, negocios, atividades,
            campanhas, formularios, landing pages que voce cria ou importa.
          </li>
          <li>
            <strong>Pagamento</strong>: processado por terceiros (Stripe). Nao armazenamos numeros
            completos de cartao.
          </li>
          <li>
            <strong>Conteudo de comunicacao</strong>: mensagens enviadas/recebidas via WhatsApp,
            email, SMS atraves da plataforma.
          </li>
        </ul>

        <p className="mt-4">
          <strong>Dados coletados automaticamente:</strong>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Tecnicos</strong>: endereco IP, tipo de navegador, sistema operacional,
            timestamps de acesso, paginas visitadas.
          </li>
          <li>
            <strong>Comportamento</strong>: cliques, formularios preenchidos, UTMs (origem do
            trafego).
          </li>
          <li>
            <strong>Cookies</strong>: usamos cookies essenciais (sessao) e funcionais (preferencias
            de tema). Veja secao 9.
          </li>
        </ul>

        <p className="mt-4">
          <strong>Dados de integracoes (com sua autorizacao):</strong>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Meta (Facebook/Instagram)</strong>: token OAuth de longa duracao, lista de
            contas de anuncio, IDs de Pages, dados de campanhas e leads gerados.
          </li>
          <li>
            <strong>Google Ads</strong>: token OAuth, IDs de contas e campanhas.
          </li>
          <li>
            <strong>WhatsApp Cloud API</strong>: token de acesso, ID do numero, mensagens trocadas.
          </li>
          <li>
            <strong>Google Calendar / Outlook / iCal</strong>: eventos para sincronizacao.
          </li>
        </ul>
      </section>

      <section id="como-usamos">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          3. Como usamos seus dados
        </h2>
        <p className="mt-3">Tratamos seus dados pelas seguintes bases legais e finalidades:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Execucao do contrato</strong>: prestacao do servico SaaS, autenticacao,
            faturamento, suporte.
          </li>
          <li>
            <strong>Legitimo interesse</strong>: melhoria do produto, prevencao de fraude,
            analytics agregados, comunicacao transacional.
          </li>
          <li>
            <strong>Consentimento</strong>: emails de marketing (opt-out a qualquer momento),
            integracoes com Meta/Google/WhatsApp.
          </li>
          <li>
            <strong>Cumprimento de obrigacao legal</strong>: emissao de notas fiscais, atendimento
            a autoridades.
          </li>
        </ul>
        <p className="mt-3">
          Aplicamos modelos de IA (Claude da Anthropic, GPT da OpenAI) para gerar campanhas,
          insights e qualificar leads. <strong>Seus dados nao sao usados para treinar modelos de
          terceiros</strong> — usamos APIs com clausula explicita de no-training.
        </p>
      </section>

      <section id="compartilhamento">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          4. Compartilhamento com terceiros
        </h2>
        <p className="mt-3">
          Compartilhamos dados apenas com operadores essenciais para a prestacao do servico:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Hospedagem</strong>: VPS dedicada (Hetzner, Frankfurt) e Vercel (CDN).
          </li>
          <li>
            <strong>Banco de dados</strong>: Supabase self-hosted em servidor proprio.
          </li>
          <li>
            <strong>Pagamento</strong>: Stripe Inc. (politica:{" "}
            <a
              href="https://stripe.com/br/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              stripe.com/br/privacy
            </a>
            ).
          </li>
          <li>
            <strong>IA</strong>: Anthropic (Claude), OpenAI (GPT) — apenas conteudo necessario para
            a funcionalidade solicitada.
          </li>
          <li>
            <strong>Email</strong>: Resend, SendGrid (transacional).
          </li>
          <li>
            <strong>Telefonia/SMS</strong>: provedores de voz IA e DID brasileiro (Twilio,
            similares).
          </li>
        </ul>
        <p className="mt-3">
          <strong>Nao vendemos seus dados.</strong> Nao compartilhamos seus dados com anunciantes
          ou data brokers.
        </p>
      </section>

      <section id="integracoes">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          5. Integracoes com Meta, Google e WhatsApp
        </h2>
        <p className="mt-3">
          Quando voce conecta sua conta Meta (Facebook/Instagram) ou Google ao AdSales Hub:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Solicitamos permissoes especificas (ex: <code className="font-mono">ads_management</code>,{" "}
            <code className="font-mono">leads_retrieval</code>) e voce autoriza no popup oficial do
            Facebook/Google.
          </li>
          <li>
            Armazenamos um <strong>token OAuth criptografado</strong> com chave AES-256 no nosso
            banco. O token e usado exclusivamente para executar acoes que voce solicitou (criar
            campanhas, ler insights, receber leads).
          </li>
          <li>
            Voce pode <strong>revogar o acesso</strong> a qualquer momento em{" "}
            <code className="font-mono">/configuracoes/meta-ads</code> (botao &quot;Desconectar&quot;)
            ou diretamente em{" "}
            <a
              href="https://www.facebook.com/settings?tab=business_tools"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              facebook.com/settings/business_tools
            </a>
            .
          </li>
          <li>
            Conforme exigido pelo Facebook, voce pode solicitar a <strong>exclusao dos seus dados
            do Facebook</strong> em nosso sistema enviando email para{" "}
            <a
              href="mailto:dpo@7iegroup.com.br"
              className="underline"
            >
              dpo@7iegroup.com.br
            </a>
            . Excluiremos em ate 7 dias e enviaremos confirmacao.
          </li>
        </ul>
        <p className="mt-3">
          Cumprimos as{" "}
          <a
            href="https://developers.facebook.com/terms/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Politicas da Plataforma Meta
          </a>{" "}
          e os{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Termos de Servicos das APIs do Google (Limited Use)
          </a>
          .
        </p>
      </section>

      <section id="armazenamento">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          6. Armazenamento e seguranca
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Criptografia em transito</strong>: TLS 1.3 em todas as conexoes (HTTPS).
          </li>
          <li>
            <strong>Criptografia em repouso</strong>: tokens de integracao com AES-256-GCM. Senhas
            com bcrypt (cost 12).
          </li>
          <li>
            <strong>Isolamento multi-tenant</strong>: Row Level Security (RLS) ativo em todas as
            tabelas — cada workspace ve apenas seus proprios dados.
          </li>
          <li>
            <strong>Backups</strong>: snapshots diarios criptografados, retencao de 30 dias.
          </li>
          <li>
            <strong>Localidade</strong>: dados hospedados na Uniao Europeia (Frankfurt). Voce
            consente com a transferencia internacional ao usar a plataforma.
          </li>
          <li>
            <strong>Acesso interno</strong>: restrito a engenheiros autorizados, com auditoria de
            logs.
          </li>
        </ul>
      </section>

      <section id="retencao">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          7. Retencao de dados
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Conta ativa</strong>: enquanto sua assinatura estiver ativa.
          </li>
          <li>
            <strong>Apos cancelamento</strong>: 30 dias de grace period para reativar; em seguida,
            exclusao definitiva.
          </li>
          <li>
            <strong>Dados fiscais</strong>: 5 anos por exigencia legal (notas fiscais, registros
            financeiros).
          </li>
          <li>
            <strong>Logs tecnicos</strong>: 90 dias.
          </li>
          <li>
            <strong>Comunicacao com suporte</strong>: 2 anos.
          </li>
        </ul>
      </section>

      <section id="seus-direitos">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          8. Seus direitos (LGPD Art. 18)
        </h2>
        <p className="mt-3">Como Titular, voce tem direito a:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Confirmar a existencia de tratamento dos seus dados</li>
          <li>Acessar seus dados (exportacao em JSON/CSV)</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Anonimizar, bloquear ou eliminar dados desnecessarios</li>
          <li>Portabilidade para outro fornecedor</li>
          <li>Eliminacao dos dados pessoais tratados com seu consentimento</li>
          <li>Informacao sobre quais entidades publicas/privadas compartilhamos seus dados</li>
          <li>
            Revogar consentimento a qualquer momento (sem afetar legalidade do tratamento
            anterior)
          </li>
        </ul>
        <p className="mt-3">
          Para exercer qualquer um destes direitos, envie email para{" "}
          <a href="mailto:dpo@7iegroup.com.br" className="underline">
            dpo@7iegroup.com.br
          </a>
          . Respondemos em ate <strong>15 dias</strong>.
        </p>
      </section>

      <section id="cookies">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          9. Cookies e rastreamento
        </h2>
        <p className="mt-3">Usamos as seguintes categorias de cookies:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Essenciais</strong>: sessao de login (cookie HttpOnly), CSRF tokens. Sem isso o
            servico nao funciona.
          </li>
          <li>
            <strong>Funcionais</strong>: preferencias (tema claro/escuro, idioma).
          </li>
          <li>
            <strong>Analytics agregados</strong>: PostHog/Plausible (sem identificadores pessoais
            persistentes).
          </li>
        </ul>
        <p className="mt-3">
          <strong>Nao usamos cookies de publicidade de terceiros</strong> (sem Facebook Pixel /
          Google Ads no nosso proprio site institucional). Se voce ativa o Pixel da Meta nas suas
          campanhas via AdSales Hub, isso e responsabilidade sua perante seus visitantes.
        </p>
      </section>

      <section id="menores">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          10. Menores de idade
        </h2>
        <p className="mt-3">
          O AdSales Hub <strong>nao e destinado a menores de 18 anos</strong>. Nao coletamos
          conscientemente dados de menores. Se identificarmos cadastro de menor, excluiremos
          imediatamente. Se voce e responsavel legal e suspeita disso, contate{" "}
          <a href="mailto:dpo@7iegroup.com.br" className="underline">
            dpo@7iegroup.com.br
          </a>
          .
        </p>
      </section>

      <section id="alteracoes">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          11. Alteracoes nesta politica
        </h2>
        <p className="mt-3">
          Podemos atualizar esta politica para refletir mudancas legais, novas funcionalidades ou
          melhorias. Mudancas materiais serao notificadas por email com pelo menos{" "}
          <strong>30 dias de antecedencia</strong>. A data de &quot;Ultima atualizacao&quot; no topo
          desta pagina indica a versao vigente.
        </p>
      </section>

      <section id="contato">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          12. Contato e Encarregado de Dados (DPO)
        </h2>
        <p className="mt-3">Duvidas, solicitacoes ou reclamacoes:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Encarregado (DPO)</strong>:{" "}
            <a href="mailto:dpo@7iegroup.com.br" className="underline">
              dpo@7iegroup.com.br
            </a>
          </li>
          <li>
            <strong>Suporte geral</strong>:{" "}
            <a href="mailto:suporte@7iegroup.com.br" className="underline">
              suporte@7iegroup.com.br
            </a>
          </li>
          <li>
            <strong>Autoridade Nacional de Protecao de Dados (ANPD)</strong>:{" "}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              gov.br/anpd
            </a>
          </li>
        </ul>
      </section>
    </LegalLayout>
  );
}
