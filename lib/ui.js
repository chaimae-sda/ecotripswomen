import { normaliser } from "./normaliser.js";

// Textes fixes de l'interface: noms des champs, calendrier, filtres, libelles
// d'accessibilite. Ils ne changent jamais depuis le Studio, ils sont donc
// traduits ici une bonne fois, avec une qualite superieure a une machine.
//
// Le contenu editorial (offres, questions frequentes, titres de sections) suit
// un autre chemin: il vient de Sanity et passe par DeepL, pour se mettre a jour
// tout seul quand il est modifie.
const FR = {
  langue: "fr",
  autreLangue: { code: "en", nom: "English", court: "EN" },
  nomLangue: "Français",
  courtLangue: "FR",
  choisirLangue: "Changer de langue",

  navPrincipale: "Navigation principale",
  navOffres: "Offres",
  navFonctionnement: "Fonctionnement",
  navVideos: "Vidéos",
  navAvis: "Avis",
  piedDePage: "Pied de page",
  ouvrirMenu: "Ouvrir le menu",
  reserver: "Réserver",
  contact: "Contact",
  contactMessage: "Bonjour EcoTrips Women, j'ai une question",

  // Formulaire de reservation
  reservation: "Réservation",
  prenom: "Prénom",
  nom: "Nom",
  villeDepart: "Ville de départ",
  taVille: "Ta ville",
  telephone: "Numéro de téléphone",
  telephoneInvalide: "Indique un numéro de téléphone valide",
  nombrePersonnes: "Nombre de personnes",
  dateDepart: "Date de départ souhaitée",
  choisirDate: "Choisir une date",
  dateManquante: "Choisis une date de départ.",
  envoiEnCours: "Envoi en cours…",
  fermer: "Fermer",
  accompagnanteUne: "La personne qui t'accompagne",
  accompagnantesPlusieurs: "Les {n} personnes qui t'accompagnent",
  prenomPersonne: "Prénom · personne {n}",
  nomPersonne: "Nom · personne {n}",

  // Message envoye sur WhatsApp
  messageDebut:
    "Bonjour, je suis {prenom} {nom} et je souhaite réserver pour le voyage {voyage} " +
    "au départ de {ville} le {date}",
  messagePersonnes: ", pour {n} personnes : {noms}",
  et: "et",

  // Calendrier
  jours: ["L", "M", "M", "J", "V", "S", "D"],
  mois: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
  moisPrecedent: "Mois précédent",
  moisSuivant: "Mois suivant",
  datesDisponibles: "Dates de départ disponibles",
  disponible: "Disponible",
  tonChoix: "Ton choix",
  selectionnee: "sélectionnée",

  // Page d'un voyage
  dates: "Dates",
  depart: "Départ",
  prix: "Prix",
  agrandir: "Agrandir",


  // Filtres
  filtreVille: "Ville de départ",
  filtreDestination: "Destination",
  filtrePrix: "Prix",
  filtreDate: "Date de départ",
  filtreDuree: "Durée",
  toutes: "Toutes",
  toutEffacer: "Tout effacer",
  resultatUn: "{n} voyage au total",
  resultatPlusieurs: "{n} voyages au total",
  resultatFiltreUn: "{n} voyage correspond à ta recherche",
  resultatFiltrePlusieurs: "{n} voyages correspondent à ta recherche",
  prixTranches: ["Moins de 500 DH", "500 à 999 DH", "1000 à 1499 DH", "1500 DH et plus"],
  durees: ["Journée", "2 jours", "3 jours", "4 jours et plus"],

  // Pages par ville
  villesAutres: "Voyages dans d'autres villes",
  villesParVille: "Voyages par ville",
  voyageA: "Voyage organisé à {ville}, 100% femmes",
  voyageDepuis: "Voyage organisé au départ de {ville}, 100% femmes",
  voyageOrganiseA: "Voyage organisé à {ville}",

  // Galerie
  galerie: "Galerie EcoTrips Women",
  mediaPrecedent: "Média précédent",
  mediaSuivant: "Média suivant",

  // Application
  installer: "Installer l'application",
  installerAideIOS: "Sur iPhone : touche le bouton Partager en bas de Safari, puis Sur l'écran d'accueil.",
};

