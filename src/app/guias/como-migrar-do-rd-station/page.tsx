import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/guias/como-migrar-do-rd-station";

const TITLE = "Como migrar do RD Station: guia passo a passo (2026)";
const SUBTITLE = "Plano de 7 dias com zero downtime — export, mapeamento, paralelo e go-live";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Migração honesta do RD Station (Marketing Pro + RD CRM + Conversas) pro AdSales·Hub: 7 dias, sem perder lead, com plano paralelo, gotchas reais e cálculo de custo.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "Quanto tempo leva, na prática, pra migrar do RD Station?",
    a: "PME típica com 8-15 mil contatos, 200-400 oportunidades abertas e 4-6 fluxos: 5-7 dias úteis se uma pessoa do time tomar conta, com mais 2 semanas de paralelo pra calibrar atribuição e entregabilidade. Operações com 80k+ contatos ou e-commerce com automações longas: 2-3 semanas, normalmente com migração assistida do plano Escala.",
  },
  {
    q: "Vou perder o histórico de e-mails enviados pelo RD?",
    a: "Sim, parcialmente. O histórico de envios fica retido no painel do RD por 60-90 dias após o cancelamento (depende do contrato), mas não exporta via API. O AdSales·Hub começa a registrar histórico do go-live em diante. Se aberturas e cliques antigos forem críticos pra atribuição, baixe os relatórios de campanha em CSV antes de cancelar — você não vai conseguir reimportar isso, mas pelo menos terá o registro.",
  },
  {
    q: "Posso rodar RD e AdSales·Hub em paralelo durante a migração?",
    a: "Pode, e a verdade é que recomendamos. Trial de 14 dias sem cartão, e o ideal é estender pra 30 dias rodando uma campanha ou um funil completo no AdSales·Hub enquanto o resto continua no RD. Você compara CPL, taxa de resposta e entregabilidade dos dois lados antes de virar a chave.",
  },
  {
    q: "E se eu já tiver Meta Conversions API e Pixel configurados pelo RD?",
    a: "O RD usa um pixel próprio que dispara eventos via tag manager. No AdSales·Hub, a Conversions API roda server-side direto pela conta de anúncio do workspace — você reconfigura uma vez e ganha deduplicação automática entre browser e server. Plano: deixe os dois pixels coexistindo por 7 dias, valide o EMQ no Events Manager, depois remove o RD.",
  },
];

