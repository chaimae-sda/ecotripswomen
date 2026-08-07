const heroFields = {
  name: "hero",
  title: "Grande image d'accueil",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    {
      name: "photo",
      title: "Photo de fond",
      type: "image",
      description: "Photo large affichee tout en haut du site.",
      options: { hotspot: true },
    },
    {
      name: "title",
      title: "Grand titre",
      type: "string",
      description: 'Le texte en tres gros, par exemple "She can travel !".',
      validation: (Rule) => Rule.required(),
    },
    {
      name: "text",
      title: "Phrase de presentation",
      type: "text",
      rows: 3,
    },
    {
      name: "primaryLabel",
      title: "Bouton principal - texte",
      type: "string",
      initialValue: "Voir les départs",
    },
    {
      name: "secondaryLabel",
      title: "Bouton WhatsApp - texte",
      type: "string",
      initialValue: "Réserver sur WhatsApp",
    },
  ],
};

const promiseField = {
  name: "promises",
  title: "Les 4 arguments sous la photo",
  type: "array",
  description: "Les petites cartes blanches qui se superposent au bas de la photo d'accueil.",
  of: [
    {
      type: "object",
      fields: [
        { name: "title", title: "Titre", type: "string" },
        { name: "text", title: "Texte", type: "text", rows: 2 },
      ],
      preview: { select: { title: "title", subtitle: "text" } },
    },
  ],
};

const stepsField = {
  name: "steps",
  title: "Les etapes",
  type: "array",
  description: "Les cartes numerotees. Le numero est ajoute automatiquement selon l'ordre.",
  of: [
    {
      type: "object",
      fields: [
        { name: "title", title: "Titre", type: "string" },
        { name: "text", title: "Texte", type: "text", rows: 2 },
      ],
      preview: { select: { title: "title", subtitle: "text" } },
    },
  ],
};

const statsField = {
  name: "stats",
  title: "Les chiffres cles",
  type: "array",
  description: "Le grand chiffre et sa legende, par exemple 100% / Voyages entre femmes.",
  of: [
    {
      type: "object",
      fields: [
        { name: "value", title: "Chiffre", type: "string" },
        { name: "label", title: "Legende", type: "string" },
      ],
      preview: { select: { title: "value", subtitle: "label" } },
    },
  ],
};

export default {
  name: "siteSettings",
  title: "Réglages du site",
  type: "document",
  groups: [
    { name: "identite", title: "Identité et contact", default: true },
    { name: "accueil", title: "Accueil" },
    { name: "fonctionnement", title: "Comment ça marche" },
    { name: "titres", title: "Titres des sections" },
  ],
  fields: [
    {
      name: "logo",
      title: "Logo",
      type: "image",
      group: "identite",
      description: "Image carree, de preference avec un fond transparent.",
    },
    {
      name: "phone",
      title: "Numéro de téléphone",
      type: "string",
      group: "identite",
      description: "Format international sans espaces, par exemple +212600368626.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "instagramUrl",
      title: "Lien Instagram",
      type: "url",
      group: "identite",
    },
    {
      name: "googleReviewsUrl",
      title: "Lien vers la fiche Google",
      type: "url",
      group: "identite",
      description: "Utilise par le bouton « Voir tous les avis sur Google ».",
    },
    {
      name: "qrCode",
      title: "QR code Instagram",
      type: "image",
      group: "identite",
    },
    { ...heroFields, group: "accueil" },
    { ...promiseField, group: "accueil" },
    {
      name: "howTitle",
      title: "Titre « Comment ça marche »",
      type: "sectionHeading",
      group: "fonctionnement",
    },
    { ...stepsField, group: "fonctionnement" },
    { ...statsField, group: "fonctionnement" },
    {
      name: "offersTitle",
      title: "Titre de la section Offres",
      type: "sectionHeading",
      group: "titres",
    },
    {
      name: "videosTitle",
      title: "Titre de la section Vidéos",
      type: "sectionHeading",
      group: "titres",
    },
    {
      name: "reviewsTitle",
      title: "Titre de la section Avis",
      type: "sectionHeading",
      group: "titres",
    },
    {
      name: "galleryTitle",
      title: "Titre de la section Souvenirs",
      type: "sectionHeading",
      group: "titres",
    },
    {
      name: "communityTitle",
      title: "Titre de la section Instagram",
      type: "sectionHeading",
      group: "titres",
    },
    {
      name: "contactTitle",
      title: "Titre de la section Contact",
      type: "sectionHeading",
      group: "titres",
    },
    {
      name: "contactImage",
      title: "Image de la section Contact",
      type: "image",
      group: "titres",
    },
    {
      name: "footerLine1",
      title: "Pied de page - 1re ligne",
      type: "string",
      group: "titres",
      initialValue: "on t'aide",
    },
    {
      name: "footerHighlight",
      title: "Pied de page - mot en rose",
      type: "string",
      group: "titres",
      initialValue: "à",
    },
    {
      name: "footerLine2",
      title: "Pied de page - 2e ligne",
      type: "string",
      group: "titres",
      initialValue: "explorer le Maroc",
    },
  ],
  preview: {
    prepare: () => ({ title: "Réglages du site" }),
  },
};