const EN = {
  langue: "en",
  autreLangue: { code: "fr", nom: "Français", court: "FR" },
  nomLangue: "English",
  courtLangue: "EN",
  choisirLangue: "Change language",

  navPrincipale: "Main navigation",
  navOffres: "Trips",
  navFonctionnement: "How it works",
  navVideos: "Videos",
  navAvis: "Reviews",
  piedDePage: "Footer",
  ouvrirMenu: "Open menu",
  reserver: "Book",
  contact: "Contact",
  contactMessage: "Hello EcoTrips Women, I have a question",

  reservation: "Booking",
  prenom: "First name",
  nom: "Last name",
  villeDepart: "Departure city",
  taVille: "Your city",
  telephone: "Phone number",
  telephoneInvalide: "Please enter a valid phone number",
  nombrePersonnes: "Number of travellers",
  dateDepart: "Preferred departure date",
  choisirDate: "Choose a date",
  dateManquante: "Please choose a departure date.",
  envoiEnCours: "Sending…",
  fermer: "Close",
  accompagnanteUne: "The person travelling with you",
  accompagnantesPlusieurs: "The {n} people travelling with you",
  prenomPersonne: "First name · traveller {n}",
  nomPersonne: "Last name · traveller {n}",

  messageDebut:
    "Hello, my name is {prenom} {nom} and I would like to book the trip {voyage} " +
    "departing from {ville} on {date}",
  messagePersonnes: ", for {n} people: {noms}",
  et: "and",

  jours: ["M", "T", "W", "T", "F", "S", "S"],
  mois: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  moisPrecedent: "Previous month",
  moisSuivant: "Next month",
  datesDisponibles: "Available departure dates",
  disponible: "Available",
  tonChoix: "Your choice",
  selectionnee: "selected",

  dates: "Dates",
  depart: "Departure",
  prix: "Price",
  agrandir: "Enlarge",


  filtreVille: "Departure city",
  filtreDestination: "Destination",
  filtrePrix: "Price",
  filtreDate: "Departure date",
  filtreDuree: "Duration",
  toutes: "All",
  toutEffacer: "Clear all",
  resultatUn: "{n} trip in total",
  resultatPlusieurs: "{n} trips in total",
  resultatFiltreUn: "{n} trip matches your search",
  resultatFiltrePlusieurs: "{n} trips match your search",
  prixTranches: ["Under 500 DH", "500 to 999 DH", "1000 to 1499 DH", "1500 DH and above"],
  durees: ["Day trip", "2 days", "3 days", "4 days and more"],

  villesAutres: "Trips in other cities",
  villesParVille: "Trips by city",
  voyageA: "Women-only organised trip to {ville}",
  voyageDepuis: "Women-only organised trip departing from {ville}",
  voyageOrganiseA: "Organised trip to {ville}",

  galerie: "EcoTrips Women gallery",
  mediaPrecedent: "Previous media",
  mediaSuivant: "Next media",

  installer: "Install the app",
  installerAideIOS: "On iPhone: tap the Share button at the bottom of Safari, then Add to Home Screen.",
};

// Darija ecrite en lettres latines, convention WhatsApp: 7 pour ح, 3 pour ع,
// 9 pour ق. Ces libelles sont ecrits a la main et non traduits par une machine:
// sur des mots courts et familiers, une machine se trompe de registre.
const DR = {
  langue: 'dr',
  nomLangue: 'Darija',
  courtLangue: 'DR',
  choisirLangue: 'Bdel logha',

  navPrincipale: 'Menu',
  piedDePage: "Bas dyal la page",
  ouvrirMenu: '7ell menu',
  reserver: '7jez',
  contact: 'Contact',
  contactMessage: 'Salam EcoTrips Women, 3ndi so2al',

  reservation: '7jez',
  prenom: 'Smiya',
  nom: 'Knya',
  villeDepart: 'Mnin ghadi tkhrji',
  taVille: 'Mdinatek',
  telephone: 'Raqm dyal telephone',
  telephoneInvalide: 'Ktbi raqm dyal telephone s7i7',
  nombrePersonnes: 'Ch7al men wa7da',
  dateDepart: 'Nhar li bghiti temchi',
  choisirDate: 'Khtari nhar',
  dateManquante: "Khtari nhar dyal lkhrouj.",
  envoiEnCours: 'Kansiftou...',
  fermer: 'Sedd',
  accompagnanteUne: 'Li ghadya m3ak',
  accompagnantesPlusieurs: 'L {n} li ghadyin m3ak',
  prenomPersonne: 'Smiya · wa7da {n}',
  nomPersonne: 'Knya · wa7da {n}',

  messageDebut:
    'Salam, ana {prenom} {nom} w bghit n7jez f sfar {voyage} ' +
    'mn {ville} nhar {date}',
  messagePersonnes: ', l {n} dyal les personnes : {noms}',
  et: 'w',

  jours: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  mois: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
  moisPrecedent: 'Chhar li fat',
  moisSuivant: 'Chhar li jay',
  datesDisponibles: 'Nhar li kaynin',
  disponible: 'Kayn',
  tonChoix: 'Li khtariti',
  selectionnee: 'mkhtara',

  dates: 'Nhar',
  depart: 'Khrouj',
  prix: 'Taman',
  agrandir: 'Kbbar',


  filtreVille: 'Mnin ghadi tkhrji',
  filtreDestination: 'Fin ghadyin',
  filtrePrix: 'Taman',
  filtreDate: "Nhar dyal lkhrouj",
  filtreDuree: 'Ch7al dyal nhar',
  toutes: 'Kollchi',
  toutEffacer: 'M7i kollchi',
  resultatUn: '{n} sfar',
  resultatPlusieurs: '{n} dyal sfariyat',
  resultatFiltreUn: '{n} sfar li mnaseb',
  resultatFiltrePlusieurs: '{n} dyal sfariyat li mnasbin',
  prixTranches: ['9ell mn 500 DH', 'Mn 500 l 999 DH', 'Mn 1000 l 1499 DH', '1500 DH w kter'],
  durees: ['Nhar wa7ed', 'Jouj dyal iyam', '3 dyal iyam', '4 dyal iyam w kter'],

  villesAutres: 'Sfariyat f mdon khrin',
  villesParVille: "Sfariyat 7sab lmdina",
  voyageA: 'Sfar mnadem l {ville}, ghir l3ayalat',
  voyageDepuis: 'Sfar mnadem mn {ville}, ghir l3ayalat',
  voyageOrganiseA: 'Sfar mnadem l {ville}',

  galerie: 'Tsawer dyal EcoTrips Women',
  mediaPrecedent: 'Li 9bel',
  mediaSuivant: 'Li mn ba3d',

  navOffres: 'Sfariyat',
  navFonctionnement: 'Kifach khdam',
  navVideos: 'Videos',
  navAvis: 'Ara2',

  installer: "Rakkeb lapplication",
  installerAideIOS: "F iPhone: bdi mn bouton Partager t7t f Safari, mn ba3d Sur lécran daccueil.",
};

