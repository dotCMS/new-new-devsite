/** @type {import('next').NextConfig} */

const url = new URL(process.env.NEXT_PUBLIC_DOTCMS_HOST);

const nextConfig = {
    reactStrictMode: true,

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
            }
        ],

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
            ],
        };
    },
};

module.exports = nextConfig;
