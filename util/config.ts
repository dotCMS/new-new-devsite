import { envBool } from './utils';

// stripts the trailing slash from the host urls
const normalizedDotCMSHost = process.env.NEXT_PUBLIC_DOTCMS_HOST?.endsWith('/')
  ? process.env.NEXT_PUBLIC_DOTCMS_HOST.slice(0, -1)
  : (process.env.NEXT_PUBLIC_DOTCMS_HOST as string) 

const normalizedCDNHost = process.env.NEXT_PUBLIC_CDN_HOST && process.env.NEXT_PUBLIC_CDN_HOST.length > 0 ?
  process.env.NEXT_PUBLIC_CDN_HOST?.endsWith('/')
    ? process.env.NEXT_PUBLIC_CDN_HOST.slice(0, -1)
    : (process.env.NEXT_PUBLIC_CDN_HOST as string)
  : (normalizedDotCMSHost as string)

/**
 * `siteId` for GET `/api/v1/menulinks` only. The plugin expects the same value as a working
 * browser/curl call (often the site hostname, e.g. `dotcms.dev`), not the GraphQL inode id.
 */
const navMenulinksSiteId =
  process.env.NEXT_PUBLIC_DOTCMS_MENULINKS_SITE_ID?.trim() || "dotcms.dev";
const navFolderPath = (process.env.NEXT_PUBLIC_DOTCMS_NAV_FOLDER_PATH?.trim() || "/docs/nav").replace(
  /\/+$/,
  ""
) || "/docs/nav";

export const Config = {
  DotCMSHost: normalizedDotCMSHost as string,
  CDNHost: normalizedCDNHost as string,
  /** Passed as menulinks `siteId` query param (default `dotcms.dev`). */
  NavSiteId: navMenulinksSiteId,
  /** Folder root for docs nav menulinks (e.g. `/docs/nav`). */
  NavFolderPath: navFolderPath,
  /** Menulinks `depth` (default 2 to match typical plugin queries). */
  NavMenuDepth: Math.max(1, Number(process.env.NEXT_PUBLIC_DOTCMS_NAV_MENU_DEPTH ?? 2) || 2),
  /**
   * `GET /api/v1/nav` depth for the folder overlay only (order + titles on synthetic `.nav.*` folders).
   * DotCMS counts the **requested folder as depth 1**, then each step outward is +1: depth 2 is
   * immediate children of `/docs/nav`, depth 3 is **grandchildren** (the second tier of section
   * folders, e.g. under “Getting Started”). Two UI “folder rows” under the nav root therefore need **3** here.
   * Deeper values add payload (more links under expanded nodes) for little gain unless the tree grows.
   * Override with `NEXT_PUBLIC_DOTCMS_NAV_FOLDER_OVERLAY_DEPTH`.
   */
  NavFolderOverlayDepth: Math.max(
    1,
    Number(process.env.NEXT_PUBLIC_DOTCMS_NAV_FOLDER_OVERLAY_DEPTH ?? 3) || 3
  ),
  GraphqlUrl: process.env.NEXT_PUBLIC_API_GRAPH_URL || ((normalizedDotCMSHost + '/api/v1/graphql') as string),
  AuthToken: process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN as string,
  SwaggerUrl: ((process.env.NEXT_PUBLIC_API_SWAGGER_URL || normalizedDotCMSHost) + '/api/openapi.json') as string,
  LogRequestEnabled: true,
  LanguageId: 1 as number,
  Headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN}`
  },
  AIModel: "gpt-4o-mini"
} as const

export const AnalyticsConfig = {
  server: Config.DotCMSHost,
  siteAuth: process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_SITE_KEY ?? '',
  debug: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_DEBUG, process.env.NODE_ENV !== 'production'),
  autoPageView: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_AUTO_PAGE_VIEW, false),
  impressions: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_IMPRESSIONS, false),
  clicks: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_CLICKS, false),
};