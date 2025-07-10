import { getOpenAPISpec, type OpenAPISpec } from './getOpenAPISpec';

/**
 * Creates a filtered OpenAPI spec containing only the specified endpoint
 * This allows SwaggerUI to render just one endpoint instead of the entire API
 */
export const getFilteredOpenAPISpec = async (method: string, path: string): Promise<OpenAPISpec | null> => {
  try {
    const fullSpec = await getOpenAPISpec();
    
    if (!fullSpec?.paths || !fullSpec.paths[path] || !fullSpec.paths[path][method.toLowerCase()]) {
      return null;
    }

    // Create a minimal OpenAPI spec with just the one endpoint
    const filteredSpec: OpenAPISpec = {
      openapi: fullSpec.openapi || '3.0.0',
      info: fullSpec.info || {
        title: 'API Documentation',
        version: '1.0.0'
      },
      servers: fullSpec.servers || [],
      paths: {
        [path]: {
          [method.toLowerCase()]: fullSpec.paths[path][method.toLowerCase()]
        }
      },
      components: fullSpec.components || {}
    };

    return filteredSpec;
  } catch (error) {
    console.error('Error creating filtered OpenAPI spec:', error);
    return null;
  }
}; 