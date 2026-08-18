// Met le contenu de Sanity a plat, dans la forme attendue par les pages: images
// normalisees, listes nettoyees, valeurs calculees (prix, duree, slug), et
// retour au contenu de secours pour chaque champ laisse vide dans le Studio.
//
// Aucune dependance a Next: le script "npm run darija:seed" s'en sert pour
// obtenir exactement le contenu que le site affiche, et donc exactement les
// memes phrases a traduire.
// Extensions explicites: ce fichier est aussi charge par Node, hors de Next,
// et le resolveur ESM ne les devine pas.
import { fallbackContent } from "./fallback-content.js";
import { uniqueSlug } from "./slug.js";

function toImage(image, fallback = null) {
  if (!image?.url) return fallback;
  return {
    url: image.url,
    width: image.width || 1200,
    height: image.height || 1200,
    lqip: image.lqip || null,
  };
}

function toHeading(heading, fallback) {
  if (!heading?.title && !heading?.eyebrow) return fallback;
  return {
    eyebrow: heading.eyebrow || fallback?.eyebrow || "",
    title: heading.title || fallback?.title || "",
    highlight: heading.highlight || "",
    text: heading.text || "",
  };
}

// Ne garde que les textes reellement remplis: un champ vide dans le Studio ne
// doit pas effacer le libelle d'origine.
function pickFilled(values) {
  return Object.fromEntries(
    Object.entries(values || {}).filter(([, value]) => typeof value === "string" && value.trim())
  );
}

function toList(values) {
  return (values || []).filter((value) => typeof value === "string" && value.trim());
}

