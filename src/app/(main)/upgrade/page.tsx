import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ module?: string; from?: string }>;
}

const MODULE_COPY: Record<string, { title: string; description: string }> = {
  ads: {
    title: "Trafego Pago com IA",
    description:
      "Meta Ads automatizado: briefing em linguagem natural gera campanhas, criativos e publicos. Otimizador IA roda ciclos a cada 2 dias.",
  },
  social: {
    title: "Social Media",
    description:
      "Calendario, criador de post, aprovacao por link e publicacao automatica em Instagram, Facebook, LinkedIn, TikTok, YouTube e Pinterest.",
  },
  msg: {
    title: "Mensagens",
    description:
      "WhatsApp Cloud API, email marketing em massa e SMS integrados ao CRM. Disparos segmentados + metricas.",
  },
  sdr: {
    title: "SDR + Agente de Voz IA",
    description:
      "Qualificacao automatica por telefone em 90s. Agenda reuniao e notifica vendedor.",
  },
  bi: {
    title: "BI / Analytics",
    description:
      "Relatorios white-label em PDF, funil unificado marketing + vendas, CAC, ROAS, drill-down e IA que responde perguntas.",
  },
  site: {
    title: "Landing Pages",
    description:
      "Builder drag-and-drop, templates, A/B test, dominio custom e formularios que caem direto no pipeline.",
  },
  sign: {
    title: "Contratos / E-signature",
    description:
      "Propostas comerciais, contratos com variaveis, assinatura eletronica e certificado com trilha de auditoria.",
  },
};

export default async function UpgradePage({ searchParams }: PageProps) {
  const { module: slug, from } = await searchParams;
  const session = await getSession();
  const supabase = await createServerSupabaseClient();

  type ModuleRow = {
    slug: string;
    display_name: string;
    description: string | null;
    price_monthly: number;
  };
  type BasketRow = {
    name: string;
    display_name: string;
    price_monthly: number;
    module_ids: string[] | null;
    is_featured: boolean;
    trial_days: number;
  };

  const [{ data: moduleRow }, { data: baskets }] = await Promise.all([
    slug
      ? supabase
          .from("modules")
          .select("slug, display_name, price_monthly, description")
          .eq("slug", slug)
          .maybeSingle()
          .overrideTypes<ModuleRow | null>()
      : Promise.resolve({ data: null as ModuleRow | null }),
    supabase
      .from("baskets")
      .select("name, display_name, price_monthly, module_ids, is_featured, trial_days")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true })
      .overrideTypes<BasketRow[]>(),
  ]);

  const copy = slug ? MODULE_COPY[slug] : undefined;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <span className="kicker">Upgrade necessario</span>
      <h1 className="mt-3 text-4xl font-medium tracking-tighter2">
        {copy?.title ?? moduleRow?.display_name ?? "Modulo nao contratado"}
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--ink-3)]">
        {copy?.description ??
          moduleRow?.description ??
          "Este modulo nao esta incluido na sua cesta atual. Contrate o modulo individualmente ou mude para uma cesta que o inclua."}
      </p>
      {from && (
        <p className="mt-2 text-xs text-[color:var(--ink-4)]">
          Voce foi redirecionado de <code className="font-mono">{from}</code>.
        </p>
      )}

      {moduleRow && (
        <div className="mt-8 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="kicker">Modulo</div>
              <div className="mt-1 text-2xl font-medium">
                {moduleRow.display_name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[color:var(--ink-3)]">a partir de</div>
              <div className="text-2xl font-medium">
                R$ {(moduleRow.price_monthly / 100).toFixed(0)}
                <span className="text-sm font-normal text-[color:var(--ink-3)]">/mes</span>
              </div>
            </div>
          </div>
          <Button asChild className="mt-6">
            <Link href={`/configuracoes/billing?add_module=${moduleRow.slug}`}>
              Contratar modulo
            </Link>
          </Button>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-medium tracking-tighter2">
          Ou escolha uma cesta
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(baskets ?? []).map((b) => (
            <div
              key={b.name}
              className={`rounded-card border p-5 ${
                b.is_featured
                  ? "border-[color:var(--accent)] bg-[color:var(--panel)]"
                  : "border-[color:var(--line)] bg-[color:var(--panel)]"
              }`}
            >
              <div className="kicker">{b.is_featured ? "Recomendado" : "Cesta"}</div>
              <div className="mt-2 text-lg font-medium">{b.display_name}</div>
              <div className="mt-2 text-2xl font-medium">
                R$ {(b.price_monthly / 100).toFixed(0)}
                <span className="text-sm font-normal text-[color:var(--ink-3)]">/mes</span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-[color:var(--ink-3)]">
                {((b.module_ids ?? []) as string[]).map((m) => (
                  <li key={m}>— {m}</li>
                ))}
              </ul>
              <Button asChild variant={b.is_featured ? "default" : "outline"} className="mt-6 w-full">
                <Link href={`/configuracoes/billing?basket=${b.name}`}>
                  Escolher {b.display_name}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-[color:var(--ink-4)]">
        Workspace: <strong>{session.workspaceName}</strong> · role {session.role}
      </p>
    </div>
  );
}
