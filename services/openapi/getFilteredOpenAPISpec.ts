import { getOpenAPISpec, type OpenAPISpec } from './getOpenAPISpec';

/**
 * Recursively finds all schema references in an object
 */
const findSchemaReferences = (obj: any, refs: Set<string> = new Set()): Set<string> => {
  if (!obj || typeof obj !== 'object') {
    return refs;
  }

  if (Array.isArray(obj)) {
    obj.forEach(item => findSchemaReferences(item, refs));
    return refs;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      // Extract schema name from $ref (e.g., "#/components/schemas/User" -> "User")
      const match = value.match(/^#\/components\/schemas\/(.+)$/);
      if (match) {
        refs.add(match[1]);
      }
    } else {
      findSchemaReferences(value, refs);
    }
  }

  return refs;
};

/**
 * Recursively collects all dependent schemas
 */
const collectDependentSchemas = (
  schemaNames: Set<string>, 
  allSchemas: Record<string, any>,
  collected: Record<string, any> = {}
): Record<string, any> => {
  const newRefs = new Set<string>();
  
  for (const schemaName of schemaNames) {
    if (!collected[schemaName] && allSchemas[schemaName]) {
      collected[schemaName] = allSchemas[schemaName];
      // Find references in this schema
      const refs = findSchemaReferences(allSchemas[schemaName]);
      refs.forEach(ref => {
        if (!collected[ref]) {
          newRefs.add(ref);
        }
      });
    }
  }
  
  // If we found new references, recursively collect them
  if (newRefs.size > 0) {
    collectDependentSchemas(newRefs, allSchemas, collected);
  }
  
  return collected;
};

/**
 * Creates a filtered OpenAPI spec containing only the specified endpoint
 * and its dependent schemas
 */
export const getFilteredOpenAPISpec = async (method: string, path: string): Promise<OpenAPISpec | null> => {
  try {
    const fullSpec = await getOpenAPISpec();
    
    if (!fullSpec?.paths || !fullSpec.paths[path] || !fullSpec.paths[path][method.toLowerCase()]) {
      return null;
    }

    const endpoint = fullSpec.paths[path][method.toLowerCase()];
    
    // Find all schema references in the endpoint
    const referencedSchemas = findSchemaReferences(endpoint);
    
    // Collect all dependent schemas (including nested dependencies)
    const filteredSchemas = fullSpec.components?.schemas 
      ? collectDependentSchemas(referencedSchemas, fullSpec.components.schemas)
      : {};

    // Create filtered components object with only necessary schemas
    const filteredComponents: Record<string, any> = {};
    if (Object.keys(filteredSchemas).length > 0) {
      filteredComponents.schemas = filteredSchemas;
    }
    
    // Include other components that might be referenced by the endpoint
    // For now, include all non-schema components as they're typically smaller
    // and may have complex reference patterns that are harder to trace
    if (fullSpec.components?.responses) {
      filteredComponents.responses = fullSpec.components.responses;
    }
    if (fullSpec.components?.parameters) {
      filteredComponents.parameters = fullSpec.components.parameters;
    }
    if (fullSpec.components?.requestBodies) {
      filteredComponents.requestBodies = fullSpec.components.requestBodies;
    }
    if (fullSpec.components?.headers) {
      filteredComponents.headers = fullSpec.components.headers;
    }
    if (fullSpec.components?.securitySchemes) {
      filteredComponents.securitySchemes = fullSpec.components.securitySchemes;
    }

    // Create a minimal OpenAPI spec with just the one endpoint and its dependencies
    const filteredSpec: OpenAPISpec = {
      openapi: fullSpec.openapi || '3.0.0',
      info: fullSpec.info || {
        title: 'API Documentation',
        version: '1.0.0'
      },
      servers: fullSpec.servers || [],
      paths: {
        [path]: {
          [method.toLowerCase()]: endpoint
        }
      },
      ...(Object.keys(filteredComponents).length > 0 && { components: filteredComponents })
    };

    return filteredSpec;
  } catch (error) {
    console.error('Error creating filtered OpenAPI spec:', error);
    return null;
  }
}; 