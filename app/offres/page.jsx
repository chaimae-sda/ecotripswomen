import { getSiteContent } from "../../lib/content";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";
import OffersBrowser from "./offers-browser";

export const revalidate = 60;

export const metadata = {
  title: "Toutes les offres | EcoTrips Women",
  description:
    "Tous les voyages 100% femmes d'EcoTrips Women, filtrables par ville de départ, prix, date, durée et destination.",
};

export default async function AllOffersPage() {
  const { settings, offers } = await getSiteContent();
  const heading = settings.allOffersTitle;

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

        <OffersBrowser offers={offers} phone={settings.phone} labels={settings.labels} />
      </main>

      <SiteFooter settings={settings} base="/" />
    </>
  );
}
