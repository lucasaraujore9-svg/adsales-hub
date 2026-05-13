import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/guias/como-demitir-agencia-sem-perder-resultado";
const TITLE = "Como demitir agência sem perder resultado — plano de 60 dias";
const SUBTITLE = "Internalize marketing sem cratera de pipeline. Transferência de assets, contratação interna, cutover gradual e o script da reunião difícil.";
const COVER = `/api/og?title=${encodeURIComponent(TITLE)}&category=${encodeURIComponent("Guias")}&subtitle=${encodeURIComponent(SUBTITLE)}`;

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Plano de transição de 60 dias pra internalizar marketing sem queda de pipeline: período paralelo, transferência de Business Manager e Pixel, contratação interna, cutover gradual e estabilização.",
  alternates: { canonical: URL },
};

const FAQ = [
  {
    q: "Vou perder pipeline ao demitir a agência?",
    a: "Se fizer transição abrupta, sim — é comum perder 30 a 50% do pipeline nos primeiros 30 dias porque ninguém pega no Business Manager, criativos vencedores ficam parados e a Conversions API quebra. Com plano de 60 dias e período paralelo, a queda fica em 5 a 10% no primeiro mês e a operação recupera (e geralmente supera) no segundo.",
  },
  {
    q: "Quanto custa o período de transição?",
    a: "Cerca de 1.5x o custo normal por 30 a 45 dias: você paga agência + nova plataforma + analista interno em paralelo. Em números reais, R$ 8.000 a R$ 15.000 a mais durante a transição. Esse investimento se paga em 2 a 3 meses pelo fee de agência que você deixa de pagar.",
  },
  {
    q: "Quem é a pessoa ideal pra contratar internamente?",
    a: "Analista de marketing júnior ou pleno com perfil mão-na-massa, à vontade com Business Manager, Pixel e GA4. Não precisa ser sênior se a plataforma faz o trabalho técnico (briefing em linguagem natural vira campanha). Salário típico R$ 4.000 a R$ 6.500 + variável atrelado a CPL e ROAS.",
  },
  {
    q: "Quando NÃO devo internalizar?",
    a: "Se você gasta menos de R$ 3.000/mês em mídia, ainda está validando produto, o sócio não tem perfil de coordenar pessoa interna, ou se a agência também faz estratégia de produto e posicionamento que você não consegue replicar. Internalizar mídia é simples; internalizar pensamento estratégico é outra coisa.",
  },
  {
    q: "E se a agência se recusar a passar os acessos?",
    a: "Acontece. Por isso o passo 1 é confirmar quem é dono do Business Manager (sua empresa ou a agência). Se está no nome da agência, você tem que migrar tudo pra um BM novo — leva 2 a 3 semanas e custa aprendizado de Pixel. Por isso o ideal é nunca deixar uma agência abrir BM no nome dela; e se já deixou, esse é o primeiro problema a resolver.",
  },
  {
    q: "Posso terceirizar parte e internalizar parte?",
    a: "Sim, e às vezes é o melhor caminho. Mantenha freelancer de criativo (designer/editor) por demanda e internalize gestão de campanha + tráfego + CRM. Custa metade de uma agência completa e te dá o controle dos dados.",
  },
];

