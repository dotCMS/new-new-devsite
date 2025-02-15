// stripts the trailing slash from the host urls
const normalizedDotCMSHost = process.env.NEXT_PUBLIC_DOTCMS_HOST?.endsWith('/')
  ? process.env.NEXT_PUBLIC_DOTCMS_HOST.slice(0, -1)
  : (process.env.NEXT_PUBLIC_DOTCMS_HOST as string) 

const normalizedMediaHost = process.env.NEXT_PUBLIC_MEDIA_URL?.endsWith('/')
  ? process.env.NEXT_PUBLIC_MEDIA_URL.slice(0, -1)
  : (normalizedDotCMSHost as string)

export const ConfigDict = {
  DotCMSHost: normalizedDotCMSHost as string,
  MediaHost: normalizedMediaHost as string,
  GraphqlUrl: process.env.NEXT_PUBLIC_API_GRAPH_URL || ((normalizedDotCMSHost + '/api/v1/graphql') as string),
  AuthToken: process.env.NEXT_PUBLIC_AUTH_TOKEN as string,
  SwaggerUrl: process.env.NEXT_PUBLIC_API_SWAGGER_URL || ((normalizedDotCMSHost + '/api/openapi.json') as string),
  ReleasesUrl: process.env.NEXT_PUBLIC_API_RELEASES_URL as string,
  LogRequestEnabled: true,
  ExpApiKey: undefined,
  ExpDebug: false,
  Headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
  }
} as const
