// Premiere ebauche de darija, pour le script de remplissage du Studio.
//
// Le site ne passe plus jamais par ici: il lit la fiche "Textes en darija" de
// Sanity. Ce module ne sert qu'a `npm run darija:seed`, qui propose une
// traduction des phrases nouvelles pour qu'il y ait quelque chose a relire
// plutot qu'une page blanche. Ce qui est ecrit dans le Studio ensuite ne
// repasse jamais par une machine.
//
// DeepL ne connait pas la darija: aucune de ses 110 langues cibles ne la
// couvre. On passe donc par Gemini, un modele de langue, seul capable de
// produire du marocain ecrit en lettres latines.
// Le modele se choisit par la variable GEMINI_MODELE_DARIJA, pour pouvoir en
// essayer un autre sans toucher au code. Par defaut gemini-3.5-flash: c'est le
// meilleur rapport qualite/quota gratuit mesure sur des phrases du site.
const MODELE_PAR_DEFAUT = process.env.GEMINI_MODELE_DARIJA || "gemini-3.5-flash";
const urlDe = (modele) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`;

// Sans regle imposee, un modele ecrit "7it" puis "hit" dans la meme page. La
// convention est donc fixee explicitement, et rappelee a chaque appel.
const CONSIGNE = `Tu traduis du français vers la darija marocaine ÉCRITE EN LETTRES LATINES
(arabizi), le style utilisé sur WhatsApp au Maroc.

Règles strictes :
- Chiffres pour les lettres arabes : 7 pour ح, 3 pour ع, 9 pour ق, 5 ou kh pour خ. Sois constant.
- Jamais d'alphabet arabe. Jamais de français littéral.
- Ton naturel et familier, comme une Marocaine qui parle à une amie.
- Garde tels quels : EcoTrips Women, "She can travel", WhatsApp, Instagram, les noms de villes, les prix et les chiffres.
- Les mots sans équivalent courant en darija restent en français (réservation, transport, agence).
- Tu reçois un tableau JSON de textes. Tu réponds UNIQUEMENT par un tableau JSON
  de la même longueur, dans le même ordre, sans commentaire ni balise de code.`;

async function appelerGemini(textes, cle, { modele = MODELE_PAR_DEFAUT, rappel = "" } = {}) {
  const reponse = await fetch(`${urlDe(modele)}?key=${cle}`, {
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
    throw new Error(`${modele} a repondu ${reponse.status}: ${detail.slice(0, 200)}`);
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

// Gros lots volontairement: chaque appel compte dans le quota gratuit.
const LOT = 120;

// La consigne interdit l'alphabet arabe, mais le modele y retombe au milieu
// d'une phrase par ailleurs correcte: "makhassek tوجدi walo", "nمرة dyal
// telephone". Illisible pour une lectrice qui lit de gauche a droite. Ces
// textes-la sont redemandes une fois, avec la regle rappelee en dernier.
const ARABE = /[؀-ۿ]/;

const RAPPEL = `

Ces textes ont deja ete traduits une fois, avec des lettres arabes glissees au
milieu. Refais-les en lettres latines uniquement.`;

export async function traduireDarija(textes, cle, { modele = MODELE_PAR_DEFAUT } = {}) {
  const sortie = [];
  for (let i = 0; i < textes.length; i += LOT) {
    sortie.push(...(await appelerGemini(textes.slice(i, i + LOT), cle, { modele })));
  }

  const aRefaire = sortie.flatMap((texte, i) => (ARABE.test(texte) ? [i] : []));
  if (!aRefaire.length) return sortie;

  // Le premier jet est deja relisable: une reprise ratee ne doit pas faire
  // echouer tout le remplissage.
  try {
    const reprises = await appelerGemini(
      aRefaire.map((i) => textes[i]),
      cle,
      { modele, rappel: RAPPEL }
    );
    aRefaire.forEach((indice, rang) => {
      sortie[indice] = reprises[rang];
    });
  } catch (error) {
    console.error("Reprise darija sans lettres arabes echouee:", error.message);
  }

  return sortie;
}
