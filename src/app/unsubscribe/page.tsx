import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata = {
  title: "Cancelar inscrição · AdSales Hub",
  robots: { index: false },
};

interface ContactRow {
  id: string;
  email: string | null;
  email_unsubscribed_at: string | null;
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const contactId = sp.contact;
  const token = sp.token;

  if (!contactId || !token) {
    return (
      <Centered icon="error">
        <h1 className="text-2xl font-medium">Link inválido</h1>
        <p className="text-sm text-[color:var(--ink-3)]">
          Os parâmetros necessários não foram fornecidos.
        </p>
      </Centered>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminSupabaseClient() as any;
  const { data: contactRow } = await admin
    .from("contacts")
    .select("id, email, email_unsubscribed_at")
    .eq("id", contactId)
    .eq("unsubscribe_token", token)
    .maybeSingle();
  const contact = contactRow as ContactRow | null;

  if (!contact) {
    return (
      <Centered icon="error">
        <h1 className="text-2xl font-medium">Link inválido ou expirado</h1>
        <p className="text-sm text-[color:var(--ink-3)]">
          Não conseguimos validar este link de cancelamento.
        </p>
      </Centered>
    );
  }

  if (!contact.email_unsubscribed_at) {
    await admin
      .from("contacts")
      .update({ email_unsubscribed_at: new Date().toISOString() })
      .eq("id", contact.id);
  }

  return (
    <Centered icon="ok">
      <h1 className="text-2xl font-medium">Inscrição cancelada</h1>
      <p className="text-sm text-[color:var(--ink-3)]">
        Você não receberá mais emails marketing de <strong>{contact.email}</strong>.
      </p>
      <p className="text-xs text-[color:var(--ink-4)]">
        Para reativar, entre em contato com a empresa diretamente.
      </p>
    </Centered>
  );
}

function Centered({ children, icon }: { children: React.ReactNode; icon: "ok" | "error" }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        color: "var(--ink)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {icon === "ok" ? (
          <CheckCircle2 className="h-12 w-12 text-[color:var(--good)]" />
        ) : (
          <XCircle className="h-12 w-12 text-[color:var(--bad)]" />
        )}
        {children}
      </div>
    </main>
  );
}
