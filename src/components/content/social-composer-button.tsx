"use client";

import { useState, useTransition } from "react";
import { ImagePlus, PenLine, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSocialPostWithMedia,
  generateSocialImage,
  generateSocialPostWithAI,
} from "@/lib/actions/social-posts";

interface MediaAsset {
  url: string;
  type: "image" | "video";
  prompt?: string;
}

export interface ComposerCredits {
  balance: number;
  monthlyAllowanceRemaining: number;
  imageCost: number;
  videoCost: number;
  unlimited?: boolean;
}

type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

const ASPECT_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1 Feed" },
  { value: "4:5", label: "4:5 Retrato" },
  { value: "9:16", label: "9:16 Stories" },
  { value: "16:9", label: "16:9 YouTube" },
];

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "pinterest", label: "Pinterest" },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

interface ConnectedAccount {
  platform: string;
  status: string;
}

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  pinterest: 500,
};

type Mode = "manual" | "ai";

interface Props {
  accounts: ConnectedAccount[];
  defaultScheduledAt?: string;
  triggerLabel?: string;
  credits?: ComposerCredits;
}

export function SocialComposerButton({
  accounts,
  defaultScheduledAt,
  triggerLabel,
  credits,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [generating, startGen] = useTransition();
  const [mode, setMode] = useState<Mode>("manual");

  const [content, setContent] = useState("");
  const [hashtagsRaw, setHashtagsRaw] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [selected, setSelected] = useState<PlatformKey[]>([]);
  const [scheduled, setScheduled] = useState(Boolean(defaultScheduledAt));
  const [scheduledAt, setScheduledAt] = useState<string>(defaultScheduledAt ?? "");

  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [aiSource, setAiSource] = useState<"ai" | "stub" | null>(null);

  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageAspect, setImageAspect] = useState<AspectRatio>("1:1");
  const [generatingImg, startImg] = useTransition();
  const [balance, setBalance] = useState<number | null>(credits?.balance ?? null);
  const [insufficient, setInsufficient] = useState(false);
  const unlimited = credits?.unlimited === true;

  const imageCost = credits?.imageCost ?? 10;

  const connectedKeys = new Set(
    accounts.filter((a) => a.status === "active").map((a) => a.platform),
  );

  function togglePlatform(p: PlatformKey) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function reset() {
    setMode("manual");
    setContent("");
    setHashtagsRaw("");
    setFirstComment("");
    setSelected([]);
    setScheduled(Boolean(defaultScheduledAt));
    setScheduledAt(defaultScheduledAt ?? "");
    setTopic("");
    setObjective("");
    setBrandVoice("");
    setAiSource(null);
    setMedia([]);
    setImagePrompt("");
    setImageAspect("1:1");
    setInsufficient(false);
  }

  function handleGenerateImage() {
    const fallbackPrompt = imagePrompt.trim() || topic.trim() || content.trim().slice(0, 200);
    if (fallbackPrompt.length < 3) {
      toast.error("Descreva a imagem que você quer gerar.");
      return;
    }
    startImg(async () => {
      const result = await generateSocialImage({
        prompt: fallbackPrompt,
        aspect_ratio: imageAspect,
      });
      if (!result.ok) {
        if (result.reason === "insufficient_credits") {
          setInsufficient(true);
          toast.error(result.error);
          if (typeof result.balance === "number") setBalance(result.balance);
        } else {
          toast.error(result.error ?? "Erro ao gerar imagem");
        }
        return;
      }
      setMedia((prev) => [
        ...prev,
        {
          url: result.data.url,
          type: "image",
          prompt: result.data.prompt,
        },
      ]);
      setBalance(result.data.balance);
      setInsufficient(false);
      toast.success(
        result.data.unlimited
          ? "Imagem gerada."
          : `Imagem gerada (-${result.data.charged} creditos).`,
      );
    });
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  function handleGenerate() {
    if (selected.length === 0) {
      toast.error("Selecione ao menos 1 plataforma para a IA usar como referencia.");
      return;
    }
    if (topic.trim().length < 3 || objective.trim().length < 2) {
      toast.error("Preencha tema e objetivo.");
      return;
    }
    startGen(async () => {
      const result = await generateSocialPostWithAI({
        topic,
        objective,
        brand_voice: brandVoice || null,
        platforms: selected,
      });
      if (!result.ok || !result.data) {
        toast.error(result.error ?? "Erro ao gerar conteudo");
        return;
      }
      setContent(result.data.content_text);
      setHashtagsRaw(result.data.hashtags.join(" "));
      setFirstComment(result.data.first_comment ?? "");
      setAiSource(result.data.source);
      setMode("manual");
      toast.success(
        result.data.source === "ai"
          ? "Conteudo gerado pela IA. Edite antes de salvar."
          : "Rascunho gerado em modo demo. Configure ANTHROPIC_API_KEY para usar IA real.",
      );
    });
  }

  function handleSave(asScheduled: boolean) {
    if (selected.length === 0) {
      toast.error("Selecione ao menos 1 plataforma.");
      return;
    }
    if (content.trim().length < 2) {
      toast.error("Conteudo vazio.");
      return;
    }
    if (asScheduled && !scheduledAt) {
      toast.error("Defina data e hora para agendar.");
      return;
    }
    const hashtags = hashtagsRaw
      .split(/[\s,]+/)
      .map((h) => h.trim().replace(/^#/, ""))
      .filter(Boolean);
    const body = {
      content_text: content,
      hashtags,
      platforms: selected,
      scheduled_at: asScheduled ? scheduledAt : null,
      first_comment: firstComment || null,
      media_urls: media.map((m) => ({
        url: m.url,
        type: m.type,
        prompt: m.prompt,
      })),
    };
    start(async () => {
      const result = await createSocialPostWithMedia(body);
      if (result.ok) {
        toast.success(asScheduled ? "Post agendado" : "Rascunho salvo");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao salvar");
      }
    });
  }

  const limit =
    selected.length > 0
      ? Math.min(...selected.map((p) => PLATFORM_LIMITS[p] ?? 5000))
      : 5000;
  const overLimit = content.length > limit;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <Button size="sm" onClick={() => setOpen(true)}>
        <Sparkles className="mr-1 h-4 w-4" /> {triggerLabel ?? "Novo post"}
      </Button>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo post</DialogTitle>
        </DialogHeader>

        <div className="mb-3 inline-flex rounded-pill border border-[color:var(--line-2)] p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 font-medium transition-colors ${
              mode === "manual"
                ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            }`}
          >
            <PenLine className="h-3.5 w-3.5" /> Manual
          </button>
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 font-medium transition-colors ${
              mode === "ai"
                ? "bg-[color:var(--accent)] text-white"
                : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" /> Gerar com IA
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Plataformas</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const active = selected.includes(p.key);
                const connected = connectedKeys.has(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePlatform(p.key)}
                    className={`rounded-pill border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : connected
                          ? "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                          : "border-dashed border-[color:var(--line-2)] text-[color:var(--ink-4)]"
                    }`}
                    title={
                      connected
                        ? "Conta conectada"
                        : "Conta não conectada — será salvo, mas não pública"
                    }
                  >
                    {p.label}
                    {!connected && " ⚠"}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
              {connectedKeys.size === 0
                ? "Conecte contas em /social/contas para publicar automaticamente."
                : `${connectedKeys.size} conta(s) ativa(s).`}
            </p>
          </div>

          {mode === "ai" ? (
            <div className="space-y-3 rounded-card border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 p-4">
              <div>
                <Label htmlFor="ai-topic">Tema do post</Label>
                <Input
                  id="ai-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: lancamento do módulo de SDR com voz IA"
                />
              </div>
              <div>
                <Label htmlFor="ai-objective">Objetivo</Label>
                <Input
                  id="ai-objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: gerar leads, educar audiencia, divulgar promocao"
                />
              </div>
              <div>
                <Label htmlFor="ai-voice">Tom da marca (opcional)</Label>
                <Input
                  id="ai-voice"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  placeholder="Ex: tecnico, direto, com humor leve"
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
              >
                <Wand2 className="mr-1 h-4 w-4" />
                {generating ? "Gerando..." : "Gerar rascunho"}
              </Button>
              <p className="text-[10px] text-[color:var(--ink-4)]">
                A IA gera o texto adaptado a cada plataforma selecionada, hashtags e melhor horario.
                Voce edita antes de salvar.
              </p>
            </div>
          ) : (
            <>
              {aiSource && (
                <div className="rounded-card border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 px-3 py-2 text-[11px] text-[color:var(--accent)]">
                  {aiSource === "ai"
                    ? "Conteudo gerado por IA — edite livremente antes de salvar."
                    : "Rascunho demo (sem IA configurada) — edite antes de salvar."}
                </div>
              )}

              <div>
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="sp-content">Conteudo</Label>
                  <span
                    className={`font-mono text-[10px] ${
                      overLimit ? "text-[color:var(--bad)]" : "text-[color:var(--ink-4)]"
                    }`}
                  >
                    {content.length}/{limit}
                  </span>
                </div>
                <textarea
                  id="sp-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  maxLength={limit}
                  className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
                  placeholder="O que você vai postar?"
                />
              </div>

              <div>
                <Label htmlFor="sp-hashtags">Hashtags</Label>
                <Input
                  id="sp-hashtags"
                  value={hashtagsRaw}
                  onChange={(e) => setHashtagsRaw(e.target.value)}
                  placeholder="marketing vendas crm saas"
                />
                <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
                  Separe por espacos ou virgulas. Sem # (adiciono automaticamente).
                </p>
              </div>

              <div>
                <Label htmlFor="sp-comment">Primeiro comentario (opcional)</Label>
                <Input
                  id="sp-comment"
                  value={firstComment}
                  onChange={(e) => setFirstComment(e.target.value)}
                  placeholder="Comum em IG: hashtags adicionais aqui"
                />
              </div>

              <fieldset className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
                <legend className="flex items-center justify-between px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                  <span>Imagens</span>
                  {unlimited ? (
                    <span className="rounded-pill border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-2 py-0.5 normal-case tracking-normal text-[color:var(--accent)]">
                      Ilimitado
                    </span>
                  ) : (
                    balance !== null && (
                      <span className="font-mono normal-case tracking-normal">
                        {balance} creditos
                      </span>
                    )
                  )}
                </legend>

                {media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {media.map((m, idx) => (
                      <div
                        key={`${m.url}-${idx}`}
                        className="group relative aspect-square overflow-hidden rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg-2)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.prompt ?? "media"}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Remover imagem"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Descreva a imagem (ou deixe vazio para usar o tema/conteudo)"
                  />
                  <select
                    value={imageAspect}
                    onChange={(e) => setImageAspect(e.target.value as AspectRatio)}
                    className="h-9 rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-2 text-sm"
                  >
                    {ASPECT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateImage}
                  disabled={generatingImg}
                >
                  <ImagePlus className="mr-1 h-4 w-4" />
                  {generatingImg
                    ? "Gerando imagem..."
                    : unlimited
                      ? "Gerar imagem"
                      : `Gerar imagem (-${imageCost} creditos)`}
                </Button>

                {insufficient ? (
                  <div className="rounded-card border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/5 p-3 text-[11px]">
                    <p className="text-[color:var(--bad)]">
                      Saldo insuficiente. Compre creditos para continuar.
                    </p>
                    <a
                      href="/configuracoes/billing/creditos"
                      className="mt-1 inline-block font-medium text-[color:var(--accent)] hover:underline"
                    >
                      Comprar creditos →
                    </a>
                  </div>
                ) : (
                  <p className="text-[10px] text-[color:var(--ink-4)]">
                    Geracoes consomem creditos do saldo. Pacotes adicionais em
                    Billing → Creditos.
                  </p>
                )}
              </fieldset>

              <fieldset className="space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
                <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                  Publicacao
                </legend>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sp-sched-toggle"
                    checked={scheduled}
                    onChange={(e) => setScheduled(e.target.checked)}
                  />
                  <Label htmlFor="sp-sched-toggle" className="!mt-0">
                    Agendar publicacao
                  </Label>
                </div>
                {scheduled && (
                  <div>
                    <Label htmlFor="sp-sched">Quando</Label>
                    <Input
                      id="sp-sched"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                )}
              </fieldset>
            </>
          )}
        </div>

        {mode === "manual" && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending || overLimit}
              onClick={() => handleSave(scheduled)}
            >
              {pending
                ? "Salvando..."
                : scheduled
                  ? "Agendar post"
                  : "Salvar rascunho"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
