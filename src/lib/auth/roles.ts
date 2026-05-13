export const ROLES = {
  ADMIN: "admin",
  GESTOR: "gestor",
  VENDEDOR: "vendedor",
  MEDIA_BUYER: "media_buyer",
  VISUALIZADOR: "visualizador",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  gestor: "Gestor",
  vendedor: "Vendedor",
  media_buyer: "Media Buyer",
  visualizador: "Visualizador",
};

export type Permission =
  | "pipeline.read"
  | "pipeline.write"
  | "pipeline.own_only"
  | "campaigns.read"
  | "campaigns.write"
  | "settings.read"
  | "settings.write"
  | "users.read"
  | "users.write"
  | "billing.read"
  | "billing.write"
  | "reports.read"
  | "reports.write"
  | "marketing.read"
  | "marketing.write"
  | "social.read"
  | "social.write"
  | "automations.write";

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  admin: new Set([
    "pipeline.read","pipeline.write",
    "campaigns.read","campaigns.write",
    "settings.read","settings.write",
    "users.read","users.write",
    "billing.read","billing.write",
    "reports.read","reports.write",
    "marketing.read","marketing.write",
    "social.read","social.write",
    "automations.write",
  ]),
  gestor: new Set([
    "pipeline.read","pipeline.write",
    "campaigns.read","campaigns.write",
    "settings.read",
    "users.read",
    "billing.read",
    "reports.read","reports.write",
    "marketing.read","marketing.write",
    "social.read","social.write",
    "automations.write",
  ]),
  vendedor: new Set([
    "pipeline.read","pipeline.write","pipeline.own_only",
    "campaigns.read",
    "settings.read",
    "reports.read",
    "marketing.read",
  ]),
  media_buyer: new Set([
    "pipeline.read",
    "campaigns.read","campaigns.write",
    "settings.read",
    "reports.read",
    "marketing.read","marketing.write",
    "social.read","social.write",
    "automations.write",
  ]),
  visualizador: new Set([
    "pipeline.read",
    "campaigns.read",
    "settings.read",
    "reports.read",
    "marketing.read",
    "social.read",
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function canAccessOwnOnly(role: Role): boolean {
  return hasPermission(role, "pipeline.own_only");
}

export function isValidRole(value: string): value is Role {
  return (Object.values(ROLES) as string[]).includes(value);
}