// L'image de couverture d'une video est posee par l'attribut `poster`, que
// l'optimiseur de Next ne touche pas: telle quelle, l'originale (plus de 100 Ko)
// partait au chargement. On demande directement a Sanity une version reduite au
// format le plus leger que le navigateur accepte.
function toPosterUrl(url) {
  if (!url) return null;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=800&q=70&auto=format`;
}

// Sans description saisie dans le Studio, on retombe sur le nom du voyage:
// une photo sans texte de remplacement est muette pour un lecteur d'ecran.
function toPhoto(item, fallbackAlt = "") {
  const src = item?.src || item?.image?.url;
  return src ? { type: "image", src, alt: item.alt || fallbackAlt } : null;
}

// Les villes du formulaire de reservation: celles saisies dans le Studio, ou a
// defaut celles lues dans "Depart Tanger - Tetouan".
function toDepartureCities(offer) {
  const cities = toList(offer.departureCities);
  if (cities.length) return cities;

  return (offer.departure || "")
    .replace(/^\s*d[ée]part\s*/i, "")
    .split(/\s*[-–/,]\s*|\s+ou\s+/i)
    .map((city) => city.trim())
    .filter(Boolean);
}

// "999 DHS" donne 999, "1300 MAD" donne 1300. Sert au filtre par prix.
function toPriceValue(price) {
  const digits = (price || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

// Duree en jours, bornes comprises: du 07 au 09 septembre fait 3 jours.
function toDuration(offer) {
  if (offer.durationDays) return Number(offer.durationDays);
  if (!offer.startDate || !offer.endDate) return null;

  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const days = Math.round((end - start) / 86400000) + 1;
  return days > 0 ? days : null;
}

const FORMATS = {
  fr: new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
};

// "2026-08-14" devient "vendredi 14 août 2026". Les dates saisies dans le
// Studio sont des jours, sans heure: on force UTC pour que le fuseau du
// visiteur ne fasse pas basculer la veille.
//
// Pas de majuscule au jour de la semaine: en francais on ecrit "le samedi
// 8 août", et cette phrase part telle quelle dans le message WhatsApp.
export function toDateLabel(value, lang = "fr") {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : FORMATS[lang].format(date);
}

// Les dates proposees dans le formulaire de reservation, sous la forme
// { value: "2026-08-14", label: "vendredi 14 août 2026" }. La valeur brute sert
// au calendrier, le libelle a l'affichage et au message WhatsApp.
//
// Sans date choisie dans le Studio on retombe sur la date de depart, puis sur
// le texte de la carte. Ce dernier cas ("Chaque dimanche") n'est pas une date:
// il sort avec value a null et le formulaire repasse alors en simple liste.
function toDepartureDates(offer) {
  const choisies = toList(offer.departureDates)
    .map((value) => ({ value, label: toDateLabel(value) }))
    .filter((date) => date.label);
  if (choisies.length) return choisies;

  const debut = offer.startDate ? toDateLabel(offer.startDate) : null;
  if (debut) return [{ value: offer.startDate, label: debut }];

  return toList([offer.date]).map((label) => ({ value: null, label }));
}

function toOffer(offer) {
  return {
    image: toImage(offer.image),
    title: offer.title || "",
    badge: offer.badge || "",
    badgeColor: offer.badgeColor || "",
    date: offer.date || "",
    departure: offer.departure || "",
    price: offer.price || "",
    priceValue: toPriceValue(offer.price),
    startDate: offer.startDate || null,
    endDate: offer.endDate || null,
    durationDays: toDuration(offer),
    destinations: toList(offer.destinations),
    message: offer.message || "",
    // Conditions propres au voyage: elles remplacent les garanties generales
    // dans le bloc affiche sous le bouton Reserver (voir app/guarantees.jsx).
    cancelDays: Number(offer.cancelDays) || null,
    deposit: offer.deposit || "",
    summary: offer.summary || "",
    program: (offer.program || []).filter((day) => day?.title || day?.text),
    included: toList(offer.included),
    toBring: toList(offer.toBring),
    departureDates: toDepartureDates(offer),
    departureCities: toDepartureCities(offer),
    previousGallery: (offer.previousGallery || [])
      .map((photo) => toPhoto(photo, offer.title || ""))
      .filter(Boolean),
  };
}

// Chaque voyage recoit l'adresse de sa page de detail: /offres/<slug>.
function toOffers(items) {
  const taken = new Set();
  return items.map((offer) => {
    const normalized = toOffer(offer);
    return { ...normalized, slug: uniqueSlug(normalized.title, taken) };
  });
}

// Le contenu de secours passe par la meme normalisation que Sanity: les pages
// de detail fonctionnent donc aussi tant que le Studio n'est pas branche.
export const fallback = { ...fallbackContent, offers: toOffers(fallbackContent.offers) };

export function normalize(data) {
  const base = fallback;
  const s = data.settings || {};

  const settings = {
    logo: toImage(s.logo, base.settings.logo),
    phone: s.phone || base.settings.phone,
    instagramUrl: s.instagramUrl || base.settings.instagramUrl,
    // Un lien vide dans le Studio masque l'icone: on ne remet pas la valeur
    // d'origine, contrairement aux textes.
    facebookUrl: s.facebookUrl ?? base.settings.facebookUrl,
    tiktokUrl: s.tiktokUrl ?? base.settings.tiktokUrl,
    youtubeUrl: s.youtubeUrl ?? base.settings.youtubeUrl,
    googleReviewsUrl: s.googleReviewsUrl || base.settings.googleReviewsUrl,
    qrCode: toImage(s.qrCode, base.settings.qrCode),
    seo: { ...base.settings.seo, ...pickFilled(s.seo) },
    hero: {
      photo: toImage(s.hero?.photo, base.settings.hero.photo),
      title: s.hero?.title || base.settings.hero.title,
      // Vide dans le Studio veut dire "ne rien afficher": on ne remet pas le
      // texte d'origine, contrairement aux autres champs.
      tagline: s.hero?.tagline ?? base.settings.hero.tagline,
      text: s.hero?.text || base.settings.hero.text,
      primaryLabel: s.hero?.primaryLabel || base.settings.hero.primaryLabel,
      secondaryLabel: s.hero?.secondaryLabel || base.settings.hero.secondaryLabel,
    },
    promises: s.promises?.length ? s.promises : base.settings.promises,
    howTitle: toHeading(s.howTitle, base.settings.howTitle),
    steps: s.steps?.length ? s.steps : base.settings.steps,
    stats: s.stats?.length ? s.stats : base.settings.stats,
    offersTitle: toHeading(s.offersTitle, base.settings.offersTitle),
    allOffersTitle: toHeading(s.allOffersTitle, base.settings.allOffersTitle),
    // Liste vide dans le Studio = aucune garantie affichee, on ne remet pas
    // les valeurs d'origine.
    guarantees: (s.guarantees ?? base.settings.guarantees).filter((g) => g?.title),
    faqTitle: toHeading(s.faqTitle, base.settings.faqTitle),
    faq: (s.faq ?? base.settings.faq).filter((q) => q?.question && q?.answer),
    // Chaque libelle vide dans le Studio reprend le texte d'origine.
    labels: { ...base.settings.labels, ...pickFilled(s.labels) },
    videosTitle: toHeading(s.videosTitle, base.settings.videosTitle),
    reviewsTitle: toHeading(s.reviewsTitle, base.settings.reviewsTitle),
    galleryTitle: toHeading(s.galleryTitle, base.settings.galleryTitle),
    communityTitle: toHeading(s.communityTitle, base.settings.communityTitle),
    contactTitle: toHeading(s.contactTitle, base.settings.contactTitle),
    contactImage: toImage(s.contactImage, base.settings.contactImage),
    footerLine1: s.footerLine1 || base.settings.footerLine1,
    footerHighlight: s.footerHighlight ?? base.settings.footerHighlight,
    footerLine2: s.footerLine2 || base.settings.footerLine2,
  };

  const offers = data.offers?.length ? toOffers(data.offers) : base.offers;

  const reviews = data.reviews?.length
    ? data.reviews.map((review) => ({
        name: review.name || "",
        text: review.text || "",
        rating: review.rating || 5,
        date: review.date || "",
        localGuide: Boolean(review.localGuide),
        color: review.color || "#e51f79",
        photo: toImage(review.photo),
      }))
    : base.reviews;

  const gallery = data.gallery?.length
    ? data.gallery
        .map((item) => {
          if (item._type === "video") {
            if (!item.file) return null;
            return {
              type: "video",
              src: item.file,
              poster: toPosterUrl(item.poster?.url),
              alt: item.alt || "",
              featured: Boolean(item.featured),
            };
          }
          if (!item.image?.url) return null;
          return { type: "image", src: item.image.url, alt: item.alt || "" };
        })
        .filter(Boolean)
    : base.gallery;

  return { settings, offers, reviews, gallery };
}
