// Le contenu du site est un objet imbrique: reglages, voyages, galerie. Ce
// module sait en extraire les textes, y reposer des traductions, et recoller
// les deux endroits ou une phrase est coupee en deux champs pour la mise en
// forme (titres de section, pied de page).
//
// Rien ici ne depend de Next: le script `npm run darija:seed` s'en sert aussi
// pour lister les textes a traduire, avec exactement le meme decoupage que le
// site. Sans ca, les cles ecrites dans le Studio ne correspondraient pas a
// celles que le site cherche.

// Champs a ne jamais traduire: adresses, couleurs, dimensions, identifiants.
export const IGNORER = new Set([
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
  // qu'elles n'ont pas ecrit. Ils restent dans leur langue d'origine.
  "reviews",
  // "vendredi 14 août 2026" est refabrique depuis la date brute pour chaque
  // langue, apres traduction: le libelle collecte ici serait jete. Seul cas
  // perdu, une offre sans date reelle ("Chaque dimanche"): son libelle de
  // calendrier reste alors en francais.
  "departureDates",
]);

export function estTraduisible(texte) {
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
export function collecter(valeur, chemin = [], sortie = []) {
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
export function appliquer(source, entrees, traductions) {
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

// Repose une version de chaque texte, phrase par phrase. `remplacer` recoit le
// texte francais et rend celui a afficher; rendre le meme texte le laisse tel
// quel.
export function remplacerTextes(valeur, remplacer) {
  if (typeof valeur === "string") return estTraduisible(valeur) ? remplacer(valeur) : valeur;
  if (Array.isArray(valeur)) return valeur.map((v) => remplacerTextes(v, remplacer));
  if (!valeur || typeof valeur !== "object") return valeur;

  return Object.fromEntries(
    Object.entries(valeur).map(([cle, v]) => [
      cle,
      IGNORER.has(cle) ? v : remplacerTextes(v, remplacer),
    ])
  );
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

// Le pied de page est decoupe comme un titre de section, mais sur trois champs
// plats: "on t'aide" + "à" en rose + "explorer le Maroc". Envoye seul, le mot
// rose ne fait qu'un caractere, trop court meme pour partir en traduction:
// l'anglais affichait "We'll help you à explore Morocco". Recolle a la ligne
// qui le precede, il revient en "We'll help you to".
function recollerPied(settings) {
  return {
    ...settings,
    footerLine1: `${settings.footerLine1} ${settings.footerHighlight}`.trim(),
    footerHighlight: "",
  };
}

function recouperPied(settings) {
  const mots = settings.footerLine1.trim().split(/\s+/);
  if (mots.length < 2) return settings;

  const dernier = mots.pop();
  return { ...settings, footerLine1: mots.join(" "), footerHighlight: dernier };
}

// Met le contenu dans l'etat ou les phrases sont entieres, pret a traduire.
// `piedRecolle` doit etre rendu a `finaliser`: le mot rose du pied de page
// n'est recoupe qu'a la condition d'avoir ete recolle, sinon un pied laisse
// volontairement sans mot rose dans le Studio en gagnerait un.
export function preparerSource(content) {
  const piedRecolle = Boolean(content.settings?.footerHighlight?.trim());
  const avecPied = piedRecolle
    ? { ...content, settings: recollerPied(content.settings) }
    : content;

  return { source: recollerTitres(avecPied), piedRecolle };
}

export function finaliser(valeur, piedRecolle) {
  const sortie = recouperTitres(valeur);
  return piedRecolle ? { ...sortie, settings: recouperPied(sortie.settings) } : sortie;
}

// La liste des phrases du site, sans doublon et dans l'ordre de lecture. Sert
// au script de remplissage: c'est exactement ce que le Studio doit proposer a
// la traduction.
export function listerTextes(content) {
  const { source } = preparerSource(content);
  return [...new Set(collecter(source).map((entree) => entree.texte))];
}

// Les onglets des fiches de traduction du Studio. Une liste de 181 phrases
// d'un seul tenant est illisible: on la coupe la ou la cliente coupe le site.
// L'ordre compte, c'est celui des onglets.
export const SECTIONS = [
  { name: "accueil", title: "Accueil" },
  { name: "voyages", title: "Voyages" },
  { name: "faq", title: "Questions fréquentes" },
  { name: "galerie", title: "Galerie" },
  { name: "titres", title: "Titres des sections" },
  { name: "libelles", title: "Boutons et libellés" },
];

// A quel onglet appartient une phrase, d'apres l'endroit d'ou elle a ete lue.
// `chemin` est celui rendu par `collecter`: ["settings", "hero", "title"],
// ["offers", 0, "program", 1, "title"]...
function sectionDe(chemin) {
  const [racine, champ] = chemin;

  if (racine === "offers") return "voyages";
  if (racine === "gallery") return "galerie";
  if (racine !== "settings") return "libelles";

  if (champ === "faq" || champ === "faqTitle") return "faq";
  if (["hero", "promises", "steps", "stats", "howTitle"].includes(champ)) return "accueil";
  if (champ.endsWith("Title") || champ.startsWith("footer")) return "titres";

  // labels, guarantees, seo: tout ce qui est bouton, promesse ou onglet du
  // navigateur.
  return "libelles";
}

// Les phrases du site avec leur onglet, sans doublon et dans l'ordre de
// lecture. Une phrase qui apparait a deux endroits garde le premier.
export function listerTextesParSection(content) {
  const { source } = preparerSource(content);
  const vus = new Map();

  for (const { chemin, texte } of collecter(source)) {
    if (!vus.has(texte)) vus.set(texte, sectionDe(chemin));
  }

  return [...vus].map(([texte, section]) => ({ texte, section }));
}
