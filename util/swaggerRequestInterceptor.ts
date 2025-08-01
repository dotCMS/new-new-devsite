import { Config } from '@/util/config';

/**
 * Extracts the base URL from a full URL
 * e.g., "https://api.example.com/openapi.json" -> "https://api.example.com"
 */
const getBaseUrlFromSwaggerUrl = (swaggerUrl: string): string => {
  try {
    const url = new URL(swaggerUrl);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    console.error('Invalid SwaggerUrl format:', swaggerUrl, error);
    // Fallback to the original value if URL parsing fails
    return swaggerUrl;
  }
};

/**
 * Shared request interceptor for SwaggerUI components
 * Redirects API calls to the backend server and adds authentication
 */
export const createSwaggerRequestInterceptor = () => {
  const backendBaseUrl = getBaseUrlFromSwaggerUrl(Config.SwaggerUrl);
  
  return (req: any) => {
    // Don't modify requests that are loading the spec itself
    if (req.loadSpec) {
      return req;
    }

    // Rewrite API URLs to point to the backend server
    const currentOrigin = window.location.origin;
    if (req.url.startsWith(currentOrigin + '/api/')) {
      // Replace frontend origin with backend origin
      req.url = req.url.replace(currentOrigin, backendBaseUrl);
    } else if (req.url.startsWith('/api/')) {
      // Handle relative URLs
      req.url = backendBaseUrl + req.url;
    }

    req.headers.Authorization = 'Basic YWRtaW5AZG90Y21zLmNvbTphZG1pbg==';

    return req;
  };
};