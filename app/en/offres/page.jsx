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

const TITLE = "Women-only organised trips in Morocco | EcoTrips Women";
const DESCRIPTION =
  "All our women-only organised trips in Morocco: sea, desert, hiking and camping, " +
  "departing from Tanger, Tétouan, Rabat and Salé. Filter by city, price, date, duration or destination.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/en/offres",
    languages: { fr: `${siteUrl}/offres`, en: `${siteUrl}/en/offres`, "x-default": `${siteUrl}/offres` },
  },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/en/offres", locale: "en_GB" },
};

export default async function AllOffersPageEn() {
  const { settings, offers, ui } = await getSiteContent("en");
  const heading = settings.allOffersTitle;
  const cities = buildCityIndex(offers);

  return (
    <>
      <HtmlLang lang="en" />
      <SiteHeader settings={settings} base="/en/" />

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
                  <Link href={`/en/voyages/${city.slug}`}>{format(ui.voyageOrganiseA, { ville: city.name })}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>

      <SiteFooter settings={settings} base="/en/" />
    </>
  );
}
