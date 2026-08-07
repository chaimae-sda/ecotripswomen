export default {
  name: "gallery",
  title: "Galerie souvenirs",
  type: "document",
  fields: [
    {
      name: "items",
      title: "Photos et vidéos",
      type: "array",
      description:
        "Fais glisser pour changer l'ordre. Les vidéos doivent être au format MP4: un iPhone enregistre en .MOV ou .HEIC, qui ne s'affichent pas sur le web.",
      of: [
        {
          type: "object",
          name: "photo",
          title: "Photo",
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
        {
          type: "object",
          name: "video",
          title: "Vidéo",
          fields: [
            {
              name: "file",
              title: "Fichier vidéo (MP4)",
              type: "file",
              options: { accept: "video/mp4" },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "poster",
              title: "Image de couverture",
              type: "image",
              description:
                "Indispensable: c'est ce qui s'affiche sur mobile quand le téléphone bloque la lecture automatique.",
              options: { hotspot: true },
            },
            {
              name: "alt",
              title: "Description",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "featured",
              title: "Afficher dans « Vidéos de voyageuses »",
              type: "boolean",
              description:
                "Coche pour la faire apparaître dans la bande de vidéos en haut de page. Maximum 3.",
              initialValue: false,
            },
          ],
          preview: {
            select: { title: "alt", media: "poster", featured: "featured" },
            prepare: ({ title, media, featured }) => ({
              title: `🎬 ${title || "Vidéo"}`,
              subtitle: featured ? "Mise en avant" : "",
              media,
            }),
          },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: "Galerie souvenirs" }) },
};
