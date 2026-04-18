import type { ApiNavItem } from "@/util/navTransform";

/** Flat menulinks API row (extra fields from API are ignored). */
export type MenuLinkRow = {
  folderPath: string;
  linkCode?: string | null;
  linkType: string;
  protocol?: string | null;
  url?: string | null;
  showOnMenu?: boolean | string | number;
  sortOrder?: number;
  title: string;
  target?: string | null;
};

function segmentKeyToTitle(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Normalize `/docs/nav/foo/bar/` → segments `['foo','bar']`. */
export function parseNavFolderSegments(folderPath: string, navRoot: string): string[] {
  const norm = folderPath.trim().replace(/\/+$/, "");
  const root = navRoot.trim().replace(/\/+$/, "");
  if (!norm.toLowerCase().startsWith(root.toLowerCase())) return [];
  const rest = norm.slice(root.length).replace(/^\/+/, "");
  if (!rest) return [];
  return rest.split("/").filter(Boolean);
}

function looksLikeAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || s.startsWith("//");
}

function normalizeExternalHref(protocol: string | null | undefined, url: string | null | undefined): string {
  const u = (url ?? "").trim();
  if (!u) return "#";
  if (u.startsWith("//")) return `https:${u}`;
  if (looksLikeAbsoluteUrl(u)) return u;
  const p = (protocol ?? "https://").trim();
  const proto = p.toLowerCase().includes("http") ? p.replace(/\/+$/, "") : "https:";
  const rest = u.replace(/^\/+/, "");
  if (proto.endsWith(":")) return `${proto}//${rest}`;
  return `${proto}/${rest}`.replace(/([^:])\/{2,}/g, "$1/");
}

function buildInternalHref(protocol: string | null | undefined, url: string | null | undefined): string {
  const p = (protocol ?? "http://").trim() || "http://";
  const u = (url ?? "").trim();
  if (!u) return "";
  if (looksLikeAbsoluteUrl(u)) return u;
  return `${p}${u}`.replace(/(https?:\/\/)\/+/, "$1");
}

/** Doc slug for INTERNAL rows: pathname after host, no leading slash, lowercased. */
export function deriveInternalDocSlug(protocol: string | null | undefined, url: string | null | undefined): string {
  const href = buildInternalHref(protocol, url);
  if (!href) return "";
  try {
    const u = new URL(href);
    let path = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
    if (path.startsWith("docs/")) {
      path = path.slice("docs/".length);
    }
    return path;
  } catch {
    return "";
  }
}

function normalizeRowShowOnMenu(v: MenuLinkRow['showOnMenu']): boolean | undefined {
  if (v === false || v === 'false' || v === 0) return false;
  if (v === true || v === 'true' || v === 1) return true;
  return undefined;
}

function rowToApiNavLeaf(row: MenuLinkRow): ApiNavItem {
  const order = row.sortOrder ?? 0;
  const showOnMenu = normalizeRowShowOnMenu(row.showOnMenu);
  const targetRaw = (row.target ?? "_self").trim() || "_self";
  const lt = (row.linkType ?? "").toUpperCase();

  if (lt === "EXTERNAL") {
    const href = normalizeExternalHref(row.protocol, row.url);
    const target = targetRaw === "_self" ? "_self" : "_blank";
    return {
      type: "link",
      title: row.title,
      order,
      showOnMenu,
      children: [],
      code: null,
      href,
      target,
      linkKind: "EXTERNAL",
    };
  }

  if (lt === "CODE") {
    const rawCode = (row.linkCode ?? "").trim();
    if (rawCode && looksLikeAbsoluteUrl(rawCode)) {
      return {
        type: "link",
        title: row.title,
        order,
        showOnMenu,
        children: [],
        code: null,
        href: rawCode.startsWith("http") ? rawCode : `https://${rawCode}`,
        target: "_blank",
        linkKind: "CODE",
      };
    }
    return {
      type: "link",
      title: row.title,
      order,
      showOnMenu,
      children: [],
      code: rawCode || null,
      href: undefined,
      target: targetRaw === "_blank" ? "_blank" : undefined,
      linkKind: "CODE",
    };
  }

  if (lt === "INTERNAL") {
    const href = buildInternalHref(row.protocol, row.url);
    const trimmedCode = (row.linkCode ?? "").trim();
    const codeFromRow = trimmedCode && !looksLikeAbsoluteUrl(trimmedCode) ? trimmedCode.toLowerCase() : "";
    const code = codeFromRow || deriveInternalDocSlug(row.protocol, row.url);
    return {
      type: "link",
      title: row.title,
      order,
      showOnMenu,
      children: [],
      code: code || null,
      href: href || undefined,
      target: targetRaw === "_blank" ? "_blank" : undefined,
      linkKind: "INTERNAL",
    };
  }

  return {
    type: "link",
    title: row.title,
    order,
    showOnMenu,
    children: [],
    code: (row.linkCode ?? "").trim() || null,
    href: undefined,
    linkKind: "CODE",
  };
}

