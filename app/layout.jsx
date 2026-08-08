import { Inter, Playfair_Display } from "next/font/google";
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
  title: "EcoTrips Women | Voyages femmes au Maroc",
  description:
    "EcoTrips Women organise des voyages 100% femmes au Maroc: mer, camping, randonnée, piscine et escapades entre voyageuses.",
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
