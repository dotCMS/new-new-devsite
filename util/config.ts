import { envBool } from './utils';

/**
 * Strip surrounding whitespace and matching single/double quotes from an
 * env value. Some `.env` entries are written as `KEY= 'value'`, which leaves
 * a leading space and literal quotes in `process.env`.
 */
const cleanEnv = (value: string | undefined): string =>
  (value ?? '').trim().replace(/^['"]|['"]$/g, '').trim();

// stripts the trailing slash from the host urls
const normalizedDotCMSHost = process.env.NEXT_PUBLIC_DOTCMS_HOST?.endsWith('/')
  ? process.env.NEXT_PUBLIC_DOTCMS_HOST.slice(0, -1)
  : (process.env.NEXT_PUBLIC_DOTCMS_HOST as string) 

const normalizedCDNHost = process.env.NEXT_PUBLIC_CDN_HOST && process.env.NEXT_PUBLIC_CDN_HOST.length > 0 ?
  process.env.NEXT_PUBLIC_CDN_HOST?.endsWith('/')
    ? process.env.NEXT_PUBLIC_CDN_HOST.slice(0, -1)
    : (process.env.NEXT_PUBLIC_CDN_HOST as string)
  : (normalizedDotCMSHost as string)

export const Config = {
  DotCMSHost: normalizedDotCMSHost as string,
  CDNHost: normalizedCDNHost as string,
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
  /** Used by chat completions + AI search. Override with NEXT_PUBLIC_DOTCMS_AI_MODEL. */
  AIModel: (process.env.NEXT_PUBLIC_DOTCMS_AI_MODEL ?? 'gpt-5.2') as string,
  /**
   * Bunny Stream library ID for embedding course lesson videos.
   * Public — used in the iframe URL. Prefers the server var, falls back to
   * the public one so the embed works even without the server key set.
   */
  BunnyLibraryId:
    cleanEnv(process.env.BUNNY_STREAM_LIBRARY_ID) ||
    cleanEnv(process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID) ||
    '666358',
  /** Bunny Stream API key (server-only secret) for reading video chapters. */
  BunnyApiKey: cleanEnv(process.env.BUNNY_STREAM_API_KEY),
  /** Bunny pull zone host for public thumbnails/HLS (e.g. vz-xxxx.b-cdn.net). */
  BunnyPullZone: cleanEnv(process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE),
} as const

export const AnalyticsConfig = {
  server: Config.DotCMSHost,
  siteAuth: process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_SITE_KEY ?? '',
  debug: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_DEBUG, process.env.NODE_ENV !== 'production'),
  autoPageView: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_AUTO_PAGE_VIEW, false),
  impressions: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_IMPRESSIONS, false),
  clicks: envBool(process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_CLICKS, false),
};