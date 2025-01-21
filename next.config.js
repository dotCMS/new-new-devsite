/** @type {import('next').NextConfig} */

const url = new URL(process.env.NEXT_PUBLIC_DOTCMS_HOST);

const nextConfig = {
    reactStrictMode: true,

    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: url.protocol.replace(":", ""),
                hostname: url.hostname,
                port: url.port || "",
            },
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
