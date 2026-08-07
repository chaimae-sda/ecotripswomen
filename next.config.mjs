/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF puis WebP: les navigateurs recents recoivent le format le plus leger.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    // Images televersees depuis le Studio Sanity.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
