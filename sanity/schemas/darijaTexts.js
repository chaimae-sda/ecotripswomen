// Les textes darija du site, un par phrase francaise.
//
// Ce qui est ecrit ici est ce qui s'affiche sur /dr, et rien d'autre ne le
// change: le darija n'est plus reconstruit par une machine a chaque generation
// du site. Une ligne laissee vide affiche le francais, ce qui rend visible ce
// qui reste a traduire.
//
// Les phrases sont reparties en onglets, comme les Reglages du site: cent
// quatre-vingts lignes d'un seul tenant, on ne retrouve jamais celle qu'on
// cherche. Le decoupage est celui du site, il est calcule dans
// lib/contenu-textes.js et non recopie ici, pour que les deux ne divergent pas.
//
// La liste se remplit toute seule avec `npm run darija:seed`: le script ajoute
// les phrases nouvelles du site et ne touche jamais a une ligne deja ecrite.
import { SECTIONS } from "../../lib/contenu-textes";

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
  groups: SECTIONS.map((section, index) => ({ ...section, default: index === 0 })),
  fields: SECTIONS.map((section) => ({
    name: section.name,
    title: section.title,
    type: "array",
    group: section.name,
    of: [{ type: "darijaEntry" }],
    description:
      "Les phrases de cette partie du site, avec leur version darija. " +
      "Corrige ce que tu veux, puis Publish: le site suit dans la minute.",
  })),
  preview: {
    select: Object.fromEntries(SECTIONS.map((s) => [s.name, s.name])),
    prepare: (valeurs) => {
      const lignes = SECTIONS.flatMap((s) => valeurs[s.name] || []);
      const vides = lignes.filter((e) => !e?.darija?.trim()).length;
      return {
        title: "Textes en darija",
        subtitle: `${lignes.length} textes · ${vides} sans darija`,
      };
    },
  },
};

export default [entree, fiche];
