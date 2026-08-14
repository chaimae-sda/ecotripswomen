import crypto from "node:crypto";

import { unstable_cache } from "next/cache";

// DeepL ne connait pas la darija: aucune de ses 110 langues cibles ne la
// couvre. On passe donc par Gemini, un modele de langue, seul capable de
// produire du marocain ecrit en lettres latines.
// Modele fixe, pas "latest": l'alias pointe vers la version la plus recente,
// dont le palier gratuit est minuscule (20 requetes). Un modele "lite" stable
// offre un quota utilisable et suffit largement pour de la traduction.
const MODELE = "gemini-3.5-flash-lite";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent`;

// Sans regle imposee, un modele ecrit "7it" puis "hit" dans la meme page. La
// convention est donc fixee explicitement, et rappelee a chaque appel.
const CONSIGNE = `Tu traduis du français vers la darija marocaine ÉCRITE EN LETTRES LATINES
(arabizi), le style utilisé sur WhatsApp au Maroc.

Règles strictes :
- Chiffres pour les lettres arabes : 7 pour ح, 3 pour ع, 9 pour ق, 5 ou kh pour خ. Sois constant.
- Jamais d'alphabet arabe. Jamais de français littéral.
- Ton naturel et familier, comme une Marocaine qui parle à une amie.
- Garde tels quels : EcoTrips Women, WhatsApp, Instagram, les noms de villes, les prix et les chiffres.
- Les mots sans équivalent courant en darija restent en français (réservation, transport, agence).
- Tu reçois un tableau JSON de textes. Tu réponds UNIQUEMENT par un tableau JSON
  de la même longueur, dans le même ordre, sans commentaire ni balise de code.`;

async function appelerGemini(textes, cle, rappel = "") {
  const reponse = await fetch(`${URL}?key=${cle}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CONSIGNE + rappel }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(textes) }] }],
      generationConfig: {
        // Temperature basse: on veut la meme graphie d'un appel a l'autre.
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    throw new Error(`Gemini a repondu ${reponse.status}: ${detail.slice(0, 200)}`);
  }

  const data = await reponse.json();
  const brut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!brut) throw new Error("Gemini n'a rien renvoye");

  const traduits = JSON.parse(brut);
  if (!Array.isArray(traduits) || traduits.length !== textes.length) {
    throw new Error(`Gemini a renvoye ${traduits?.length} textes au lieu de ${textes.length}`);
  }

  return traduits.map((t, i) => (typeof t === "string" && t.trim() ? t : textes[i]));
}

// Gros lots volontairement: chaque appel compte dans le quota gratuit. A 40
// textes il fallait 7 appels par traduction, multiplies par les processus
// paralleles du build, ce qui epuisait le quota en une seule generation.
const LOT = 120;

// La consigne interdit l'alphabet arabe, mais le modele y retombe au milieu
// d'une phrase par ailleurs correcte: "makhassek tوجدi walo", "nمرة dyal
// telephone". Illisible pour une lectrice qui lit de gauche a droite. Ces
// textes-la sont redemandes une fois, avec la regle rappelee en dernier.
const ARABE = /[؀-ۿ]/;

const RAPPEL = `

Ces textes ont deja ete traduits une fois, avec des lettres arabes glissees au
milieu. Refais-les en lettres latines uniquement.`;

async function traduireTout(textes, cle) {
  const sortie = [];
  for (let i = 0; i < textes.length; i += LOT) {
    sortie.push(...(await appelerGemini(textes.slice(i, i + LOT), cle)));
  }

  const aRefaire = sortie.flatMap((texte, i) => (ARABE.test(texte) ? [i] : []));
  if (!aRefaire.length) return sortie;

  // Le premier jet est deja utilisable: une reprise ratee ne doit pas faire
  // tomber toute la page en francais. On garde alors la version d'origine,
  // quelques lettres arabes etant moins genantes qu'une page non traduite.
  try {
    const reprises = await appelerGemini(
      aRefaire.map((i) => textes[i]),
      cle,
      RAPPEL
    );
    aRefaire.forEach((indice, rang) => {
      sortie[indice] = reprises[rang];
    });
  } catch (error) {
    console.error("Reprise darija sans lettres arabes echouee:", error.message);
  }

  return sortie;
}

// Meme principe de cache que pour l'anglais: une empreinte du texte source.
// Tant que rien ne change dans le Studio, aucun appel a Gemini.
// Pendant un build, plusieurs pages darija sont generees en meme temps dans le
// meme processus et demandaient chacune leur traduction. On memorise la promesse
// en cours: les appels simultanes partagent alors un seul aller-retour.
const enCours = new Map();

export function traduireDarija(textes) {
  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return null;

  const empreinte = crypto.createHash("sha1").update(textes.join(" ")).digest("hex");
  if (enCours.has(empreinte)) return enCours.get(empreinte);

  const promesse = unstable_cache(
    async () => traduireTout(textes, cle),
    ["gemini-fr-dr", empreinte],
    { revalidate: 60 * 60 * 24 * 30, tags: ["traductions"] }
  )().finally(() => enCours.delete(empreinte));

  enCours.set(empreinte, promesse);
  return promesse;
}
