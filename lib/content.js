import { client } from "../sanity/client";
import { sanityEnabled } from "../sanity/env";
import { siteContentQuery } from "../sanity/queries";
import { fallback, normalize, toDateLabel } from "./normalize";
import { translateContent } from "./translate";
import { getUI } from "./ui";

// Les traductions voyagent a cote du contenu, pas dedans: ce sont des
// traductions, pas du contenu a traduire.
const VIDE = { content: fallback, traductions: { darija: [], english: [] } };

async function getFrenchContent() {
  if (!sanityEnabled || !client) return VIDE;

  try {
    const data = await client.fetch(siteContentQuery, {}, { next: { revalidate: 60 } });
    if (!data) return VIDE;
    return {
      content: normalize(data),
      traductions: { darija: data.darija || [], english: data.english || [] },
    };
  } catch (error) {
    // Le site ne doit jamais tomber parce que le CMS est injoignable.
    console.error("Sanity injoignable, contenu de secours utilise:", error.message);
    return VIDE;
  }
}

// `lang` vaut "fr" par defaut. Les deux autres langues se lisent d'abord dans
// leur fiche du Studio ("Textes en anglais", "Textes en darija"): ce qui y est
// ecrit a la main l'emporte sur toute traduction automatique, et s'applique
// dans la minute, sans remise en ligne.
export async function getSiteContent(lang = "fr") {
  const { content, traductions } = await getFrenchContent();
  const ui = getUI(lang);

  if (lang === "fr") {
    return { ...content, lang, ui, settings: { ...content.settings, ui, lang } };
  }

  const traduit = await translateContent(content, lang, traductions);

  // Les dates sont reconstruites depuis leur valeur brute plutot que traduites:
  // une machine rendrait "vendredi 14 aout 2026" mot a mot. En darija, les mois
  // se disent couramment en francais, on garde donc la mise en forme francaise.
  const locale = lang === "en" ? "en" : "fr";
  const offers = traduit.offers.map((offer) => ({
    ...offer,
    departureDates: offer.departureDates.map((date) =>
      date.value ? { ...date, label: toDateLabel(date.value, locale) || date.label } : date
    ),
  }));

  return { ...traduit, offers, lang, ui, settings: { ...traduit.settings, ui, lang } };
}
