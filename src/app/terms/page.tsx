import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Termos de Servico · AdSales Hub",
  description:
    "Condicoes de uso da plataforma AdSales Hub. Marco Civil da Internet, Codigo de Defesa do Consumidor e LGPD.",
};

const sections: { id: string; title: string }[] = [
  { id: "aceite", title: "1. Aceite dos termos" },
  { id: "servico", title: "2. Descricao do servico" },
  { id: "conta", title: "3. Conta e responsabilidades" },
  { id: "uso", title: "4. Uso aceitavel" },
  { id: "conteudo", title: "5. Conteudo do usuário" },
  { id: "pagamento", title: "6. Planos, pagamento e trial" },
  { id: "cancelamento", title: "7. Cancelamento e reembolso" },
  { id: "ip", title: "8. Propriedade intelectual" },
  { id: "integrações", title: "9. Integracoes e APIs de terceiros" },
  { id: "ia", title: "10. Conteudo gerado por IA" },
  { id: "garantias", title: "11. Garantias e limitacao de responsabilidade" },
  { id: "suspensao", title: "12. Suspensao e rescisao" },
  { id: "alteracoes", title: "13. Alteracoes nestes termos" },
  { id: "lei", title: "14. Lei aplicavel e foro" },
  { id: "contato", title: "15. Contato" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      kicker="Legal"
      title="Termos de Servico"
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

      <section id="aceite">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          1. Aceite dos termos
        </h2>
        <p className="mt-3">
          Ao criar uma conta ou usar a plataforma <strong>AdSales Hub</strong>, voce declara ter
          mais de 18 anos, ter capacidade legal para celebrar contratos, e concorda com estes
          Termos de Servico (&quot;Termos&quot;) e com a{" "}
          <a href="/privacy" className="underline">
            Politica de Privacidade
          </a>
          .
        </p>
        <p className="mt-3">
          Se voce contrata em nome de uma empresa, declara ter poderes para vincula-la
          juridicamente.
        </p>
      </section>

      <section id="servico">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          2. Descricao do servico
        </h2>
        <p className="mt-3">
          O AdSales Hub e um <strong>SaaS multi-modulo</strong> que combina:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>CRM de vendas</strong>: pipeline, contatos, atividades, automacoes
          </li>
          <li>
            <strong>Trafego pago com IA</strong>: criacao e otimizacao de campanhas Meta/Google
          </li>
          <li>
            <strong>Marketing organico</strong>: landing pages, formularios, email marketing,
            social media
          </li>
          <li>
            <strong>Analytics</strong>: relatorios unificados marketing + vendas
          </li>
          <li>
            <strong>SDR + agente de voz IA</strong>: qualificacao automatica de leads
          </li>
          <li>
            <strong>Contratos e e-signature</strong>: propostas e assinatura eletronica
          </li>
        </ul>
        <p className="mt-3">
          Os modulos disponiveis dependem do plano contratado. Reservamos o direito de adicionar,
          remover ou modificar funcionalidades, com aviso previo de <strong>30 dias</strong> em
          caso de remocao material.
        </p>
      </section>

      <section id="conta">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          3. Conta e responsabilidades
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            Voce e responsavel por <strong>manter a confidencialidade</strong> da senha e por todas
            as atividades realizadas com sua conta.
          </li>
          <li>
            Voce deve fornecer <strong>informacoes verdadeiras</strong> e mantelas atualizadas.
          </li>
          <li>
            Cada workspace pode ter <strong>multiplos usuarios</strong> com papeis (admin, gestor,
            vendedor, midia, visualizador). O Administrador e responsavel por gerenciar acessos.
          </li>
          <li>
            Notifique-nos <strong>imediatamente</strong> em caso de uso nao autorizado:{" "}
            <a href="mailto:suporte@7iegroup.com.br" className="underline">
              suporte@7iegroup.com.br
            </a>
            .
          </li>
        </ul>
      </section>

      <section id="uso">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          4. Uso aceitavel
        </h2>
        <p className="mt-3">
          Voce concorda em <strong>nao usar</strong> a plataforma para:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Atividades ilegais, fraudulentas ou que violem direitos de terceiros</li>
          <li>
            Spam, mensagens nao solicitadas ou que violem o <strong>CAN-SPAM</strong>, LGPD ou
            CDC
          </li>
          <li>Disparos massivos sem opt-in valido dos destinatarios</li>
          <li>Conteudo odioso, discriminatorio, sexualmente explicito ou que incite violencia</li>
          <li>
            Burlar, descompilar, fazer engenharia reversa ou interferir no funcionamento do
            servico
          </li>
          <li>
            Acessar dados de outros workspaces ou explorar vulnerabilidades (reporte
            responsavelmente em{" "}
            <a href="mailto:security@7iegroup.com.br" className="underline">
              security@7iegroup.com.br
            </a>
            )
          </li>
          <li>
            Revender o servico sem autorizacao escrita (programa de parceiros disponivel sob
            demanda)
          </li>
          <li>Sobrecarregar a infraestrutura com requisicoes abusivas</li>
        </ul>
        <p className="mt-3">
          Violacoes podem resultar em <strong>suspensao imediata</strong> da conta, sem reembolso
          proporcional.
        </p>
      </section>

      <section id="conteudo">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          5. Conteudo do usuario
        </h2>
        <p className="mt-3">
          Voce mantem <strong>100% da propriedade</strong> dos dados que importa, cria ou gera no
          AdSales Hub (contatos, campanhas, criativos, textos, configuracoes).
        </p>
        <p className="mt-3">
          Concede-nos uma <strong>licenca limitada e nao-exclusiva</strong> para processar esses
          dados exclusivamente para prestar o servico (armazenar, exibir, executar IA solicitada
          por voce, integrar com APIs autorizadas).
        </p>
        <p className="mt-3">
          Voce declara possuir todos os direitos sobre o conteudo que faz upload, incluindo
          imagens, videos, copy de campanhas, e que tem base legal (consentimento, legitimo
          interesse) para processar dados pessoais de seus contatos/leads.
        </p>
      </section>

      <section id="pagamento">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          6. Planos, pagamento e trial
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Trial</strong>: 14 dias gratuitos sem necessidade de cartao. Apos o trial, e
            necessario contratar um plano pago para manter o acesso.
          </li>
          <li>
            <strong>Planos modulares</strong>: Operacao (R$ 290), Crescimento (R$ 690), Escala
            (R$ 1.490) ou Custom Builder. Valores em reais (BRL), atualizados periodicamente.
          </li>
          <li>
            <strong>Cobranca</strong>: mensal recorrente, processada via Stripe. Voce autoriza
            cobrancas automaticas no metodo de pagamento cadastrado.
          </li>
          <li>
            <strong>Notas fiscais</strong>: emitidas mensalmente conforme dados cadastrais. Voce
            deve manter CNPJ/dados fiscais atualizados.
          </li>
          <li>
            <strong>Atraso</strong>: apos 7 dias de inadimplencia, o servico pode ser{" "}
            <strong>suspenso</strong>. Apos 30 dias, dados podem ser excluidos.
          </li>
          <li>
            <strong>Reajuste</strong>: anual conforme IPCA, com aviso de 60 dias.
          </li>
        </ul>
      </section>

      <section id="cancelamento">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          7. Cancelamento e reembolso
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Voce pode cancelar a qualquer momento</strong> em{" "}
            <code className="font-mono">/configuracoes/billing</code>. O acesso permanece ate o
            fim do periodo ja pago.
          </li>
          <li>
            <strong>Direito de arrependimento (CDC Art. 49)</strong>: 7 dias corridos a partir da
            primeira contratacao para reembolso integral.
          </li>
          <li>
            <strong>Apos 7 dias</strong>: nao ha reembolso proporcional. Voce mantem acesso ate o
            fim do ciclo.
          </li>
          <li>
            <strong>Exportacao</strong>: voce pode exportar todos os dados em CSV/JSON antes de
            cancelar.
          </li>
        </ul>
      </section>

      <section id="ip">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          8. Propriedade intelectual
        </h2>
        <p className="mt-3">
          O <strong>nome, marca, logo, design, codigo-fonte e conteudo</strong> do AdSales Hub sao
          de propriedade da 7iE Group e protegidos por leis de propriedade intelectual.
        </p>
        <p className="mt-3">Voce nao pode:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Copiar, modificar ou criar obras derivadas</li>
          <li>Usar nossas marcas sem autorizacao escrita</li>
          <li>Remover avisos de copyright</li>
          <li>Usar o servico para construir produto concorrente</li>
        </ul>
      </section>

      <section id="integrações">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          9. Integracoes e APIs de terceiros
        </h2>
        <p className="mt-3">
          O AdSales Hub se integra com servicos de terceiros (Meta, Google, WhatsApp, Stripe,
          Anthropic, OpenAI, etc.). Ao usar essas integracoes:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Voce concorda com os <strong>termos especificos de cada plataforma</strong> (Meta
            Platform Policy, Google API ToS, etc.)
          </li>
          <li>
            Mudancas, indisponibilidades ou rescisao por parte desses provedores estao{" "}
            <strong>fora do nosso controle</strong>
          </li>
          <li>
            Voce e responsavel por manter contas validas e em conformidade com cada provedor
          </li>
          <li>
            Tokens OAuth podem ser revogados a qualquer momento pelo provedor (ex: Facebook expira
            tokens em ~60 dias)
          </li>
        </ul>
      </section>

      <section id="ia">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          10. Conteudo gerado por IA
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            Geramos campanhas, criativos, copies, scripts e insights usando modelos de IA (Claude,
            GPT, modelos de imagem/video).
          </li>
          <li>
            Conteudo gerado por IA pode conter <strong>imprecisoes ou erros</strong>. Voce e
            responsavel por <strong>revisar antes de publicar</strong>, especialmente em
            comunicacao com clientes.
          </li>
          <li>
            <strong>Voce e o autor</strong> do conteudo final que publica e assume
            responsabilidade legal por ele.
          </li>
          <li>
            Nao garantimos que o conteudo gerado seja unico — outros usuarios podem receber outputs
            similares para prompts similares.
          </li>
          <li>
            Aplicamos limites de uso de IA conforme o plano (creditos mensais). Uso excedente pode
            ser cobrado separadamente.
          </li>
        </ul>
      </section>

      <section id="garantias">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          11. Garantias e limitacao de responsabilidade
        </h2>
        <p className="mt-3">
          O servico e fornecido <strong>&quot;como esta&quot; (as-is)</strong>. Embora trabalhemos
          para manter alta disponibilidade (SLA target de 99.5% mensal), nao garantimos que sera
          ininterrupto, livre de erros ou que atendera a todas as suas expectativas.
        </p>
        <p className="mt-3">
          <strong>Nao somos responsaveis por:</strong>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Resultados financeiros ou de negocio (nao garantimos vendas, ROI ou conversoes)</li>
          <li>Decisoes tomadas com base em insights de IA</li>
          <li>Acoes ou omissoes de provedores terceiros (Meta, Google, Stripe, etc.)</li>
          <li>Perda de dados decorrente de uso inadequado</li>
          <li>Suspensao de contas em plataformas de terceiros (Meta Ads, Google Ads)</li>
          <li>Conteudo enviado por voce que viole leis ou direitos de terceiros</li>
        </ul>
        <p className="mt-3">
          Em qualquer hipotese, nossa <strong>responsabilidade total</strong> esta limitada ao
          valor pago por voce nos <strong>ultimos 12 meses</strong> de assinatura.
        </p>
      </section>

      <section id="suspensao">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          12. Suspensao e rescisao
        </h2>
        <p className="mt-3">Podemos suspender ou rescindir o servico em caso de:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Inadimplencia superior a 7 dias</li>
          <li>Violacao destes Termos ou da Politica de Privacidade</li>
          <li>Uso fraudulento ou abusivo</li>
          <li>Determinacao judicial ou administrativa</li>
          <li>Encerramento do produto (com aviso previo de 90 dias)</li>
        </ul>
        <p className="mt-3">
          Em caso de rescisao por nossa parte sem culpa sua, oferecemos{" "}
          <strong>reembolso proporcional</strong> do periodo nao utilizado.
        </p>
      </section>

      <section id="alteracoes">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          13. Alteracoes nestes termos
        </h2>
        <p className="mt-3">
          Podemos atualizar estes Termos. Mudancas materiais serao notificadas por email com{" "}
          <strong>30 dias de antecedencia</strong>. O uso continuado apos a data de vigencia
          significa aceitacao dos novos termos.
        </p>
      </section>

      <section id="lei">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          14. Lei aplicavel e foro
        </h2>
        <p className="mt-3">
          Estes Termos sao regidos pelas leis da <strong>Republica Federativa do Brasil</strong>,
          em especial:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Marco Civil da Internet (Lei nº 12.965/2014)</li>
          <li>Lei Geral de Protecao de Dados (LGPD - Lei nº 13.709/2018)</li>
          <li>Codigo de Defesa do Consumidor (Lei nº 8.078/1990)</li>
          <li>Codigo Civil (Lei nº 10.406/2002)</li>
        </ul>
        <p className="mt-3">
          Fica eleito o <strong>foro da Comarca de Sao Paulo/SP</strong> para dirimir quaisquer
          controversias, com renuncia a qualquer outro, por mais privilegiado que seja.
        </p>
        <p className="mt-3">
          Antes de litigio, as partes se comprometem a tentar resolver disputas por mediacao em
          ate <strong>30 dias</strong>.
        </p>
      </section>

      <section id="contato">
        <h2 className="text-xl font-medium tracking-tighter2 text-[color:var(--ink)]">
          15. Contato
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Suporte</strong>:{" "}
            <a href="mailto:suporte@7iegroup.com.br" className="underline">
              suporte@7iegroup.com.br
            </a>
          </li>
          <li>
            <strong>Comercial</strong>:{" "}
            <a href="mailto:vendas@7iegroup.com.br" className="underline">
              vendas@7iegroup.com.br
            </a>
          </li>
          <li>
            <strong>Juridico / DPO</strong>:{" "}
            <a href="mailto:dpo@7iegroup.com.br" className="underline">
              dpo@7iegroup.com.br
            </a>
          </li>
          <li>
            <strong>Seguranca</strong>:{" "}
            <a href="mailto:security@7iegroup.com.br" className="underline">
              security@7iegroup.com.br
            </a>
          </li>
        </ul>
      </section>
    </LegalLayout>
  );
}
