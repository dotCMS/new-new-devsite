import type { ContentSubTabId } from "./contentNav";

export type ContentNavLink = { id: string; label: string };

/** Titled list (h2 + links) or a single top-level link (e.g. Layouts next to a Pages group). */
export type ContentNavBlock =
  | { kind: "section"; id: string; title: string; items: ContentNavLink[] }
  | { kind: "link"; item: ContentNavLink };

const modeling: ContentNavBlock[] = [
  {
    kind: "section",
    id: "md-sec-1",
    title: "Core model",
    items: [
      { id: "md-ct", label: "Content Types" },
      { id: "md-fld", label: "Fields" },
      { id: "md-rel", label: "Relationships" },
      { id: "md-tax", label: "Taxonomy" },
      { id: "md-bp", label: "Modeling Best Practices" },
    ],
  },
];

const authoring: ContentNavBlock[] = [
  {
    kind: "section",
    id: "au-sec-1",
    title: "Content lifecycle",
    items: [
      { id: "au-create", label: "Creating Content" },
      { id: "au-edit", label: "Editing Content" },
      { id: "au-media", label: "Media & Assets" },
      { id: "au-version", label: "Versioning" },
      { id: "au-sched", label: "Scheduling Content" },
    ],
  },
];

const experiences: ContentNavBlock[] = [
  {
    kind: "section",
    id: "ex-sec-1",
    title: "Site & pages",
    items: [
      { id: "ex-pg-overview", label: "Pages Overview" },
      { id: "ex-pg-create", label: "Creating Pages" },
      { id: "ex-layouts", label: "Layouts" },
      { id: "ex-nav", label: "Navigation Menus" },
      { id: "ex-cw", label: "Components & Widgets" },
      { id: "ex-pers", label: "Page Personalization" },
    ],
  },
];

const publishing: ContentNavBlock[] = [
  {
    kind: "section",
    id: "pub-wf",
    title: "Workflow",
    items: [
      { id: "pub-wf-over", label: "Workflow Overview" },
      { id: "pub-wf-create", label: "Creating Workflows" },
      { id: "pub-wf-approval", label: "Approval Processes" },
    ],
  },
  {
    kind: "section",
    id: "pub-pub",
    title: "Publishing",
    items: [
      { id: "pub-pb-content", label: "Publishing Content" },
      { id: "pub-pb-sched", label: "Scheduled Publishing" },
    ],
  },
  {
    kind: "section",
    id: "pub-loc",
    title: "Localization",
    items: [
      { id: "pub-loc-ml", label: "Multi-language Content" },
      { id: "pub-loc-lv", label: "Language Variants" },
      { id: "pub-loc-twf", label: "Translation Workflows" },
    ],
  },
  {
    kind: "section",
    id: "pub-seo",
    title: "Search & SEO",
    items: [
      { id: "pub-seo-over", label: "Search Overview" },
      { id: "pub-seo-bp", label: "SEO Best Practices" },
      { id: "pub-seo-meta", label: "Metadata Management" },
    ],
  },
];

export const contentNavBySubTab: Record<ContentSubTabId, ContentNavBlock[]> = {
  modeling,
  authoring,
  experiences,
  publishing,
};

function firstLinkInBlock(block: ContentNavBlock): string | null {
  if (block.kind === "link") {
    return block.item.id;
  }
  return block.items[0]?.id ?? null;
}

export function firstContentActiveId(blocks: ContentNavBlock[]): string {
  for (const b of blocks) {
    const id = firstLinkInBlock(b);
    if (id) return id;
  }
  return "";
}
