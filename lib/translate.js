import crypto from "node:crypto";

import { unstable_cache } from "next/cache";

import { corrigerDarija, TEXTES_CORRIGES } from "./darija-corrections";
import { traduireDarija } from "./translate-darija";

const DEEPL_FREE = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO = "https://api.deepl.com/v2/translate";

// DeepL accepte jusqu'a 50 textes par appel.
const LOT = 50;

// Champs a ne jamais traduire: adresses, couleurs, dimensions, identifiants.
const IGNORER = new Set([
  "url",
  "src",
  "poster",
  "slug",
  "value",
  "color",
  "badgeColor",
  "width",
  "height",
  "lqip",
  "phone",
  "instagramUrl",
  "facebookUrl",
  "tiktokUrl",
  "youtubeUrl",
  "googleReviewsUrl",
  "message",
  "startDate",
  "endDate",
  "priceValue",
  "durationDays",
  // Les avis Google sont des citations: ce sont les mots des voyageuses, pas
  // du contenu editorial. Les traduire reviendrait a leur faire dire ce
  // qu'elles n'ont pas ecrit. Ils restent donc dans leur langue d'origine.
  "reviews",
]);

function estTraduisible(texte) {
  if (typeof texte !== "string") return false;
  const t = texte.trim();
  if (t.length < 2) return false;
  // Adresses, couleurs, dates, nombres seuls.
  if (/^(https?:\/\/|\/|#|\+?\d)/.test(t)) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
  // Il faut au moins une lettre.
  return /\p{L}/u.test(t);
}

// Parcourt l'objet et retourne la liste des textes, avec le chemin de chacun.
function collecter(valeur, chemin = [], sortie = []) {
  if (estTraduisible(valeur)) {
    sortie.push({ chemin: [...chemin], texte: valeur });
    return sortie;
  }
  if (Array.isArray(valeur)) {
    valeur.forEach((v, i) => collecter(v, [...chemin, i], sortie));
    return sortie;
  }
  if (valeur && typeof valeur === "object") {
    for (const [cle, v] of Object.entries(valeur)) {
      if (!IGNORER.has(cle)) collecter(v, [...chemin, cle], sortie);
    }
  }
  return sortie;
}

// Reconstruit une copie de l'objet en remplacant les textes collectes.
function appliquer(source, entrees, traductions) {
  const copie = structuredClone(source);

  entrees.forEach((entree, i) => {
    const traduit = traductions[i];
    if (!traduit) return;

    let noeud = copie;
    for (let d = 0; d < entree.chemin.length - 1; d += 1) noeud = noeud[entree.chemin[d]];
    noeud[entree.chemin[entree.chemin.length - 1]] = traduit;
  });

  return copie;
}

// Pose les textes darija relus a la main avant tout appel a Gemini. Le
// parcours touche toutes les chaines, y compris celles trop courtes pour la
// traduction automatique: c'est le seul moyen d'atteindre le "à" rose du pied
// de page.
function appliquerCorrections(valeur) {
  if (typeof valeur === "string") return corrigerDarija(valeur) ?? valeur;
  if (Array.isArray(valeur)) return valeur.map((v) => appliquerCorrections(v));
  if (!valeur || typeof valeur !== "object") return valeur;

  return Object.fromEntries(
    Object.entries(valeur).map(([cle, v]) => [cle, IGNORER.has(cle) ? v : appliquerCorrections(v)])
  );
}

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

// La traduction est mise en cache sous une empreinte du texte source: tant que
// le contenu ne bouge pas dans le Studio, aucun appel a DeepL. Des qu'un texte
// change, l'empreinte change, et la traduction n'est refaite qu'une seule fois.
function traduireEnCache(empreinte, textes, cle) {
  return unstable_cache(
    async () => (await appelerDeepL(textes, cle)).map(corrigerMarque),
    ["deepl-fr-en", empreinte],
    { revalidate: 60 * 60 * 24 * 30, tags: ["traductions"] }
  )();
}

// Les titres de section sont coupes en deux champs pour l'italique rose:
// "Comment ca" + "marche". Envoyes separement, DeepL n'a aucun contexte et rend
// "What do you mean? walk". On les recolle avant traduction, puis on recoupe le
// resultat en gardant le dernier mot en couleur.
function estTitre(valeur) {
  return (
    valeur &&
    typeof valeur === "object" &&
    !Array.isArray(valeur) &&
    typeof valeur.title === "string" &&
    typeof valeur.highlight === "string" &&
    "eyebrow" in valeur
  );
}

function recollerTitres(valeur) {
  if (Array.isArray(valeur)) return valeur.map(recollerTitres);
  if (!valeur || typeof valeur !== "object") return valeur;

  if (estTitre(valeur) && valeur.highlight.trim()) {
    return { ...valeur, title: `${valeur.title} ${valeur.highlight}`.trim(), highlight: "" };
  }

  return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, recollerTitres(v)]));
}

function recouperTitres(valeur) {
  if (Array.isArray(valeur)) return valeur.map(recouperTitres);
  if (!valeur || typeof valeur !== "object") return valeur;

  if (estTitre(valeur) && !valeur.highlight && valeur.title.includes(" ")) {
    const mots = valeur.title.trim().split(/\s+/);
    const dernier = mots.pop();
    return { ...valeur, title: mots.join(" "), highlight: dernier };
  }

  return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, recouperTitres(v)]));
}

// Traduit tout le contenu du site vers la langue demandee. Sans cle, ou en cas
// de panne du service, on renvoie le francais: le site reste debout, simplement
// pas traduit.
//
// Anglais par DeepL, darija par Gemini: aucune des 110 langues de DeepL ne
// couvre le marocain, encore moins ecrit en lettres latines.
export async function translateContent(content, lang) {
  const cleDeepL = process.env.DEEPL_API_KEY;
  if (lang === "en" && !cleDeepL) return content;

  const recolle = recollerTitres(content);
  const source = lang === "dr" ? appliquerCorrections(recolle) : recolle;

  // Ce qui a deja ete relu a la main ne repart pas en traduction: Gemini
  // reecrirait du darija qu'on vient tout juste de corriger.
  const entrees = collecter(source).filter((entree) => !TEXTES_CORRIGES.has(entree.texte));

  if (!entrees.length) return lang === "dr" ? recouperTitres(source) : content;
  // Sans cle Gemini, la darija se limite aux textes corriges a la main: le
  // reste de la page reste en francais, plutot que rien du tout.
  if (lang === "dr" && !process.env.GEMINI_API_KEY) return recouperTitres(source);

  try {
    const textes = entrees.map((e) => e.texte);
    const empreinte = crypto.createHash("sha1").update(textes.join(" ")).digest("hex");

    const traductions =
      lang === "dr"
        ? await traduireDarija(textes)
        : await traduireEnCache(empreinte, textes, cleDeepL);

    if (!traductions) return lang === "dr" ? recouperTitres(source) : content;
    return recouperTitres(appliquer(source, entrees, traductions));
  } catch (error) {
    console.error(`Traduction ${lang} indisponible, affichage en francais:`, error.message);
    // En darija, les corrections manuelles tiennent meme si Gemini tombe.
    return lang === "dr" ? recouperTitres(source) : content;
  }
}
