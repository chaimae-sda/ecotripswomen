import Home from "./home";
import { AgencyJsonLd, FaqJsonLd } from "./structured-data";
import { getSiteContent } from "../lib/content";

// Le contenu est relu au maximum toutes les 60 secondes: une modification faite
// dans le Studio apparait sur le site en moins d'une minute.
export const revalidate = 60;

// Le titre et la description viennent du Studio (Réglages du site >
// Référencement Google), pour se corriger sans passer par le code.
export async function generateMetadata() {
  const { settings } = await getSiteContent();

  return {
    title: settings.seo.metaTitle,
    description: settings.seo.metaDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.seo.metaTitle,
      description: settings.seo.metaDescription,
      url: "/",
      images: settings.hero?.photo?.url ? [settings.hero.photo.url] : [],
    },
  };
}

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <AgencyJsonLd settings={content.settings} />
      <FaqJsonLd items={content.settings.faq} />
      <Home content={content} />
    </>
  );
}
