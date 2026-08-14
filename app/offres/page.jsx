import Link from "next/link";

import { buildCityIndex } from "../../lib/cities";
import { getSiteContent } from "../../lib/content";
import { siteUrl } from "../../lib/site";
import { format } from "../../lib/ui";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";
import OffersBrowser from "./offers-browser";

export const revalidate = 60;

const TITLE = "Voyages organisés 100% femmes au Maroc | EcoTrips Women";
const DESCRIPTION =
  "Tous les voyages organisés entre femmes au Maroc : mer, désert, randonnée et camping, " +
  "au départ de Tanger, Tétouan, Rabat et Salé. Filtre par ville, prix, date, durée et destination.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/offres",
    languages: {
      fr: `${siteUrl}/offres`,
      en: `${siteUrl}/en/offres`,
      "x-default": `${siteUrl}/offres`,
    },
  },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/offres" },
};

export default async function AllOffersPage() {
  const { settings, offers, ui } = await getSiteContent();
  const heading = settings.allOffersTitle;
  const cities = buildCityIndex(offers);

  return (
    <>
      <SiteHeader settings={settings} base="/" />

      <main className="section all-offers">
        <div className="section-title centered">
          {heading?.eyebrow ? <p className="eyebrow">{heading.eyebrow}</p> : null}
          <h1>
            {heading?.title} {heading?.highlight ? <span>{heading.highlight}</span> : null}
          </h1>
          {heading?.text ? <p>{heading.text}</p> : null}
        </div>

        <OffersBrowser
          offers={offers}
          phone={settings.phone}
          labels={settings.labels}
          guarantees={settings.guarantees}
          ui={ui}
        />

        {/* Chemin d'acces vers les pages par ville, pour les visiteuses comme
            pour Google. */}
        {cities.length > 0 && (
          <nav className="city-links" aria-label={ui.villesParVille}>
            <h2>{ui.villesParVille}</h2>
            <ul>
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/voyages/${city.slug}`}>
                    {format(ui.voyageOrganiseA, { ville: city.name })}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>

      <SiteFooter settings={settings} base="/" />
    </>
  );
}
