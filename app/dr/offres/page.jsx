import Link from "next/link";

import { buildCityIndex } from "../../../lib/cities";
import { format } from "../../../lib/ui";
import { getSiteContent } from "../../../lib/content";
import { siteUrl } from "../../../lib/site";
import SiteFooter from "../../site-footer";
import SiteHeader from "../../site-header";
import OffersBrowser from "../../offres/offers-browser";
import HtmlLang from "../../html-lang";

export const revalidate = 60;

const TITLE = "Voyajate mounadamin 100% dyal lbnat f Lmaghrib | EcoTrips Women";
const DESCRIPTION =
  "Ga3 voyajate mounadamin dyalna f Lmaghrib: lb7ar, sahra, randonnée w camping, " +
  "mn Tanger, Tétouan, Rabat w Salé. Filtri 7sab lmdina, taman, nhar, mudda wla lblasa.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
    // La darija latine n a pas de code de langue reconnu par Google: la declarer
    // brouillerait la lecture des versions francaise et anglaise. Ces pages sont
    // faites pour les visiteuses, pas pour le referencement.
    robots: { index: false, follow: true },

  alternates: {
    canonical: "/dr/offres",
  },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/dr/offres", locale: "ar_MA" },
};

export default async function AllOffersPageEn() {
  const { settings, offers, ui } = await getSiteContent("dr");
  const heading = settings.allOffersTitle;
  const cities = buildCityIndex(offers);

  return (
    <>
      <HtmlLang lang="dr" />
      <SiteHeader settings={settings} base="/dr/" />

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

        {cities.length > 0 && (
          <nav className="city-links" aria-label={ui.villesParVille}>
            <h2>{ui.villesParVille}</h2>
            <ul>
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/dr/voyages/${city.slug}`}>{format(ui.voyageOrganiseA, { ville: city.name })}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>

      <SiteFooter settings={settings} base="/dr/" />
    </>
  );
}
