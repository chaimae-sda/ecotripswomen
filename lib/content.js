import { client } from "../sanity/client";
import { sanityEnabled } from "../sanity/env";
import { siteContentQuery } from "../sanity/queries";
import { fallbackContent } from "./fallback-content";
import { uniqueSlug } from "./slug";

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

// Accepte les deux formes de photo: celle de Sanity ({ image: { url } }) et
// celle du contenu de secours ({ src }).
function toPhoto(item) {
  const src = item?.image?.url || item?.src;
  return src ? { type: "image", src, alt: item.alt || "" } : null;
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
    summary: offer.summary || "",
    program: (offer.program || []).filter((day) => day?.title || day?.text),
    included: toList(offer.included),
    toBring: toList(offer.toBring),
    // Sans date proposee, on offre au moins celle affichee sur la carte.
    departureDates: toList(offer.departureDates).length
      ? toList(offer.departureDates)
      : toList([offer.date]),
    departureCities: toDepartureCities(offer),
    previousGallery: (offer.previousGallery || []).map(toPhoto).filter(Boolean),
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
const fallback = { ...fallbackContent, offers: toOffers(fallbackContent.offers) };

function normalize(data) {
  const base = fallback;
  const s = data.settings || {};

  const settings = {
    logo: toImage(s.logo, base.settings.logo),
    phone: s.phone || base.settings.phone,
    instagramUrl: s.instagramUrl || base.settings.instagramUrl,
    googleReviewsUrl: s.googleReviewsUrl || base.settings.googleReviewsUrl,
    qrCode: toImage(s.qrCode, base.settings.qrCode),
    hero: {
      photo: toImage(s.hero?.photo, base.settings.hero.photo),
      title: s.hero?.title || base.settings.hero.title,
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
              poster: item.poster?.url || null,
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

export async function getSiteContent() {
  if (!sanityEnabled || !client) return fallback;

  try {
    const data = await client.fetch(siteContentQuery, {}, { next: { revalidate: 60 } });
    if (!data) return fallback;
    return normalize(data);
  } catch (error) {
    // Le site ne doit jamais tomber parce que le CMS est injoignable.
    console.error("Sanity injoignable, contenu de secours utilise:", error.message);
    return fallback;
  }
}
