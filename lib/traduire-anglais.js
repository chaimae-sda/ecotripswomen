// Traduction francais -> anglais, avec deux moteurs.
//
// DeepL d'abord: c'est le meilleur sur du francais editorial, et c'est le
// choix d'origine du site. Son palier gratuit s'arrete net a 500 000
// caracteres par mois, sans prevenir, et la page anglaise repasse alors en
// francais. Gemini prend le relais dans ce cas: la qualite baisse un peu, le
// site reste en anglais.
//
// Rien ici ne depend de Next: `pnpm run en:translate` s'en sert aussi.
const DEEPL_FREE = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO = "https://api.deepl.com/v2/translate";

// DeepL accepte jusqu'a 50 textes par appel.
const LOT_DEEPL = 50;

// Remet la marque telle qu'elle s'ecrit: les moteurs la coupent parfois en deux.
export function corrigerMarque(texte) {
  return texte
    .replace(/Eco\s?Trips\s?Women/gi, "EcoTrips Women")
    .replace(/What'?s\s?App/gi, "WhatsApp");
}

async function appelerDeepL(textes, cle) {
  // La cle gratuite se termine par ":fx" et utilise un autre domaine.
  const url = cle.endsWith(":fx") ? DEEPL_FREE : DEEPL_PRO;
  const resultats = [];

  for (let i = 0; i < textes.length; i += LOT_DEEPL) {
    const lot = textes.slice(i, i + LOT_DEEPL);

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

// Meme modele que la darija: quota gratuit utilisable et version figee, pour
// que deux passages a un mois d'intervalle ne changent pas de formulation.
const MODELE = "gemini-3.5-flash-lite";
const URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent`;

const CONSIGNE = `Tu traduis du français vers l'anglais britannique, pour le site
d'une agence de voyages marocaine qui organise des séjours 100% femmes.

Règles strictes :
- Ton chaleureux et direct, comme le français d'origine. Le site tutoie sa
  lectrice : rends-le par un "you" naturel, jamais guindé.
- Garde tels quels : EcoTrips Women, "She can travel", WhatsApp, Instagram,
  les noms de villes et de lieux marocains, les prix et les chiffres.
- "DHS" et "DH" restent tels quels, ce sont les dirhams marocains.
- Ne traduis pas les noms propres de plages, de montagnes ou de quartiers.
- Ne rajoute rien, ne commente pas, ne développe pas : même longueur environ.
- Tu reçois un tableau JSON de textes. Tu réponds UNIQUEMENT par un tableau JSON
  de la même longueur, dans le même ordre, sans commentaire ni balise de code.`;

// Gros lots: chaque appel compte dans le quota gratuit de requetes.
const LOT_GEMINI = 120;

async function appelerGemini(textes, cle) {
  const reponse = await fetch(`${URL_GEMINI}?key=${cle}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CONSIGNE }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(textes) }] }],
      generationConfig: {
        // Temperature basse: on veut la meme phrase d'un appel a l'autre.
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

  // Une case vide laisserait un trou dans la page: on garde le francais.
  return traduits.map((t, i) => (typeof t === "string" && t.trim() ? t : textes[i]));
}

async function parGemini(textes, cle) {
  const sortie = [];
  for (let i = 0; i < textes.length; i += LOT_GEMINI) {
    sortie.push(...(await appelerGemini(textes.slice(i, i + LOT_GEMINI), cle)));
  }
  return sortie;
}

// Renvoie { traductions, moteur }. Leve une erreur seulement si les deux
// moteurs echouent: l'appelant decide alors quoi afficher.
export async function traduireAnglais(textes, { deepl, gemini } = {}) {
  if (!textes.length) return { traductions: [], moteur: null };

  const erreurs = [];

  if (deepl) {
    try {
      return { traductions: (await appelerDeepL(textes, deepl)).map(corrigerMarque), moteur: "DeepL" };
    } catch (error) {
      erreurs.push(error.message);
    }
  }

  if (gemini) {
    try {
      return { traductions: (await parGemini(textes, gemini)).map(corrigerMarque), moteur: "Gemini" };
    } catch (error) {
      erreurs.push(error.message);
    }
  }

  throw new Error(erreurs.join(" | ") || "aucune cle de traduction configuree");
}
