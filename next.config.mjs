/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF puis WebP: les navigateurs recents recoivent le format le plus leger.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    // Images televersees depuis le Studio Sanity.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Sur un reseau IPv6 avec NAT64 (beaucoup de connexions mobiles et de box
    // marocaines), cdn.sanity.io se resout en 64:ff9b::x.x.x.x. Next 16 prend ce
    // prefixe pour une IP privee et refuse de charger l'image: toutes les photos
    // apparaissent cassees en local. On leve ce garde-fou, sans risque ici car
    // remotePatterns limite deja l'optimiseur au seul domaine cdn.sanity.io.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
