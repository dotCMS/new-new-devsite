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
          {
            source: '/docs/long-term-supported-releases',
            destination: '/docs/changelogs?lts=true',
            permanent: false,
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
        largePageDataBytes: 128 * 100000,
    
      }
};

module.exports = nextConfig;
