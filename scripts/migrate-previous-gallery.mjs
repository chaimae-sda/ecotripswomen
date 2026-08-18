// Convertit les "Photos de l'edition precedente" a la forme actuelle.
//
//   pnpm run sanity:migrate-gallery
//
// Avant, chaque photo etait une fiche qui contenait une image:
//   { _type: "photo", image: { asset }, alt }
// Maintenant la photo est l'image elle-meme:
//   { _type: "photo", asset, alt }
// C'est cette forme qui permet de deposer plusieurs photos d'un coup dans le
// Studio, sans ouvrir puis refermer une fiche par photo.
//
// Le script ne touche qu'aux photos restees a l'ancienne forme: le relancer est
// sans danger. Il traite aussi le brouillon (drafts.*) s'il y en a un, sinon
// une modification non publiee ecraserait la conversion.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

// Renvoie la liste convertie, ou null si elle n'a pas bouge.
function convert(gallery) {
  if (!Array.isArray(gallery)) return null;

  let changed = false;
  const photos = gallery.map((photo) => {
    const asset = photo?.asset || photo?.image?.asset;
    if (!asset || photo.asset) return photo;

    changed = true;
    // Le recadrage etait pose sur l'image interne: il remonte d'un cran avec
    // elle, sinon les photos deja recadrees repartiraient de zero.
    const { image, ...rest } = photo;
    return {
      ...rest,
      _type: "photo",
      asset,
      ...(image.hotspot ? { hotspot: image.hotspot } : {}),
      ...(image.crop ? { crop: image.crop } : {}),
    };
  });

  return changed ? photos : null;
}

async function migrate(documentId) {
  const doc = await client.getDocument(documentId);
  if (!doc) return 0;

  const patch = {};
  let photos = 0;

  (doc.items || []).forEach((offer, index) => {
    const converted = convert(offer.previousGallery);
    if (!converted) return;
    // La cle _key est plus sure que l'index: elle survit a un deplacement de
    // l'offre entre la lecture et l'ecriture.
    const key = offer._key ? `[_key=="${offer._key}"]` : `[${index}]`;
    patch[`items${key}.previousGallery`] = converted;
    photos += converted.length;
    console.log(`  ${offer.title || `offre ${index + 1}`}: ${converted.length} photos`);
  });

  if (!photos) return 0;

  await client.patch(documentId).set(patch).commit();
  return photos;
}

console.log(`Projet ${projectId}, jeu de donnees ${dataset}`);

let total = 0;
for (const id of ["offers", "drafts.offers"]) {
  console.log(`\n${id}`);
  const photos = await migrate(id);
  if (!photos) console.log("  rien a convertir");
  total += photos;
}

console.log(`\nTermine: ${total} photos converties.`);
