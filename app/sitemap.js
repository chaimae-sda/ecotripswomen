import { buildCityIndex } from "../lib/cities";
import { getSiteContent } from "../lib/content";
import { siteUrl } from "../lib/site";

export const revalidate = 3600;

// Plan du site lu par Google: l'accueil, la liste des offres, la page de chaque
// voyage et la page de chaque ville. Tout voyage ou ville ajoute dans le Studio
// y apparait tout seul.
export default async function sitemap() {
  const { offers } = await getSiteContent();
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/offres`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...offers.map((offer) => ({
      url: `${siteUrl}/offres/${offer.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...buildCityIndex(offers).map((city) => ({
      url: `${siteUrl}/voyages/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
