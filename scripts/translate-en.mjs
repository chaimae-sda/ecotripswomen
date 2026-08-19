// Calcule la version anglaise du contenu du site, une fois, et l'ecrit dans
// lib/traductions-en.js.
//
//   pnpm run en:translate
//
// Ce script tourne aussi automatiquement avant chaque `pnpm run build`.
//
// Pourquoi ne pas traduire pendant la generation des pages, comme avant: Next
// fabrique les pages dans une quinzaine de processus paralleles, qui demarrent
// ensemble et ratent le cache ensemble. Chacun redemandait donc la traduction
// entiere du site, soit quinze fois 10 000 caracteres a chaque mise en ligne.
// Le palier gratuit de DeepL (500 000 caracteres par mois) etait epuise en
// trois mises en ligne, et les pages anglaises repassaient en francais sans
// prevenir. En traduisant avant, une seule fois, une mise en ligne ne coute
// plus rien tant que le texte francais n'a pas bouge.
//
// Le fichier garde ce qui a deja ete traduit: seules les phrases nouvelles
// partent au moteur de traduction. Une phrase corrigee a la main dans
// lib/traductions-en.js n'est donc jamais ecrasee.
//
// Prerequis dans .env.local (les deux cles sont facultatives):
//   DEEPL_API_KEY=...    moteur principal
//   GEMINI_API_KEY=...   secours quand le quota DeepL est epuise
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

const ENTETE = `// Traductions anglaises du contenu du site.
//
// Ce fichier est ecrit par \`pnpm run en:translate\`, qui tourne aussi avant
// chaque build. Il ne contient que des phrases deja traduites: le site les
// repose telles quelles, sans appeler personne. C'est ce qui evite de rejouer
// la traduction entiere du site dans chacun des processus qui fabriquent les
// pages.
//
// La cle est le texte francais exact, tel qu'il sort du Studio. Les titres de
// section et la premiere ligne du pied de page sont recolles avant d'etre
// cherches ("Comment ca" + "marche"), la cle est donc la phrase entiere.
//
// Corriger une traduction a la main ici est sans danger: le script ne remplace
// jamais une ligne existante, il ne fait qu'ajouter les phrases nouvelles et
// retirer celles qui ne sont plus affichees nulle part.
`;

// JSON.stringify pour la valeur: il echappe guillemets et sauts de ligne
// exactement comme il faut, et le resultat reste du JavaScript valide.
function ecrire(table) {
  const lignes = [...table.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([fr, en]) => `  ${JSON.stringify(fr)}: ${JSON.stringify(en)},`);

  fs.writeFileSync(
    FICHIER,
    `${ENTETE}\nexport const TRADUCTIONS_EN = {\n${lignes.join("\n")}\n};\n`,
    "utf8"
  );
}

async function lireContenu() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    console.log("     pas de projet Sanity configure, contenu de secours utilise");
    return fallback;
  }

  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-10-01",
    useCdn: false,
    // Le site en ligne ne montre que le contenu publie: on traduit la meme
    // chose, sinon un brouillon ferait apparaitre des phrases jamais affichees.
    perspective: "published",
  });

  const data = await client.fetch(siteContentQuery);
  return data ? normalize(data) : fallback;
}

async function run() {
  console.log("1/3  Lecture du contenu du site");
  const content = await lireContenu();
  const textes = listerTextes(content);
  console.log(`     ${textes.length} phrases affichees sur le site`);

  const existantes = new Map(
    Object.entries(TRADUCTIONS_EN).map(([fr, en]) => [normaliser(fr), en])
  );

  // La table finale ne garde que les phrases encore affichees: une offre
  // supprimee ne doit pas laisser sa traduction trainer indefiniment.
  const table = new Map();
  const manquantes = [];
  for (const texte of textes) {
    const cle = normaliser(texte);
    const deja = existantes.get(cle);
    if (deja) table.set(cle, deja);
    else manquantes.push(texte);
  }

  const retirees = existantes.size - table.size;

  if (!manquantes.length) {
    console.log("2/3  Aucune phrase nouvelle a traduire");
    if (retirees > 0) {
      ecrire(table);
      console.log(`3/3  ${retirees} traductions retirees: leur texte francais n'existe plus.`);
    } else {
      console.log("3/3  Rien a ecrire, le fichier est a jour.");
    }
    return;
  }

  const caracteres = manquantes.reduce((n, t) => n + t.length, 0);
  console.log(`2/3  ${manquantes.length} phrases nouvelles (${caracteres} caracteres)`);

  const { traductions, moteur } = await traduireAnglais(manquantes, {
    deepl: process.env.DEEPL_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  });

  manquantes.forEach((texte, i) => {
    const traduit = traductions[i];
    if (traduit?.trim()) table.set(normaliser(texte), traduit);
  });

  console.log("3/3  Ecriture de lib/traductions-en.js");
  ecrire(table);

  console.log(`\nTermine (${moteur}): ${table.size} phrases traduites.`);
  if (retirees > 0) console.log(`${retirees} retirees: leur texte francais n'existe plus.`);
}

run().catch((error) => {
  // Un build ne doit jamais tomber parce qu'un service de traduction repond
  // mal: les phrases deja traduites restent en place, les nouvelles
  // s'afficheront en francais jusqu'au prochain passage.
  console.error(`\nTraduction anglaise incomplete: ${error.message}`);
  console.error("Les phrases deja traduites sont conservees, les nouvelles resteront en francais.");
  process.exit(0);
});
