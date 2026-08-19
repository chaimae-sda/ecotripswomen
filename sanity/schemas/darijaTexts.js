// Les textes darija du site, un par phrase francaise.
//
// Ce qui est ecrit ici est ce qui s'affiche sur /dr, et rien d'autre ne le
// change: le darija n'est plus reconstruit par une machine a chaque generation
// du site. Une ligne laissee vide affiche le francais, ce qui rend visible ce
// qui reste a traduire.
//
// Les phrases sont reparties en onglets, comme les Reglages du site: cent
// quatre-vingts lignes d'un seul tenant, on ne retrouve jamais celle qu'on
// cherche. L'onglet Voyages est decoupe une fois de plus, un bloc par voyage.
// Ce decoupage est celui du site, il est calcule dans lib/contenu-textes.js et
// non recopie ici, pour que les deux ne divergent pas.
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

// Un bloc par voyage dans l'onglet Voyages: on ouvre le voyage qu'on veut
// corriger, et on ne voit que ses phrases.
const voyage = {
  name: "darijaVoyage",
  title: "Voyage",
  type: "object",
  fields: [
    {
      name: "voyage",
      title: "Voyage",
      type: "string",
      readOnly: true,
      description: "Repris du nom de l'offre. Il se modifie dans « Voyages à venir ».",
    },
    {
      name: "textes",
      title: "Ses textes",
      type: "array",
      of: [{ type: "darijaEntry" }],
      description:
        "Toutes les phrases de ce voyage: nom, présentation, programme, ce qui est " +
        "compris, à prévoir, descriptions des photos.",
    },
  ],
  preview: {
    select: { voyage: "voyage", textes: "textes" },
    prepare: ({ voyage: nom, textes = [] }) => {
      const vides = textes.filter((e) => !e?.darija?.trim()).length;
      return {
        title: nom || "Voyage",
        subtitle: vides
          ? `${textes.length} textes · ${vides} sans darija`
          : `${textes.length} textes`,
      };
    },
  },
};

// Les phrases d'un onglet, ou les blocs par voyage pour l'onglet Voyages.
function lignesDe(valeurs, section) {
  const contenu = valeurs[section.name] || [];
  return section.name === "voyages" ? contenu.flatMap((bloc) => bloc?.textes || []) : contenu;
}

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
    of: [{ type: section.name === "voyages" ? "darijaVoyage" : "darijaEntry" }],
    description:
      section.name === "voyages"
        ? "Un bloc par voyage. Ouvre celui que tu veux corriger, puis Publish: le site " +
          "suit dans la minute."
        : "Les phrases de cette partie du site, avec leur version darija. " +
          "Corrige ce que tu veux, puis Publish: le site suit dans la minute.",
  })),
  preview: {
    select: Object.fromEntries(SECTIONS.map((s) => [s.name, s.name])),
    prepare: (valeurs) => {
      const lignes = SECTIONS.flatMap((section) => lignesDe(valeurs, section));
      const vides = lignes.filter((e) => !e?.darija?.trim()).length;
      return {
        title: "Textes en darija",
        subtitle: `${lignes.length} textes · ${vides} sans darija`,
      };
    },
  },
};

export default [entree, voyage, fiche];
