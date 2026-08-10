import { Inter, Playfair_Display } from "next/font/google";
import { siteUrl } from "../lib/site";
import "./globals.css";
import ScrollToTop from "./scroll-to-top";

// Polices auto-hebergees par Next: pas de requete vers Google Fonts au chargement.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata = {
  // Sans metadataBase, Next fabrique les liens de partage a partir de l'adresse
  // technique du deploiement (…vercel.app): les apercus Facebook et WhatsApp
  // pointeraient vers le mauvais domaine.
  metadataBase: new URL(siteUrl),
  title: "EcoTrips Women | Voyages femmes au Maroc",
  description:
    "EcoTrips Women organise des voyages 100% femmes au Maroc: mer, camping, randonnée, piscine et escapades entre voyageuses.",
  alternates: { canonical: "/" },
  // Preuve de propriete pour Google Search Console. Ce code est public par
  // nature: il doit apparaitre dans le HTML de chaque page.
  verification: { google: "srcYg9HIasjV5yMvRgq4BmO81vfsEjlMiDV5ms06plE" },
  openGraph: {
    type: "website",
    siteName: "EcoTrips Women",
    locale: "fr_FR",
    url: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
