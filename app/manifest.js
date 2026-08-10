// Fiche d'identite de l'application: c'est ce fichier qui permet aux
// navigateurs de proposer « Installer » sur ordinateur et « Ajouter a l'ecran
// d'accueil » sur telephone.
export default function manifest() {
  return {
    name: "EcoTrips Women — Voyages 100% femmes au Maroc",
    short_name: "EcoTrips Women",
    description:
      "Voyages organisés 100% femmes au Maroc : prochains départs, programmes et réservation.",
    start_url: "/",
    scope: "/",
    // "standalone": une fois installee, l'appli s'ouvre sans barre d'adresse.
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#e51f79",
    lang: "fr",
    dir: "ltr",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android recadre l'icone en cercle ou en goutte: la version "maskable"
      // garde une marge pour que le logo ne soit pas rogne.
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Toutes les offres",
        short_name: "Offres",
        url: "/offres",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
