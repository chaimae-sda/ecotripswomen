import Home from "../home";
import { AgencyJsonLd, FaqJsonLd } from "../structured-data";
import { getSiteContent } from "../../lib/content";
import { siteUrl } from "../../lib/site";
import HtmlLang from "../html-lang";

export const revalidate = 60;

export async function generateMetadata() {
  const { settings } = await getSiteContent("en");

  return {
    title: settings.seo.metaTitle,
    description: settings.seo.metaDescription,
    alternates: {
      canonical: "/en",
      // Indique a Google que les deux pages sont la meme, en deux langues.
      languages: { fr: `${siteUrl}/`, en: `${siteUrl}/en`, "x-default": `${siteUrl}/` },
    },
    openGraph: {
      title: settings.seo.metaTitle,
      description: settings.seo.metaDescription,
      url: "/en",
      locale: "en_GB",
      images: settings.hero?.photo?.url ? [settings.hero.photo.url] : [],
    },
  };
}

export default async function HomePageEn() {
  const content = await getSiteContent("en");

  return (
    <>
      <HtmlLang lang="en" />
      <AgencyJsonLd settings={content.settings} />
      <FaqJsonLd items={content.settings.faq} />
      <Home content={content} />
    </>
  );
}
