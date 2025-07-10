import { Config } from '@/util/config';

// Global cache for OpenAPI spec
let openAPICache: {
  data: any | null;
  promise: Promise<any> | null;
} = {
  data: null,
  promise: null
};

export interface OpenAPISpec {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
  };
}

export interface EndpointSpec {
  summary?: string;
  description?: string;
  parameters?: Array<{
    name: string;
    in: string;
    required?: boolean;
    schema?: any;
    description?: string;
  }>;
  requestBody?: {
    content: Record<string, any>;
    required?: boolean;
    description?: string;
  };
  responses?: Record<string, {
    description?: string;
    content?: Record<string, any>;
  }>;
  tags?: string[];
}

/**
 * Fetches the OpenAPI specification with caching
 * Returns the same promise for concurrent calls to avoid race conditions
 */
export const getOpenAPISpec = async (): Promise<OpenAPISpec> => {
  // Return cached data if available
  if (openAPICache.data) {
    return openAPICache.data;
  }

  // If already loading, return the existing promise
  if (openAPICache.promise) {
    return openAPICache.promise;
  }

  // Start loading
  const fetchPromise = fetch(Config.SwaggerUrl)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Cache the successful result
      openAPICache.data = data;
      
      return data;
    })
    .finally(() => {
      // Clear the promise when done (success or failure)
      openAPICache.promise = null;
    });

  // Store the promise so concurrent calls can use it
  openAPICache.promise = fetchPromise;

  return fetchPromise;
};

/**
 * Finds a specific endpoint specification in the OpenAPI spec
 */
export const getEndpointSpec = async (method: string, path: string): Promise<EndpointSpec | null> => {
  try {
    const spec = await getOpenAPISpec();
    
    if (!spec?.paths) {
      return null;
    }
    
    const pathSpec = spec.paths[path];
    if (!pathSpec) {
      return null;
    }
    
    const methodSpec = pathSpec[method.toLowerCase()];
    return methodSpec || null;
  } catch (error) {
    console.error('Error getting endpoint spec:', error);
    return null;
  }
};

/**
 * Clears the OpenAPI spec cache (useful for testing or forced refresh)
 */
export const clearOpenAPICache = (): void => {
  openAPICache.data = null;
  openAPICache.promise = null;
};

/**
 * Gets the current cache status (useful for debugging)
 */
export const getOpenAPICacheStatus = () => {
  return {
    hasData: !!openAPICache.data,
    hasPromise: !!openAPICache.promise
  };
}; 