import { notFound } from "next/navigation";

import { getSiteContent } from "../../../../lib/content";
import { siteUrl } from "../../../../lib/site";
import SiteFooter from "../../../site-footer";
import SiteHeader from "../../../site-header";
import { OfferJsonLd } from "../../../structured-data";
import OfferDetail from "../../../offres/[slug]/offer-detail";
import HtmlLang from "../../../html-lang";

export const revalidate = 60;

async function findOffer(slug) {
  const content = await getSiteContent("dr");
  return { content, offer: content.offers.find((item) => item.slug === slug) };
}

export async function generateStaticParams() {
  const { offers } = await getSiteContent("dr");
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { offer } = await findOffer(slug);
  if (!offer) return {};

  const details = [offer.date, offer.departure, offer.price].filter(Boolean).join(" · ");
  const title = `${offer.title} — women-only trip in Morocco | EcoTrips Women`;
  const description = offer.summary || details;

  return {
    title,
    description,
    // La darija latine n a pas de code de langue reconnu par Google: la declarer
    // brouillerait la lecture des versions francaise et anglaise. Ces pages sont
    // faites pour les visiteuses, pas pour le referencement.
    robots: { index: false, follow: true },

    alternates: {
      canonical: `/dr/offres/${offer.slug}`,
    },
    openGraph: {
      type: "article",
      url: `/dr/offres/${offer.slug}`,
      title,
      description,
      locale: "ar_MA",
      images: offer.image?.url ? [offer.image.url] : [],
    },
  };
}

export default async function OfferPageEn({ params }) {
  const { slug } = await params;
  const { content, offer } = await findOffer(slug);
  if (!offer) notFound();

  return (
    <>
      <HtmlLang lang="dr" />
      <OfferJsonLd offer={offer} />
      <SiteHeader settings={content.settings} base="/dr/" />
      <OfferDetail
        offer={offer}
        phone={content.settings.phone}
        labels={content.settings.labels}
        guarantees={content.settings.guarantees}
        ui={content.ui}
      />
      <SiteFooter settings={content.settings} base="/dr/" />
    </>
  );
}
