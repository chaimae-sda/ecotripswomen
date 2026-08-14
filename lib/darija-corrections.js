// Corrections darija relues a la main.
//
// Le darija du site est produit par Gemini (lib/translate-darija.js). Sur les
// phrases courtes et les titres, la machine se trompe de registre: elle rend
// "Comment ca marche" par "Kifach kaykon lhal", ou "Plus d'infos" par "Aktar
// l'info". Les textes listes ici ne partent donc jamais chez Gemini: la version
// relue est posee telle quelle.
//
// La cle est le texte francais exact tel qu'il est saisi dans le Studio. Si une
// phrase est modifiee dans Sanity, sa cle ne correspond plus et le texte repart
// en traduction automatique: il faut alors mettre la cle a jour ici.
const CORRECTIONS = {
  // Onglet du navigateur. La machine rend "au Maroc" par "f Morocco".
  "Agence de voyage 100% femmes au Maroc | EcoTrips Women":
    "Agence dyal voyajate 100% dyal lbnat f Lmaghrib | EcoTrips Women",
  "EcoTrips Women est une agence de voyage féminine au Maroc : voyages organisés 100% femmes, en petits groupes, au départ de Tanger, Tétouan, Rabat et Salé. Transport, hébergement et accompagnement inclus.":
    "EcoTrips Women hiya agence dyal voyajate dyal lbnat f Lmaghrib : voyajate mounadamin 100% dyal lbnat, f groupes sghar, mn Tanger, Tétouan, Rabat w Salé. M3ahom lbus, l'hébergement ou l'accompagnement.",

  // Banniere d'accueil
  "Agence de voyages organisés 100% femmes au Maroc":
    "Agence dyal voyajate mounadamin 100% dyal lbnat f Lmaghrib",
  "Voyages 100% femmes au Maroc, organisés avec transport, activités et accompagnement.":
    "Voyajate mounadamin 100% dyal lbnat f Lmaghrib : m3ahom lbus, les activités ou l'accompagnement.",
  "Réserver sur WhatsApp": "Reservi 3la WhatsApp",

  // Les quatre promesses
  "Transport inclus": "M3ahom lbus",
  "Nature et mer": "Tabi3a ou lb7ar",
  "Réservation directe par WhatsApp avec l'équipe EcoTrips.":
    "Réservation directe 3la WhatsApp m3a l'équipe EcoTrips.",

  // Comment ca marche. Les titres de section sont recolles avant traduction
  // ("Comment ça" + "marche"), la cle est donc le titre entier.
  "Simple et rassurant": "Sahl w mtme2n",
  "Comment ça marche": "Kifach treservi",
  "Tu choisis ton voyage, EcoTrips Women gère les détails essentiels.":
    "Katkhtari voyajek, EcoTrips Women katklf bga3 les détails.",

  // Les quatre etapes
  "Choisis ton voyage": "Khtari voyajek",
  "Réserve sur WhatsApp": "Reservi 3la WhatsApp",
  "Voyage accompagnée": "Safri m3ana",
  "Transport touristique, activités et groupe féminin.":
    "Transport touristique, les activités w groupe fih ghir lbnat.",
  "Photos, vidéos, souvenirs et nouvelles amitiés.":
    "Tsawer, vidéos, dikrayat w sadiqat jdad.",

  // Chiffres cles
  "Offres actives": "Offres mtoufrin",
  "Ambiances de voyage": "Dial ajwa2 dial safar",

  // Boutons
  "Plus d'infos": "Tafasil",
  "Voir toutes les offres": "Chouf ga3 les offres",

  // Page toutes les offres
  "Tous nos voyages organisés 100% femmes au Maroc. Filtre par ville de départ, prix, mois, durée ou destination.":
    "Ga3 voyajate mounadamin dyalna 100% dyal lbnat f Lmaghrib. Filtri 7sab lmdina dyal lkhrouj, taman, chhar, mudda wla lblasa.",

  // Questions frequentes
  "Comment se passe un voyage organisé entre femmes au Maroc ?":
    "Kifach kaydouz voyage mounadam bin lbnat f Lmaghrib?",
  "Qu'est-ce qui est compris dans le prix d'un voyage femme au Maroc ?":
    "Chno li dakhl f taman dyal voyage bnt f Lmaghrib?",
  // Question et reponse ou la machine s'obstine: elle rendait "bوhdi" en
  // lettres arabes, et "reserver" par "nreservation".
  "Peut-on réserver seule ?": "Wach momkin n7jez b wa7di?",
  "Oui, et c'est très courant. Tu réserves ta place seule et tu rejoins le groupe de voyageuses au départ. Tu peux aussi réserver pour plusieurs personnes : le formulaire demande alors le prénom et le nom de chaque participante.":
    "Ah, w hadchi 3adi bzaf. Katreservi blastek b wa7dek w katltaqi m3a lgroupe dyal lbnat nhar dyal lkhrouj. Momkin tan treservi l bzaf dyal nas : lformulaire ghadi ysewlek 3la smiya w knya dyal kol wa7da.",
  "Comment réserver une place ?": "Kifach treservi blasa?",

  // Avis, galerie, communaute
  "Ce que racontent les femmes qui sont déjà parties avec EcoTrips Women.":
    "Dakchi li kay3aoudou lbnat li sforo mn qbl m3a EcoTrips Women.",
  "Photos et vidéos prises pendant nos sorties. Clique pour agrandir.":
    "Taswira w vidéos dial les voyages dyalna. Kliki bach tkbr.",
  "Rejoins-nous sur Instagram": "Followina 3la Instagram",

  // Contact
  "EcoTrips peut t'emmener loin": "EcoTrips momkin tddik b3id",
  "Pour recevoir les prochaines sorties ou réserver une place, contacte directement l'équipe.":
    "Bach t3rfi lasfar jayin wlla treservi blasa, tasli directement m3a l'équipe.",

  // Pied de page: "on t'aide" + "à" en rose + "explorer le Maroc".
  // Le mot en rose fait un seul caractere en francais, trop court pour partir
  // en traduction: sans correction manuelle il resterait "à" au milieu du
  // darija.
  "on t'aide": "Kantsnaouk",
  à: "bach",
  "explorer le Maroc": "Nktchfo Lmaghrib",
};

// Le Studio produit parfois une apostrophe typographique la ou le contenu de
// secours en a une droite. Les deux doivent tomber sur la meme cle.
function normaliser(texte) {
  return texte.replace(/[’‘]/g, "'").trim();
}

const TABLE = new Map(Object.entries(CORRECTIONS).map(([fr, dr]) => [normaliser(fr), dr]));

// Les textes deja corriges: ils servent a les reconnaitre apres substitution
// pour ne pas les renvoyer chez Gemini.
export const TEXTES_CORRIGES = new Set(TABLE.values());

export function corrigerDarija(texte) {
  return TABLE.get(normaliser(texte)) ?? null;
}
