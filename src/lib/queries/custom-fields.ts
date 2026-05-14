import "server-only";

export type CustomFieldEntity = "deal" | "contact" | "company" | "activity";
export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "boolean"
  | "url"
  | "email"
  | "phone";

export interface CustomFieldDef {
  id: string;
  entity: CustomFieldEntity;
  name: string;
  field_key: string;
  type: CustomFieldType;
  options: string[] | null;
  required: boolean;
  position: number;
}

export interface CustomFieldValue {
  custom_field_id: string;
  entity_id: string;
  value: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

/** Lista definições de custom fields do workspace para uma entidade. */
export async function listCustomFields(
  sb: DB,
  workspaceId: string,
  entity: CustomFieldEntity,
): Promise<CustomFieldDef[]> {
  const { data } = await sb
    .from("custom_fields")
    .select("id, entity, name, field_key, type, options, required, position")
    .eq("workspace_id", workspaceId)
    .eq("entity", entity)
    .order("position", { ascending: true });
  return (data ?? []) as CustomFieldDef[];
}

/** Busca os valores de custom fields para uma única entidade. */
export async function getCustomFieldValues(
  sb: DB,
  workspaceId: string,
  entityId: string,
): Promise<Record<string, unknown>> {
  const { data } = await sb
    .from("custom_field_values")
    .select("custom_field_id, value, custom_field:custom_fields(field_key)")
    .eq("workspace_id", workspaceId)
    .eq("entity_id", entityId);
  const out: Record<string, unknown> = {};
  for (const row of (data ?? []) as Array<{
    custom_field: { field_key: string } | null;
    value: unknown;
  }>) {
    if (row.custom_field?.field_key) {
      out[row.custom_field.field_key] = row.value;
    }
  }
  return out;
}

/** Salva (upsert) valores de custom fields para uma entidade. */
export async function setCustomFieldValues(
  sb: DB,
  workspaceId: string,
  entityId: string,
  values: Record<string, unknown>,
): Promise<void> {
  if (Object.keys(values).length === 0) return;

  // Resolve field_keys → custom_field_ids
  const { data: defs } = await sb
    .from("custom_fields")
    .select("id, field_key")
    .eq("workspace_id", workspaceId)
    .in("field_key", Object.keys(values));
  const defList = (defs ?? []) as { id: string; field_key: string }[];
  const idByKey = new Map(defList.map((d) => [d.field_key, d.id]));

  const rows = Object.entries(values)
    .map(([k, v]) => {
      const id = idByKey.get(k);
      if (!id) return null;
      return {
        workspace_id: workspaceId,
        custom_field_id: id,
        entity_id: entityId,
        value: v,
      };
    })
    .filter(Boolean) as Array<{
    workspace_id: string;
    custom_field_id: string;
    entity_id: string;
    value: unknown;
  }>;

  if (rows.length === 0) return;
  await sb.from("custom_field_values").upsert(rows as never, {
    onConflict: "custom_field_id,entity_id",
  });
}
