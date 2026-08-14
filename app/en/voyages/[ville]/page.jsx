import Link from "next/link";
import { notFound } from "next/navigation";

import { buildCityIndex, cityHeading, cityIntro, findCity } from "../../../../lib/cities";
import { getSiteContent } from "../../../../lib/content";
import { siteUrl } from "../../../../lib/site";
import SiteFooter from "../../../site-footer";
import SiteHeader from "../../../site-header";
import TripCard from "../../../trip-card";
import HtmlLang from "../../../html-lang";

export const revalidate = 60;

export async function generateStaticParams() {
  const { offers } = await getSiteContent("en");
  return buildCityIndex(offers).map((city) => ({ ville: city.slug }));
}

export async function generateMetadata({ params }) {
  const { ville } = await params;
  const { offers, ui } = await getSiteContent("en");
  const city = findCity(offers, ville);
  if (!city) return {};

  const title = `${cityHeading(city, ui)} | EcoTrips Women`;
  const description = cityIntro(city, ui);

  return {
    title,
    description,
    alternates: {
      canonical: `/en/voyages/${city.slug}`,
      languages: {
        fr: `${siteUrl}/voyages/${city.slug}`,
        en: `${siteUrl}/en/voyages/${city.slug}`,
        "x-default": `${siteUrl}/voyages/${city.slug}`,
      },
    },
    openGraph: { title, description, url: `/en/voyages/${city.slug}`, locale: "en_GB" },
  };
}

export default async function CityPageEn({ params }) {
  const { ville } = await params;
  const { settings, offers, ui } = await getSiteContent("en");
  const city = findCity(offers, ville);
  if (!city) notFound();

  const autres = buildCityIndex(offers).filter((item) => item.slug !== city.slug);

  return (
    <>
      <HtmlLang lang="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: cityHeading(city, ui),
            description: cityIntro(city, ui),
            url: `${siteUrl}/en/voyages/${city.slug}`,
            about: { "@type": "Place", name: city.name },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: city.offers.map((offer, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: offer.title,
                url: `${siteUrl}/en/offres/${offer.slug}`,
              })),
            },
          }),
        }}
      />

      <SiteHeader settings={settings} base="/en/" />

      <main className="section all-offers">
        <div className="section-title centered">
          <p className="eyebrow">{city.name}</p>
          <h1>{cityHeading(city, ui)}</h1>
          <p>{cityIntro(city, ui)}</p>
        </div>

        <div className="trip-grid">
          {city.offers.map((offer) => (
            <TripCard
              key={offer.slug}
              offer={offer}
              phone={settings.phone}
              labels={settings.labels}
              guarantees={settings.guarantees}
              ui={ui}
            />
          ))}
        </div>

        {autres.length > 0 && (
          <nav className="city-links" aria-label={ui.villesAutres}>
            <h2>{ui.villesAutres}</h2>
            <ul>
              {autres.map((item) => (
                <li key={item.slug}>
                  <Link href={`/en/voyages/${item.slug}`}>{item.name}</Link>
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
