import { notFound } from "next/navigation";

import { getSiteContent } from "../../../lib/content";
import SiteFooter from "../../site-footer";
import SiteHeader from "../../site-header";
import OfferDetail from "./offer-detail";

export const revalidate = 60;

async function findOffer(slug) {
  const content = await getSiteContent();
  return { content, offer: content.offers.find((item) => item.slug === slug) };
}

// Une page est pregeneree pour chaque voyage; un voyage ajoute plus tard dans
// le Studio obtient la sienne au premier affichage.
export async function generateStaticParams() {
  const { offers } = await getSiteContent();
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { offer } = await findOffer(slug);
  if (!offer) return {};

  const details = [offer.date, offer.departure, offer.price].filter(Boolean).join(" · ");

  return {
    title: `${offer.title} | EcoTrips Women`,
    description: offer.summary || details,
    alternates: { canonical: `/offres/${offer.slug}` },
    openGraph: {
      type: "article",
      url: `/offres/${offer.slug}`,
      title: `${offer.title} | EcoTrips Women`,
      description: offer.summary || details,
      images: offer.image?.url ? [offer.image.url] : [],
    },
  };
}

export default async function OfferPage({ params }) {
  const { slug } = await params;
  const { content, offer } = await findOffer(slug);
  if (!offer) notFound();

  return (
    <>
      <SiteHeader settings={content.settings} base="/" />
      <OfferDetail offer={offer} phone={content.settings.phone} labels={content.settings.labels} />
      <SiteFooter settings={content.settings} base="/" />
    </>
  );
}
