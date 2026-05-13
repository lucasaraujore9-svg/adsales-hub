import Link from "next/link";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth/guards";
import { getCreditBalance, getCreditCost } from "@/lib/billing/credits";
import { generateCreative } from "@/lib/actions/creatives";
import {
  COMPOSITION_OPTIONS,
  LIGHTING_OPTIONS,
  MOOD_OPTIONS,
  PALETTE_OPTIONS,
  QUALITY_OPTIONS,
  STYLE_OPTIONS,
  TEXT_POSITION_OPTIONS,
  TEXT_RENDERER_OPTIONS,
} from "@/lib/ai-creative/prompt-builder";

export const metadata = { title: "Gerar criativo IA · AdSales Hub" };

interface SearchParams {
  status?: string;
  id?: string;
  type?: string;
  required?: string;
  balance?: string;
  charged?: string;
}

const SELECT_CLASS =
  "mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm";

function SectionTitle({ step, title, hint }: { step: string; title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
        {step}
      </p>
      <h3 className="mt-0.5 text-sm font-medium">{title}</h3>
      {hint ? (
        <p className="mt-1 text-[11px] text-[color:var(--ink-4)]">{hint}</p>
      ) : null}
    </div>
  );
}

export default async function GenerateCreativePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const [balance, imageCost, imagePremiumCost, videoCost, videoPremiumCost] =
    await Promise.all([
      getCreditBalance(session.workspaceId),
      getCreditCost("image"),
      getCreditCost("image_premium"),
      getCreditCost("video"),
      getCreditCost("video_premium"),
    ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/campanhas/criativos"
        className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="mr-1 inline h-3 w-3" /> Biblioteca
      </Link>

      <PageHeader
        kicker="Bloco B · Criativos"
        title="Gerar criativos com IA"
        description="Preencha o briefing por etapas — montamos o prompt para você."
        actions={
          <div className="rounded-pill border border-[color:var(--line-2)] px-3 py-1 text-xs">
            {balance.unlimited ? (
              <span className="font-medium text-[color:var(--accent)]">
                Creditos: ilimitado
              </span>
            ) : (
              <span>
                <span className="font-mono">{balance.balance}</span> creditos
                {balance.monthlyAllowance > 0 && (
                  <span className="ml-1 text-[10px] text-[color:var(--ink-4)]">
                    (+{balance.monthlyAllowanceRemaining}/mes)
                  </span>
                )}
              </span>
            )}
          </div>
        }
      />

      {sp.status === "ok" && (
        <div className="mb-4 rounded-lg border border-[color:var(--good)]/30 bg-[color:var(--good)]/10 p-3 text-xs text-[color:var(--good)]">
          Criativo gerado com sucesso{sp.charged ? ` (-${sp.charged} creditos)` : ""}.{" "}
          <Link className="underline" href="/campanhas/criativos">
            Ver biblioteca
          </Link>
          .
        </div>
      )}
      {sp.status === "insufficient" && (
        <div className="mb-4 rounded-lg border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 p-3 text-xs">
          <p className="text-[color:var(--bad)]">
            Saldo insuficiente. Necessario: {sp.required ?? "?"}, disponivel: {sp.balance ?? "?"}.
          </p>
          <Link
            href="/configuracoes/billing/creditos"
            className="mt-1 inline-block font-medium text-[color:var(--accent)] hover:underline"
          >
            Comprar creditos →
          </Link>
        </div>
      )}
      {sp.status === "queued" && (
        <div className="mb-4 rounded-lg border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/10 p-3 text-xs text-[color:var(--warn)]">
          A geracao de {sp.type === "video" ? "video" : "midia"} foi enfileirada e nao retornou um
          arquivo final agora. Os creditos foram devolvidos. Tente novamente em alguns instantes.
        </div>
      )}
      {sp.status === "error" && (
        <div className="mb-4 rounded-lg border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 p-3 text-xs text-[color:var(--bad)]">
          Falha ao gerar o criativo. Os creditos foram devolvidos.
        </div>
      )}

      <WidgetCard kicker="Briefing" title="Descreva o criativo por etapas">
        <form action={generateCreative} className="space-y-7">
          {/* 1. Identificação ------------------------------------------------ */}
          <section>
            <SectionTitle
              step="1 · Identificação"
              title="Como esse criativo será catalogado"
            />
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome interno</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: Hero Black Friday SaaS v1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select id="type" name="type" defaultValue="image" className={SELECT_CLASS}>
                    <option value="image">Imagem</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <select id="format" name="format" defaultValue="1x1" className={SELECT_CLASS}>
                    <option value="1x1">1:1 (feed)</option>
                    <option value="4x5">4:5 (feed vertical)</option>
                    <option value="9x16">9:16 (reels / stories)</option>
                    <option value="16x9">16:9 (horizontal)</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="quality">Qualidade do modelo</Label>
                <select id="quality" name="quality" defaultValue="fast" className={SELECT_CLASS}>
                  {QUALITY_OPTIONS.map((o) => {
                    const costImg =
                      o.value === "premium"
                        ? (imagePremiumCost ?? 25)
                        : (imageCost ?? 10);
                    const costVid =
                      o.value === "premium"
                        ? (videoPremiumCost ?? 250)
                        : (videoCost ?? 100);
                    return (
                      <option key={o.value} value={o.value}>
                        {o.label} — {costImg} créd. (img) / {costVid} créd. (vídeo)
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-[11px] text-[color:var(--ink-4)]">
                  <strong>Rápida</strong> (FLUX schnell): boa para iterar conceitos, ~4s. Texto e
                  fidelidade são corrigidos pelo overlay tipográfico do servidor.{" "}
                  <strong>Premium</strong> (FLUX 2): fidelidade e prompt-following bem superiores,
                  ~15s, ideal quando o criativo vai pro ar.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[color:var(--line)]" />

          {/* 2. Conteúdo da imagem ------------------------------------------- */}
          <section>
            <SectionTitle
              step="2 · Conteúdo"
              title="O que aparece na imagem"
              hint="Seja específico. Cite produto, pessoa, objeto, ação. Mais detalhe = imagem mais previsível."
            />
            <div className="space-y-3">
              <div>
                <Label htmlFor="theme">Tema da campanha</Label>
                <Textarea
                  id="theme"
                  name="theme"
                  required
                  className="min-h-[60px]"
                  placeholder="Ex: Lançamento do AdSales Hub para PMEs que pagam agência de marketing"
                />
              </div>
              <div>
                <Label htmlFor="highlight">Destaque principal</Label>
                <Textarea
                  id="highlight"
                  name="highlight"
                  required
                  className="min-h-[80px]"
                  placeholder="Ex: CEO brasileira de 35 anos, sorridente e confiante, segurando um notebook moderno aberto que mostra o dashboard do AdSales Hub. Roupa social casual."
                />
              </div>
              <div>
                <Label htmlFor="background">Cenário / fundo (opcional)</Label>
                <Textarea
                  id="background"
                  name="background"
                  className="min-h-[60px]"
                  placeholder="Ex: Escritório minimalista com janela grande ao fundo, plantas em vasos, parede off-white. Profundidade de campo levemente desfocada."
                />
              </div>
            </div>
          </section>

          <div className="border-t border-[color:var(--line)]" />

          {/* 3. Estilo visual ------------------------------------------------ */}
          <section>
            <SectionTitle
              step="3 · Estilo visual"
              title="A linguagem visual da imagem"
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="style">Estilo</Label>
                <select
                  id="style"
                  name="style"
                  defaultValue="editorial-photo"
                  className={SELECT_CLASS}
                >
                  {STYLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="mood">Atmosfera</Label>
                <select id="mood" name="mood" defaultValue="premium" className={SELECT_CLASS}>
                  {MOOD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="lighting">Iluminação</Label>
                <select
                  id="lighting"
                  name="lighting"
                  defaultValue="soft-diffused"
                  className={SELECT_CLASS}
                >
                  {LIGHTING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="border-t border-[color:var(--line)]" />

          {/* 4. Texto na imagem (collapsible) -------------------------------- */}
          <details className="group rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-2)]/30 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
              <span>
                4 · Texto na imagem{" "}
                <span className="ml-1 text-[11px] font-normal text-[color:var(--ink-4)]">
                  (opcional)
                </span>
              </span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-3 px-4 pb-4">
              <p className="text-[11px] text-[color:var(--ink-4)]">
                Por padrão, o texto é renderizado em tipografia real (Inter) sobre a imagem após
                a geração — independe do modelo, sem erros de ortografia. Prefira chamadas curtas
                (até 6 palavras) para impacto.
              </p>
              <div>
                <Label htmlFor="textRenderer">Como renderizar o texto</Label>
                <select
                  id="textRenderer"
                  name="textRenderer"
                  defaultValue="overlay"
                  className={SELECT_CLASS}
                >
                  {TEXT_RENDERER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
                  <strong>Tipografia do servidor</strong> (recomendado): Inter real, kerning
                  preciso, edição instantânea sem regerar.{" "}
                  <strong>Pelo modelo de IA</strong>: o FLUX 2 desenha o texto integrado à cena —
                  pode parecer mais &quot;orgânico&quot; (texto seguindo perspectiva, sombras
                  realistas) mas pode errar acentos do português (~20-30% das vezes). Só vale a
                  pena com Qualidade Premium — em Rápida o texto vira borrão.
                </p>
              </div>
              <div>
                <Label htmlFor="headline">Chamada principal (headline)</Label>
                <Input
                  id="headline"
                  name="headline"
                  placeholder="Ex: Pare de pagar agência"
                  maxLength={80}
                />
              </div>
              <div>
                <Label htmlFor="subheadline">Texto de apoio (sub-headline)</Label>
                <Input
                  id="subheadline"
                  name="subheadline"
                  placeholder="Ex: Marketing + vendas no mesmo lugar"
                  maxLength={120}
                />
              </div>
              <div>
                <Label htmlFor="textPosition">Posição do texto</Label>
                <select
                  id="textPosition"
                  name="textPosition"
                  defaultValue="none"
                  className={SELECT_CLASS}
                >
                  {TEXT_POSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>

          {/* 5. Refinamentos avançados (collapsible) ------------------------- */}
          <details className="group rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-2)]/30 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
              <span>
                5 · Refinamentos avançados{" "}
                <span className="ml-1 text-[11px] font-normal text-[color:var(--ink-4)]">
                  (opcional)
                </span>
              </span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-3 px-4 pb-4">
              <div>
                <Label htmlFor="palette">Paleta de cores</Label>
                <select
                  id="palette"
                  name="palette"
                  defaultValue="brand-orange"
                  className={SELECT_CLASS}
                >
                  {PALETTE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="paletteCustom">
                  Cores personalizadas{" "}
                  <span className="text-[10px] text-[color:var(--ink-4)]">
                    (preencha se escolher &quot;Personalizada&quot; acima)
                  </span>
                </Label>
                <Input
                  id="paletteCustom"
                  name="paletteCustom"
                  placeholder="Ex: verde esmeralda profundo, dourado, fundo bordô"
                />
              </div>
              <div>
                <Label htmlFor="composition">Composição</Label>
                <select id="composition" name="composition" defaultValue="" className={SELECT_CLASS}>
                  <option value="">Sem preferência</option>
                  {COMPOSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="avoid">Elementos a evitar</Label>
                <Textarea
                  id="avoid"
                  name="avoid"
                  className="min-h-[50px]"
                  placeholder="Ex: pessoas em closeup, mãos em primeiro plano, logos de outras marcas, texto em inglês"
                />
                <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
                  Se vazio, aplicamos um padrão (sem watermarks, sem rostos distorcidos, sem texto
                  borrado).
                </p>
              </div>
            </div>
          </details>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              <Sparkles className="mr-1 h-4 w-4" /> Gerar criativo
            </Button>
            <p className="text-[11px] text-[color:var(--ink-4)]">
              {balance.unlimited
                ? "Workspace ilimitado — sem desconto de saldo."
                : "Os creditos sao debitados ao iniciar e estornados se o provider falhar."}
            </p>
          </div>
        </form>
      </WidgetCard>
    </div>
  );
}
