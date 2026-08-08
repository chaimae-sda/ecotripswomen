const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const ANY = "";

// Tranches de prix fixes: plus lisible qu'un curseur sur un telephone.
export const PRICE_RANGES = [
  { value: "0-499", label: "Moins de 500 DH", min: 0, max: 499 },
  { value: "500-999", label: "500 à 999 DH", min: 500, max: 999 },
  { value: "1000-1499", label: "1000 à 1499 DH", min: 1000, max: 1499 },
  { value: "1500+", label: "1500 DH et plus", min: 1500, max: Infinity },
];

export const DURATIONS = [
  { value: "1", label: "Journée", min: 1, max: 1 },
  { value: "2", label: "2 jours", min: 2, max: 2 },
  { value: "3", label: "3 jours", min: 3, max: 3 },
  { value: "4+", label: "4 jours et plus", min: 4, max: Infinity },
];

// "2026-09-03" donne { value: "2026-09", label: "septembre 2026" }.
function toMonth(startDate) {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return null;

  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return {
    value: `${date.getUTCFullYear()}-${month}`,
    label: `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
  };
}

function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr"));
}

// Les listes deroulantes ne proposent que ce qui existe vraiment dans les offres.
export function buildFilterOptions(offers) {
  const months = new Map();
  for (const offer of offers) {
    const month = offer.startDate ? toMonth(offer.startDate) : null;
    if (month) months.set(month.value, month.label);
  }

  return {
    cities: sortedUnique(offers.flatMap((offer) => offer.departureCities)),
    destinations: sortedUnique(offers.flatMap((offer) => offer.destinations)),
    months: [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label })),
    prices: PRICE_RANGES.filter((range) =>
      offers.some(
        (offer) =>
          offer.priceValue !== null &&
          offer.priceValue >= range.min &&
          offer.priceValue <= range.max
      )
    ),
    durations: DURATIONS.filter((range) =>
      offers.some(
        (offer) =>
          offer.durationDays !== null &&
          offer.durationDays >= range.min &&
          offer.durationDays <= range.max
      )
    ),
  };
}

function inRange(value, ranges, selected) {
  const range = ranges.find((item) => item.value === selected);
  if (!range) return true;
  // Une offre sans prix ni duree renseignes ne peut pas etre classee: on la
  // masque plutot que de la faire apparaitre dans la mauvaise tranche.
  if (value === null) return false;
  return value >= range.min && value <= range.max;
}

export function filterOffers(offers, filters) {
  return offers.filter((offer) => {
    if (filters.city && !offer.departureCities.includes(filters.city)) return false;
    if (filters.destination && !offer.destinations.includes(filters.destination)) return false;
    if (!inRange(offer.priceValue, PRICE_RANGES, filters.price)) return false;
    if (!inRange(offer.durationDays, DURATIONS, filters.duration)) return false;

    if (filters.month) {
      // Un voyage sans date de debut revient regulierement: il reste propose
      // quel que soit le mois choisi.
      const month = offer.startDate ? toMonth(offer.startDate) : null;
      if (month && month.value !== filters.month) return false;
    }

    return true;
  });
}

export const EMPTY_FILTERS = {
  city: ANY,
  destination: ANY,
  price: ANY,
  duration: ANY,
  month: ANY,
};
