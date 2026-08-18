// Complete les voyages deja presents dans le Studio avec les champs ajoutes
// depuis: destinations, dates de debut et de fin, programme, ce qui est
// compris, a prevoir, et photos de l'edition precedente.
//
//   pnpm run sanity:fill
//
// Le script ne remplace jamais un champ deja rempli dans le Studio: il ne
// comble que les trous. Le relancer est donc sans danger.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

import { fallbackContent } from "../lib/fallback-content.js";

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

const uploaded = new Map();

async function upload(publicPath) {
  if (uploaded.has(publicPath)) return uploaded.get(publicPath);

  const filePath = path.join(root, "public", publicPath.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    console.warn(`    photo introuvable, ignoree: ${publicPath}`);
    return null;
  }

  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });

  const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  uploaded.set(publicPath, ref);
  return ref;
}

function isEmpty(value) {
  if (value === null || value === undefined || value === "") return true;
  return Array.isArray(value) && value.length === 0;
}

async function run() {
  const document = await client.getDocument("offers");
  if (!document?.items?.length) {
    console.error("Aucune offre trouvee dans le Studio. Lance d'abord pnpm run sanity:import.");
    process.exit(1);
  }

  const patch = {};
  let filled = 0;

  for (const [index, item] of document.items.entries()) {
    const source = fallbackContent.offers.find((offer) => offer.title === item.title);
    if (!source) {
      console.log(`  ${item.title}: pas de contenu prepare, ignoree`);
      continue;
    }

    const key = `${index}`;
    const added = [];

    // Champs simples.
    for (const field of ["summary", "startDate", "endDate"]) {
      if (isEmpty(item[field]) && !isEmpty(source[field])) {
        patch[`items[${key}].${field}`] = source[field];
        added.push(field);
      }
    }

    // Listes de textes.
    for (const field of ["included", "toBring", "destinations", "departureDates", "departureCities"]) {
      if (isEmpty(item[field]) && !isEmpty(source[field])) {
        patch[`items[${key}].${field}`] = source[field];
        added.push(field);
      }
    }

    // Programme jour par jour: chaque entree a besoin de sa cle _key.
    if (isEmpty(item.program) && !isEmpty(source.program)) {
      patch[`items[${key}].program`] = source.program.map((day, dayIndex) => ({
        _key: `day-${index}-${dayIndex}`,
        _type: "day",
        ...day,
      }));
      added.push("program");
    }

    // Photos de l'edition precedente.
    if (isEmpty(item.previousGallery) && !isEmpty(source.previousGallery)) {
      const photos = [];
      for (const [photoIndex, photo] of source.previousGallery.entries()) {
        const image = await upload(photo.src);
        if (image) {
          photos.push({
            _key: `photo-${index}-${photoIndex}`,
            _type: "photo",
            asset: image.asset,
            alt: photo.alt,
          });
        }
      }
      if (photos.length) {
        patch[`items[${key}].previousGallery`] = photos;
        added.push(`previousGallery (${photos.length} photos)`);
      }
    }

    if (added.length) {
      filled += 1;
      console.log(`  ${item.title}: ${added.join(", ")}`);
    } else {
      console.log(`  ${item.title}: deja complet`);
    }
  }

  if (!Object.keys(patch).length) {
    console.log("\nRien a completer: tous les voyages sont deja remplis.");
    return;
  }

  await client.patch("offers").set(patch).commit();
  console.log(`\nTermine: ${filled} voyage(s) complete(s). Le site se met a jour en une minute.`);
}

run().catch((error) => {
  console.error("\nEchec:", error.message);
  process.exit(1);
});
