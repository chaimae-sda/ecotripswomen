const imageFields = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
}`;

const headingFields = `{ eyebrow, title, highlight, text }`;

// Les fiches de traduction rangent leurs phrases par onglet ("accueil",
// "voyages"...). Le site n'a besoin que d'une liste: on les recolle ici.
// `entries` est l'ancien champ unique, garde le temps qu'une fiche pas encore
// reecrite continue de fonctionner.
//
// `previousGallery` accepte deux formes: la photo est l'image elle-meme (forme
// actuelle, celle qui permet d'en deposer plusieurs d'un coup dans le Studio),
// ou une fiche qui contient un champ `image` (forme d'origine). Le `coalesce`
// evite de casser les voyages saisis avant le changement.
export const siteContentQuery = `{
  "settings": *[_type == "siteSettings"][0]{
    "logo": logo${imageFields},
    phone,
    instagramUrl,
    facebookUrl,
    tiktokUrl,
    youtubeUrl,
    googleReviewsUrl,
    "qrCode": qrCode${imageFields},
    seo{ metaTitle, metaDescription },
    hero{
      "photo": photo${imageFields},
      title,
      tagline,
      text,
      primaryLabel,
      secondaryLabel
    },
    promises[]{ title, text },
    howTitle${headingFields},
    steps[]{ title, text },
    stats[]{ value, label },
    offersTitle${headingFields},
    allOffersTitle${headingFields},
    guarantees[]{ title, text },
    faqTitle${headingFields},
    faq[]{ question, answer },
    labels,
    videosTitle${headingFields},
    reviewsTitle${headingFields},
    galleryTitle${headingFields},
    communityTitle${headingFields},
    contactTitle${headingFields},
    "contactImage": contactImage${imageFields},
    footerLine1,
    footerHighlight,
    footerLine2
  },
  "offers": *[_type == "offers"][0].items[]{
    "image": image${imageFields},
    title,
    badge,
    badgeColor,
    date,
    departure,
    price,
    startDate,
    endDate,
    durationDays,
    destinations,
    message,
    cancelDays,
    deposit,
    summary,
    program[]{ title, text },
    included,
    toBring,
    departureDates,
    departureCities,
    previousGallery[]{ alt, "src": coalesce(asset->url, image.asset->url) }
  },
  "reviews": *[_type == "reviews"][0].items[]{
    name,
    text,
    rating,
    date,
    localGuide,
    color,
    "photo": photo${imageFields}
  },
  "darija": *[_type == "darijaTexts"][0]{
    "tout": coalesce(accueil, []) + coalesce(voyages[].textes[], []) + coalesce(faq, []) +
      coalesce(galerie, []) + coalesce(titres, []) + coalesce(libelles, []) +
      coalesce(entries, [])
  }.tout[]{ source, darija },
  "english": *[_type == "enTexts"][0]{
    "tout": coalesce(accueil, []) + coalesce(voyages[].textes[], []) + coalesce(faq, []) +
      coalesce(galerie, []) + coalesce(titres, []) + coalesce(libelles, []) +
      coalesce(entries, [])
  }.tout[]{ source, english },
  "gallery": *[_type == "gallery"][0].items[]{
    _type,
    alt,
    featured,
    "image": image${imageFields},
    "poster": poster${imageFields},
    "file": file.asset->url
  }
}`;
