import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import {
  listActivities,
  listDeals,
  listContacts,
  listWorkspaceUsers,
} from "@/lib/queries/crm";
import { ActivitiesList } from "@/components/activities/activities-list";
import { ActivitiesCalendar } from "@/components/activities/activities-calendar";
import { ActivitiesFilters } from "@/components/activities/activities-filters";
import { NewActivityButton } from "@/components/activities/new-activity-button";

export const metadata = { title: "Atividades · AdSales Hub" };

const ACTIVITY_TYPES = [
  "call",
  "email",
  "whatsapp",
  "meeting",
  "task",
  "note",
  "sms",
] as const;

type View = "lista" | "calendario";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: View;
    type?: string;
    user?: string;
    month?: string;
  }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const [allActivities, deals, contacts, users] = await Promise.all([
    listActivities(sb, session.workspaceId, { limit: 1000 }),
    listDeals(sb, session.workspaceId),
    listContacts(sb, session.workspaceId),
    listWorkspaceUsers(sb, session.workspaceId),
  ]);

  const view: View = sp.view === "calendario" ? "calendario" : "lista";
  const typeFilter = sp.type && (ACTIVITY_TYPES as readonly string[]).includes(sp.type)
    ? sp.type
    : null;
  const userFilter = sp.user ?? null;

  const activities = allActivities.filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (userFilter === "me" && a.user_id !== session.user.id) return false;
    if (userFilter === "unassigned" && a.user_id !== null) return false;
    if (userFilter && userFilter !== "me" && userFilter !== "unassigned" && a.user_id !== userFilter)
      return false;
    return true;
  });

  const overdue = activities.filter(
    (a) => !a.completed && a.due_date && new Date(a.due_date).getTime() < Date.now(),
  ).length;
  const done = activities.filter((a) => a.completed).length;
  const open = activities.filter((a) => !a.completed).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="CRM"
        title="Atividades"
        description={`${open} abertas · ${overdue} atrasadas · ${done} concluidas`}
        actions={<NewActivityButton deals={deals} contacts={contacts} />}
      />

      <ActivitiesFilters
        view={view}
        typeFilter={typeFilter}
        userFilter={userFilter}
        users={users}
        currentUserId={session.user.id}
      />

      {view === "calendario" ? (
        <ActivitiesCalendar
          activities={activities}
          deals={deals}
          contacts={contacts}
          monthParam={sp.month ?? null}
        />
      ) : (
        <ActivitiesList activities={activities} deals={deals} contacts={contacts} />
      )}
    </div>
  );
}
