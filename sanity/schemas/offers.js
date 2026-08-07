export default {
  name: "offers",
  title: "Voyages à venir",
  type: "document",
  fields: [
    {
      name: "items",
      title: "Les offres",
      type: "array",
      description:
        "Fais glisser les offres pour changer leur ordre sur le site. Clique sur les trois points puis « Remove » pour en supprimer une.",
      of: [
        {
          type: "object",
          name: "offer",
          fields: [
            {
              name: "image",
              title: "Affiche du voyage",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "title",
              title: "Nom du voyage",
              type: "string",
              description: 'Par exemple "Nador - El Houceima".',
              validation: (Rule) => Rule.required(),
            },
            {
              name: "badge",
              title: "Étiquette",
              type: "string",
              description: 'Le petit rectangle en haut, par exemple "Vente flash".',
            },
            {
              name: "badgeColor",
              title: "Couleur de l'étiquette",
              type: "string",
              options: {
                list: [
                  { title: "Rose", value: "" },
                  { title: "Jaune", value: "yellow" },
                  { title: "Bleu", value: "blue" },
                ],
                layout: "radio",
              },
              initialValue: "",
            },
            {
              name: "date",
              title: "Dates",
              type: "string",
              description: 'Par exemple "14 - 16 août".',
            },
            {
              name: "departure",
              title: "Départ",
              type: "string",
              description: 'Par exemple "Départ Tanger - Tétouan".',
            },
            {
              name: "price",
              title: "Prix",
              type: "string",
              description: 'Écris le prix tel qu\'il doit apparaître, par exemple "999 DHS".',
            },
            {
              name: "message",
              title: "Message WhatsApp pré-rempli",
              type: "string",
              description:
                "Le texte que la cliente enverra en cliquant sur Réserver. Laisse vide pour un message automatique.",
            },
          ],
          preview: {
            select: { title: "title", subtitle: "date", media: "image" },
          },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: "Voyages à venir" }) },
};
