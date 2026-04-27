export type OverviewNavLink = {
  id: string;
  label: string;
};

export type OverviewNavSection = {
  id: string;
  /** Shown in UI as uppercase (style), not a dropdown. */
  title: string;
  items: OverviewNavLink[];
};

/**
 * Overview sidebar: section labels + flat links (wireframe — not from dotCMS).
 */
export const overviewNavSections: OverviewNavSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      { id: "what-is-dotcms", label: "What is dotCMS" },
      { id: "why-dotcms", label: "Why dotCMS" },
      { id: "core-features", label: "Core Features" },
    ],
  },
  {
    id: "core-concepts",
    title: "Core concepts",
    items: [
      { id: "content-types", label: "Content Types" },
      { id: "pages-layouts-containers", label: "Pages, Layouts & Containers" },
      { id: "workflows", label: "Workflows" },
      { id: "headless-vs-traditional", label: "Headless vs Traditional" },
      { id: "personalization", label: "Personalization" },
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    items: [
      { id: "system-architecture", label: "System Architecture" },
      { id: "page-rendering-architecture", label: "Page Rendering Architecture" },
      { id: "content-delivery-model", label: "Content Delivery Model" },
    ],
  },
  {
    id: "choose-your-path",
    title: "Choose your path",
    items: [
      { id: "for-developers", label: "For Developers" },
      { id: "for-content-teams", label: "For Content Teams" },
      { id: "for-admins", label: "For Admins" },
      { id: "for-architects", label: "For Architects" },
    ],
  },
];
