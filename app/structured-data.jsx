import { siteUrl } from "../lib/site";

// Donnees structurees: le petit bloc invisible qui explique a Google ce qu'est
// EcoTrips Women (une agence de voyage, au Maroc, pour les femmes) plutot que
// de le laisser deviner a partir du texte.
//
// Volontairement absent: la note moyenne et les avis. Les regles de Google
// interdisent de baliser des avis qu'on affiche soi-meme sur son propre site;
// le faire expose a une penalite plutot qu'a des etoiles dans les resultats.
function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function AgencyJsonLd({ settings }) {
  const sameAs = [settings.instagramUrl, settings.googleReviewsUrl].filter(Boolean);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "@id": `${siteUrl}/#agence`,
        name: "EcoTrips Women",
        // Les differentes facons d'ecrire le nom: c'est ce qui permet a Google
        // de relier "ecotripswomen" ou "trips women morocco" a cette agence.
        alternateName: [
          "EcoTripsWomen",
          "Eco Trips Women",
          "Ecotrips Women Maroc",
          "EcoTrips Women Morocco",
          "Trips Women Morocco",
        ],
        description: settings.seo.metaDescription,
        url: siteUrl,
        logo: settings.logo?.url,
        image: settings.hero?.photo?.url || settings.logo?.url,
        telephone: settings.phone,
        priceRange: "399 - 1300 MAD",
        areaServed: { "@type": "Country", name: "Maroc" },
        address: { "@type": "PostalAddress", addressCountry: "MA" },
        knowsLanguage: ["fr", "ar"],
        ...(sameAs.length ? { sameAs } : {}),
      }}
    />
  );
}

// Chaque voyage est decrit comme un produit avec son prix: c'est ce qui permet
// a Google d'afficher le tarif directement dans les resultats.
export function OfferJsonLd({ offer }) {
  const url = `${siteUrl}/offres/${offer.slug}`;
  const details = [offer.date, offer.departure].filter(Boolean).join(" · ");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${offer.title} — voyage 100% femmes au Maroc`,
          description: offer.summary || details,
          url,
          ...(offer.image?.url ? { image: offer.image.url } : {}),
          brand: { "@type": "Brand", name: "EcoTrips Women" },
          ...(offer.priceValue
            ? {
                offers: {
                  "@type": "Offer",
                  price: offer.priceValue,
                  priceCurrency: "MAD",
                  availability: "https://schema.org/InStock",
                  url,
                  seller: { "@type": "TravelAgency", name: "EcoTrips Women" },
                },
              }
            : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Voyages", item: `${siteUrl}/offres` },
            { "@type": "ListItem", position: 3, name: offer.title, item: url },
          ],
        }}
      />
    </>
  );
}
