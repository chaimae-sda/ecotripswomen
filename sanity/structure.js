// Menu du Studio: 5 fiches uniques, pas de bouton "creer un document"
// qui pourrait dupliquer le contenu par erreur.
const singletons = [
  { id: "siteSettings", title: "Réglages du site", icon: "⚙️" },
  { id: "offers", title: "Voyages à venir", icon: "🧳" },
  { id: "reviews", title: "Avis des voyageuses", icon: "⭐" },
  { id: "gallery", title: "Galerie souvenirs", icon: "🖼️" },
  { id: "darijaTexts", title: "Textes en darija", icon: "📝" },
];

export const structure = (S) =>
  S.list()
    .title("Contenu du site")
    .items(
      singletons.map((item) =>
        S.listItem()
          .title(`${item.icon}  ${item.title}`)
          .id(item.id)
          .child(S.document().schemaType(item.id).documentId(item.id).title(item.title))
      )
    );
