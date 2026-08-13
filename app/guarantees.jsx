// Les engagements de l'agence: annulation, avance a verser…
// Le meme bloc sert sous le bouton d'une page voyage et dans la fenetre de
// reservation, pour que la cliente lise exactement la meme promesse aux deux
// endroits.
export default function Guarantees({ items, className = "" }) {
  if (!items?.length) return null;

  return (
    <ul className={`garanties ${className}`.trim()}>
      {items.map((item) => (
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
