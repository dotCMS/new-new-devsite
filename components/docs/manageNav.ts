import { DOCS_LANDING_PATH } from "./primaryNav";

export const MANAGE_SUB_TABS = [
  "access",
  "environments",
  "deployment",
  "configuration",
  "observability",
] as const;

export type ManageSubTabId = (typeof MANAGE_SUB_TABS)[number];

export const MANAGE_SUB_LABEL: Record<ManageSubTabId, string> = {
  access: "Access",
  environments: "Environments",
  deployment: "Deployment",
  configuration: "Configuration",
  observability: "Observability",
};

const MANAGE_SET = new Set<string>(MANAGE_SUB_TABS);

export const DEFAULT_MANAGE_SUB: ManageSubTabId = "access";

/**
 * `?manage=access|...` when `?primary=manage`.
 */
export function parseManageSubFromSearchParam(
  v: string | null | undefined
): ManageSubTabId {
  if (v && MANAGE_SET.has(v)) {
    return v as ManageSubTabId;
  }
  return DEFAULT_MANAGE_SUB;
}

export function hrefForManageSubNav(
  pathname: string | null,
  manageSub: ManageSubTabId
): string {
  const path = pathname?.split("?")[0] || DOCS_LANDING_PATH;
  const q = new URLSearchParams();
  q.set("primary", "manage");
  q.set("manage", manageSub);
  return `${path}?${q.toString()}`;
}
