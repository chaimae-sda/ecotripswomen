export default {
  name: "reviews",
  title: "Avis des voyageuses",
  type: "document",
  fields: [
    {
      name: "items",
      title: "Les avis",
      type: "array",
      description:
        "Recopie ici les avis publiés sur ta fiche Google. N'invente jamais d'avis: ce sont des propos attribués à de vraies clientes.",
      of: [
        {
          type: "object",
          name: "review",
          fields: [
            {
              name: "name",
              title: "Prénom / nom affiché",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "text",
              title: "Texte de l'avis",
              type: "text",
              rows: 6,
              validation: (Rule) => Rule.required(),
            },
            {
              name: "rating",
              title: "Note",
              type: "number",
              initialValue: 5,
              options: {
                list: [
                  { title: "5 étoiles", value: 5 },
                  { title: "4 étoiles", value: 4 },
                  { title: "3 étoiles", value: 3 },
                  { title: "2 étoiles", value: 2 },
                  { title: "1 étoile", value: 1 },
                ],
              },
              validation: (Rule) => Rule.required().min(1).max(5),
            },
            {
              name: "date",
              title: "Date affichée",
              type: "string",
              description: 'Tel que Google l\'affiche, par exemple "il y a un mois".',
            },
            {
              name: "localGuide",
              title: "Local Guide",
              type: "boolean",
              description: "Coche si Google indique « Local Guide » sous son nom.",
              initialValue: false,
            },
            {
              name: "photo",
              title: "Photo de profil",
              type: "image",
              description:
                "Facultatif. Sans photo, la première lettre du prénom est affichée dans une pastille colorée.",
            },
            {
              name: "color",
              title: "Couleur de la pastille",
              type: "string",
              description: "Code couleur, par exemple #8e44ad. Utilisé seulement s'il n'y a pas de photo.",
              initialValue: "#e51f79",
            },
          ],
          preview: {
            select: { title: "name", subtitle: "text", media: "photo" },
          },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: "Avis des voyageuses" }) },
};
