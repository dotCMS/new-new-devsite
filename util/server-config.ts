// Server-side only configuration - auth tokens should never be exposed to client
const normalizedDotCMSHost = process.env.NEXT_PUBLIC_DOTCMS_HOST?.endsWith('/')
  ? process.env.NEXT_PUBLIC_DOTCMS_HOST.slice(0, -1)
  : (process.env.NEXT_PUBLIC_DOTCMS_HOST as string) 

const normalizedCDNHost = process.env.NEXT_PUBLIC_CDN_HOST && process.env.NEXT_PUBLIC_CDN_HOST.length > 0 ?
  process.env.NEXT_PUBLIC_CDN_HOST?.endsWith('/')
    ? process.env.NEXT_PUBLIC_CDN_HOST.slice(0, -1)
    : (process.env.NEXT_PUBLIC_CDN_HOST as string)
  : (normalizedDotCMSHost as string)

// Use server-side env var first, fallback to public one temporarily
const authToken = process.env.DOTCMS_AUTH_TOKEN || process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN;

export const ServerConfig = {
  DotCMSHost: normalizedDotCMSHost as string,
  CDNHost: normalizedCDNHost as string,
  GraphqlUrl: process.env.NEXT_PUBLIC_API_GRAPH_URL || ((normalizedDotCMSHost + '/api/v1/graphql') as string),
  // Use server-side only env var (without NEXT_PUBLIC_ prefix)
  AuthToken: authToken as string,
  SwaggerUrl: process.env.NEXT_PUBLIC_API_SWAGGER_URL || ((normalizedDotCMSHost + '/api/openapi.json') as string),
  LogRequestEnabled: process.env.NODE_ENV === 'development',
  LanguageId: 1 as number,
  Headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${authToken}`
  },
  AIModel: "gpt-4o-mini"
} as const

// Validate required server-side environment variables
if (!ServerConfig.DotCMSHost) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_DOTCMS_HOST");
}

if (!ServerConfig.AuthToken) {
  throw new Error("Missing required environment variable: DOTCMS_AUTH_TOKEN (or NEXT_PUBLIC_DOTCMS_AUTH_TOKEN as fallback)");
}


