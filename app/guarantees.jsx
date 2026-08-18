// Les engagements de l'agence: annulation, avance a verser…
// Le meme bloc sert sous le bouton d'une page voyage et dans la fenetre de
// reservation, pour que la cliente lise exactement la meme promesse aux deux
// endroits.
import { format } from "../lib/ui";

// Un voyage qui porte ses propres conditions (delai d'annulation, avance)
// remplace entierement les garanties generales des Reglages du site: laisser
// cote a cote "7 jours" en general et "3 jours" pour ce voyage-ci serait pire
// que de n'afficher qu'une seule des deux phrases.
//
// Les phrases sont ecrites dans lib/ui.js et non dans Sanity: elles contiennent
// un chiffre saisi voyage par voyage, elles doivent donc exister a la main dans
// les trois langues plutot que de passer par la traduction automatique.
function offerGuarantees(offer, items, ui) {
  const propres = [];

  if (offer?.cancelDays) {
    propres.push({
      title: ui.garantieAnnulation,
      text: format(
        offer.cancelDays === 1 ? ui.garantieAnnulationUn : ui.garantieAnnulationPlusieurs,
        { n: offer.cancelDays }
      ),
    });
  }

  if (offer?.deposit) {
    propres.push({
      title: ui.garantieAvance,
      text: format(ui.garantieAvanceTexte, { montant: offer.deposit }),
    });
  }

  return propres.length ? propres : items;
}

export default function Guarantees({ items, offer, ui, className = "" }) {
  const list = offerGuarantees(offer, items, ui);
  if (!list?.length) return null;

  return (
    <ul className={`garanties ${className}`.trim()}>
      {list.map((item) => (
        <li key={item.title}>
          <span className="garantie-coche" aria-hidden="true">
            ✓
          </span>
          <span>
            <strong>{item.title}</strong>
            {item.text ? <em>{item.text}</em> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
