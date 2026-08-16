import crypto from "node:crypto";

import { unstable_cache } from "next/cache";

import {
  appliquer,
  collecter,
  finaliser,
  preparerSource,
  remplacerTextes,
} from "./contenu-textes";
import { construireTable, normaliser } from "./darija-corrections";

const DEEPL_FREE = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO = "https://api.deepl.com/v2/translate";

// DeepL accepte jusqu'a 50 textes par appel.
const LOT = 50;

async function appelerDeepL(textes, cle) {
  // La cle gratuite se termine par ":fx" et utilise un autre domaine.
  const url = cle.endsWith(":fx") ? DEEPL_FREE : DEEPL_PRO;
  const resultats = [];

  for (let i = 0; i < textes.length; i += LOT) {
    const lot = textes.slice(i, i + LOT);

    const reponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: lot,
        target_lang: "EN-GB",
        // Conserve la marque et les noms propres intacts.
        preserve_formatting: true,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!reponse.ok) {
      const detail = await reponse.text();
      throw new Error(`DeepL a repondu ${reponse.status}: ${detail.slice(0, 160)}`);
    }

    const data = await reponse.json();
    resultats.push(...data.translations.map((t) => t.text));
  }

  return resultats;
}

// Remet la marque telle qu'elle s'ecrit: DeepL la coupe parfois en deux mots.
function corrigerMarque(texte) {
  return texte
    .replace(/Eco\s?Trips\s?Women/gi, "EcoTrips Women")
    .replace(/What'?s\s?App/gi, "WhatsApp");
}

// La traduction anglaise est mise en cache sous une empreinte du texte source:
// tant que le contenu ne bouge pas dans le Studio, aucun appel a DeepL. Des
// qu'un texte change, l'empreinte change, et la traduction n'est refaite
// qu'une seule fois.
//
// Ce cache ne protege pas du demarrage a froid: au build, les vingt et quelques
// pages anglaises partent ensemble, manquent toutes le cache, et appellent
// DeepL chacune de leur cote. Un seul build a ainsi demande 43 fois la meme
// traduction, soit 340 000 caracteres pour 8 000 utiles. On memorise donc la
// promesse en cours: les pages qui arrivent pendant l'aller-retour la
// partagent.
const enCours = new Map();

function traduireEnCache(empreinte, textes, cle) {
  if (enCours.has(empreinte)) return enCours.get(empreinte);

  const promesse = unstable_cache(
    async () => (await appelerDeepL(textes, cle)).map(corrigerMarque),
    ["deepl-fr-en", empreinte],
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

// Traduit tout le contenu du site vers la langue demandee. Sans cle, ou en cas
// de panne du service, on renvoie le francais: le site reste debout, simplement
// pas traduit.
export async function translateContent(content, lang, entreesDarija) {
  if (lang === "dr") return lireDarija(content, entreesDarija);

  const cleDeepL = process.env.DEEPL_API_KEY;
  if (!cleDeepL || Date.now() < panneJusqua) return content;

  const { source, piedRecolle } = preparerSource(content);
  const entrees = collecter(source);
  if (!entrees.length) return content;

  try {
    const textes = entrees.map((e) => e.texte);
    const empreinte = crypto.createHash("sha1").update(textes.join(" ")).digest("hex");
    const traductions = await traduireEnCache(empreinte, textes, cleDeepL);

    return finaliser(appliquer(source, entrees, traductions), piedRecolle);
  } catch (error) {
    panneJusqua = Date.now() + REPOS;
    console.error(`Traduction ${lang} indisponible, affichage en francais:`, error.message);
    return content;
  }
}
