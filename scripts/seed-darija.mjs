// Remplit la fiche "Textes en darija" du Studio avec les phrases du site.
//
//   npm run darija:seed
//
// A relancer apres avoir ajoute ou modifie du texte francais dans le Studio:
// le script ajoute les phrases nouvelles et retire celles qui ne sont plus
// affichees nulle part. Il ne touche jamais a une ligne deja traduite, meme si
// Gemini rendrait autre chose aujourd'hui: le darija ecrit dans le Studio est
// le seul qui compte.
//
// Les phrases nouvelles arrivent avec une premiere ebauche produite par Gemini,
// pour qu'il y ait quelque chose a relire plutot qu'une page blanche. Sans cle
// GEMINI_API_KEY elles arrivent vides, ce qui marche aussi: le site affiche
// alors le francais en attendant.
//
// Prerequis dans .env.local :
//   NEXT_PUBLIC_SANITY_PROJECT_ID=...
//   NEXT_PUBLIC_SANITY_DATASET=production
//   SANITY_API_TOKEN=...   (jeton avec droit d'ecriture)
//   GEMINI_API_KEY=...     (facultatif)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

import { listerTextesParSection, SECTIONS } from "../lib/contenu-textes.js";
import { listerLibellesUI } from "../lib/ui.js";
import { BASE_DARIJA, normaliser } from "../lib/darija-corrections.js";
import { fallback, normalize } from "../lib/normalize.js";
import { traduireDarija } from "../lib/translate-darija.js";
import { siteContentQuery } from "../sanity/queries.js";

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

// Cle stable par ligne: Sanity exige un _key sur chaque element de tableau, et
// le derive du texte francais evite d'en regenerer a chaque passage.
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

// Ramasse les couples { source, darija } ou qu'ils soient dans la fiche: a plat,
// range par onglet, ou groupe par voyage. La forme de la fiche a deja change
// deux fois; une lecture qui suivrait sa structure perdrait toutes les
// traductions le jour ou elle changera encore.
function ramasser(valeur, sortie = new Map()) {
  if (Array.isArray(valeur)) {
    for (const v of valeur) ramasser(v, sortie);
    return sortie;
  }
  if (!valeur || typeof valeur !== "object") return sortie;

  if (typeof valeur.source === "string" && typeof valeur.darija === "string") {
    if (valeur.darija.trim()) sortie.set(normaliser(valeur.source), valeur.darija);
    return sortie;
  }

  for (const v of Object.values(valeur)) ramasser(v, sortie);
  return sortie;
}

async function run() {
  console.log("1/4  Lecture du contenu du site");
  const data = await client.fetch(siteContentQuery);
  const content = data ? normalize(data) : fallback;
  const liste = listerTextesParSection(content);
  const textes = liste.map((entree) => entree.texte);
  console.log(`     ${textes.length} phrases affichees sur le site`);

  console.log("2/4  Lecture des textes darija deja saisis");
  // La fiche entiere, pas la projection de la requete: on ne veut dependre
  // d'aucune hypothese sur sa structure.
  const existantes = ramasser(await client.getDocument("darijaTexts"));
  console.log(`     ${existantes.size} lignes deja traduites dans le Studio`);

  // Une phrase deja traduite dans le Studio, ou relue a la main dans le code,
  // n'a rien a demander a une machine.
  const aTraduire = textes.filter((texte) => {
    const c = normaliser(texte);
    return !existantes.get(c)?.trim() && !BASE_DARIJA.has(c);
  });

  let ebauches = new Map();
  if (aTraduire.length && process.env.GEMINI_API_KEY) {
    console.log(`3/4  Premiere ebauche pour ${aTraduire.length} phrases nouvelles`);
    try {
      const traduits = await traduireDarija(aTraduire, process.env.GEMINI_API_KEY);
      ebauches = new Map(aTraduire.map((texte, i) => [normaliser(texte), traduits[i]]));
    } catch (error) {
      // Sans ebauche, les lignes arrivent vides: elles restent a remplir a la
      // main, ce qui vaut mieux qu'un script qui s'arrete en chemin.
      console.error("     Gemini indisponible, lignes laissees vides:", error.message);
    }
  } else if (aTraduire.length) {
    console.log(`3/4  ${aTraduire.length} phrases nouvelles, laissees vides (pas de GEMINI_API_KEY)`);
  } else {
    console.log("3/4  Aucune phrase nouvelle a traduire");
  }

  // Une liste par onglet du Studio, et dans l'onglet Voyages un bloc par
  // voyage: on ouvre le voyage a corriger sans derouler tous les autres.
  const champs = Object.fromEntries(SECTIONS.map((section) => [section.name, []]));
  const blocs = new Map();

  liste.forEach(({ texte, section, voyage }, index) => {
    const ligne = (() => {
      const c = normaliser(texte);
      const darija = existantes.get(c)?.trim() || BASE_DARIJA.get(c) || ebauches.get(c) || "";
      return { _type: "darijaEntry", _key: cle(texte, index), source: texte, darija };
    })();

    if (section !== "voyages") {
      champs[section].push(ligne);
      return;
    }

    if (!blocs.has(voyage)) {
      const bloc = { _type: "darijaVoyage", _key: cle(voyage, blocs.size), voyage, textes: [] };
      blocs.set(voyage, bloc);
      champs.voyages.push(bloc);
    }
    blocs.get(voyage).textes.push(ligne);
  });


  // L'onglet "Interface du site" ne vient pas de Sanity mais de lib/ui.js:
  // menus, formulaire, calendrier, filtres. Ces libelles sont deja traduits a
  // la main, on les propose tels quels pour qu'ils deviennent corrigeables.
  champs.interface = listerLibellesUI("dr").map(({ fr, texte }, index) => ({
    _type: "darijaEntry",
    _key: cle(fr, index),
    source: fr,
    darija: existantes.get(normaliser(fr))?.trim() || texte || "",
  }));

  const entries = SECTIONS.flatMap((section) =>
    section.name === "voyages"
      ? champs.voyages.flatMap((bloc) => bloc.textes)
      : champs[section.name]
  );

  // Les libelles d'interface ne viennent pas du contenu Sanity: sans cette
  // exception ils seraient tous comptes comme retires a chaque passage.
  const sourcesUI = new Set(listerLibellesUI("dr").map(({ fr }) => normaliser(fr)));
  const retirees = [...existantes.keys()].filter(
    (c) => !sourcesUI.has(c) && !textes.some((texte) => normaliser(texte) === c)
  );

  console.log("4/4  Ecriture dans le Studio");
  await client.createOrReplace({ _id: "darijaTexts", _type: "darijaTexts", ...champs });

  const vides = entries.filter((e) => !e.darija).length;
  console.log(
    `\nTermine: ${entries.length} textes, ${entries.length - vides} traduits, ${vides} a remplir.`
  );
  if (retirees.length) {
    console.log(`${retirees.length} lignes retirees: leur texte francais n'existe plus.`);
  }
  console.log("Relis-les dans le Studio > Textes en darija, onglet par onglet.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
