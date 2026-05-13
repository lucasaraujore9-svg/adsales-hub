const SITE_URL = "https://adsaleshub.7iegroup.com.br";

interface ArticleProps {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  faq?: { q: string; a: string }[];
}

export function ArticleJsonLd({
  url,
  headline,
  description,
  datePublished,
  dateModified,
  faq,
}: ArticleProps) {
  const graph: object[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline,
      description,
      url,
      datePublished,
      dateModified: dateModified ?? datePublished,
      inLanguage: "pt-BR",
      author: {
        "@type": "Organization",
        name: "AdSales·Hub",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "AdSales·Hub",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/brand-assets/png/lockup-horizontal-primary-2x.png`,
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
  ];

  if (faq && faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

interface CompareProps {
  url: string;
  productA: string;
  productB: string;
  description: string;
}

export function ComparisonJsonLd({ url, productA, productB, description }: CompareProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": url,
          url,
          name: `${productA} vs ${productB}`,
          description,
          inLanguage: "pt-BR",
          about: [
            { "@type": "SoftwareApplication", name: productA },
            { "@type": "SoftwareApplication", name: productB },
          ],
        }),
      }}
    />
  );
}
