import { client } from "../sanity/client";
import { sanityEnabled } from "../sanity/env";
import { siteContentQuery } from "../sanity/queries";
import { fallbackContent } from "./fallback-content";

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

function normalize(data) {
  const base = fallbackContent;
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

  const offers = data.offers?.length
    ? data.offers.map((offer) => ({
        image: toImage(offer.image),
        title: offer.title || "",
        badge: offer.badge || "",
        badgeColor: offer.badgeColor || "",
        date: offer.date || "",
        departure: offer.departure || "",
        price: offer.price || "",
        message: offer.message || "",
      }))
    : base.offers;

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
  if (!sanityEnabled || !client) return fallbackContent;

  try {
    const data = await client.fetch(siteContentQuery, {}, { next: { revalidate: 60 } });
    if (!data) return fallbackContent;
    return normalize(data);
  } catch (error) {
    // Le site ne doit jamais tomber parce que le CMS est injoignable.
    console.error("Sanity injoignable, contenu de secours utilise:", error.message);
    return fallbackContent;
  }
}
