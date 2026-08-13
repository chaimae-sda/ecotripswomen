const imageFields = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
}`;

const headingFields = `{ eyebrow, title, highlight, text }`;

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
    summary,
    program[]{ title, text },
    included,
    toBring,
    departureDates,
    departureCities,
    previousGallery[]{ alt, "image": image${imageFields} }
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
  "gallery": *[_type == "gallery"][0].items[]{
    _type,
    alt,
    featured,
    "image": image${imageFields},
    "poster": poster${imageFields},
    "file": file.asset->url
  }
}`;
