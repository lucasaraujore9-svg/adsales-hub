import { requireSuperAdmin } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const metadata = { title: "Super Admin · Jobs & Cron" };

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
}

interface CronRunRow {
  runid: number;
  jobid: number;
  job_pid: number | null;
  database: string;
  username: string;
  command: string;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
}

export default async function SuperAdminJobsPage() {
  await requireSuperAdmin();
  const sb = createAdminSupabaseClient() as unknown as {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };

  let jobs: CronJob[] = [];
  let runs: CronRunRow[] = [];
  try {
    const r1 = await sb.rpc("_super_admin_list_cron_jobs", {});
    if (!r1.error && Array.isArray(r1.data)) jobs = r1.data as CronJob[];
  } catch {
    /* no-op */
  }
  try {
    const r2 = await sb.rpc("_super_admin_recent_cron_runs", { p_limit: 30 });
    if (!r2.error && Array.isArray(r2.data)) runs = r2.data as CronRunRow[];
  } catch {
    /* no-op */
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="kicker">Jobs</span>
        <h1 className="mt-2 text-2xl font-medium tracking-tighter2">pg_cron</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Listagem dos jobs agendados no Postgres. Para detalhes/reset, conecte direto via psql.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Agendados
        </h2>
        {jobs.length === 0 ? (
          <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5 text-sm text-[color:var(--ink-3)]">
            Nenhum job listado (helper RPC ausente — execute as queries via{" "}
            <span className="font-mono text-xs">psql cron.job</span>).
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
            <table className="w-full text-sm">
              <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
                <tr>
                  <th className="px-4 py-3 text-left">Job</th>
                  <th className="px-4 py-3 text-left">Schedule</th>
                  <th className="px-4 py-3 text-right">Ativo</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.jobid} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{j.jobname}</td>
                    <td className="px-4 py-3 font-mono text-xs">{j.schedule}</td>
                    <td className="px-4 py-3 text-right">{j.active ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Execucoes recentes
        </h2>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5 text-sm text-[color:var(--ink-3)]">
          {runs.length === 0
            ? "Nenhuma execucao listada (precisa do helper RPC e da extensao pg_cron com job_run_details)."
            : `${runs.length} execucoes mais recentes carregadas.`}
        </div>
      </section>
    </div>
  );
}
