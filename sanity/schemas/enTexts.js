// Les textes anglais du site, un par phrase francaise.
//
// Meme principe que la fiche "Textes en darija": ce qui est ecrit ici s'affiche
// sur /en et l'emporte sur tout le reste. Une ligne laissee vide retombe sur la
// traduction automatique gardee dans lib/traductions-en.js, et a defaut sur le
// francais.
//
// La liste se remplit toute seule avec `pnpm run en:translate`: le script
// ajoute les phrases nouvelles et ne touche jamais a une ligne deja ecrite.

const entree = {
  name: "enEntry",
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
      name: "english",
      title: "En anglais",
      type: "text",
      rows: 3,
      description:
        "Corrige librement la traduction automatique. Laissé vide, le site reprend " +
        "la traduction automatique.",
    },
  ],
  preview: {
    select: { english: "english", source: "source" },
    prepare: ({ english, source }) => ({
      title: english?.trim() || "⚠️  à traduire",
      subtitle: source,
    }),
  },
};

const fiche = {
  name: "enTexts",
  title: "Textes en anglais",
  type: "document",
  fields: [
    {
      name: "entries",
      title: "Textes du site",
      type: "array",
      of: [{ type: "enEntry" }],
      description:
        "Chaque phrase du site avec sa version anglaise. Rempli automatiquement " +
        "par « pnpm run en:translate », puis relu et corrigé ici.",
    },
  ],
  preview: {
    select: { entries: "entries" },
    prepare: ({ entries = [] }) => {
      const vides = entries.filter((e) => !e?.english?.trim()).length;
      return {
        title: "Textes en anglais",
        subtitle: `${entries.length} textes · ${vides} sans anglais`,
      };
    },
  },
};

export default [entree, fiche];
