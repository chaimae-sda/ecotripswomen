import crypto from "node:crypto";

import { unstable_cache } from "next/cache";

import { collecter, finaliser, preparerSource, remplacerTextes } from "./contenu-textes";
import { construireTable, normaliser } from "./darija-corrections";
import { TRADUCTIONS_EN } from "./traductions-en";
import { traduireAnglais } from "./traduire-anglais";

// L'anglais se lit d'abord dans lib/traductions-en.js, rempli avant le build
// par `pnpm run en:translate`. Tant que le texte francais n'a pas bouge, le
// site ne demande donc rien a personne.
//
// C'etait autrefois traduit pendant la generation des pages. Next les fabrique
// dans une quinzaine de processus paralleles, qui demarrent ensemble et ratent
// le cache ensemble: chacun redemandait la traduction entiere du site, soit
// quinze fois 10 000 caracteres par mise en ligne. Le palier gratuit de DeepL
// tenait trois mises en ligne, apres quoi les pages anglaises repassaient en
// francais sans prevenir.
const TABLE_EN = new Map(Object.entries(TRADUCTIONS_EN).map(([fr, en]) => [normaliser(fr), en]));

// Deux pages generees en meme temps demandent la meme chose: on partage la
// promesse en cours plutot que de poser la question deux fois.
const enCours = new Map();

function traduireEnCache(empreinte, textes) {
  if (enCours.has(empreinte)) return enCours.get(empreinte);

  const promesse = unstable_cache(
    async () =>
      (
        await traduireAnglais(textes, {
          deepl: process.env.DEEPL_API_KEY,
          gemini: process.env.GEMINI_API_KEY,
        })
      ).traductions,
    ["traduction-fr-en", empreinte],
    { revalidate: 60 * 60 * 24 * 30, tags: ["traductions"] }
  )().finally(() => enCours.delete(empreinte));

  enCours.set(empreinte, promesse);
  return promesse;
}

// Quota epuise ou cle refusee: la reponse sera la meme pour la page suivante.
// On arrete de demander pendant dix minutes, plutot que de rejouer l'echec sur
// chaque page. Assez court pour qu'une panne passagere se rattrape toute seule,
// assez long pour qu'un build entier ne pose la question qu'une fois.
const REPOS = 10 * 60 * 1000;
let panneJusqua = 0;

// Les phrases ecrites dans le Studio depuis la derniere mise en ligne n'ont pas
// encore de traduction en reserve. Plutot que de les laisser en francais
// jusqu'au prochain build, on traduit celles-la, et elles seules: quelques
// centaines de caracteres, la ou traduire le site entier en coutait dix mille.
async function lireAnglais(content) {
  const { source, piedRecolle } = preparerSource(content);

  const manquantes = [...new Set(collecter(source).map((entree) => entree.texte))].filter(
    (texte) => !TABLE_EN.has(normaliser(texte))
  );

  const aUneCle = Boolean(process.env.DEEPL_API_KEY || process.env.GEMINI_API_KEY);
  let table = TABLE_EN;

  if (manquantes.length && aUneCle && Date.now() >= panneJusqua) {
    table = new Map(TABLE_EN);
    try {
      const empreinte = crypto.createHash("sha1").update(manquantes.join(" ")).digest("hex");
      const traductions = await traduireEnCache(empreinte, manquantes);
      manquantes.forEach((texte, i) => {
        if (traductions[i]?.trim()) table.set(normaliser(texte), traductions[i]);
      });
    } catch (error) {
      panneJusqua = Date.now() + REPOS;
      console.error(
        `${manquantes.length} phrases nouvelles laissees en francais, lance "pnpm run en:translate":`,
        error.message
      );
    }
  }

  const traduit = remplacerTextes(source, (texte) => table.get(normaliser(texte)) ?? texte);
  return finaliser(traduit, piedRecolle);
}

// Le darija ne se traduit pas a l'affichage: il se lit. Chaque phrase est
// cherchee dans la fiche "Textes en darija" du Studio, et ce qui n'y figure pas
// reste en francais.
//
// C'etait autrefois Gemini qui le reconstruisait a chaque generation, d'ou un
// texte qui changeait de formulation tout seul d'un build a l'autre, sans que
// personne puisse le corriger durablement. Le remplissage de la fiche est
// desormais un geste separe: `npm run darija:seed`.
function lireDarija(content, entrees) {
  const table = construireTable(entrees);
  const { source, piedRecolle } = preparerSource(content);
  const traduit = remplacerTextes(source, (texte) => table.get(normaliser(texte)) ?? texte);

  return finaliser(traduit, piedRecolle);
}

// Traduit tout le contenu du site vers la langue demandee. Ce qui n'a pas de
// traduction reste en francais: le site est alors incompletement traduit, mais
// jamais casse.
export async function translateContent(content, lang, entreesDarija) {
  if (lang === "dr") return lireDarija(content, entreesDarija);
  if (lang === "en") return lireAnglais(content);
  return content;
}
