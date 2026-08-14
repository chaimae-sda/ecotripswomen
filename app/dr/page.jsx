import Home from "../home";
import { AgencyJsonLd, FaqJsonLd } from "../structured-data";
import { getSiteContent } from "../../lib/content";
import { siteUrl } from "../../lib/site";
import HtmlLang from "../html-lang";

export const revalidate = 60;

export async function generateMetadata() {
  const { settings } = await getSiteContent("dr");

  return {
    title: settings.seo.metaTitle,
    description: settings.seo.metaDescription,
    // La darija latine n a pas de code de langue reconnu par Google: la declarer
    // brouillerait la lecture des versions francaise et anglaise. Ces pages sont
    // faites pour les visiteuses, pas pour le referencement.
    robots: { index: false, follow: true },

    alternates: {
      canonical: "/dr",
    },
    openGraph: {
      title: settings.seo.metaTitle,
      description: settings.seo.metaDescription,
      url: "/dr",
      locale: "ar_MA",
      images: settings.hero?.photo?.url ? [settings.hero.photo.url] : [],
    },
  };
}

export default async function HomePageEn() {
  const content = await getSiteContent("dr");

  return (
    <>
      <HtmlLang lang="dr" />
      <AgencyJsonLd settings={content.settings} />
      <FaqJsonLd items={content.settings.faq} />
      <Home content={content} />
    </>
  );
}
