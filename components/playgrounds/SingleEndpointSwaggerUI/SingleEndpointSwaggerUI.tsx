'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getFilteredOpenAPISpec } from '@/services/openapi/getFilteredOpenAPISpec'
import type { OpenAPISpec } from '@/services/openapi/getOpenAPISpec'
import { Config } from '@/util/config'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 shadow-sm p-4">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading SwaggerUI...</span>
      </div>
    </div>
  ),
})

// Simple Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SwaggerUI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Load CSS when component mounts
const loadSwaggerCSS = () => {
  if (typeof window !== 'undefined' && !document.querySelector('link[href*="swagger-ui.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/swagger-ui.css';
    document.head.appendChild(link);
  }
};

interface SingleEndpointSwaggerUIProps {
  method: string;
  path: string;
}

const SingleEndpointSwaggerUI: React.FC<SingleEndpointSwaggerUIProps> = ({ 
  method, 
  path
}) => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Create unique key for this component instance using Base64 encoding to prevent collisions
  const componentKey = React.useMemo(() => {
    const keyString = `${method}:${path}`;
    return btoa(keyString).replace(/[+/=]/g, '');
  }, [method, path]);

  // Memoize request interceptor to prevent unnecessary SwaggerUI reinitialization
  const requestInterceptor = useCallback((req: any) => {
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
  }, []);

  useEffect(() => {
    setMounted(true);
    loadSwaggerCSS();
  }, [componentKey]);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        setLoading(true);
        setError(null);
        const filteredSpec = await getFilteredOpenAPISpec(method, path);
        setSpec(filteredSpec);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load endpoint specification');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchSpec();
    }
  }, [method, path, mounted, componentKey]);

  // Don't render anything until mounted (client-side)
  if (!mounted) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Initializing...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading endpoint documentation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 dark:border-red-800 rounded-lg mb-4 bg-red-50 dark:bg-red-950/50 p-4">
        <div className="text-red-800 dark:text-red-200">
          Error loading endpoint documentation: {error}
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4 bg-yellow-50 dark:bg-yellow-950/50 p-4">
        <div className="text-yellow-800 dark:text-yellow-200">
          Endpoint not found in API specification: {method.toUpperCase()} {path}
        </div>
      </div>
    );
  }

  return (
    <div className="endpoint-container mb-4">
      <ErrorBoundary fallback={
        <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/50 p-4">
          <div className="text-red-800 dark:text-red-200">
            Error rendering endpoint: {method.toUpperCase()} {path}
          </div>
        </div>
      }>
        <SwaggerUI 
          key={componentKey}
          spec={spec}
          requestInterceptor={requestInterceptor}
          deepLinking={false}
          displayOperationId={false}
          defaultModelsExpandDepth={-1}
          defaultModelExpandDepth={-1}
          displayRequestDuration={false}
          docExpansion="list"
          filter={false}
          showExtensions={false}
          showCommonExtensions={false}
          tryItOutEnabled={false}
        />
      </ErrorBoundary>
      <style dangerouslySetInnerHTML={{
        __html: `
          .endpoint-container .swagger-ui {
            padding: 0 !important;
            margin: 0 !important;
          }
          .endpoint-container .swagger-ui .wrapper {
            padding: 0 !important;
            margin: 0 !important;
          }
          .endpoint-container .swagger-ui .main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .endpoint-container .swagger-ui .swagger-container {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .endpoint-container .swagger-ui .information-container {
            display: none !important;
          }
          .endpoint-container .swagger-ui .info {
            display: none !important;
          }
          .endpoint-container .swagger-ui .scheme-container {
            display: none !important;
          }
          .endpoint-container .swagger-ui .servers {
            display: none !important;
          }
          .endpoint-container .swagger-ui h2.title {
            display: none !important;
          }
          .endpoint-container .swagger-ui .info h1 {
            display: none !important;
          }
          .endpoint-container .swagger-ui .description {
            display: none !important;
          }
          .endpoint-container .swagger-ui .opblock-tag-section {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          .endpoint-container .swagger-ui .opblock-tag-section h3.opblock-tag {
            display: none !important;
          }
          .endpoint-container .swagger-ui .opblock {
            margin: 0 !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          }
          .endpoint-container .swagger-ui .opblock.is-open {
            margin: 0 !important;
          }
          .endpoint-container .swagger-ui .opblock-summary {
            border-radius: 0.5rem !important;
          }
          .endpoint-container .swagger-ui .opblock.is-open .opblock-summary {
            border-bottom: 1px solid #e2e8f0 !important;
            border-radius: 0.5rem 0.5rem 0 0 !important;
          }
          .endpoint-container .swagger-ui .opblock-body {
            padding: 1rem !important;
          }
        `
      }} />
    </div>
  );
};
  
  export default SingleEndpointSwaggerUI; 