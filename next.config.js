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
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
}

module.exports = nextConfig
