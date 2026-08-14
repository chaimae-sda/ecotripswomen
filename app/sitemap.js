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

  const villes = buildCityIndex(offers);

  // Chaque adresse est declaree dans les deux langues, avec le lien vers son
  // equivalent: Google comprend ainsi qu'il s'agit du meme contenu traduit.
  function paire(chemin, priority) {
    const fr = `${siteUrl}${chemin}`;
    const en = `${siteUrl}/en${chemin === "/" ? "" : chemin}`;
    const alternates = { languages: { fr, en } };
    return [
      { url: fr, lastModified: now, changeFrequency: "weekly", priority, alternates },
      { url: en, lastModified: now, changeFrequency: "weekly", priority, alternates },
    ];
  }

  return [
    ...paire("/", 1),
    ...paire("/offres", 0.9),
    ...offers.flatMap((offer) => paire(`/offres/${offer.slug}`, 0.8)),
    ...villes.flatMap((city) => paire(`/voyages/${city.slug}`, 0.7)),
  ];
}
