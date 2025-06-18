/** @type {import('next').NextConfig} */

const url = new URL(process.env.NEXT_PUBLIC_DOTCMS_HOST);

const nextConfig = {
    reactStrictMode: true,
    // cacheMaxMemorySize: 0, // Comment out to re-enable default caching
    async headers() {
        return [
            {
                // Apply cache control for large pages
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=31536000, max-age=0',
                    },
                ],
            },
        ];
    },
    async redirects() {
        return [
          {
            source: '/security/:path',
            destination: '/docs/known-security-issues?issueNumber=:path',
            permanent: true,
          },
          {
            source: '/docs/latest/:path',
            destination: '/docs/:path',
            permanent: true,
          },
          {
            source: '/blogs',
            destination: '/blog',
            permanent: true,
          },
        ]
      },
    images: {
        remotePatterns: [
            {
                protocol: url.protocol.replace(":", ""),
                hostname: url.hostname,
                port: url.port || "",
            },
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com', // temporary solution to allow images to be served from vercel
            },
            {
                protocol: 'https',
                hostname: 'dev.dotcms.com',
                pathname: '/dA/**',
            },
            {
                protocol: 'https',
                hostname: 'www.dotcms.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        dangerouslyAllowSVG: true,
        loader: 'custom',
        loaderFile: './util/imageLoader.ts',
        
    },

    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/dA/:path*",
                    destination: `${url.origin}/dA/:path*`,
                },
                {
                    source: "/contentAsset/image/:path*",
                    destination: `${url.origin}/contentAsset/image/:path*`,
                },
                {
                    source: '/sitemap.xml',
                    destination: '/api/sitemap'
                }
            ],
            afterFiles: [
 
            ]
        };
    },
      experimental: {
        largePageDataBytes: 128 * 1000, // Reduce from 100000 to 1000 (128KB instead of 12.8MB)
    
      }
};

module.exports = nextConfig;