function folderMarker(segmentKey: string): string {
  return `.nav.${segmentKey}`;
}

function getOrCreateFolderChild(parent: ApiNavItem, segmentKey: string, orderHint: number): ApiNavItem {
  const marker = folderMarker(segmentKey);
  let f = parent.children.find((c) => c.type === "folder" && c.code === marker);
  if (!f) {
    f = {
      type: "folder",
      title: segmentKeyToTitle(segmentKey),
      order: orderHint,
      children: [],
      code: marker,
    };
    parent.children.push(f);
  }
  return f;
}

function sortTreeRecursive(node: ApiNavItem): void {
  node.children.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
  for (const c of node.children) {
    if (c.type === "folder") sortTreeRecursive(c);
  }
}

/**
 * Build top-level section folders (ApiNavItem tree) from flat menulinks rows.
 */
export function menulinksRowsToApiNavTree(rows: MenuLinkRow[], navRoot = "/docs/nav"): ApiNavItem[] {
  const root: ApiNavItem = {
    type: "folder",
    title: "__root__",
    order: 0,
    children: [],
    code: "__root__",
  };

  for (const row of rows) {
    if (!row.folderPath || !row.title) continue;
    const segments = parseNavFolderSegments(row.folderPath, navRoot);
    if (segments.length === 0) continue;

    let parent = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isLast = i === segments.length - 1;
      const hint = row.sortOrder ?? (i + 1) * 10;
      parent = getOrCreateFolderChild(parent, seg, hint);
      if (isLast) {
        parent.children.push(rowToApiNavLeaf(row));
      }
    }
  }

  sortTreeRecursive(root);
  return root.children;
}

/** Extract flat menulinks rows from API JSON. */
export function parseMenulinksEntity(json: unknown): MenuLinkRow[] {
  if (!json || typeof json !== "object") return [];
  const entity = (json as { entity?: unknown }).entity;
  if (!Array.isArray(entity)) return [];
  return entity.filter((r) => r && typeof r === "object" && typeof (r as MenuLinkRow).folderPath === "string") as MenuLinkRow[];
}

/** Legacy nested nav (`entity.children` or `children`). */
export function parseLegacyNavChildren(json: unknown): ApiNavItem[] | null {
  if (!json || typeof json !== "object") return null;
  const j = json as { entity?: { children?: unknown }; children?: unknown };
  const ch = (j.entity && typeof j.entity === "object" && !Array.isArray(j.entity)
    ? (j.entity as { children?: unknown }).children
    : undefined) ?? j.children;
  if (!Array.isArray(ch) || ch.length === 0) return null;
  const first = ch[0] as { type?: string; children?: unknown };
  if (typeof first?.type === "string" && (first.type === "folder" || first.type === "link" || first.type === "page")) {
    return ch as ApiNavItem[];
  }
  return null;
}

/**
 * Normalize API / fixture JSON into ApiNavItem[] for filter + transform.
 */
/**
 * Query string for `GET /api/v1/menulinks` (matches plugin contract).
 * `folderPath` is appended literally (e.g. `/docs/nav`) — `URLSearchParams` encodes `/` as `%2F`,
 * which breaks the menulinks plugin.
 */
export function buildMenulinksQueryString(
  siteId: string,
  folderPath: string,
  depth: number,
  opts?: { includeArchived?: boolean; offset?: number; limit?: number }
): string {
  const includeArchived = opts?.includeArchived ?? false;
  const offset = opts?.offset ?? 0;
  const limit = opts?.limit ?? 0;
  const d = Math.max(1, depth);
  return [
    `siteId=${encodeURIComponent(siteId)}`,
    `folderPath=${folderPath}`,
    `includeArchived=${includeArchived}`,
    `offset=${offset}`,
    `limit=${limit}`,
    `orderBy=${encodeURIComponent("path,sort_order")}`,
    `depth=${d}`,
  ].join("&");
}

/** Absolute GET URL (host + path + query). Host should match `NEXT_PUBLIC_DOTCMS_HOST` (no trailing slash). */
export function buildMenulinksUrl(
  dotcmsHost: string,
  siteId: string,
  folderPath: string,
  depth: number,
  opts?: { includeArchived?: boolean; offset?: number; limit?: number }
): string {
  const base = dotcmsHost.replace(/\/+$/, "");
  const qs = buildMenulinksQueryString(siteId, folderPath, depth, opts);
  return `${base}/api/v1/menulinks?${qs}`;
}

export function navPayloadToApiNavTree(json: unknown, navRoot = "/docs/nav"): ApiNavItem[] {
  const rows = parseMenulinksEntity(json);
  if (rows.length > 0) {
    return menulinksRowsToApiNavTree(rows, navRoot);
  }
  const legacy = parseLegacyNavChildren(json);
  return legacy ?? [];
}
