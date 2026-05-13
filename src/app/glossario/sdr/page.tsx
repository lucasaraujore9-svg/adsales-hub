import type { Metadata } from "next";
import { ContentLayout } from "@/components/content/content-layout";
import { ArticleJsonLd } from "@/components/content/article-jsonld";

const URL = "https://adsaleshub.7iegroup.com.br/glossario/sdr";

export const metadata: Metadata = {
  title: "O que é SDR — função, métricas e quando vale ter",
  description:
    "SDR (Sales Development Representative) explicado: o que faz, quanto custa, métricas de performance e quando faz sentido humano vs IA.",
  alternates: { canonical: URL },
};

const FAQ = [
  { q: "Qual a diferença entre SDR e BDR?", a: "SDR (Sales Development Rep) qualifica leads inbound — quem chegou pelo seu marketing pago ou orgânico. BDR (Business Development Rep) faz prospecção outbound — busca leads do zero, frio, sem nenhum sinal prévio de interesse. Em PMEs brasileiras, é quase sempre a mesma pessoa fazendo as duas coisas, com o título embaralhado. O que importa não é a sigla, é a métrica: quantas reuniões qualificadas chegam pro AE." },
  { q: "Quanto custa um SDR no Brasil em 2026?", a: "Salário CLT júnior ficou entre R$ 2.500 e R$ 3.500, mais comissão variável de 10-25% sobre meta atingida, mais encargos trabalhistas (FGTS, INSS, férias, 13º) que somam cerca de 70% sobre o bruto. Some computador, headset, cadeira, software de discagem, CRM, ferramenta de cadência. O custo real fica entre R$ 4.500 e R$ 6.500 por mês, por SDR. SDR de Voz IA equivalente custa R$ 220 por mês no AdSales Hub e atende 24 horas por dia, sem férias e sem turnover." },
  { q: "SDR de IA substitui humano de verdade?", a: "Para qualificação inicial — perguntas estruturadas de roteiro, agendamento de reunião, retorno de leads frios — sim, com taxa de qualificação que fica em 70-90% da humana sênior e supera a humana júnior. Para negociação consultiva, leitura emocional e fechamento de ticket alto — não, e provavelmente não vai substituir tão cedo. O ideal honesto é IA fazendo qualificação inicial e humano focado só no que faz dinheiro: fechar." },
  { q: "Quando faz sentido contratar SDR humano?", a: "Quando o ticket médio passa de R$ 30 mil, o ciclo de venda é longo (mais de 60 dias), a venda exige múltiplos stakeholders e a qualificação envolve diagnóstico técnico profundo. Aí o humano sênior compensa o custo. Para ticket abaixo de R$ 5 mil, ciclo curto e venda transacional, SDR humano é desperdício de dinheiro — IA cobre 90% do trabalho por 4% do custo." },
];

const COVER_TITLE = encodeURIComponent("O que é SDR (Sales Development Representative)");
const COVER_SUBTITLE = encodeURIComponent("Função, métricas, custo e quando trocar humano por voz IA");

