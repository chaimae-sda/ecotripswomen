// Les textes darija du site, un par phrase francaise.
//
// Ce qui est ecrit ici est ce qui s'affiche sur /dr, et rien d'autre ne le
// change: le darija n'est plus reconstruit par une machine a chaque generation
// du site. Une ligne laissee vide affiche le francais, ce qui rend visible ce
// qui reste a traduire.
//
// La liste se remplit toute seule avec `npm run darija:seed`: le script ajoute
// les phrases nouvelles du site et ne touche jamais a une ligne deja ecrite.

const entree = {
  name: "darijaEntry",
  title: "Texte",
  type: "object",
  fields: [
    {
      name: "source",
      title: "Texte français",
      type: "text",
      rows: 2,
      readOnly: true,
      description:
        "Repris tel quel du site. C'est la clé: le site cherche cette phrase exacte, " +
        "donc elle ne se modifie pas ici mais dans la fiche d'origine (Réglages, Voyages…).",
    },
    {
      name: "darija",
      title: "En darija",
      type: "text",
      rows: 3,
      description:
        "Lettres latines, façon WhatsApp : 7 pour ح, 3 pour ع, 9 pour ق. " +
        "Laissé vide, le site affiche le français.",
    },
  ],
  preview: {
    select: { darija: "darija", source: "source" },
    prepare: ({ darija, source }) => ({
      title: darija?.trim() || "⚠️  à traduire",
      subtitle: source,
    }),
  },
};

const fiche = {
  name: "darijaTexts",
  title: "Textes en darija",
  type: "document",
  fields: [
    {
      name: "entries",
      title: "Textes du site",
      type: "array",
      of: [{ type: "darijaEntry" }],
      description:
        "Chaque phrase du site avec sa version darija. Rempli automatiquement " +
        "par « npm run darija:seed », puis relu et corrigé ici.",
    },
  ],
  preview: {
    select: { entries: "entries" },
    prepare: ({ entries = [] }) => {
      const vides = entries.filter((e) => !e?.darija?.trim()).length;
      return {
        title: "Textes en darija",
        subtitle: `${entries.length} textes · ${vides} sans darija`,
      };
    },
  },
};

export default [entree, fiche];
