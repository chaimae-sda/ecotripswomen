// Remet, pour les garanties, la darija relue a la main qui etait dans
// lib/ui.js avant qu'elles ne deviennent du texte libre.
import fs from "node:fs";
import { createClient } from "@sanity/client";
import { normaliser } from "../lib/darija-corrections.js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2024-10-01",
  useCdn: false,
});

const VOULU = new Map(
  [
    ["Annulation gratuite", "Annulation bla flous"],
    ["Paiement flexible", "Khlas 3la rahtek"],
    [
      "Jusqu'à 4 jours avant le départ, remboursement intégral.",
      "7ta l 4 dyal l'iyam 9bel lkhrouj, kanreddou lik flousek kamlin.",
    ],
    [
      "Jusqu'à 5 jours avant le départ, remboursement intégral.",
      "7ta l 5 dyal l'iyam 9bel lkhrouj, kanreddou lik flousek kamlin.",
    ],
    [
      "Verse 400 d'avance aujourd'hui, le reste avant le départ.",
      "Khelsi 400 daba, w lba9i 9bel lkhrouj.",
    ],
    [
      "Verse 100 d'avance aujourd'hui, le reste avant le départ.",
      "Khelsi 100 daba, w lba9i 9bel lkhrouj.",
    ],
  ].map(([fr, dr]) => [normaliser(fr), dr])
);

const doc = await client.getDocument("darijaTexts");
const SECTIONS = ["accueil", "voyages", "faq", "galerie", "titres", "libelles"];
let corrigees = 0;

function corriger(lignes) {
  return (lignes || []).map((ligne) => {
    const voulu = VOULU.get(normaliser(ligne.source || ""));
    if (!voulu || ligne.darija === voulu) return ligne;
    console.log(`  ${ligne.source.slice(0, 55)}\n     ancien: ${ligne.darija}\n     nouveau: ${voulu}`);
    corrigees += 1;
    return { ...ligne, darija: voulu };
  });
}

const patch = {};
for (const section of SECTIONS) {
  patch[section] =
    section === "voyages"
      ? (doc.voyages || []).map((bloc) => ({ ...bloc, textes: corriger(bloc.textes) }))
      : corriger(doc[section]);
}

await client.patch("darijaTexts").set(patch).commit();
console.log(`\n${corrigees} lignes corrigees.`);
