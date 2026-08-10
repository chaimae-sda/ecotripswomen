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
      name: "tagline",
      title: "Sous-titre sous le grand titre",
      type: "string",
      description:
        "Petite ligne juste sous le grand titre. Elle compte beaucoup pour Google : c'est là " +
        "qu'il comprend le métier. Garde-y les mots que tes clientes tapent, par exemple " +
        '"Agence de voyage 100% femmes au Maroc". Laisse vide pour ne rien afficher.',
      initialValue: "Agence de voyage 100% femmes au Maroc",
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

// Tous les petits textes des pages voyage: boutons, titres de blocs et
// formulaire de reservation. Chaque champ vide reprend le texte d'origine.
const labelsField = {
  name: "labels",
  title: "Textes des boutons et des pages voyage",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    {
      name: "moreInfo",
      title: "Bouton sur la carte d'offre",
      type: "string",
      initialValue: "Plus d'infos",
    },
    {
      name: "allOffers",
      title: "Bouton sous les offres",
      type: "string",
      initialValue: "Voir toutes les offres",
    },
    {
      name: "back",
      title: "Lien de retour, en haut d'une page voyage",
      type: "string",
      initialValue: "Tous les voyages",
    },
    {
      name: "book",
      title: "Grand bouton de réservation",
      type: "string",
      initialValue: "Réserver ce voyage",
    },
    { name: "program", title: "Titre du bloc programme", type: "string", initialValue: "Le programme" },
    {
      name: "included",
      title: "Titre du bloc « compris »",
      type: "string",
      initialValue: "Ce qui est compris",
    },
    { name: "toBring", title: "Titre du bloc « à prévoir »", type: "string", initialValue: "À prévoir" },
    {
      name: "memories",
      title: "Titre de la galerie de l'édition précédente",
      type: "string",
      initialValue: "Le même voyage, la fois précédente",
    },
    {
      name: "memoriesText",
      title: "Phrase sous cette galerie",
      type: "text",
      rows: 2,
      initialValue: "Les photos rapportées par le groupe lors de la dernière édition.",
    },
    {
      name: "question",
      title: "Phrase du bloc « une question ? »",
      type: "string",
      initialValue: "Une question avant de réserver ?",
    },
    {
      name: "questionButton",
      title: "Bouton du bloc « une question ? »",
      type: "string",
      initialValue: "Écrire sur WhatsApp",
    },
    {
      name: "formIntro",
      title: "Phrase d'introduction du formulaire de réservation",
      type: "text",
      rows: 3,
      initialValue:
        "Remplis ces quelques informations : elles partent directement à l'équipe, qui te recontacte pour confirmer ta place.",
    },
    {
      name: "formSubmit",
      title: "Bouton d'envoi du formulaire",
      type: "string",
      initialValue: "Envoyer ma réservation",
    },
    {
      name: "formNote",
      title: "Petite phrase sous le bouton d'envoi",
      type: "text",
      rows: 2,
      initialValue:
        "Tes informations ne servent qu'à traiter ta réservation. Tu pourras nous écrire sur WhatsApp juste après si tu as une question.",
    },
    {
      name: "noResult",
      title: "Message quand aucun voyage ne correspond aux filtres",
      type: "string",
      initialValue: "Aucun voyage ne correspond à ta recherche.",
    },
  ],
};

// Ce que Google affiche dans ses resultats de recherche.
const seoField = {
  name: "seo",
  title: "Référencement Google",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    {
      name: "metaTitle",
      title: "Titre dans les résultats Google",
      type: "string",
      description:
        "La ligne bleue cliquable. Vise 60 caractères maximum, sinon Google la coupe. " +
        "Mets les mots que tes clientes tapent au début.",
      validation: (Rule) => Rule.max(65).warning("Au-delà de 65 caractères, Google coupe la fin."),
    },
    {
      name: "metaDescription",
      title: "Description dans les résultats Google",
      type: "text",
      rows: 3,
      description:
        "Le petit paragraphe gris sous le titre. Vise 155 caractères maximum. " +
        "C'est lui qui donne envie de cliquer.",
      validation: (Rule) =>
        Rule.max(165).warning("Au-delà de 165 caractères, Google coupe la fin."),
    },
  ],
};

export default {
  name: "siteSettings",
  title: "Réglages du site",
  type: "document",
  groups: [
    { name: "identite", title: "Identité et contact", default: true },
    { name: "seo", title: "Référencement Google" },
    { name: "accueil", title: "Accueil" },
    { name: "fonctionnement", title: "Comment ça marche" },
    { name: "titres", title: "Titres des sections" },
    { name: "voyages", title: "Pages voyage" },
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
    { ...seoField, group: "seo" },
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
      name: "allOffersTitle",
      title: "Titre de la page « Toutes les offres »",
      type: "sectionHeading",
      group: "voyages",
    },
    { ...labelsField, group: "voyages" },
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
