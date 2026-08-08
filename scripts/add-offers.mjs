// Ajoute les deux nouveaux voyages (Plongee-Belyounech et Taghazout-Essaouira)
// dans le Studio Sanity, sans toucher aux offres deja en ligne.
//
//   pnpm run sanity:add-offers
//
// Avant de lancer, enregistre les deux affiches dans public/assets/ sous les
// noms indiques dans NEW_OFFERS ci-dessous.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const NEW_OFFERS = [
  {
    poster: "/assets/offre-plongee-belyounech.jpg",
    title: "Plongée - Belyounech",
    badge: "Promo",
    badgeColor: "",
    date: "Chaque dimanche",
    departure: "Départ Tanger - Tétouan",
    price: "399 DH",
    // Sortie a la journee qui revient chaque semaine: pas de date fixe, donc
    // la duree est donnee a la main pour le filtre.
    startDate: null,
    endDate: null,
    durationDays: 1,
    destinations: ["Belyounech"],
    departureCities: ["Tanger", "Tétouan"],
    departureDates: ["Chaque dimanche"],
    message: "Bonjour EcoTrips Women, je veux réserver la sortie Plongée à Belyounech",
    summary:
      "Une journée de plongée sous-marine à Belyounech, chaque dimanche, au départ de Tanger et Tétouan. Découverte des fonds marins, visite du village et photos souvenir en GoPro. Promotion à 399 DH au lieu de 500 DH.",
    program: [
      {
        title: "Matin · Départ et arrivée à Belyounech",
        text: "Rendez-vous le matin à Tanger puis à Tétouan, route vers Belyounech et accueil par l'équipe.",
      },
      {
        title: "Journée · Plongée et village",
        text: "Plongée sous-marine encadrée, puis visite du village de Belyounech. Photos et vidéos GoPro tout au long de la sortie.",
      },
      { title: "Soir · Retour", text: "Retour vers Tétouan et Tanger en fin de journée." },
    ],
    included: [
      "Transport aller-retour",
      "Accompagnement et animation",
      "Visite du village de Belyounech",
      "Plongée sous-marine",
      "Photos et vidéos GoPro",
    ],
    toBring: ["Maillot de bain et serviette", "Crème solaire", "Change complet", "Carte d'identité"],
  },
  {
    poster: "/assets/offre-taghazout-essaouira.jpg",
    title: "Taghazout - Essaouira",
    badge: "4 jours",
    badgeColor: "blue",
    date: "03 (soir) - 06 septembre",
    departure: "",
    price: "1300 MAD",
    startDate: "2026-09-03",
    endDate: "2026-09-06",
    durationDays: null,
    destinations: ["Taghazout", "Essaouira", "Imsouane", "Aghroud", "Timlaline"],
    departureCities: [],
    departureDates: ["03 (soir) - 06 septembre"],
    message: "Bonjour EcoTrips Women, je veux réserver Taghazout - Essaouira",
    summary:
      "Quatre jours sur la côte atlantique : Taghazout, Essaouira, Imsouane, Aghroud et Timlaline. Plages, villages de pêcheurs et médina, avec hébergement et transport touristique inclus.",
    program: [
      {
        title: "Jour 1 · Départ le soir",
        text: "Départ en soirée le 03 septembre, route de nuit en bus touristique.",
      },
      {
        title: "Jour 2 · Taghazout et Aghroud",
        text: "Arrivée sur la côte, installation, plages de Taghazout et d'Aghroud.",
      },
      {
        title: "Jour 3 · Imsouane et Timlaline",
        text: "Journée entre la baie d'Imsouane et Timlaline, villages et bord de mer.",
      },
      {
        title: "Jour 4 · Essaouira et retour",
        text: "Visite de la médina et du port d'Essaouira, puis retour.",
      },
    ],
    included: [
      "Hébergement 2 nuits",
      "2 petits déjeuners",
      "Transport touristique",
      "Visites (plages, villages…)",
      "Accompagnement et organisation",
    ],
    toBring: [
      "Maillot de bain et serviette",
      "Chaussures confortables",
      "Crème solaire et chapeau",
      "Carte d'identité",
    ],
  },
];

function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Il manque NEXT_PUBLIC_SANITY_PROJECT_ID ou SANITY_API_TOKEN dans .env.local.\n" +
      "Le jeton se cree sur https://sanity.io/manage > API > Tokens, avec le droit Editor."
  );
  process.exit(1);
}

// On verifie les affiches avant tout appel reseau: mieux vaut echouer tout de
// suite que laisser une offre sans image dans le Studio.
const missing = NEW_OFFERS.filter(
  (offer) => !fs.existsSync(path.join(root, "public", offer.poster.replace(/^\//, "")))
);

if (missing.length) {
  console.error("Affiches introuvables. Enregistre-les dans public/assets/ sous ces noms:\n");
  for (const offer of missing) console.error(`  ${offer.poster}   (${offer.title})`);
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

async function upload(publicPath) {
  const filePath = path.join(root, "public", publicPath.replace(/^\//, ""));
  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });
  console.log(`  affiche televersee: ${path.basename(filePath)}`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

function buildItem(offer, image) {
  const key = offer.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    _key: `offer-${key}`,
    _type: "offer",
    image,
    title: offer.title,
    badge: offer.badge,
    badgeColor: offer.badgeColor,
    date: offer.date,
    departure: offer.departure,
    price: offer.price,
    startDate: offer.startDate || undefined,
    endDate: offer.endDate || undefined,
    durationDays: offer.durationDays || undefined,
    destinations: offer.destinations,
    message: offer.message,
    summary: offer.summary,
    program: offer.program.map((day, index) => ({
      _key: `${key}-day-${index}`,
      _type: "day",
      ...day,
    })),
    included: offer.included,
    toBring: offer.toBring,
    departureDates: offer.departureDates,
    departureCities: offer.departureCities,
    previousGallery: [],
  };
}

async function run() {
  const existing = await client.fetch('*[_type == "offers"][0].items[].title');
  const titles = new Set(existing || []);

  const items = [];
  for (const offer of NEW_OFFERS) {
    if (titles.has(offer.title)) {
      console.log(`  deja presente, ignoree: ${offer.title}`);
      continue;
    }
    console.log(`  ajout: ${offer.title}`);
    items.push(buildItem(offer, await upload(offer.poster)));
  }

  if (!items.length) {
    console.log("\nRien a ajouter: les deux voyages sont deja dans le Studio.");
    return;
  }

  // setIfMissing puis insert: fonctionne meme si le document n'a pas encore de
  // liste d'offres, et n'ecrase jamais les offres existantes.
  await client
    .patch("offers")
    .setIfMissing({ items: [] })
    .insert("after", "items[-1]", items)
    .commit();

  console.log(`\nTermine: ${items.length} voyage(s) ajoute(s). Ouvre /studio pour les relire.`);
}

run().catch((error) => {
  console.error("\nEchec de l'ajout:", error.message);
  process.exit(1);
});
