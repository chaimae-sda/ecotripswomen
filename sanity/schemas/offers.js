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

            // Ces trois champs servent aux filtres de la page « Toutes les offres ».
            // Le prix chiffre est lu automatiquement dans le champ Prix ci-dessus.
            {
              name: "startDate",
              title: "Date de début (pour les filtres)",
              type: "date",
              options: { dateFormat: "DD/MM/YYYY" },
              description:
                "La vraie date du départ. Elle ne s'affiche pas sur le site : elle sert à trier " +
                "et à filtrer les voyages par mois. Laisse vide pour un voyage qui revient " +
                "régulièrement, il restera visible quel que soit le mois choisi.",
            },
            {
              name: "endDate",
              title: "Date de fin (pour les filtres)",
              type: "date",
              options: { dateFormat: "DD/MM/YYYY" },
              description: "Sert à calculer la durée du voyage.",
            },
            {
              name: "durationDays",
              title: "Durée en jours",
              type: "number",
              description:
                "À remplir seulement si les dates ci-dessus sont vides, ou pour corriger la durée " +
                "calculée automatiquement. Par exemple 1 pour une sortie à la journée.",
              validation: (Rule) => Rule.min(1).max(60),
            },
            {
              name: "destinations",
              title: "Destinations",
              type: "array",
              description:
                'Les lieux visités, une par ligne, par exemple "Essaouira". Ils servent au filtre ' +
                "par destination.",
              of: [{ type: "string" }],
            },
            {
              name: "message",
              title: "Message WhatsApp pré-rempli",
              type: "string",
              description:
                "Le texte que la cliente enverra en cliquant sur Réserver. Laisse vide pour un message automatique.",
            },

            // Tout ce qui suit alimente la page « Plus d'infos » du voyage.
            // Chaque champ laisse vide est simplement masque sur la page.
            {
              name: "summary",
              title: "Présentation du voyage",
              type: "text",
              rows: 4,
              description:
                "Deux ou trois phrases affichées en haut de la page de détail, sous le nom du voyage.",
            },
            {
              name: "program",
              title: "Programme jour par jour",
              type: "array",
              description: "Une étape par journée. Fais glisser pour changer l'ordre.",
              of: [
                {
                  type: "object",
                  name: "day",
                  fields: [
                    {
                      name: "title",
                      title: "Titre de la journée",
                      type: "string",
                      description: 'Par exemple "Jour 1 · Départ et arrivée à Nador".',
                      validation: (Rule) => Rule.required(),
                    },
                    { name: "text", title: "Ce qui est prévu", type: "text", rows: 3 },
                  ],
                  preview: { select: { title: "title", subtitle: "text" } },
                },
              ],
            },
            {
              name: "included",
              title: "Ce qui est compris",
              type: "array",
              description: "Une ligne par élément: transport, hébergement, repas, activités…",
              of: [{ type: "string" }],
            },
            {
              name: "toBring",
              title: "À prévoir",
              type: "array",
              description: "Ce que la voyageuse doit apporter. Une ligne par élément.",
              of: [{ type: "string" }],
            },
            {
              name: "departureDates",
              title: "Dates de départ proposées",
              type: "array",
              description:
                "Les dates que la cliente pourra choisir dans le formulaire de réservation, par exemple " +
                '"14 - 16 août". Si tu laisses vide, seule la date écrite plus haut est proposée.',
              of: [{ type: "string" }],
            },
            {
              name: "departureCities",
              title: "Villes de départ proposées",
              type: "array",
              description:
                'Une ville par ligne, par exemple "Tanger". Si tu laisses vide, les villes sont ' +
                "reprises automatiquement du champ Départ.",
              of: [{ type: "string" }],
            },
            {
              name: "previousGallery",
              title: "Photos de l'édition précédente",
              type: "array",
              description:
                "Les photos de la dernière fois que ce voyage a eu lieu. Elles s'affichent sous " +
                "l'affiche, sur la page de détail.",
              of: [
                {
                  type: "object",
                  name: "photo",
                  fields: [
                    {
                      name: "image",
                      title: "Photo",
                      type: "image",
                      options: { hotspot: true },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: "alt",
                      title: "Description",
                      type: "string",
                      description:
                        "Décris ce qu'on voit. Lu par les personnes malvoyantes et par Google.",
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: { select: { title: "alt", media: "image" } },
                },
              ],
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
