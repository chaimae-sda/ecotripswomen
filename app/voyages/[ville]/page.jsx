import Link from "next/link";
import { notFound } from "next/navigation";

import { buildCityIndex, cityHeading, cityIntro, findCity } from "../../../lib/cities";
import { getSiteContent } from "../../../lib/content";
import { siteUrl } from "../../../lib/site";
import SiteFooter from "../../site-footer";
import SiteHeader from "../../site-header";
import TripCard from "../../trip-card";

export const revalidate = 60;

// Une page par ville citee dans les offres. Une ville ajoutee dans le Studio
// obtient la sienne automatiquement.
export async function generateStaticParams() {
  const { offers } = await getSiteContent();
  return buildCityIndex(offers).map((city) => ({ ville: city.slug }));
}

export async function generateMetadata({ params }) {
  const { ville } = await params;
  const { offers } = await getSiteContent();
  const city = findCity(offers, ville);
  if (!city) return {};

  const title = `${cityHeading(city)} | EcoTrips Women`;
  const description = cityIntro(city);

  return {
    title,
    description,
    alternates: { canonical: `/voyages/${city.slug}` },
    openGraph: { title, description, url: `/voyages/${city.slug}` },
  };
}

export default async function CityPage({ params }) {
  const { ville } = await params;
  const { settings, offers } = await getSiteContent();
  const city = findCity(offers, ville);
  if (!city) notFound();

  const autres = buildCityIndex(offers).filter((item) => item.slug !== city.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: cityHeading(city),
            description: cityIntro(city),
            url: `${siteUrl}/voyages/${city.slug}`,
            about: { "@type": "Place", name: city.name },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: city.offers.map((offer, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: offer.title,
                url: `${siteUrl}/offres/${offer.slug}`,
              })),
            },
          }),
        }}
      />

      <SiteHeader settings={settings} base="/" />

      <main className="section all-offers">
        <div className="section-title centered">
          <p className="eyebrow">{city.name}</p>
          <h1>{cityHeading(city)}</h1>
          <p>{cityIntro(city)}</p>
        </div>

        <div className="trip-grid">
          {city.offers.map((offer) => (
            <TripCard
              key={offer.slug}
              offer={offer}
              phone={settings.phone}
              labels={settings.labels}
            />
          ))}
        </div>

        {/* Liens entre les villes: sans eux, ces pages resteraient isolees et
            Google ne les explorerait pas. */}
        {autres.length > 0 && (
          <nav className="city-links" aria-label="Autres villes">
            <h2>Voyages dans d&apos;autres villes</h2>
            <ul>
              {autres.map((item) => (
                <li key={item.slug}>
                  <Link href={`/voyages/${item.slug}`}>{item.name}</Link>
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
