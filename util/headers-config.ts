// Headers configuration for server-side API requests
// This should only be imported in server-side code (API routes, server components, etc.)

import { ServerConfig } from './server-config';

export const getServerHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${ServerConfig.AuthToken}`
  };
};

// For client-side code that doesn't need auth
export const getPublicHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};
