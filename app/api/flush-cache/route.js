import { graphCache } from '../../../util/cacheService';
import { navCache } from '../../../util/cacheService';
import { pageCache } from '../../../util/cacheService';
import { NextResponse } from 'next/server';

// API key for securing the webhook - this should be stored in environment variables in production
const API_KEY = process.env.CACHE_FLUSH_API_KEY || 'dotcms-cache-webhook-key';

/**
 * Validates the API key from request headers or query parameters
 * @param {Request} request - The incoming request
 * @returns {boolean} - Whether the API key is valid
 */
function isAuthorized(request) {
  // Check header authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === API_KEY) {
    return true;
  }
  
  // Check query parameter
  const url = new URL(request.url);
  const keyParam = url.searchParams.get('key');
  if (keyParam === API_KEY) {
    return true;
  }
  
  return false;
}

/**
 * POST handler for the flush-cache webhook
 * Flushes the cache when this endpoint is hit with valid authorization
 */
export async function POST(request) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Invalid or missing API key'
      }, { status: 401 });
    }
    
    // Flush all keys from the cache
    graphCache.flushAll();
    navCache.flushAll();
    pageCache.flushAll();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Cache successfully flushed',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    // Return error response if something goes wrong
    return NextResponse.json({
      success: false,
      message: 'Error flushing Cache',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * GET handler for the flush-cache webhook
 * Allows testing the endpoint via browser or simple GET requests
 * Requires API key authentication via query parameter: ?key=YOUR_API_KEY
 */
export async function GET(request) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Invalid or missing API key',
        usage: 'Add ?key=YOUR_API_KEY to the URL or use Bearer token in Authorization header'
      }, { status: 401 });
    }
    
    // Flush all keys from the cache
    graphCache.flushAll();
    navCache.flushAll();
    pageCache.flushAll();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Cache successfully flushed',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    // Return error response if something goes wrong
    return NextResponse.json({
      success: false,
      message: 'Error flushing Cache',
      error: error.message
    }, { status: 500 });
  }
}
