// Titre de section: petit surtitre, titre en deux parties (la 2e est en rose italique),
// et une phrase d'introduction facultative.
export default {
  name: "sectionHeading",
  title: "Titre de section",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    {
      name: "eyebrow",
      title: "Surtitre",
      type: "string",
      description: "Petit texte en majuscules au-dessus du titre.",
    },
    {
      name: "title",
      title: "Titre - début (en noir)",
      type: "string",
    },
    {
      name: "highlight",
      title: "Titre - fin (en rose italique)",
      type: "string",
    },
    {
      name: "text",
      title: "Phrase d'introduction",
      type: "text",
      rows: 2,
    },
  ],
  preview: {
    select: { title: "title", subtitle: "highlight" },
    prepare: ({ title, subtitle }) => ({
      title: [title, subtitle].filter(Boolean).join(" ") || "Titre de section",
    }),
  },
};
