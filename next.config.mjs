/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gateway.irys.xyz" },
      { protocol: "https", hostname: "www.stonkfun.xyz" },
      { protocol: "https", hostname: "dd.dexscreener.com" },
      { protocol: "https", hostname: "cdn.dexscreener.com" },
    ],
  },
};

export default nextConfig;
