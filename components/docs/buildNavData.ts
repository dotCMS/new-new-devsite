import type { BuildSubTabId } from "./buildNav";

export type BuildNavLink = { id: string; label: string };

/** Titled group + flat links (no collapsible folders) — matches Overview-style sections. */
export type BuildNavSection = {
  id: string;
  title: string;
  items: BuildNavLink[];
};

const headless: BuildNavSection[] = [
  {
    id: "hl-sec-start",
    title: "Get started",
    items: [
      { id: "hl-overview", label: "Overview" },
      { id: "hl-quick-start", label: "Quick Start" },
      { id: "hl-fetch-first", label: "Fetch Your First Content" },
    ],
  },
  {
    id: "hl-sec-apis",
    title: "APIs",
    items: [
      { id: "hl-apis-overview", label: "API Overview" },
      { id: "hl-rest", label: "REST API Usage" },
      { id: "hl-graphql", label: "GraphQL API Usage" },
      { id: "hl-cda", label: "Content Delivery API" },
      { id: "hl-querying", label: "Querying Content" },
      { id: "hl-filtering", label: "Filtering & Pagination" },
      { id: "hl-relationships", label: "Relationships" },
      { id: "hl-api-bp", label: "API Best Practices" },
    ],
  },
  {
    id: "hl-sec-fe",
    title: "Frontend",
    items: [
      { id: "hl-fe-overview", label: "Frontend Overview" },
      { id: "hl-next", label: "Next.js" },
      { id: "hl-react", label: "React" },
      { id: "hl-angular", label: "Angular" },
      { id: "hl-astro", label: "Astro" },
      { id: "hl-ssg", label: "Static Site Generation (SSG)" },
      { id: "hl-ssr", label: "Server-Side Rendering (SSR)" },
    ],
  },
  {
    id: "hl-sec-tut",
    title: "Tutorials",
    items: [
      { id: "hl-tut-site", label: "Build a Headless Site" },
      { id: "hl-tut-blog", label: "Blog with Next.js" },
      { id: "hl-tut-api-app", label: "API-driven App" },
    ],
  },
];

const themes: BuildNavSection[] = [
  {
    id: "th-sec-start",
    title: "Get started",
    items: [
      { id: "th-overview", label: "Overview" },
      { id: "th-quick-start", label: "Quick Start" },
      { id: "th-first-page", label: "Create Your First Page" },
    ],
  },
  {
    id: "th-sec-themes",
    title: "Themes",
    items: [
      { id: "th-to-overview", label: "Themes Overview" },
      { id: "th-creating", label: "Creating a Theme" },
      { id: "th-structure", label: "Theme Structure" },
      { id: "th-deploy", label: "Theme Deployment" },
      { id: "th-bp", label: "Theme Best Practices" },
    ],
  },
  {
    id: "th-sec-cli",
    title: "CLI",
    items: [
      { id: "th-cli-overview", label: "CLI Overview" },
      { id: "th-cli-install", label: "Install CLI" },
      { id: "th-cli-theme", label: "Create a Theme with CLI" },
      { id: "th-cli-deploy", label: "Deploy a Theme" },
      { id: "th-cli-sync", label: "Sync Changes" },
      { id: "th-cli-wf", label: "CLI Workflow for Themes" },
    ],
  },
  {
    id: "th-sec-tpl",
    title: "Templating",
    items: [
      { id: "th-tpl-tmpl", label: "Templates" },
      { id: "th-tpl-cont", label: "Containers" },
      { id: "th-tpl-lay", label: "Layouts" },
      { id: "th-tpl-widgets", label: "Widgets" },
      { id: "th-tpl-nav", label: "Navigation Rendering" },
    ],
  },
  {
    id: "th-sec-ren",
    title: "Rendering",
    items: [
      { id: "th-ren-flow", label: "Page Rendering Flow" },
      { id: "th-ren-vel", label: "Velocity Basics" },
      { id: "th-ren-dyn", label: "Dynamic Content Rendering" },
    ],
  },
  {
    id: "th-sec-tut",
    title: "Tutorials",
    items: [
      { id: "th-tut-website", label: "Build a Traditional Website" },
      { id: "th-tut-tmpl", label: "Create a Template" },
      { id: "th-tut-dyn", label: "Build a Dynamic Page" },
    ],
  },
];

const extend: BuildNavSection[] = [
  {
    id: "ex-sec-int",
    title: "Integrations",
    items: [
      { id: "ex-int-overview", label: "Integrations Overview" },
      { id: "ex-webhooks", label: "Webhooks" },
      { id: "ex-events", label: "Event System" },
      { id: "ex-external", label: "External APIs" },
      { id: "ex-crm", label: "CRM Integrations" },
      { id: "ex-commerce", label: "Commerce Integrations" },
      { id: "ex-dam", label: "DAM Integrations" },
      { id: "ex-analytics", label: "Analytics Integrations" },
      { id: "ex-search", label: "Search Integrations" },
    ],
  },
  {
    id: "ex-sec-ext",
    title: "Extensibility",
    items: [
      { id: "ex-ext-dcms", label: "Extending dotCMS" },
      { id: "ex-osgi", label: "OSGi Plugins" },
      { id: "ex-apps", label: "Custom Apps" },
      { id: "ex-appfw", label: "App Framework" },
      { id: "ex-listeners", label: "Event Listeners" },
    ],
  },
  {
    id: "ex-sec-data",
    title: "Data & sync",
    items: [
      { id: "ex-import", label: "Import Data" },
      { id: "ex-export", label: "Export Data" },
      { id: "ex-content-sync", label: "Content Sync" },
      { id: "ex-migration", label: "Migration Strategies" },
    ],
  },
];

export const buildNavBySubTab: Record<BuildSubTabId, BuildNavSection[]> = {
  headless,
  themes,
  extend,
};

export function firstActiveId(sections: BuildNavSection[]): string {
  return sections[0]?.items[0]?.id ?? "";
}
