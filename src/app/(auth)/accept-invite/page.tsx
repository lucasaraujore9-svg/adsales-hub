import Link from "next/link";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const errorMsg = params.error_description ?? params.error;

  return (
    <div className="space-y-4">
      <span className="kicker">Convite</span>
      <h2 className="text-3xl font-medium tracking-tighter2">
        {errorMsg ? "Convite inválido" : "Confirme seu convite"}
      </h2>
      {errorMsg ? (
        <p className="text-sm text-[color:var(--bad)]">{errorMsg}</p>
      ) : (
        <p className="text-sm text-[color:var(--ink-3)]">
          Abra o link enviado por email para ativar sua conta. O link inclui o
          token necessario para entrar no workspace com a role definida pelo
          admin.
        </p>
      )}
      <Link
        href="/login"
        className="inline-flex text-sm font-medium text-[color:var(--accent)]"
      >
        Ir para login
      </Link>
    </div>
  );
}
