/** @type {import('next').NextConfig} */

const url = new URL(process.env.NEXT_PUBLIC_DOTCMS_HOST);

const nextConfig = {
    reactStrictMode: true,
    cacheMaxMemorySize: 0, 
    async redirects() {
        return [
          {
            source: '/security/:path',
            destination: '/docs/known-security-issues?issueNumber=:path',
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
                hostname: 'auth.dotcms.dev',
                pathname: '/dA/**',
            },
            {
                protocol: 'https',
                hostname: 'www.dotcms.com',
                pathname: '**',
            },
        ],
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
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
    async headers() {
        return [
          {
            source: '/:path*',
            headers: [
              {
                key: 'X-Robots-Tag',
                value: 'noindex, nofollow'
              }
            ]
          }
        ]
      },
      experimental: {
        largePageDataBytes: 128 * 100000,
    
      }
};

module.exports = nextConfig;
