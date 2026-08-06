import "./globals.css";

export const metadata = {
  title: "EcoTrips Women | Voyages femmes au Maroc",
  description:
    "EcoTrips Women organise des voyages 100% femmes au Maroc: mer, camping, randonnee, piscine et escapades entre voyageuses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
