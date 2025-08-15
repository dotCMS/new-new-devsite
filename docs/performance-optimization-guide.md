# Next.js Application Performance Optimization Guide

## Performance Analysis & Recommendations

Based on the analysis of your Next.js application, here are comprehensive performance optimization recommendations organized by priority and impact.

## 🚀 High Priority Optimizations

### 1. Implement Static Generation & Caching
**Current Issue:** Your main page (`app/[[...slug]]/page.js`) fetches data on every request
```javascript
// Add this to your page.js for static generation
export const revalidate = 3600; // Revalidate every hour

// Or implement ISR (Incremental Static Regeneration)
export async function generateStaticParams() {
  // Fetch list of known paths from your CMS
  const paths = await fetchPopularPaths();
  return paths.map((path) => ({
    slug: path.split('/').filter(Boolean),
  }));
}
```

### 2. Optimize Bundle Size
**Current Issue:** Large number of dependencies (50+ packages)

#### Actions:
- **Audit and remove unused dependencies**
  ```bash
  npx depcheck
  npm uninstall [unused-packages]
  ```

- **Replace heavy libraries with lighter alternatives:**
  - Consider replacing `swagger-ui-react` (5.18.3) with dynamic imports
  - Lazy load `react-syntax-highlighter` components
  - Use dynamic imports for heavy components

```javascript
// Example: Dynamic import for Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div>Loading API documentation...</div>
});
```

### 3. Image Optimization Enhancements
**Current Configuration:** Custom loader with multiple domains

#### Improvements:
```javascript
// next.config.js improvements
const nextConfig = {
  images: {
    // Add formats for better compression
    formats: ['image/avif', 'image/webp'],
    
    // Optimize device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Reduce quality for faster loads
    quality: 75,
    
    // Enable blur placeholders
    placeholder: 'blur',
    
    // Keep existing config
    remotePatterns: [...],
    dangerouslyAllowSVG: true,
    loader: 'custom',
    loaderFile: './util/imageLoader.ts',
  },
};
```

### 4. Reduce Analytics Impact
**Current Issue:** Multiple analytics scripts loading synchronously

#### Solution:
```javascript
// app/layout.tsx - Defer non-critical analytics
import dynamic from 'next/dynamic';

// Load analytics after page interactive
const Analytics = dynamic(() => import('@/components/Analytics'), {
  ssr: false,
});

// Create a unified Analytics component
// components/Analytics.tsx
'use client';
import { useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import MicrosoftClarity from '@/components/metrics/MicrosoftClarity';
import { LeadboxerScript } from '@/components/metrics/Leadboxer';

export default function Analytics() {
  useEffect(() => {
    // Load analytics after a delay
    const timer = setTimeout(() => {
      // Initialize analytics here
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <GoogleAnalytics gaId="G-CM1HLQW35G" />
      <MicrosoftClarity />
      <LeadboxerScript />
    </>
  );
}
```

## 🎯 Medium Priority Optimizations

### 5. Implement Route Prefetching Strategy
```javascript
// components/navigation/OptimizedLink.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function OptimizedLink({ href, children, prefetch = 'viewport' }) {
  const router = useRouter();
  
  useEffect(() => {
    // Prefetch on hover for better UX
    const prefetchTimer = setTimeout(() => {
      router.prefetch(href);
    }, 100);
    
    return () => clearTimeout(prefetchTimer);
  }, [href]);
  
  return (
    <Link href={href} prefetch={false}>
      {children}
    </Link>
  );
}
```

### 6. Optimize Font Loading
```javascript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // Reduces CLS
});
```

### 7. Implement Proper Error Boundaries
```javascript
// Enhance your ErrorBoundary component
export default function ErrorBoundary({ children, fallback }) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <ErrorBoundaryWrapper>
        {children}
      </ErrorBoundaryWrapper>
    </Suspense>
  );
}
```

### 8. Add Resource Hints
```javascript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_DOTCMS_HOST} />
        
        {/* Prefetch critical resources */}
        <link rel="prefetch" href="/api/health" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {/* ... */}
      </body>
    </html>
  );
}
```

## 🔧 Configuration Optimizations

### 9. Update next.config.js
```javascript
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Optimize Webpack
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier());
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              const hash = crypto.createHash('sha1');
              hash.update(chunks.reduce((acc, chunk) => acc + chunk.name, ''));
              return hash.digest('hex').substring(0, 8);
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  
  // Reduce experimental largePageDataBytes
  experimental: {
    largePageDataBytes: 128 * 1000, // Reduce from 12.8MB to 128KB
    optimizeCss: true,
    scrollRestoration: true,
  },
};
```

### 10. Implement API Response Caching
```javascript
// util/cacheService.ts enhancements
import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes default
  checkperiod: 120,
  useClones: false, // Better performance
});

export const getCachedData = async (key, fetcher, ttl = 600) => {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
};

// Use in your page data fetching
const { pageAsset, error } = await getCachedData(
  `page:${path}`,
  () => fetchPageData(pageParams),
  3600 // Cache for 1 hour
);
```

## 📊 Performance Monitoring

### 11. Add Web Vitals Tracking
```javascript
// app/components/WebVitals.tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    window.gtag?.('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
    
    // Log poor performance
    if (metric.name === 'FCP' && metric.value > 2500) {
      console.warn('Poor FCP:', metric.value);
    }
  });
  
  return null;
}
```

## 🚦 Quick Wins

1. **Enable Compression**: Add gzip/brotli compression in your hosting provider
2. **Set Cache Headers**: Already configured, but verify they're working
3. **Remove Unused CSS**: Use PurgeCSS with Tailwind
4. **Lazy Load Components**: Use `dynamic()` for below-the-fold content
5. **Optimize Third-party Scripts**: Load them with `Script` component with `strategy="lazyOnload"`

## 📈 Expected Performance Improvements

- **Initial Load Time**: 30-40% reduction
- **Time to Interactive**: 25-35% reduction  
- **Bundle Size**: 40-50% reduction
- **Core Web Vitals**: All metrics should be in "Good" range

## 🔍 Performance Testing Tools

1. **Lighthouse CI**: Automate performance testing in CI/CD
2. **Bundle Analyzer**: `npm install --save-dev @next/bundle-analyzer`
3. **Chrome DevTools**: Performance profiling
4. **WebPageTest**: Real-world performance testing

## 📝 Implementation Priority

1. **Week 1**: Implement static generation, optimize bundles, defer analytics
2. **Week 2**: Image optimization, font optimization, route prefetching
3. **Week 3**: Configuration updates, caching strategy, monitoring setup
4. **Ongoing**: Monitor metrics, iterate on optimizations

## 🎯 Performance Budget

Set these targets:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
- JavaScript Bundle Size: < 200KB (gzipped)
