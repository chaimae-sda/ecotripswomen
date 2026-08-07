// Remplit le Studio Sanity avec le contenu actuel du site (textes, photos, videos).
// A lancer une seule fois, apres avoir cree le projet Sanity:
//   pnpm run sanity:import
//
// Prerequis dans .env.local :
//   NEXT_PUBLIC_SANITY_PROJECT_ID=...
//   NEXT_PUBLIC_SANITY_DATASET=production
//   SANITY_API_TOKEN=...   (jeton avec droit d'ecriture, cree sur sanity.io/manage)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

import { fallbackContent } from "../lib/fallback-content.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Petit lecteur de .env.local: evite d'ajouter une dependance juste pour ca.
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

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

const uploaded = new Map();

async function upload(kind, publicPath) {
  if (!publicPath) return null;
  if (uploaded.has(publicPath)) return uploaded.get(publicPath);

  const filePath = path.join(root, "public", publicPath.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    console.warn(`  fichier introuvable, ignore: ${publicPath}`);
    return null;
  }

  const asset = await client.assets.upload(kind, fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });

  const ref = { _type: kind, asset: { _type: "reference", _ref: asset._id } };
  uploaded.set(publicPath, ref);
  console.log(`  televerse: ${path.basename(filePath)}`);
  return ref;
}

async function run() {
  const { settings, offers, reviews, gallery } = fallbackContent;

  console.log("1/4  Reglages du site");
  const siteSettings = {
    _id: "siteSettings",
    _type: "siteSettings",
    logo: await upload("image", settings.logo.url),
    phone: settings.phone,
    instagramUrl: settings.instagramUrl,
    googleReviewsUrl: settings.googleReviewsUrl,
    qrCode: await upload("image", settings.qrCode.url),
    hero: {
      photo: await upload("image", settings.hero.photo.url),
      title: settings.hero.title,
      text: settings.hero.text,
      primaryLabel: settings.hero.primaryLabel,
      secondaryLabel: settings.hero.secondaryLabel,
    },
    promises: settings.promises.map((item, index) => ({ _key: `promise-${index}`, ...item })),
    howTitle: settings.howTitle,
    steps: settings.steps.map((item, index) => ({ _key: `step-${index}`, ...item })),
    stats: settings.stats.map((item, index) => ({ _key: `stat-${index}`, ...item })),
    offersTitle: settings.offersTitle,
    videosTitle: settings.videosTitle,
    reviewsTitle: settings.reviewsTitle,
    galleryTitle: settings.galleryTitle,
    communityTitle: settings.communityTitle,
    contactTitle: settings.contactTitle,
    contactImage: await upload("image", settings.contactImage.url),
    footerLine1: settings.footerLine1,
    footerHighlight: settings.footerHighlight,
    footerLine2: settings.footerLine2,
  };

  console.log("2/4  Voyages a venir");
  const offerItems = [];
  for (const [index, offer] of offers.entries()) {
    offerItems.push({
      _key: `offer-${index}`,
      _type: "offer",
      image: await upload("image", offer.image.url),
      title: offer.title,
      badge: offer.badge,
      badgeColor: offer.badgeColor || "",
      date: offer.date,
      departure: offer.departure,
      price: offer.price,
      message: offer.message,
    });
  }

  console.log("3/4  Avis");
  const reviewItems = reviews.map((review, index) => ({
    _key: `review-${index}`,
    _type: "review",
    name: review.name,
    text: review.text,
    rating: review.rating,
    date: review.date,
    localGuide: review.localGuide,
    color: review.color,
  }));

  console.log("4/4  Galerie");
  const galleryItems = [];
  for (const [index, item] of gallery.entries()) {
    if (item.type === "video") {
      galleryItems.push({
        _key: `media-${index}`,
        _type: "video",
        file: await upload("file", item.src),
        poster: await upload("image", item.poster),
        alt: item.alt,
        featured: Boolean(item.featured),
      });
    } else {
      galleryItems.push({
        _key: `media-${index}`,
        _type: "photo",
        image: await upload("image", item.src),
        alt: item.alt,
      });
    }
  }

  await client
    .transaction()
    .createOrReplace(siteSettings)
    .createOrReplace({ _id: "offers", _type: "offers", items: offerItems })
    .createOrReplace({ _id: "reviews", _type: "reviews", items: reviewItems })
    .createOrReplace({ _id: "gallery", _type: "gallery", items: galleryItems })
    .commit();

  console.log(
    `\nTermine: ${offerItems.length} offres, ${reviewItems.length} avis, ${galleryItems.length} medias.` +
      "\nOuvre /studio pour modifier le contenu."
  );
}

run().catch((error) => {
  console.error("\nEchec de l'import:", error.message);
  process.exit(1);
});
