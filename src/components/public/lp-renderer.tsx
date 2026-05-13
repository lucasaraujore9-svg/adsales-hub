import { PublicFormEmbed } from "@/components/public/form-embed";

interface Block {
  type:
    | "hero"
    | "problem"
    | "benefits"
    | "features"
    | "testimonials"
    | "form"
    | "pricing"
    | "faq"
    | "cta"
    | "footer"
    | "custom_html";
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  form_id?: string | null;
}

interface FormRow {
  id: string;
  name: string;
  slug: string;
  fields: unknown;
  thank_you_message: string | null;
}

interface Lp {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  meta_pixel_id: string | null;
}

function asBlock(raw: unknown): Block | null {
  if (typeof raw !== "object" || raw === null) return null;
  const b = raw as Record<string, unknown>;
  const validTypes: Block["type"][] = [
    "hero",
    "problem",
    "benefits",
    "features",
    "testimonials",
    "form",
    "pricing",
    "faq",
    "cta",
    "footer",
    "custom_html",
  ];
  const type = b.type as Block["type"];
  if (!validTypes.includes(type)) return null;
  return {
    type,
    title: typeof b.title === "string" ? b.title : null,
    subtitle: typeof b.subtitle === "string" ? b.subtitle : null,
    body: typeof b.body === "string" ? b.body : null,
    cta_label: typeof b.cta_label === "string" ? b.cta_label : null,
    cta_url: typeof b.cta_url === "string" ? b.cta_url : null,
    form_id: typeof b.form_id === "string" ? b.form_id : null,
  };
}

function renderBody(text: string | null | undefined) {
  if (!text) return null;
  // Linhas começando com - viram lista; senão paragraphs
  const lines = text.split("\n");
  const items: string[] = [];
  const paragraphs: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
      items.push(trimmed.replace(/^[-•]\s*/, ""));
    } else if (trimmed) {
      paragraphs.push(trimmed);
    }
  }
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={`p-${i}`} className="text-lg text-slate-600">
          {p}
        </p>
      ))}
      {items.length > 0 && (
        <ul className="space-y-2 text-lg text-slate-700">
          {items.map((it, i) => (
            <li key={`l-${i}`} className="flex items-start gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function LpPublicRenderer({
  lp,
  blocks: rawBlocks,
  forms,
}: {
  lp: Lp;
  blocks: unknown[];
  forms: FormRow[];
}) {
  const blocks = rawBlocks.map(asBlock).filter((b): b is Block => b !== null);
  const formById = new Map(forms.map((f) => [f.id, f]));

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {lp.meta_pixel_id && (
        <noscript>
          <img
            height="1"
            width="1"
            alt=""
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${lp.meta_pixel_id}&ev=PageView&noscript=1`}
          />
        </noscript>
      )}
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "hero":
            return (
              <section key={idx} className="px-6 py-24 text-center">
                <div className="mx-auto max-w-4xl">
                  <h1 className="text-5xl font-bold tracking-tight md:text-6xl">{b.title}</h1>
                  {b.subtitle && (
                    <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">{b.subtitle}</p>
                  )}
                  {b.cta_label && (
                    <a
                      href={b.cta_url ?? "#"}
                      className="mt-10 inline-block rounded-full bg-orange-500 px-8 py-4 text-base font-medium text-white transition-transform hover:scale-105"
                    >
                      {b.cta_label}
                    </a>
                  )}
                </div>
              </section>
            );
          case "problem":
          case "benefits":
          case "features":
          case "faq":
            return (
              <section key={idx} className="border-t border-slate-200 px-6 py-20">
                <div className="mx-auto max-w-3xl space-y-4">
                  {b.title && <h2 className="text-3xl font-semibold tracking-tight">{b.title}</h2>}
                  {renderBody(b.body)}
                </div>
              </section>
            );
          case "testimonials":
            return (
              <section key={idx} className="border-t border-slate-200 bg-slate-50 px-6 py-20">
                <div className="mx-auto max-w-4xl">
                  {b.title && <h2 className="text-3xl font-semibold tracking-tight">{b.title}</h2>}
                  <p className="mt-6 text-slate-500">
                    Depoimentos chegam quando voce conectar a base de clientes.
                  </p>
                </div>
              </section>
            );
          case "pricing":
            return (
              <section key={idx} className="border-t border-slate-200 px-6 py-20">
                <div className="mx-auto max-w-4xl text-center">
                  {b.title && <h2 className="text-3xl font-semibold tracking-tight">{b.title}</h2>}
                  <p className="mt-4 text-slate-500">
                    Planos sao puxados do catalogo de produtos do workspace.
                  </p>
                </div>
              </section>
            );
          case "form":
            const form = b.form_id ? formById.get(b.form_id) : null;
            return (
              <section key={idx} className="border-t border-slate-200 bg-orange-50 px-6 py-20">
                <div className="mx-auto max-w-xl">
                  {b.title && (
                    <h2 className="mb-6 text-center text-3xl font-semibold tracking-tight">
                      {b.title}
                    </h2>
                  )}
                  {form ? (
                    <PublicFormEmbed
                      slug={form.slug}
                      fields={form.fields}
                      thankYou={form.thank_you_message}
                    />
                  ) : (
                    <p className="text-center text-slate-500">
                      Selecione um formulario no editor.
                    </p>
                  )}
                </div>
              </section>
            );
          case "cta":
            return (
              <section key={idx} className="border-t border-slate-200 bg-slate-900 px-6 py-24 text-center text-white">
                <div className="mx-auto max-w-3xl">
                  <h2 className="text-4xl font-bold tracking-tight">{b.title}</h2>
                  {b.body && <p className="mt-6 text-lg text-slate-300">{b.body}</p>}
                  {b.cta_label && (
                    <a
                      href={b.cta_url ?? "#"}
                      className="mt-10 inline-block rounded-full bg-orange-500 px-8 py-4 text-base font-medium text-white transition-transform hover:scale-105"
                    >
                      {b.cta_label}
                    </a>
                  )}
                </div>
              </section>
            );
          case "footer":
            return (
              <footer key={idx} className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
                {b.title && <div className="font-medium text-slate-700">{b.title}</div>}
                {b.body && <p className="mt-2 whitespace-pre-line">{b.body}</p>}
              </footer>
            );
          case "custom_html":
            return (
              <section key={idx} className="px-6 py-12">
                <div
                  className="mx-auto max-w-4xl"
                  dangerouslySetInnerHTML={{ __html: b.body ?? "" }}
                />
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
