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
  AIModel: "gpt-4o-mini"
} as const


export const AnalyticsConfig = {
  server: Config.DotCMSHost,
  siteAuth: process.env.NEXT_PUBLIC_DOTCMS_ANALYTICS_SITE_KEY!,
  debug: process.env.NODE_ENV !== 'production',
} as const;