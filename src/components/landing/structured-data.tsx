const SITE_URL = "https://adsaleshub.7iegroup.com.br";

interface StructuredDataProps {
  json: object | object[];
}

function JsonLd({ json }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(json) ? json : json),
      }}
    />
  );
}

/**
 * Full structured data graph for the landing page.
 * Uses @graph to declare multiple connected entities (Organization, WebSite, Product, FAQ, etc).
 * Optimized for Google Rich Results, Bing, ChatGPT/Perplexity citations, and AI Overviews.
 */
export function LandingStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      // Organization
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "AdSales·Hub",
        legalName: "7iE Group",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/brand-assets/png/lockup-horizontal-primary-2x.png`,
          width: 1200,
          height: 320,
          caption: "AdSales·Hub",
        },
        image: { "@id": `${SITE_URL}/#logo` },
        description:
          "Plataforma SaaS brasileira que unifica marketing pago, CRM de vendas, atendimento, social media, SDR de voz com IA e contratos eletrônicos.",
        foundingDate: "2026",
        slogan: "Anúncio, lead e venda num sistema só.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "São Paulo",
          addressRegion: "SP",
          addressCountry: "BR",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            email: "suporte@7iegroup.com.br",
            contactType: "customer support",
            availableLanguage: ["pt-BR"],
            areaServed: "BR",
          },
          {
            "@type": "ContactPoint",
            email: "vendas@7iegroup.com.br",
            contactType: "sales",
            availableLanguage: ["pt-BR"],
            areaServed: "BR",
          },
          {
            "@type": "ContactPoint",
            email: "dpo@7iegroup.com.br",
            contactType: "DPO / privacy",
            availableLanguage: ["pt-BR"],
          },
        ],
        sameAs: [],
      },

      // WebSite (with SearchAction so Google may show sitelinks search box)
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "AdSales·Hub",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "pt-BR",
        description:
          "Plataforma unificada de marketing e vendas com IA. Tráfego pago, CRM, atendimento, SDR de voz e contratos eletrônicos no mesmo sistema.",
      },

      // SoftwareApplication (the product)
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: "AdSales·Hub",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "CRM, Marketing automation, Ad management",
        operatingSystem: "Web",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        image: { "@id": `${SITE_URL}/#logo` },
        description:
          "SaaS brasileiro que substitui agência + gestor de tráfego + 5 ferramentas. CRM, tráfego pago com IA, social, atendimento omnichannel, SDR de voz IA, analytics, landing pages e contratos eletrônicos no mesmo sistema. Atribuição 1:1 do clique à receita.",
        featureList: [
          "CRM com 5 funis e 19 automações",
          "Tráfego pago com IA (Meta + Google) — briefing em português gera campanha completa",
          "Social media em 6 redes com IA replicando criativo vencedor",
          "Atendimento unificado: WhatsApp, e-mail e SMS",
          "SDR de voz com IA que liga e qualifica em 90 segundos",
          "Analytics com atribuição 1:1 e ROAS aferido na receita",
          "Landing pages drag-and-drop com lead direto no CRM",
          "Contratos com assinatura eletrônica (Lei 14.063/2020)",
        ],
        inLanguage: "pt-BR",
        countriesSupported: "BR",
        offers: [
          {
            "@type": "Offer",
            name: "Operação",
            description:
              "Plano básico para começar: CRM + Tráfego IA + Landing Pages. Até 3 usuários e R$ 600/mês em mídia.",
            price: "290",
            priceCurrency: "BRL",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "290",
              priceCurrency: "BRL",
              billingDuration: "P1M",
              billingIncrement: 1,
              unitText: "mês",
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/signup`,
          },
          {
            "@type": "Offer",
            name: "Crescimento",
            description:
              "Operação completa: CRM + Tráfego IA + Social + Atendimento + BI. Até 8 usuários e R$ 2.000/mês em mídia.",
            price: "690",
            priceCurrency: "BRL",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "690",
              priceCurrency: "BRL",
              billingDuration: "P1M",
              billingIncrement: 1,
              unitText: "mês",
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/signup`,
          },
          {
            "@type": "Offer",
            name: "Escala",
            description:
              "Tudo: 8 módulos + SDR Voz IA + Contratos. Usuários ilimitados e R$ 8.000/mês em mídia.",
            price: "1490",
            priceCurrency: "BRL",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "1490",
              priceCurrency: "BRL",
              billingDuration: "P1M",
              billingIncrement: 1,
              unitText: "mês",
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/signup`,
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "1200",
          bestRating: "5",
          worstRating: "1",
        },
        review: [
          {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: { "@type": "Person", name: "Renata P." },
            reviewBody:
              "Substituímos agência + gestor + social media + 4 ferramentas. O CAC caiu 41% no segundo mês. Hoje é 1 pessoa operando o que antes era 6.",
          },
          {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: { "@type": "Person", name: "Marcelo A." },
            reviewBody:
              "A atribuição 1:1 entre campanha e receita fechada mudou como a diretoria olha pro marketing. Virou centro de lucro, não de custo.",
          },
          {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: { "@type": "Person", name: "Camila S." },
            reviewBody:
              "Em 7 dias tinha pipeline, SDR operando e WhatsApp qualificando. A IA sugeriu criativo que performou melhor que o publicitário.",
          },
        ],
      },

      // Product (alternative shape — some engines prefer Product over SoftwareApplication)
      {
        "@type": "Product",
        "@id": `${SITE_URL}/#product`,
        name: "AdSales·Hub",
        category: "Business Software / SaaS",
        brand: { "@id": `${SITE_URL}/#organization` },
        description:
          "Plataforma SaaS brasileira que unifica marketing pago, CRM, atendimento, SDR de voz IA e contratos eletrônicos.",
        image: { "@id": `${SITE_URL}/#logo` },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "BRL",
          lowPrice: "290",
          highPrice: "1490",
          offerCount: 3,
          url: `${SITE_URL}/#precos`,
        },
      },

      // FAQPage — direct citation source for ChatGPT/Perplexity/Google AI Overviews
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        inLanguage: "pt-BR",
        mainEntity: [
          {
            "@type": "Question",
            name: "Precisa demitir agência ou gestor de tráfego pra usar o AdSales·Hub?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Não. A maioria dos clientes começa mantendo a agência e usa o Hub como centro operacional. Em 2-3 meses, quando a equipe interna ganha autonomia, a decisão de substituir fica óbvia — e do cliente, não nossa.",
            },
          },
          {
            "@type": "Question",
            name: "Como funciona a atribuição entre campanha e receita fechada no AdSales·Hub?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Cada lead carrega um ID único desde o clique no anúncio. Esse ID persiste pelo funil, pela conversa no WhatsApp, até o Ganho no CRM. O painel mostra ROAS aferido na receita real — não em conversão de plataforma.",
            },
          },
          {
            "@type": "Question",
            name: "Onde ficam os meus dados? O AdSales·Hub é compatível com LGPD?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Infraestrutura própria em servidor europeu (Frankfurt), em conformidade com LGPD e GDPR. Você tem export completo em CSV e API a qualquer momento. Se sair, sai com tudo.",
            },
          },
          {
            "@type": "Question",
            name: "A IA do AdSales·Hub substitui pessoas?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Substitui trabalho repetitivo (publicar, relatar, distribuir, responder primeira mensagem). Não substitui julgamento humano: quem vende, negocia e fecha continua sendo o seu time — com 3× mais contexto na tela.",
            },
          },
          {
            "@type": "Question",
            name: "Dá pra migrar do meu CRM atual pro AdSales·Hub?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sim. Importamos de RD Station, Pipedrive, HubSpot, Bitrix24 e planilhas. O plano Escala inclui migração assistida com especialista dedicado.",
            },
          },
          {
            "@type": "Question",
            name: "Tem período de fidelidade no AdSales·Hub?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Não. Cobrança mensal. Cancele quando quiser. Trial de 14 dias sem cartão de crédito.",
            },
          },
          {
            "@type": "Question",
            name: "Quais são os preços do AdSales·Hub?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Três planos em reais: Operação R$ 290/mês (CRM + Tráfego IA + Landing Pages, até R$ 600 em mídia, 3 usuários); Crescimento R$ 690/mês (+Social, Atendimento e BI, até R$ 2.000 em mídia, 8 usuários); Escala R$ 1.490/mês (todos os 8 módulos + SDR de Voz IA + Contratos, até R$ 8.000 em mídia, usuários ilimitados). Custom Builder permite montar cesta personalizada.",
            },
          },
          {
            "@type": "Question",
            name: "O AdSales·Hub atende quais tipos de empresa?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pequenas e médias empresas brasileiras (PMEs) que pagam agência mensal e querem internalizar, freelancers de tráfego pago, agências pequenas que querem operar mais clientes com menos pessoas, e empresários que querem controlar tráfego pago + vendas no mesmo sistema.",
            },
          },
        ],
      },

      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: SITE_URL,
          },
        ],
      },
    ],
  };

  return <JsonLd json={graph} />;
}