export default function DemitirAgenciaPage() {
  return (
    <>
      <ArticleJsonLd
        url={URL}
        headline="Como demitir agência sem perder resultado"
        description="Plano 60 dias de transição pra internalizar marketing sem queda de pipeline."
        datePublished="2026-05-01"
        faq={FAQ}
      />
      <ContentLayout
        kicker="Guia"
        title="Como demitir agência sem perder resultado"
        description="O método em 60 dias pra internalizar marketing sem cratera de pipeline. Inclui os 8 acessos que você tem que cobrar, o script da reunião difícil e o checklist financeiro real."
        updatedAt="01 de maio de 2026"
        readingMinutes={11}
        coverImage={COVER}
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Guias", href: "/recursos" },
          { label: "Demitir agência" },
        ]}
        cta={{ label: "Conhecer plataforma que substitui agência", href: "/signup" }}
      >
        <p>
          Você fez a conta no fim do mês passado e doeu. Onze mil reais de fee, mais
          a verba de mídia, mais as ferramentas que a agência cobra pra fora — e o
          relatório que chegou na sexta tinha três gráficos bonitos e nenhuma
          resposta sobre por que o CPL subiu 40% em duas semanas. Você ligou. Ouviu
          que &quot;o leilão do Meta tá pesado&quot;. Desligou pensando que tem que demitir.
          E aí veio o medo.
        </p>
        <p>
          Demitir agência é, honestamente, uma das decisões mais ansiosas que um
          dono de PME toma. Não é o dinheiro — é o medo de acordar segunda-feira com
          campanha pausada, Pixel quebrado, ninguém pra atender o WhatsApp dos leads
          e três meses de cratera no pipeline. É um medo legítimo, porque a maioria
          das transições é feita errado: o sócio decide na quinta, avisa a agência
          na sexta, e na segunda já é problema dele. Não funciona assim.
        </p>
        <p>
          Esse guia é o oposto disso. É o plano de 60 dias que a gente vê funcionar
          repetidamente em PMEs brasileiras: 4 a 8 semanas de preparação invisível,
          uma semana de cutover, uma semana de comunicação formal, e estabilização
          em 12 semanas com queda de no máximo 10% no pior mês. Tem checklist de
          assets, script da reunião difícil, e as armadilhas que ninguém te conta
          até você cair nelas.
        </p>

        <h2>Por que internalizar (e quando NÃO internalizar)</h2>
        <p>
          A matemática é cruel: a maioria das PMEs brasileiras paga entre R$ 8.000
          e R$ 15.000 por mês de fee pra agência executar trabalho que, com
          plataforma certa e um analista interno, ocupa 4 horas do dia de uma
          pessoa. Quando o gasto de mídia ultrapassa R$ 8.000/mês, internalizar é
          matematicamente óbvio — o fee da agência sozinho paga o salário do
          analista e ainda sobra. Acima de R$ 25.000/mês de mídia, manter agência
          é, com poucas exceções, queimar dinheiro.
        </p>
        <p>
          Mas tem um mito que precisa morrer: internalizar não é melhor pra todo
          mundo. Se você gasta menos de R$ 3.000/mês em mídia, está validando
          produto e ainda não sabe direito quem é seu cliente, agência boa é
          investimento — você precisa de gente experiente pra encurtar a curva. Se
          o sócio tem zero perfil de coordenar pessoa interna (não dá feedback, não
          cobra, não acompanha), o analista vai virar mais um boletim sem revisão e
          o resultado vai ser pior do que tinha. E se a agência faz estratégia de
          produto e posicionamento — não só execução de tráfego — você não substitui
          isso com plataforma e júnior; você substitui com consultor sênior que
          custa mais.
        </p>
        <p>
          O perfil clássico de quem deve internalizar: PME com R$ 8k-50k/mês de
          mídia, produto validado, time comercial existente, sócio que faz reunião
          semanal de marketing e já entendeu que tráfego pago não é magia, é
          processo. Se isso é você, segue.
        </p>

        <h2>Plano de 60 dias, semana a semana</h2>
        <p>
          A regra de ouro é: a agência não pode saber até a semana 9. Parece feio,
          mas não é. Você precisa do trabalho deles enquanto monta a operação
          paralela, e qualquer agência que descobre que vai ser desligada perde o
          interesse em performar nas últimas semanas. Profissional disso já viu
          esse filme. Você também vai.
        </p>

        <h3>Semana 1 e 2 — Decisão interna e contratação</h3>
        <p>
          Comece pela decisão. Senta com sócio (ou com você mesmo, se for sozinho)
          e formaliza: vai internalizar, define data D do desligamento (60 dias à
          frente), e calcula o orçamento de transição. Esse é o único momento em
          que a decisão pode voltar atrás sem custo. Daqui pra frente, é compromisso.
        </p>
        <p>
          Em paralelo, abra a vaga do analista. Perfil: alguém com 1 a 3 anos de
          experiência em tráfego pago, que já mexeu em Business Manager de cliente
          (não só de campanha pessoal), entende Pixel ID e Conversions API pelo
          menos no conceito, e tem perfil mão-na-massa — não quer virar gerente em
          6 meses. Salário R$ 4.000 a R$ 6.500 conforme praça, com variável atrelado
          a CPL e ROAS. Publica em LinkedIn, Programathor e grupo de WhatsApp de
          tráfego — você acha em 10 dias.
        </p>
        <ul>
          <li>Confirme decisão com sócios e marca data D do desligamento (60 dias).</li>
          <li>Calcule orçamento de transição: ~1.5x do custo atual por 45 dias.</li>
          <li>Abra vaga de analista de marketing com perfil hands-on em Meta Ads.</li>
          <li>Avalie 2 ou 3 plataformas que substituem o operacional (CRM + Ads + relatórios + atendimento).</li>
          <li>NÃO conte pra agência. Não dá pista. Não fala &quot;tô pensando em mudar&quot;.</li>
        </ul>

        <h3>Semana 3 e 4 — Setup paralelo invisível</h3>
        <p>
          O analista entra. Preferencialmente entre semana 3 e 4, pra ter tempo de
          aprender a plataforma antes de assumir mídia. No primeiro dia, ele faz
          login no AdSales·Hub (ou na ferramenta que você escolheu), conecta sua
          conta Meta Ads em modo leitura, e começa a mapear tudo que a agência tá
          rodando: campanhas ativas, públicos salvos, criativos vencedores,
          orçamento por conjunto. Esse mapeamento sozinho já vale o salário do
          primeiro mês — você vai descobrir coisa absurda, tipo campanha consumindo
          R$ 80/dia há 4 meses com CPL de R$ 280 que ninguém olhou.
        </p>
        <p>
          Em paralelo, configura uma campanha de teste no novo sistema. Não toca
          em nada que a agência tá rodando — cria do zero, com 10% do orçamento
          mensal, mirando a mesma audiência. Serve como controle: no fim do mês
          você compara CPL agência vs CPL interno na mesma janela. Sem isso, você
          desliga a agência sem ter prova de que o time interno performa.
        </p>
        <ul>
          <li>Trial da plataforma escolhida (mínimo 14 dias, ideal 30).</li>
          <li>Analista mapeia tudo que agência roda: campanhas, públicos, criativos, orçamentos.</li>
          <li>Configure 1 funil + 1 campanha de teste em paralelo (10% do orçamento).</li>
          <li>Importe contatos e histórico de leads pro CRM novo.</li>
          <li>Treine analista no fluxo briefing → IA → criativo → publicação.</li>
        </ul>

        <h3>Semana 5 e 6 — Transferência de assets (a parte tensa)</h3>
        <p>
          Aqui começa a parte política. Você vai pedir acessos pra agência sem dizer
          por quê. A desculpa que funciona em 90% dos casos: &quot;auditoria interna&quot; ou
          &quot;novo gerente comercial vai acompanhar campanhas direto&quot;. Não minta sobre o
          desligamento, mas também não precisa anunciar. Pede como demanda
          administrativa normal e pronto.
        </p>
        <p>
          O ponto crítico aqui é: você não tem como saber, antes de pedir, se o
          Business Manager está no nome da sua empresa ou da agência. E essa
          diferença muda tudo. Se está no nome da sua empresa, você dá acesso novo
          ao analista interno e revoga o da agência depois. Se está no nome da
          agência, você precisa criar BM novo no seu nome, refazer Pixel, refazer
          Conversions API, refazer públicos — perde 2 a 3 semanas e parte do
          aprendizado de Pixel acumulado. Por isso a próxima seção desse guia é a
          mais importante de todas.
        </p>

        <h3>Semana 7 e 8 — Cutover gradual</h3>
        <p>
          A regra do cutover é: nunca vire 100% de uma vez. Semana 7, o analista
          interno assume 30% do orçamento de mídia — pega campanhas novas, ou
          divide com a agência por objetivo (ex: agência fica com remarketing,
          interno toma topo de funil). Compara KPIs no fim da semana. Semana 8,
          sobe pra 60%. Agência fica só com campanhas legadas que tão performando
          bem e que você tem medo de pausar.
        </p>
        <p>
          Esse é o momento em que você descobre se contratou a pessoa certa. Se o
          analista entrega CPL no mesmo patamar (ou melhor) que a agência, ótimo,
          continua. Se entregar 30% pior e você não ver causa clara (criativo
          ruim, audiência errada), recue: volta pra 30% e dá mais tempo. É melhor
          atrasar a transição em 3 semanas do que demitir agência cedo demais e
          ficar sem rede.
        </p>
        <ul>
          <li>Semana 7: interno assume 30% do orçamento. Compare CPL vs agência.</li>
          <li>Semana 8: sobe pra 60% se métricas estiverem dentro de ±15%.</li>
          <li>Documente todas as decisões num doc compartilhado (você vai precisar).</li>
          <li>Faça reunião semanal de 30 min só pra olhar números do paralelo.</li>
        </ul>

        <h3>Semana 9 — A reunião difícil</h3>
        <p>
          Chegou a hora. Agenda reunião formal, presencial se for cliente local ou
          videocall com câmera ligada se for remoto — não manda e-mail, não manda
          WhatsApp. Reunião humana. Avisa que vai desligar com X dias de aviso
          prévio (o que estiver no contrato; padrão é 30 dias). Paga tudo que
          deve, paga aviso prévio integral, e negocia o último mês como
          &quot;handover&quot; — eles continuam disponíveis pra dúvida pontual e ajuda na
          documentação dos assets.
        </p>
        <p>
          A agência vai ouvir essa decisão como traição mesmo que você fale bonito,
          porque pra eles você é parte do faturamento mensal e está saindo. É normal.
          O que não pode acontecer é virar guerra: eles ainda têm acesso a Business
          Manager, Pixel e Page; uma agência mal-resolvida pode pausar campanha,
          tirar acesso, ou em casos extremos remover Pixel do site. Por isso pague
          tudo, agradeça publicamente o trabalho, e mantenha relação cordial. Tem
          script abaixo.
        </p>

        <h3>Semana 10 a 12 — Estabilização</h3>
        <p>
          Analista interno opera 100%. Você revoga TODOS os acessos da agência no
          dia seguinte ao último dia de prestação — Business Manager, Page, GA4,
          GTM, Search Console, Tag Manager, e-mail corporativo se tiver. Faça uma
          checklist e marca um por um. Já vimos caso de agência continuar &quot;ajudando&quot;
          sem ser pedida 2 meses depois porque o acesso ficou e ninguém revogou.
        </p>
        <p>
          Esperar oscilação de ±15% nas métricas no primeiro mês é normal. Se a
          queda for maior que 25% e durar 3 semanas, alguma coisa quebrou — Pixel
          desconfigurado, Conversions API com endpoint errado, audiência custom que
          não migrou. Pega lista do mapeamento da semana 3 e vai item por item.
        </p>

        <h2>Os 8 acessos que você TEM que cobrar da agência</h2>
        <p>
          Essa é a parte que ninguém te conta direito. Acesso de mídia não é só
          &quot;login do Meta&quot;. São 8 sistemas distintos, com hierarquias de permissão
          diferentes, e perder qualquer um deles custa de uma semana a dois meses
          de operação reconstruindo. Cobre TODOS na semana 5, antes de comunicar o
          desligamento. Se a agência não te dá algum, você sabe que tem problema
          antes de virar emergência.
        </p>
        <ol>
          <li>
            <strong>Business Manager (Meta) — admin role.</strong> Não &quot;analista&quot;,
            não &quot;anunciante&quot;. Admin. Confirme também se o BM está no CNPJ da sua
            empresa ou da agência (verificação de domínio mostra). Se está no nome
            deles, é o seu primeiro problema.
          </li>
          <li>
            <strong>Pixel ID e Conversions API.</strong> Anote o Pixel ID, confirme
            que ele tá disparando no seu site (use o Pixel Helper), e peça o token
            da Conversions API + endpoint configurado. Se a agência implementou via
            servidor deles, você vai ter que reimplementar — começa antes do
            desligamento.
          </li>
          <li>
            <strong>Page admin do Facebook + Instagram Business.</strong> Você
            precisa ser admin da Page (não só editor) e da conta Instagram conectada.
            Sem admin, não consegue rodar anúncio nem responder mensagem direta.
          </li>
          <li>
            <strong>Google Tag Manager (GTM).</strong> Acesso de admin no
            container, não de &quot;publish only&quot;. Sem isso, você não muda nem uma tag.
          </li>
          <li>
            <strong>Google Analytics (GA4) admin.</strong> Acesso de
            &quot;Administrador&quot; na propriedade GA4, não &quot;Editor&quot; ou &quot;Analista&quot;. Sem
            admin, não muda configuração nem conecta Looker Studio novo.
          </li>
          <li>
            <strong>Google Search Console.</strong> Verificação de propriedade no
            seu domínio. Se a agência verificou via DNS deles, peça pra reverificar
            via meta tag ou arquivo HTML que você controla.
          </li>
          <li>
            <strong>Custom Audiences e lookalikes salvos.</strong> Faça print de
            todos os públicos customizados — especialmente os criados a partir de
            lista de e-mail dos clientes (esses são ouro, e a agência tecnicamente
            tem cópia). Documente nome, tamanho e fonte.
          </li>
          <li>
            <strong>Domínios, DNS e LPs criadas pela agência.</strong> Confirme
            quem é dono do domínio (registro.br ou outro registrar), onde tá
            hospedado, e se as LPs vão continuar acessíveis. Já vimos LP de cliente
            sumir do ar 30 dias depois do desligamento porque a hospedagem era
            paga pelo cartão da agência.
          </li>
        </ol>

        <h2>O script da reunião difícil</h2>
        <p>
          Não improvise. Reunião de desligamento improvisada vira briga ou pedido
          de desconto pra continuar. Use estrutura clara, fala em 5 minutos, e
          deixa espaço pra eles responderem. Roteiro testado:
        </p>
        <p>
          <em>
            &quot;Pessoal, obrigado por separar esse tempo. Tomamos uma decisão
            interna que precisava conversar com vocês pessoalmente: a partir do dia
            [data D], vamos internalizar a operação de marketing. Não é por
            insatisfação com o trabalho de vocês — vocês entregaram [cita um
            resultado real]. É decisão estratégica de controle de dados e custo
            operacional, e já contratamos analista interno que vem trabalhando em
            paralelo nas últimas semanas pra garantir continuidade. Vamos honrar o
            aviso prévio do contrato — pago integral — e gostaria de fechar o último
            mês como handover formal: vocês continuam disponíveis pra dúvida
            pontual, ajudam na documentação dos assets, e a gente faz a transição
            sem ruído. Agradeço de verdade pelo trabalho. Como vocês querem
            estruturar esse último mês?&quot;
          </em>
        </p>
        <p>
          Três coisas pra reparar nesse script. Primeiro, você reconhece o trabalho
          deles — não é puxa-saco, é honestidade, eles trabalharam. Segundo, você
          fala que já contratou interno: tira qualquer chance de eles oferecerem
          desconto pra te segurar. Terceiro, você devolve a pergunta pra eles
          (&quot;como vocês querem estruturar?&quot;): vira parceria, não imposição.
          Funciona em 9 de 10 casos. No 10º, a agência fica brava mesmo, e tudo
          bem — você cumpriu sua parte.
        </p>

        <h2>O que esperar nos primeiros 90 dias pós-internalização</h2>
        <p>
          Mês 1 vai ser desconfortável. O analista ainda tá calibrando, audiência
          custom precisa repopular dado, Pixel pode demorar até 14 dias pra
          reaprender padrão de conversão se você mexeu na configuração. Espera
          queda de 5 a 15% no volume de leads e CPL ligeiramente maior. Não pira.
          Se a queda passar de 25% e durar 3 semanas, aí tem problema técnico real
          e tem que investigar.
        </p>
        <p>
          Mês 2 é recuperação. Volumes voltam ao patamar pré-transição. Analista
          começou a ter intuição própria sobre o que funciona. Você começa a ver
          insight que a agência nunca te deu — tipo &quot;criativo X performa 3x melhor
          em mobile&quot; ou &quot;lead que vem de remarketing fecha 40% mais&quot;. Isso é o
          dado falando direto, sem filtro de quem ganha pra te dar boletim.
        </p>
        <p>
          Mês 3 é superação. Com plataforma unificada (CRM + Ads + atribuição), o
          time interno consegue otimizar olhando funil inteiro, não só CPL. CPL
          geralmente cai 20 a 40%, ROAS sobe, e você começa a ter previsibilidade
          de pipeline. É aqui que o sócio para de ter pesadelo com a decisão e
          começa a se perguntar por que não fez antes.
        </p>

        <h2>Casos reais</h2>
        <p>
          <strong>SaaS B2B com 6 vendedores, R$ 18k/mês de mídia.</strong> Migrou
          em 9 semanas. Mês 1 teve queda de 8% no volume de leads, mês 2 já tava
          5% acima do baseline, mês 3 economizou R$ 9.200/mês de fee + reduziu CPL
          em 32% por causa de melhor atribuição (passaram a ver lead inteiro do
          anúncio até fechamento). Pagou o investimento de transição em 6 semanas.
        </p>
        <p>
          <strong>Ecommerce de moda com 2 sócios, R$ 24k/mês de mídia.</strong>
          Migrou em 7 semanas (mais rápido porque já tinha analista contratado
          quando começou a transição). Mês 1 teve queda de 12% no faturamento
          atribuído a Ads (BlackFriday tava chegando, ajustaram audiências),
          recuperou no mês 2, e no mês 3 ROAS subiu de 3.2 pra 4.1 — mantiveram
          freelancer de criativo por demanda em vez de internalizar designer.
          Custo total caiu 38%.
        </p>

        <h2>Checklist financeiro</h2>
        <table>
          <thead>
            <tr><th>Item</th><th>Antes (agência)</th><th>Depois (interno)</th></tr>
          </thead>
          <tbody>
            <tr><td>Fee mensal de agência</td><td>R$ 9.500</td><td>—</td></tr>
            <tr><td>Salário analista interno</td><td>—</td><td>R$ 5.500 + ~30% encargos</td></tr>
            <tr><td>Plataforma unificada (CRM + Ads + relatórios)</td><td>R$ 800 (CRM separado)</td><td>R$ 690 (AdSales·Hub Crescimento)</td></tr>
            <tr><td>Ferramentas extras (Looker, automação, e-mail mkt)</td><td>R$ 1.300</td><td>R$ 0 (tudo incluso)</td></tr>
            <tr><td>Freelancer de criativo (opcional)</td><td>—</td><td>R$ 1.200</td></tr>
            <tr><td><strong>Total mensal</strong></td><td><strong>R$ 11.600</strong></td><td><strong>R$ 9.040 com encargos</strong></td></tr>
            <tr><td><strong>Economia mensal</strong></td><td colSpan={2}><strong>~R$ 2.560</strong></td></tr>
            <tr><td><strong>Economia anual</strong></td><td colSpan={2}><strong>~R$ 30.700 + controle total dos dados</strong></td></tr>
          </tbody>
        </table>
        <p>
          A economia em si nem é o ponto principal. O ponto é o controle: você sabe
          quanto custa cada lead, vê funil inteiro, decide em 1 dia (não em reunião
          de quinzena com agência), e a inteligência fica dentro de casa. Daqui a
          12 meses, o analista é o cara que mais entende do seu funil — e isso é
          ativo de empresa, não despesa.
        </p>

        <h2>5 erros que sabotam a transição</h2>
        <ol>
          <li>
            <strong>Avisar a agência cedo demais.</strong> Você acha que é
            transparência. Eles vão entender como aviso pra reduzir esforço. As
            últimas 6 semanas de campanha vão ser as piores do contrato. Espere
            até a semana 9.
          </li>
          <li>
            <strong>Não checar dono do Business Manager antes da semana 5.</strong>
            Se está no nome da agência, você descobre tarde demais e vira
            emergência. Cheque na semana 1.
          </li>
          <li>
            <strong>Contratar analista de marketing &quot;generalista&quot; sem fluência em
            tráfego pago.</strong> Pessoa boa em estratégia mas que nunca configurou
            Conversions API vai sofrer. Contrate alguém que já operou Meta Ads de
            cliente externo.
          </li>
          <li>
            <strong>Cortar 100% no dia D, sem cutover gradual.</strong> Garante
            queda de 30%+. Sempre faz cutover de 30% → 60% → 100% nas semanas 7, 8
            e 10.
          </li>
          <li>
            <strong>Não revogar acessos da agência depois do desligamento.</strong>
            Esquecimento clássico. 60 dias depois alguém da agência ainda tá
            entrando no GA4 ou pior, no Page admin. Faça checklist no dia seguinte
            ao último dia de prestação.
          </li>
        </ol>

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
