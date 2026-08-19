// Remplit la fiche "Textes en anglais" du Studio avec les phrases du site.
//
//   pnpm run en:translate
//
// A relancer apres avoir ajoute ou modifie du texte francais dans le Studio,
// exactement comme `pnpm run darija:seed`. Le script ajoute les phrases
// nouvelles avec leur traduction automatique, retire celles qui ne sont plus
// affichees nulle part, et ne touche jamais a une ligne relue a la main.
//
// Il ecrit a deux endroits, et c'est voulu:
//   - la fiche du Studio, ou la traduction se corrige et s'applique dans la
//     minute, sans remise en ligne;
//   - lib/traductions-en.js, qui sert de secours si Sanity est injoignable et
//     evite de redemander a un moteur ce qui est deja traduit.
//
// Pourquoi ne pas traduire pendant la generation des pages, comme avant: Next
// fabrique les pages dans une quinzaine de processus paralleles, qui demarrent
// ensemble et ratent le cache ensemble. Chacun redemandait donc la traduction
// entiere du site, soit quinze fois 10 000 caracteres a chaque mise en ligne.
// Le palier gratuit de DeepL (500 000 caracteres par mois) etait epuise en
// trois mises en ligne, et les pages anglaises repassaient en francais sans
// prevenir.
//
// Prerequis dans .env.local :
//   SANITY_API_TOKEN=...   jeton avec droit d'ecriture
//   DEEPL_API_KEY=...      moteur principal, facultatif
//   GEMINI_API_KEY=...     secours quand le quota DeepL est epuise, facultatif
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

import { listerTextes } from "../lib/contenu-textes.js";
import { normaliser } from "../lib/darija-corrections.js";
import { fallback, normalize } from "../lib/normalize.js";
import { TRADUCTIONS_EN } from "../lib/traductions-en.js";
import { traduireAnglais } from "../lib/traduire-anglais.js";
import { siteContentQuery } from "../sanity/queries.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FICHIER = path.join(root, "lib", "traductions-en.js");

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
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

const ENTETE = [
  "// Traductions anglaises de secours.",
  "//",
  '// La fiche "Textes en anglais" du Studio fait foi: chaque ligne remplie',
  "// la-bas l'emporte sur ce fichier. Cette table ne sert plus qu'a deux",
  "// choses: faire tenir le site tant que Sanity n'est pas joignable, et",
  "// eviter de redemander a un moteur de traduction ce qui est deja traduit.",
  "//",
  "// Elle est reecrite par le script en:translate, qui y recopie aussi les",
  "// corrections faites dans le Studio.",
  "//",
  "// La cle est le texte francais exact, tel qu'il sort du Studio. Les titres",
  "// de section et la premiere ligne du pied de page sont recolles avant",
  '// d\'etre cherches ("Comment ca" + "marche"), la cle est donc la phrase',
  "// entiere.",
].join("\n");

// JSON.stringify pour la cle comme pour la valeur: il echappe guillemets et
// sauts de ligne exactement comme il faut, et le resultat reste du JavaScript.
function ecrireFichier(table) {
  const lignes = [...table.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([fr, en]) => `  ${JSON.stringify(fr)}: ${JSON.stringify(en)},`);

  fs.writeFileSync(
    FICHIER,
    `${ENTETE}\n\nexport const TRADUCTIONS_EN = {\n${lignes.join("\n")}\n};\n`,
    "utf8"
  );
}

// Cle stable par ligne: Sanity exige un _key sur chaque element de tableau, et
// la deriver du texte francais evite d'en regenerer a chaque passage.
function cle(texte, index) {
  const base = texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "texte"}-${index}`;
}

async function run() {
  console.log("1/4  Lecture du contenu du site");
  const data = await client.fetch(siteContentQuery);
  const content = data ? normalize(data) : fallback;
  const textes = listerTextes(content);
  console.log(`     ${textes.length} phrases affichees sur le site`);

  console.log("2/4  Lecture des textes anglais deja saisis");
  // Le Studio par-dessus le fichier: une phrase relue a la main l'emporte, et
  // sa correction redescend ensuite dans le fichier de secours.
  const connues = new Map(Object.entries(TRADUCTIONS_EN).map(([fr, en]) => [normaliser(fr), en]));
  let corrigees = 0;
  for (const entree of data?.english || []) {
    if (typeof entree?.source !== "string" || typeof entree?.english !== "string") continue;
    if (!entree.english.trim()) continue;
    const c = normaliser(entree.source);
    if (connues.get(c) !== entree.english) corrigees += 1;
    connues.set(c, entree.english);
  }
  console.log(`     ${connues.size} phrases connues, dont ${corrigees} corrigees dans le Studio`);

  // La table finale ne garde que les phrases encore affichees: une offre
  // supprimee ne doit pas laisser sa traduction trainer indefiniment.
  const table = new Map();
  const manquantes = [];
  for (const texte of textes) {
    const c = normaliser(texte);
    const deja = connues.get(c);
    if (deja) table.set(c, deja);
    else manquantes.push(texte);
  }
  const retirees = connues.size - table.size;

  if (manquantes.length) {
    const caracteres = manquantes.reduce((n, t) => n + t.length, 0);
    console.log(`3/4  ${manquantes.length} phrases nouvelles (${caracteres} caracteres)`);

    const { traductions, moteur } = await traduireAnglais(manquantes, {
      deepl: process.env.DEEPL_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    });
    console.log(`     traduites par ${moteur}`);

    manquantes.forEach((texte, i) => {
      if (traductions[i]?.trim()) table.set(normaliser(texte), traductions[i]);
    });
  } else {
    console.log("3/4  Aucune phrase nouvelle a traduire");
  }

  console.log("4/4  Ecriture dans le Studio et dans lib/traductions-en.js");
  const entries = textes.map((texte, index) => ({
    _type: "enEntry",
    _key: cle(texte, index),
    source: texte,
    english: table.get(normaliser(texte)) || "",
  }));

  await client.createOrReplace({ _id: "enTexts", _type: "enTexts", entries });
  ecrireFichier(table);

  const vides = entries.filter((e) => !e.english).length;
  console.log(`\nTermine: ${entries.length} textes, ${entries.length - vides} traduits.`);
  if (vides) console.log(`${vides} sans anglais: ils s'afficheront en francais.`);
  if (retirees > 0) console.log(`${retirees} retirees: leur texte francais n'existe plus.`);
  console.log("Relis-les dans le Studio > Textes en anglais.");
}

run().catch((error) => {
  console.error(`\nTraduction anglaise incomplete: ${error.message}`);
  console.error("Les phrases deja traduites sont conservees.");
  process.exit(1);
});
