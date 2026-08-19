// Les textes anglais du site, un par phrase francaise.
//
// Meme principe que la fiche "Textes en darija", onglets et blocs par voyage
// compris: ce qui est ecrit ici s'affiche sur /en et l'emporte sur tout le
// reste. Une ligne laissee vide retombe sur la traduction automatique gardee
// dans lib/traductions-en.js, et a defaut sur le francais.
//
// La liste se remplit toute seule avec `pnpm run en:translate`: le script
// ajoute les phrases nouvelles et ne touche jamais a une ligne deja ecrite.
import { SECTIONS } from "../../lib/contenu-textes";

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

// Un bloc par voyage dans l'onglet Voyages: on ouvre le voyage qu'on veut
// corriger, et on ne voit que ses phrases.
const voyage = {
  name: "enVoyage",
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
      of: [{ type: "enEntry" }],
      description:
        "Toutes les phrases de ce voyage: nom, présentation, programme, ce qui est " +
        "compris, à prévoir, descriptions des photos.",
    },
  ],
  preview: {
    select: { voyage: "voyage", textes: "textes" },
    prepare: ({ voyage: nom, textes = [] }) => {
      const vides = textes.filter((e) => !e?.english?.trim()).length;
      return {
        title: nom || "Voyage",
        subtitle: vides
          ? `${textes.length} textes · ${vides} sans anglais`
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
  name: "enTexts",
  title: "Textes en anglais",
  type: "document",
  groups: SECTIONS.map((section, index) => ({ ...section, default: index === 0 })),
  fields: SECTIONS.map((section) => ({
    name: section.name,
    title: section.title,
    type: "array",
    group: section.name,
    of: [{ type: section.name === "voyages" ? "enVoyage" : "enEntry" }],
    description:
      section.name === "voyages"
        ? "Un bloc par voyage. Ouvre celui que tu veux corriger, puis Publish: le site " +
          "suit dans la minute."
        : "Les phrases de cette partie du site, avec leur version anglaise. " +
          "Corrige ce que tu veux, puis Publish: le site suit dans la minute.",
  })),
  preview: {
    select: Object.fromEntries(SECTIONS.map((s) => [s.name, s.name])),
    prepare: (valeurs) => {
      const lignes = SECTIONS.flatMap((section) => lignesDe(valeurs, section));
      const vides = lignes.filter((e) => !e?.english?.trim()).length;
      return {
        title: "Textes en anglais",
        subtitle: `${lignes.length} textes · ${vides} sans anglais`,
      };
    },
  },
};

export default [entree, voyage, fiche];
