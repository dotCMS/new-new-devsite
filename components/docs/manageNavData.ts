import type { ManageSubTabId } from "./manageNav";

export type ManageNavLink = { id: string; label: string };

export type ManageNavBlock =
  | { kind: "section"; id: string; title: string; items: ManageNavLink[] }
  | { kind: "link"; item: ManageNavLink };

const access: ManageNavBlock[] = [
  {
    kind: "section",
    id: "acc-sec-identity",
    title: "Accounts & access",
    items: [
      { id: "acc-users", label: "Users" },
      { id: "acc-roles", label: "Roles" },
      { id: "acc-perm", label: "Permissions" },
      { id: "acc-ac", label: "Access Control" },
      { id: "acc-teams", label: "Teams" },
    ],
  },
  {
    kind: "section",
    id: "acc-sec-security",
    title: "Security",
    items: [
      { id: "sec-auth", label: "Authentication" },
      { id: "sec-sso", label: "SSO" },
      { id: "sec-oauth", label: "OAuth" },
      { id: "sec-tokens", label: "API Tokens" },
    ],
  },
];

const environments: ManageNavBlock[] = [
  {
    kind: "section",
    id: "env-sec-1",
    title: "Sites & infrastructure",
    items: [
      { id: "env-sites", label: "Sites" },
      { id: "env-types", label: "Environments" },
      { id: "env-multisite", label: "Multi-site Management" },
    ],
  },
];

const deployment: ManageNavBlock[] = [
  {
    kind: "section",
    id: "depl-sec-1",
    title: "Deployment",
    items: [
      { id: "depl-overview", label: "Deployment Overview" },
      { id: "depl-cloud", label: "dotCMS Cloud" },
      { id: "depl-self", label: "Self-Hosted Setup" },
      { id: "depl-docker", label: "Docker Deployment" },
      { id: "depl-infra", label: "Infrastructure Requirements" },
    ],
  },
  {
    kind: "section",
    id: "depl-sec-cicd",
    title: "CI/CD",
    items: [
      { id: "cicd-pipelines", label: "CI/CD Pipelines" },
      { id: "cicd-automation", label: "Deployment Automation" },
      { id: "cicd-release", label: "Release Management" },
    ],
  },
];

const configuration: ManageNavBlock[] = [
  {
    kind: "section",
    id: "conf-sec-1",
    title: "Platform settings",
    items: [
      { id: "conf-system", label: "System Configuration" },
      { id: "conf-env", label: "Environment Variables" },
      { id: "conf-flags", label: "Feature Flags" },
      { id: "conf-cache", label: "Caching" },
    ],
  },
];

const observability: ManageNavBlock[] = [
  {
    kind: "section",
    id: "obs-sec-1",
    title: "Operations & visibility",
    items: [
      { id: "obs-logs", label: "Logs" },
      { id: "obs-monitoring", label: "Monitoring" },
      { id: "obs-debug", label: "Debugging" },
      { id: "obs-perf", label: "Performance" },
      { id: "obs-cdn", label: "CDN" },
      { id: "obs-opt", label: "Optimization" },
    ],
  },
  {
    kind: "section",
    id: "obs-sec-maintenance",
    title: "Maintenance",
    items: [
      { id: "maint-backups", label: "Backups" },
      { id: "maint-upgrades", label: "Upgrades" },
      { id: "maint-health", label: "System Health" },
      { id: "maint-dr", label: "Disaster Recovery" },
    ],
  },
];

export const manageNavBySubTab: Record<ManageSubTabId, ManageNavBlock[]> = {
  access,
  environments,
  deployment,
  configuration,
  observability,
};

function firstLinkInBlock(block: ManageNavBlock): string | null {
  if (block.kind === "link") {
    return block.item.id;
  }
  return block.items[0]?.id ?? null;
}

export function firstManageActiveId(blocks: ManageNavBlock[]): string {
  for (const b of blocks) {
    const id = firstLinkInBlock(b);
    if (id) return id;
  }
  return "";
}