export default function MigrarRDPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Como migrar do RD Station — guia passo a passo (2026)"
        description="Plano de 7 dias com zero downtime, paralelo de 30 dias e checklist real de cutover."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Guia"
        title="Como migrar do RD Station pro AdSales·Hub"
        description="Sete dias úteis, paralelo de 30 dias, zero lead perdido. O passo a passo que clientes nossos seguem na vida real — com gotchas, comandos de API e o que ninguém te conta sobre cutover."
        updatedAt="01 de maio de 2026"
        readingMinutes={11}
        coverImage={`/api/og?title=${encodeURIComponent(TITLE)}&category=Guias&subtitle=${encodeURIComponent(SUBTITLE)}`}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Guias", href: "/recursos" },
          { label: "Migrar do RD Station" },
        ]}
        cta={{ label: "Começar migração agora", href: "/signup" }}
      >
        <p>
          A primeira ligação que a gente recebe sobre migração do RD Station quase
          sempre começa igual: o financeiro abriu o boleto do mês, viu R$ 1.800
          (Marketing Pro + RD CRM + Conversas, com algum add-on de SMS ou WhatsApp),
          fez a conta de quanto isso dá em 12 meses, e mandou o time encontrar
          alternativa até sexta. Honestamente, é uma conversa difícil — porque o RD
          funciona, o time já decorou onde clica, e ninguém quer parar a operação no
          meio do trimestre. Só que a planilha não fecha mais.
        </p>
        <p>
          A boa notícia é que migração de plataforma de marketing/CRM em 2026 não é
          mais o terror que era em 2018. Os dados estão estruturados, as APIs do
          Meta e do WhatsApp Cloud API estão estáveis, e as ferramentas de
          autenticação de domínio (SPF, DKIM, DMARC) viraram commodity. O que ainda
          trava é processo: gente que tenta migrar tudo num fim de semana, esquece
          de avisar o time de vendas, pausa as campanhas erradas e perde 3 dias de
          lead. Este guia é exatamente sobre como <em>não</em> fazer isso.
        </p>
        <p>
          A operação típica que descrevemos aqui é a de uma PME ou agência com 10
          a 50 funcionários, ticket médio entre R$ 1.500 e R$ 15.000, alguns
          milhares de contatos no RD e meia dúzia de fluxos de e-mail rodando.
          Para uma operação de cursos com 8.000 contatos e 4 fluxos, a migração
          completa rodou em 5 dias úteis. Para uma agência com 22 clientes B2B,
          foi cliente por cliente, em 3 semanas. Para um e-commerce com 80k de
          base e automação de carrinho abandonado de 12 etapas, foram 18 dias com
          apoio do nosso time de onboarding. Calibre a expectativa.
        </p>

        <h2>Por que migrar — e quando NÃO migrar</h2>
        <p>
          Migração só faz sentido quando o ganho é claro e mensurável. Os três
          motivos honestos que ouvimos com mais frequência: o pacote completo do
          RD passou de R$ 1.500/mês e a operação não cresceu na mesma proporção;
          o time começou a rodar tráfego pago internamente e o RD não tem isso
          (você acaba pagando RD <em>e</em> Meta Business + alguma planilha pra
          cruzar); ou existe a necessidade de atribuição 1:1 entre o anúncio
          rodado e a venda fechada, o que exige que CRM e ads vivam dentro da
          mesma plataforma.
        </p>
        <p>
          Agora a parte impopular: existem cenários em que migrar é uma má ideia
          — pelo menos por enquanto. Se você tem fluxos de automação de e-mail
          com 50 ou mais etapas, lógica condicional aninhada e segmentação por
          score comportamental que levou 18 meses pra calibrar, refazer isso em
          uma semana é receita pra desastre. Se o seu time tem alguém que vive
          dentro do RD há três anos, conhece todos os atalhos e sua produtividade
          dependa daquela interface específica, prepare onboarding sério antes da
          troca. E se o uso é puramente e-mail marketing transacional de altíssimo
          volume (mais de 500k envios/mês), o RD ainda tem uma maturidade de
          entregabilidade que vale o preço — pelo menos enquanto você não precisar
          de mais nada.
        </p>
        <p>
          Para todos os outros casos — que é a esmagadora maioria — a planilha
          fecha. Vamos pro plano.
        </p>

        <h2>Plano de migração em 7 dias</h2>
        <p>
          A regra de ouro: nada do RD é desligado até o dia 30 do paralelo. Os 7
          dias abaixo são pra deixar o AdSales·Hub <em>operacional</em>, não pra
          descomissionar o RD. Isso reduz a ansiedade do time, dá margem pra
          ajustar entregabilidade, e te permite voltar atrás em qualquer ponto
          sem perder lead.
        </p>

        <h3>Dia 1 — Export limpo do RD Station</h3>
        <p>
          Comece pelo export, sempre. É a coisa mais chata e a mais importante,
          porque define a qualidade de tudo que vem depois. No painel do RD, vá
          em <strong>Configurações → Exportações</strong> e dispare três jobs em
          paralelo: contatos, oportunidades (pelo RD CRM) e listas/segmentações.
          O RD entrega os arquivos por e-mail em 20-40 minutos, dependendo do
          tamanho da base. Para bases acima de 50k contatos, o export quebra em
          múltiplos CSVs — junte tudo num arquivo só antes de importar, senão
          você vai duplicar contato.
        </p>
        <p>
          Fluxos de automação e templates de e-mail são o ponto de dor: o RD não
          tem export por API pública pra automações, então você vai tirar print
          de cada fluxo (ou exportar como PDF via &quot;imprimir página&quot; do
          navegador) e copiar o HTML/texto de cada e-mail manualmente. Olha, o
          que costuma travar nessa etapa é descobrir que metade dos fluxos
          documentados estão pausados há meses e ninguém lembrava. Aproveite e
          faça uma faxina — só migre o que de fato roda.
        </p>
        <ul>
          <li><strong>Contatos:</strong> CSV completo com todos os campos customizados, tags, opt-in status e origem (postRD export). Confira que o campo de e-mail está limpo e único.</li>
          <li><strong>Oportunidades (RD CRM API v2):</strong> exporta com etapa atual, valor, dono, data de criação e produtos vinculados. Cuidado com formatação BRL no campo de valor — vira string em alguns exports.</li>
          <li><strong>Fluxos de e-mail:</strong> screenshot + HTML de cada e-mail. Anote os gatilhos e condições à mão num documento.</li>
          <li><strong>Landing pages:</strong> baixe o HTML público (view-source) e tire screenshot. Vamos refazer no editor do AdSales·Hub — não dá pra portar 1:1 porque o tema do RD é proprietário.</li>
          <li><strong>Tags e segmentações:</strong> exporta como CSV. Use isso pra recriar segmentos dinâmicos depois.</li>
          <li><strong>Relatórios de campanha (últimos 90 dias):</strong> aberturas, cliques, conversões. Não vai migrar — é histórico pra consulta.</li>
        </ul>

        <h3>Dia 2 — Setup do workspace AdSales·Hub e import de contatos</h3>
        <p>
          Aqui você cria o workspace, conecta o domínio próprio (CNAME apontando
          pra <code>app.adsaleshub.com.br</code>), define o accent color e o
          logo do workspace, e cadastra o time com os papéis corretos (Admin,
          Gestor, Vendedor, Media Buyer, Visualizador). Não tente importar
          contato antes de ter os usuários cadastrados, senão a coluna de
          &quot;dono do contato&quot; vai cair toda no admin que importou e dá
          retrabalho.
        </p>
        <p>
          Pro import dos contatos, o jeito limpo é via API. Se você tem 8k
          contatos no CSV, quebre em arquivos de até 2.000 e dispare contra{" "}
          <code>POST /api/v1/contacts/bulk</code> com o token do workspace. Se
          preferir interface, o drag-and-drop também aguenta CSVs grandes, mas
          mostra progresso em tempo real, o que ajuda a detectar problemas de
          encoding (UTF-8 com BOM é o vilão clássico — abra o CSV no VS Code e
          confira). O endpoint retorna um relatório com <code>created</code>,{" "}
          <code>updated</code> e <code>skipped</code>, mais a lista de linhas
          que falharam por validação. Reprocesse só as linhas com erro, nunca o
          CSV inteiro de novo, ou vai duplicar.
        </p>
        <ul>
          <li>Conexão de domínio (CNAME) e configuração de subdomínio pra LPs.</li>
          <li>Cadastro de usuários e atribuição de papel — Vendedor não vê billing, Media Buyer não vê pipeline alheio.</li>
          <li>Mapeamento de campos customizados: mesmos tipos do RD (texto, número, data, select, multi-select, telefone).</li>
          <li>Import via <code>POST /api/v1/contacts/bulk</code> em lotes de 2.000 ou via interface drag-and-drop.</li>
          <li>Validação pós-import: contagem total bate? Tags vieram corretas? Opt-in status preservado?</li>
        </ul>

        <h3>Dia 3 — Funis, oportunidades e regras básicas de pipeline</h3>
        <p>
          Antes de importar oportunidades, recrie o funil (ou os funis — tem
          gente que tem três). O AdSales·Hub vem com 5 templates prontos
          (B2B SaaS, Imobiliária, Educação, Serviços, E-commerce de alto
          ticket), mas você quase sempre vai customizar. Defina o nome de cada
          etapa exatamente igual ao RD — facilita o de/para no CSV de
          oportunidades.
        </p>
        <p>
          O import de oportunidades via{" "}
          <code>POST /api/v1/deals/bulk</code> faz match automático com contatos
          já existentes pelo e-mail. Se o e-mail estiver vazio (acontece em
          oportunidades antigas vinculadas a empresa, não pessoa), o sistema
          cria a oportunidade sem contato vinculado e te entrega uma fila de
          revisão. Resolva isso na mesma semana, senão o vendedor liga pro lead
          e descobre que não sabe quem é.
        </p>
        <ul>
          <li>Recrie funis com mesma nomenclatura de etapa do RD pra preservar comparabilidade de relatório.</li>
          <li>Import de oportunidades via API ou CSV — match automático por e-mail.</li>
          <li>Configure automações básicas: criar atividade ao entrar em etapa, follow-up em 48h sem resposta, lembrete de fechamento próximo do due date.</li>
          <li>Defina motivos de perda (mesma lista do RD) pra preservar histórico de churn analysis.</li>
        </ul>

        <h3>Dia 4 — E-mail marketing, autenticação de domínio e templates</h3>
        <p>
          Esse é o dia que mais derruba migração. E-mail só funciona bem com SPF,
          DKIM e DMARC corretos no DNS — se você só copiar os templates e mandar,
          a entregabilidade despenca, o time acha que o AdSales·Hub é ruim, e a
          migração vira drama político. O fluxo certo é: conecte o domínio de
          envio (recomendamos Resend pela simplicidade do setup), publique os 3
          registros no DNS (Cloudflare ou onde for), espere a propagação (até
          24h), e <em>só então</em> dispare o primeiro e-mail — pra uma lista
          quente de teste, com 50-100 contatos, não pra base inteira.
        </p>
        <p>
          O DMARC merece um cuidado extra: comece com <code>p=none</code>{" "}
          (monitora mas não bloqueia), acompanhe os relatórios por uma semana,
          vai pra <code>p=quarantine</code> e depois <code>p=reject</code>. Se
          você já tinha DMARC configurado pelo RD, copie o valor existente — não
          crie um novo do zero, ou vai sobrescrever o DKIM antigo e quebrar
          envios em paralelo. Recrie templates no editor visual ou cole HTML
          direto. Sequências de boas-vindas, nutrição e re-engajamento ficam em
          uma aba só, com gatilhos de tag, comportamento ou data.
        </p>
        <ul>
          <li>Conexão de domínio de envio via Resend (ou SMTP customizado): publica SPF, DKIM e DMARC.</li>
          <li>Aquecimento progressivo: comece com 200 envios/dia, dobra a cada 3 dias até atingir o volume normal.</li>
          <li>Recriação de templates de e-mail (visual ou HTML colado).</li>
          <li>Sequências automáticas: boas-vindas, nutrição, abandono de carrinho, re-engajamento de inativos.</li>
        </ul>

        <h3>Dia 5 — Landing pages, formulários e captura de UTM</h3>
        <p>
          LPs são refeitas, ponto. Não tente exportar o HTML do RD e colar — o
          tema é proprietário, os scripts apontam pro tracker do RD, e você vai
          herdar bug sem nem saber. O editor drag-and-drop tem templates por
          nicho que cobrem 80% dos casos comuns. Pra LPs com personalização
          pesada, suba via HTML custom (suportamos no plano Crescimento e
          Escala) e configure os formulários pelo painel.
        </p>
        <p>
          Os formulários do AdSales·Hub capturam UTM automaticamente (source,
          medium, campaign, content, term) e jogam direto no campo de origem do
          contato — você não precisa configurar nada pra isso funcionar. Lead
          que entra por LP cai direto no funil correto se você definiu o
          mapeamento de formulário → funil. Para domínios das LPs antigas, ou
          aponte o CNAME pro novo, ou crie um redirect 301 da LP antiga pra
          nova. Não deixe LP morta no ar — Google indexa e você acaba com
          tráfego caindo em página 404 daqui a dois meses.
        </p>
        <ul>
          <li>Recriação das LPs principais (top 5 em conversão) no editor.</li>
          <li>Configuração de formulários com mapeamento campo-a-campo e atribuição automática a funil.</li>
          <li>Apontamento de domínio (CNAME) ou redirect 301 das LPs antigas.</li>
          <li>Pixel Meta + Google Tag Manager + GA4 instalados no header das LPs.</li>
        </ul>

        <h3>Dia 6 — Conexão de canais (Meta, WhatsApp, Google, telefonia)</h3>
        <p>
          Todas as integrações de plataforma rodam por OAuth de 1 clique, com
          exceção do WhatsApp Cloud API e do motor de voz IA, que pedem token e
          número provisionado. Para o Meta, autorize a conta de anúncio (não a
          conta pessoal — erro clássico) e o Pixel correto. A Meta Conversions
          API é configurada server-side no AdSales·Hub, sem tag pra colar — você
          só seleciona qual Pixel vai receber os eventos e o sistema cuida de
          deduplicação entre browser e server (campo <code>event_id</code>{" "}
          compartilhado).
        </p>
        <p>
          Pro WhatsApp Cloud API, se você já tinha número aprovado pelo RD
          Conversas, vai precisar fazer o &quot;número release&quot; pelo BSP do
          RD e reapropriar pelo Meta Business Manager — processo que leva 2-5
          dias úteis e exige acesso de admin no Business Manager. Programe isso
          com antecedência. Se for número novo, o cadastro é direto, demora
          algumas horas pra aprovação do display name.
        </p>
        <ul>
          <li>Meta Marketing API + Pixel + Conversions API (OAuth, 1 clique).</li>
          <li>Google Ads (OAuth) e Google Analytics 4 (Measurement Protocol).</li>
          <li>WhatsApp Cloud API: liberação do número antigo pelo BSP do RD ou cadastro novo via Meta Business Manager.</li>
          <li>Telefonia: provisionamento de DID brasileiro (+55) pra SDR de voz IA.</li>
          <li>Importação de campos de público customizado do Meta (lookalikes, retargeting de carrinho).</li>
        </ul>

        <h3>Dia 7 — Cutover, comunicação interna e go-live controlado</h3>
        <p>
          Cutover não é &quot;pausa o RD e liga o AdSales·Hub&quot;. É um
          processo de 4-6 horas, normalmente numa terça ou quarta de manhã
          (nunca sexta, nunca véspera de feriado), com o time avisado por
          escrito. A sequência: aponte os domínios finais (LPs e e-mail), ative
          as campanhas novas no Meta apontando pras novas LPs, pause as
          campanhas antigas no Meta (não delete — pause), e mande um e-mail
          interno pro time avisando que a partir das 14h os leads novos vão
          aparecer no AdSales·Hub.
        </p>
        <p>
          Mantenha o RD ativo por mais 30 dias. Sério. Você vai precisar
          consultar histórico de e-mail, talvez recuperar um template, validar
          uma conversão antiga. Cancele só depois do paralelo completo — e antes
          de cancelar, reconfirme que o boleto não vai gerar mais um ciclo, que
          é a pegadinha clássica do contrato anual do RD.
        </p>

        <h2>Validação pós go-live — checklist humanizado dos 7 primeiros dias</h2>
        <p>
          Os primeiros 7 dias depois do go-live são pra observar. Não toque em
          mais nada estrutural; só monitore. A verdade é que ninguém migra sem
          pelo menos 1 vendedor reclamando que &quot;sumiu um lead&quot; (na
          maioria das vezes, foi pra outro funil correto). Tenha paciência e
          checklist na mão.
        </p>
        <ul>
          <li>Lead novo de Meta Ads chega ao funil correto, com UTM completo, em menos de 2 minutos.</li>
          <li>Atribuição UTM aparece visível no detalhe do contato (não escondida em campo customizado).</li>
          <li>Sequência de boas-vindas dispara no horário esperado e não cai em SPAM (testa com Gmail, Outlook e iCloud — os três).</li>
          <li>WhatsApp recebe mensagem com template aprovado pela Meta, e a resposta cai na caixa de conversas correta.</li>
          <li>Push notification chega no celular do vendedor responsável quando lead novo entra.</li>
          <li>Atividade automática (ligar, e-mail, follow-up) está sendo criada no momento certo.</li>
          <li>ROAS reportado no dashboard do AdSales·Hub bate com o Events Manager do Meta (variação esperada de 5-15% por causa da janela de atribuição).</li>
          <li>Nenhum lead caiu em &quot;sem dono&quot; por mais de 1 hora — se caiu, ajuste regra de distribuição.</li>
        </ul>

        <h2>Os 3 erros mais comuns na migração — e como evitar</h2>
        <p>
          A gente já viu essa história se repetir vezes suficientes pra mapear
          os três erros que mais derrubam projeto de migração. Anote, evite, e
          poupe duas semanas de retrabalho.
        </p>
        <p>
          <strong>1. Migrar tudo de uma vez, sem paralelo.</strong> O time acha
          que vai economizar tempo cancelando o RD na sexta e ligando o
          AdSales·Hub na segunda. Resultado: na terça falta um campo customizado
          que ninguém mapeou, na quarta um vendedor diz que perdeu 12
          oportunidades, e na quinta o financeiro descobre que o boleto do RD
          ainda vai vir porque tem multa contratual de cancelamento. Sempre rode
          30 dias em paralelo, com pelo menos uma campanha completa migrada, e
          só desligue o RD com tudo validado.
        </p>
        <p>
          <strong>2. Subestimar o setup de entregabilidade de e-mail.</strong>
          Configurar SPF, DKIM e DMARC no DNS parece técnico, e o time
          freelancer que cuida do site &quot;faz quando der&quot;. Aí você
          dispara o primeiro e-mail pra base inteira, cai 40% em SPAM, e o time
          decide voltar pro RD &quot;porque chegava melhor&quot;. Reserve 1
          dia útil só pra autenticação de domínio. Use ferramentas como
          mxtoolbox.com pra validar, e faça aquecimento progressivo
          (200 envios/dia, dobrando a cada 3 dias) por 2 semanas antes de
          mandar campanha grande.
        </p>
        <p>
          <strong>3. Ignorar o ICP e os campos customizados estratégicos.</strong>{" "}
          O RD muitas vezes tem 40+ campos customizados acumulados em 4 anos de
          uso, e metade ninguém mais usa. Mas alguns são fundamentais (MRR,
          segmento, score de qualificação) e definem como o time vende. Se você
          migrar todos sem critério, vira lixo; se migrar de menos, perde
          contexto. Faça uma reunião de 1 hora com o líder de vendas antes do
          Dia 2 pra mapear quais campos são <em>realmente</em> usados nas
          decisões.
        </p>

        <h2>Custo real da migração (pessoa, plataforma, paralelo)</h2>
        <p>
          Dinheiro: a migração tem três componentes de custo que ninguém coloca
          na planilha do diretor financeiro, e depois reclama. Vamos ser
          honestos sobre eles.
        </p>
        <p>
          <strong>Pessoa interna.</strong> Você precisa de uma pessoa do time
          (não terceirizada — alguém que vive a operação) dedicando 4 a 6 horas
          por dia durante os 7 dias da migração ativa. Custo de oportunidade
          médio: R$ 4.500 a R$ 7.500 considerando salário + encargos. Pode ser
          o gestor de marketing, head de RevOps ou até o CEO da PME — alguém
          que decida sem pedir aprovação a cada gotcha que aparecer.
        </p>
        <p>
          <strong>Plataforma em paralelo.</strong> 30 dias rodando RD +
          AdSales·Hub significa pagar duas plataformas no mesmo mês. RD
          (R$ 1.000-1.800) + AdSales·Hub (a partir de R$ 290 na cesta
          Operação, com trial de 14 dias do AdSales·Hub que cobre metade do
          paralelo). Custo extra do mês de transição: R$ 800 a R$ 1.500. A
          partir do segundo mês, você só paga AdSales·Hub e a economia
          mensal cobre o paralelo em 1-2 meses.
        </p>
        <p>
          <strong>Multa contratual do RD.</strong> Se você está em contrato
          anual com 6+ meses pela frente, leia a cláusula de rescisão. Em
          alguns casos vale rodar até o fim do ciclo (em paralelo) e migrar de
          fato no aniversário do contrato. Em outros, a economia mensal já
          paga a multa em 3 meses. Não chute — peça a 2ª via do contrato e
          calcule.
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
