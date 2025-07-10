'use client'
import { type FC, useState, useEffect } from 'react'
import SwaggerUI from 'swagger-ui-react'
import { getOpenAPISpec } from '@/services/openapi/getOpenAPISpec'
import type { OpenAPISpec } from '@/services/openapi/getOpenAPISpec'
import { Config } from '@/util/config'

import 'swagger-ui-react/swagger-ui.css'

const SwaggerUIComponent: FC = () => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        setLoading(true);
        setError(null);
        const openAPISpec = await getOpenAPISpec();
        setSpec(openAPISpec);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API specification');
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  // Request interceptor to add authentication headers and rewrite URLs
  const requestInterceptor = (req: any) => {
    // Don't modify requests that are loading the spec itself
    if (req.loadSpec) {
      return req;
    }

    // Rewrite API URLs to point to the backend server
    const currentOrigin = window.location.origin;
    if (req.url.startsWith(currentOrigin + '/api/')) {
      // Replace frontend origin with backend origin
      req.url = req.url.replace(currentOrigin, Config.DotCMSHost);
    } else if (req.url.startsWith('/api/')) {
      // Handle relative URLs
      req.url = Config.DotCMSHost + req.url;
    }

    // Add authorization header
    if (Config.AuthToken) {
      req.headers.Authorization = `Bearer ${Config.AuthToken}`;
    }

    return req;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading API documentation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/50 p-6">
        <div className="text-red-800 dark:text-red-200">
          <h3 className="font-semibold mb-2">Error Loading API Documentation</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 p-6">
        <div className="text-yellow-800 dark:text-yellow-200">
          <h3 className="font-semibold mb-2">No API Documentation Found</h3>
          <p>The API specification could not be loaded or is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <SwaggerUI 
      spec={spec}
      requestInterceptor={requestInterceptor}
    />
  );
}

export default SwaggerUIComponent
