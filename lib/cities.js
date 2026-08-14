import { slugify } from "./slug";
import { format } from "./ui";

// Index des villes citees par les voyages: une ville peut etre un lieu visite,
// un point de depart, ou les deux. Chacune obtient sa page, pour repondre aux
// recherches du type "voyage organise Tanger".
export function buildCityIndex(offers) {
  const cities = new Map();

  function add(name, role, offer) {
    const slug = slugify(name);
    if (!slug || slug === "voyage") return;

    if (!cities.has(slug)) {
      cities.set(slug, { slug, name, asDestination: [], asDeparture: [] });
    }
    const city = cities.get(slug);
    if (!city[role].some((item) => item.slug === offer.slug)) city[role].push(offer);
  }

  for (const offer of offers) {
    for (const name of offer.destinations) add(name, "asDestination", offer);
    for (const name of offer.departureCities) add(name, "asDeparture", offer);
  }

  return [...cities.values()]
    .map((city) => ({
      ...city,
      // Un voyage peut partir d'une ville et s'y arreter: on ne le compte
      // qu'une fois dans la liste affichee.
      offers: [
        ...city.asDestination,
        ...city.asDeparture.filter(
          (offer) => !city.asDestination.some((item) => item.slug === offer.slug)
        ),
      ],
    }))
    .filter((city) => city.offers.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export function findCity(offers, slug) {
  return buildCityIndex(offers).find((city) => city.slug === slug) || null;
}

// Le titre change selon le role de la ville: on ne dit pas "voyage a Tanger"
// quand Tanger n'est qu'un point de depart.
export function cityHeading(city, ui) {
  const modele = city.asDestination.length > 0 ? ui.voyageA : ui.voyageDepuis;
  return format(modele, { ville: city.name });
}

// Phrase d'introduction construite a partir des vraies donnees des offres:
// aucun texte invente sur l'agence.
export function cityIntro(city, ui) {
  const n = city.offers.length;
  const anglais = ui.langue === "en";
  const departs = [...new Set(city.offers.flatMap((offer) => offer.departureCities))];
  const autres = [
    ...new Set(city.offers.flatMap((offer) => offer.destinations).filter((d) => d !== city.name)),
  ];

  if (anglais) {
    const parts = [
      city.asDestination.length
        ? `${n} women-only organised trip${n > 1 ? "s" : ""} to ${city.name} with EcoTrips Women`
        : `${n} women-only organised trip${n > 1 ? "s" : ""} departing from ${city.name} with EcoTrips Women`,
    ];
    if (city.asDestination.length && departs.length) parts.push(`departing from ${departs.join(", ")}`);
    if (autres.length) parts.push(`with stops in ${autres.slice(0, 4).join(", ")}`);
    return `${parts.join(", ")}. Transport, accommodation and guidance depending on the trip.`;
  }

  const pluriel = n > 1 ? "s" : "";
  const parts = [
    city.asDestination.length
      ? `${n} voyage${pluriel} organisé${pluriel} entre femmes à ${city.name} avec EcoTrips Women`
      : `${n} voyage${pluriel} organisé${pluriel} entre femmes au départ de ${city.name} avec EcoTrips Women`,
  ];
  if (city.asDestination.length && departs.length) parts.push(`au départ de ${departs.join(", ")}`);
  if (autres.length) parts.push(`avec étapes à ${autres.slice(0, 4).join(", ")}`);

  return `${parts.join(", ")}. Transport, hébergement et accompagnement selon l'offre.`;
}
