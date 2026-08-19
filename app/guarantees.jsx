// Les engagements de l'agence: annulation, avance a verser…
// Le meme bloc sert sous le bouton d'une page voyage et dans la fenetre de
// reservation, pour que la cliente lise exactement la meme promesse aux deux
// endroits.
//
// Un voyage qui porte ses propres garanties remplace entierement celles des
// Reglages du site: laisser cote a cote "7 jours" en general et "3 jours" pour
// ce voyage-ci serait pire que de n'afficher qu'une seule des deux phrases.
//
// Ce sont de simples textes, saisis voyage par voyage dans le Studio. Ils
// partent donc dans les fiches de traduction avec le reste du voyage, et se
// corrigent en darija et en anglais dans l'onglet de ce voyage.
export default function Guarantees({ items, offer, className = "" }) {
  const list = offer?.guarantees?.length ? offer.guarantees : items;
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