export const LANGUES = ["fr", "en", "dr"];

// Le dictionnaire ne contient que des donnees: une fonction ne peut pas
// traverser la frontiere entre composant serveur et composant client. Le
// remplacement se fait donc ici, a l'endroit ou le texte est affiche.
export function format(modele, valeurs) {
  return Object.entries(valeurs).reduce(
    (texte, [cle, valeur]) => texte.replaceAll(`{${cle}}`, valeur),
    modele
  );
}

// Ce qui n'est pas du texte affiche: codes et noms de langue.
const METADONNEES = new Set(["langue", "autreLangue", "nomLangue", "courtLangue"]);

// Les initiales des jours et les noms de mois restent en francais dans les
// trois langues, c'est le choix fait plus haut. Les rendre modifiables
// n'apporterait rien et casserait le calendrier au premier essai.
const CALENDRIER = new Set(["jours", "mois"]);

// Les libelles de l'interface qu'on peut corriger depuis le Studio, dans
// l'ordre de lecture, avec leur version dans la langue demandee.
//
// La cle est le texte francais, exactement comme pour le reste du site. Deux
// libelles qui disent la meme chose en francais ("Ville de départ" sert au
// formulaire et au filtre) ne font donc qu'une seule ligne: c'est voulu, une
// phrase francaise n'a qu'une traduction sur tout le site.
export function listerLibellesUI(lang = "dr") {
  const base = lang === "en" ? EN : lang === "dr" ? DR : FR;
  const vus = new Map();

  const ajouter = (fr, texte) => {
    if (typeof fr !== "string" || !fr.trim()) return;
    const c = normaliser(fr);
    if (!vus.has(c)) vus.set(c, { fr, texte: typeof texte === "string" ? texte : "" });
  };

  for (const [cle, valeur] of Object.entries(FR)) {
    if (METADONNEES.has(cle) || CALENDRIER.has(cle)) continue;

    if (typeof valeur === "string") ajouter(valeur, base[cle]);
    else if (Array.isArray(valeur)) valeur.forEach((v, i) => ajouter(v, base[cle]?.[i]));
  }

  return [...vus.values()];
}

// Le dictionnaire d'une langue, avec par-dessus les libelles corriges dans le
// Studio. `corrections` associe le texte francais normalise a sa traduction;
// il vient de la fiche "Textes en darija" ou "Textes en anglais".
export function getUI(lang, corrections) {
  const base = lang === "en" ? EN : lang === "dr" ? DR : FR;
  if (lang === "fr" || !corrections?.size) return base;

  const sortie = { ...base };

  for (const [cle, valeur] of Object.entries(FR)) {
    if (METADONNEES.has(cle) || CALENDRIER.has(cle)) continue;

    if (typeof valeur === "string") {
      const corrige = corrections.get(normaliser(valeur));
      if (corrige) sortie[cle] = corrige;
      continue;
    }

    if (Array.isArray(valeur)) {
      // On ne recopie la liste que si au moins une case bouge: sinon on garde
      // la reference d'origine, et rien n'est reconstruit pour rien.
      let liste = null;
      valeur.forEach((v, i) => {
        if (typeof v !== "string") return;
        const corrige = corrections.get(normaliser(v));
        if (!corrige) return;
        liste = liste || [...(base[cle] || valeur)];
        liste[i] = corrige;
      });
      if (liste) sortie[cle] = liste;
    }
  }

  return sortie;
}

// Prefixe des adresses: le francais reste a la racine, les autres langues
// vivent sous leur code (/en, /dr).
export function prefixe(lang) {
  return lang === "fr" ? "" : `/${lang}`;
}
