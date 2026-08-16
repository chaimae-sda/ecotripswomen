import { client } from "../sanity/client";
import { sanityEnabled } from "../sanity/env";
import { siteContentQuery } from "../sanity/queries";
import { fallback, normalize, toDateLabel } from "./normalize";
import { translateContent } from "./translate";
import { getUI } from "./ui";

// Les textes darija voyagent a cote du contenu, pas dedans: ce sont des
// traductions, pas du contenu a traduire.
async function getFrenchContent() {
  if (!sanityEnabled || !client) return { content: fallback, darija: [] };

  try {
    const data = await client.fetch(siteContentQuery, {}, { next: { revalidate: 60 } });
    if (!data) return { content: fallback, darija: [] };
    return { content: normalize(data), darija: data.darija || [] };
  } catch (error) {
    // Le site ne doit jamais tomber parce que le CMS est injoignable.
    console.error("Sanity injoignable, contenu de secours utilise:", error.message);
    return { content: fallback, darija: [] };
  }
}

// `lang` vaut "fr" par defaut. En anglais, le contenu francais est traduit a la
// volee et mis en cache: une modification dans le Studio se repercute donc
// toute seule sur la version anglaise.
//
// La darija ne suit pas ce chemin: elle se lit dans la fiche "Textes en
// darija" du Studio. Modifier une phrase francaise ne la change donc jamais,
// et ce qui n'y est pas encore traduit s'affiche en francais.
export async function getSiteContent(lang = "fr") {
  const { content, darija } = await getFrenchContent();
  const ui = getUI(lang);

  if (lang === "fr") {
    return { ...content, lang, ui, settings: { ...content.settings, ui, lang } };
  }

  const traduit = await translateContent(content, lang, darija);

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