export default function SDRGlossaryPage() {
  return (
    <>
      <ArticleJsonLd url={URL} headline="O que é SDR" description="Função, métricas e quando vale ter." datePublished="2026-05-01" faq={FAQ} />
      <ContentLayout
        kicker="Glossário"
        title="O que é SDR (Sales Development Representative)"
        description="SDR é o profissional que faz a ponte entre marketing e vendas — pega o lead que chegou pelo anúncio, qualifica em 90 segundos e passa pro vendedor sênior fechar."
        crumbs={[
          { label: "Recursos", href: "/recursos" },
          { label: "Glossário", href: "/recursos" },
          { label: "SDR" },
        ]}
        cta={{ label: "Conhecer SDR de Voz IA", href: "/signup" }}
        coverImage={`/api/og?title=${COVER_TITLE}&category=Glossário&subtitle=${COVER_SUBTITLE}`}
        readingMinutes={6}
      >
        <p>
          Um SDR júnior CLT no Brasil custa entre R$ 4.500 e R$ 6.500 por mês quando você
          soma salário, comissão, encargos trabalhistas, equipamento e licença das
          ferramentas. Trabalha 9h às 18h, tira férias, fica doente, pede aumento, e
          eventualmente vai embora pra concorrência levando o conhecimento que você pagou
          pra construir. Um SDR de Voz IA equivalente, dentro do AdSales·Hub, custa R$ 220
          por mês, liga em menos de 30 segundos depois do lead entrar, atende 24 horas por
          dia, faz três tentativas automáticas de contato e não pede férias em dezembro.
          Esse é o cenário que quebrou a economia da função em 2025-2026, e é o motivo
          pelo qual essa página existe.
        </p>
        <p>
          Antes de comprar ou demitir ninguém, vale entender o que um SDR realmente faz,
          quais métricas medem o trabalho dele, e em que situação humano ou IA — ou os
          dois juntos — fazem sentido. O que ninguém te conta nos cursos de vendas é que
          a maior parte do que um SDR júnior faz no dia a dia é puramente operacional:
          ligar pra quem preencheu formulário, perguntar quatro coisas do roteiro,
          agendar no calendário e sair. É exatamente o tipo de trabalho que IA executa
          melhor, mais barato e com menos variação.
        </p>

        <h2>O que faz um SDR no dia a dia</h2>
        <p>
          A função do SDR (Sales Development Representative) nasceu nos Estados Unidos
          dentro do modelo de Aaron Ross na Salesforce nos anos 2000, foi popularizada no
          Brasil por empresas como Resultados Digitais e Reev a partir de 2014, e hoje é
          o cargo de entrada padrão em qualquer time de vendas B2B com volume relevante
          de leads inbound. Na prática, o SDR é o filtro entre marketing e vendas: o
          marketing entrega o lead, o SDR qualifica, e só passa pro Account Executive
          (AE) quem realmente tem chance de fechar. Sem esse filtro, o AE perde o dia
          falando com curioso, estudante de TCC e gente sem orçamento.
        </p>
        <p>
          O dia típico de um SDR envolve receber leads do marketing (formulários, ads,
          eventos, materiais ricos baixados), fazer contato em até cinco minutos da
          captura — porque lead atendido em menos de cinco minutos converte nove vezes
          mais que lead atendido em uma hora —, qualificar via roteiro (BANT ou GPCT,
          falaremos abaixo), tratar objeções iniciais comuns (preço, momento, autoridade),
          marcar reunião na agenda do AE quando o lead encaixa nos critérios e devolver
          o lead pro fluxo de nutrição quando ainda não está pronto. Tudo isso registrado
          no CRM, com tag, motivo e próxima ação.
        </p>

        <h2>Métricas que medem performance de SDR</h2>
        <p>
          Tem uma regra honesta no jogo: SDR que não é medido vira recepcionista de luxo.
          As métricas abaixo são o que separam um time profissional de um time que só
          finge trabalhar. Os benchmarks são realistas para o mercado brasileiro de
          PMEs B2B em 2026 — vale lembrar que time de IA tende a estourar o teto desses
          números porque não dorme, não esquece de ligar e não cansa depois da quinta
          tentativa.
        </p>
        <table>
          <thead><tr><th>Métrica</th><th>Definição</th><th>Benchmark BR</th></tr></thead>
          <tbody>
            <tr><td>Tempo até primeiro contato</td><td>Captura do lead até ligação efetiva</td><td>Menos de 5 minutos</td></tr>
            <tr><td>Taxa de conexão</td><td>Percentual de leads que respondem ou atendem</td><td>30-50%</td></tr>
            <tr><td>Taxa de qualificação (MQL → SQL)</td><td>Marketing Qualified Lead que vira Sales Qualified Lead</td><td>20-35%</td></tr>
            <tr><td>SQLs gerados por mês</td><td>Volume de oportunidades qualificadas entregues ao AE</td><td>40-100 por SDR</td></tr>
            <tr><td>Show rate da reunião</td><td>Percentual de reuniões marcadas em que o lead aparece</td><td>60-80%</td></tr>
            <tr><td>Reuniões → propostas</td><td>Conversão da reunião em proposta enviada</td><td>40-60%</td></tr>
          </tbody>
        </table>

        <h2>SDR humano júnior vs SDR de Voz IA</h2>
        <p>
          O agente de voz IA é a ruptura tecnológica recente que muda completamente o
          cálculo de quando contratar gente. Modelos de voz neural conseguem manter
          conversa natural em português brasileiro, lidar com interrupção, captar
          intenção, seguir roteiro com flexibilidade, registrar tudo no CRM e devolver
          gravação transcrita. Não é mais demonstração de feira — em 2026, isso roda em
          produção, em escala, e fecha reunião. A tabela abaixo é o comparativo direto.
        </p>
        <table>
          <thead><tr><th></th><th>SDR humano júnior CLT</th><th>SDR de Voz IA (AdSales·Hub)</th></tr></thead>
          <tbody>
            <tr><td>Custo mensal real</td><td>R$ 4.500-6.500</td><td>R$ 220</td></tr>
            <tr><td>Disponibilidade</td><td>9h-18h em dias úteis</td><td>24 horas, 7 dias</td></tr>
            <tr><td>Tempo até primeiro contato</td><td>15-60 minutos no melhor caso</td><td>Menos de 30 segundos</td></tr>
            <tr><td>Tentativas automáticas por lead</td><td>1-2 (depende da disposição)</td><td>3 tentativas programadas</td></tr>
            <tr><td>Tempo de treinamento</td><td>30-60 dias até dar resultado</td><td>Imediato (roteiro + tom de voz)</td></tr>
            <tr><td>Variação de performance</td><td>Alta (humor, dia, semana)</td><td>Constante</td></tr>
            <tr><td>Volume de ligações por dia</td><td>40-80 efetivas</td><td>Centenas em paralelo</td></tr>
            <tr><td>Negociação consultiva</td><td>Boa, melhora com experiência</td><td>Limitada a roteiro</td></tr>
            <tr><td>Lida com objeção emocional</td><td>Boa quando treinado</td><td>Roteirizada, suficiente para qualificação</td></tr>
            <tr><td>Turnover anual</td><td>40-60% no setor</td><td>Zero</td></tr>
          </tbody>
        </table>
        <p>
          Caso real do nosso radar: uma agência B2B de São Paulo, ticket médio R$ 4.800,
          tinha dois SDRs juniores com custo total mensal de R$ 11.200. Trocou pelos
          dois SDRs de Voz IA do AdSales·Hub (R$ 440 no total), manteve o show rate em
          75% e cortou R$ 9 mil do custo fixo mensal — sem perder volume de reunião
          qualificada. O AE sênior continuou humano e fechou ainda mais negócio porque
          recebeu mais reunião por unidade de tempo. Isso não é exceção, é o padrão
          para ticket abaixo de R$ 10 mil.
        </p>

        <h2>Por que o modelo híbrido vence</h2>
        <p>
          Substituir todo mundo por IA é exagero, manter tudo humano é desperdício. O
          arranjo que está funcionando nas operações que acompanhamos é o híbrido: a IA
          assume a primeira camada (qualificação inicial, agendamento, follow-up de
          lead frio, retorno em horário fora do comercial) e o humano sênior assume a
          segunda camada (descoberta consultiva, leitura de poder de compra,
          negociação, fechamento). O resultado é um time menor, mais caro por cabeça
          (porque você só mantém os bons), com produtividade por pessoa muito maior e
          custo total menor. A IA limpa o funil; o humano fecha.
        </p>

        <h2>BANT vs GPCT — qual roteiro de qualificação usar</h2>
        <p>
          BANT é a sigla mais antiga e ainda a mais usada: Budget (orçamento), Authority
          (autoridade pra decidir), Need (necessidade real) e Timeline (urgência). Funciona
          bem em venda transacional, com ticket médio definido e ciclo curto. O lead que
          tem orçamento, decide sozinho, precisa agora e quer comprar este mês — esse é o
          SQL clássico.
        </p>
        <p>
          GPCT é a evolução consultiva proposta pela HubSpot: Goals (metas do cliente),
          Plans (planos atuais pra atingir), Challenges (desafios no caminho) e Timeline
          (prazo). Funciona melhor em venda complexa, ticket alto e ciclo longo, porque
          começa pelo problema do cliente em vez do bolso dele. O lead que tem meta clara,
          plano fraco, desafio real e prazo apertado é o SQL premium — esse vale ouro.
        </p>
        <p>
          Na prática, SDR de Voz IA executa BANT impecavelmente porque é estruturado e
          objetivo. GPCT exige mais escuta ativa e adaptação contextual — funciona, mas
          rende mais com humano sênior conduzindo.
        </p>

        <h2>Perguntas frequentes</h2>
        {FAQ.map((f, i) => <div key={i}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </ContentLayout>
    </>
  );
}
