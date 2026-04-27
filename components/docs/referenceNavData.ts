export type ReferenceNavLink = { id: string; label: string };

export type ReferenceNavBlock =
  | { kind: "section"; id: string; title: string; items: ReferenceNavLink[] }
  | { kind: "link"; item: ReferenceNavLink };

const apis: ReferenceNavBlock[] = [
  {
    kind: "section",
    id: "ref-api-1",
    title: "APIs",
    items: [
      { id: "ref-api-rest", label: "REST API Reference" },
      { id: "ref-api-graphql", label: "GraphQL Schema" },
      { id: "ref-api-auth", label: "Authentication Reference" },
    ],
  },
];

const cli: ReferenceNavBlock[] = [
  {
    kind: "section",
    id: "ref-cli-1",
    title: "Command line",
    items: [
      { id: "ref-cli-overview", label: "CLI Overview" },
      { id: "ref-cli-commands", label: "CLI Commands" },
      { id: "ref-cli-flags", label: "Flags & Options" },
    ],
  },
];

const config: ReferenceNavBlock[] = [
  {
    kind: "section",
    id: "ref-cfg-1",
    title: "Configuration",
    items: [
      { id: "ref-cfg-props", label: "Config Properties" },
      { id: "ref-cfg-env", label: "Environment Variables" },
      { id: "ref-cfg-system", label: "System Settings" },
    ],
  },
];

const schema: ReferenceNavBlock[] = [
  {
    kind: "section",
    id: "ref-sch-1",
    title: "Content & data",
    items: [
      { id: "ref-sch-ct", label: "Content Type Schema" },
      { id: "ref-sch-fields", label: "Field Types" },
      { id: "ref-sch-data", label: "Data Structures" },
    ],
  },
  {
    kind: "section",
    id: "ref-sch-2",
    title: "Platform",
    items: [
      { id: "ref-sch-webhooks", label: "Webhooks Reference" },
      { id: "ref-sch-events", label: "Event Reference" },
      { id: "ref-sch-perm", label: "Permissions Model" },
    ],
  },
];

const errors: ReferenceNavBlock[] = [
  {
    kind: "section",
    id: "ref-err-1",
    title: "Errors & recovery",
    items: [
      { id: "ref-err-codes", label: "Error Codes" },
      { id: "ref-err-trouble", label: "Troubleshooting Reference" },
    ],
  },
];

const releases: ReferenceNavBlock[] = [
  {
    kind: "section",
    id: "ref-rel-1",
    title: "Product history",
    items: [
      { id: "ref-rel-glossary", label: "Glossary" },
      { id: "ref-rel-notes", label: "Release Notes" },
      { id: "ref-rel-changelog", label: "Changelog" },
    ],
  },
];

/** Full Reference sidebar (no sub-nav): APIs → … → releases. */
export const referenceNavBlocks: ReferenceNavBlock[] = [
  ...apis,
  ...cli,
  ...config,
  ...schema,
  ...errors,
  ...releases,
];

function firstLinkInBlock(block: ReferenceNavBlock): string | null {
  if (block.kind === "link") {
    return block.item.id;
  }
  return block.items[0]?.id ?? null;
}

export function firstReferenceActiveId(blocks: ReferenceNavBlock[]): string {
  for (const b of blocks) {
    const id = firstLinkInBlock(b);
    if (id) return id;
  }
  return "";
}
