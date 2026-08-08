"use client";

import { useCallback, useEffect, useRef } from "react";

// Visionneuse plein ecran partagee par la galerie de la page d'accueil et par
// les photos de l'edition precedente sur la page d'un voyage.
// Le parent garde l'index du media ouvert: `onChange(null)` referme.
export default function Lightbox({ items, index, onChange, label = "Galerie EcoTrips Women" }) {
  const touchStart = useRef(null);
  const item = items[index];

  const close = useCallback(() => onChange(null), [onChange]);

  const step = useCallback(
    (direction) => onChange((index + direction + items.length) % items.length),
    [index, items.length, onChange]
  );

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, step]);

  if (!item) return null;

  function onTouchStart(event) {
    touchStart.current = event.changedTouches[0].clientX;
  }

  function onTouchEnd(event) {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button className="lightbox-close" type="button" aria-label="Fermer" onClick={close}>
        <span aria-hidden="true">×</span>
      </button>

      <button
        className="lightbox-nav prev"
        type="button"
        aria-label="Média précédent"
        onClick={(event) => {
          event.stopPropagation();
          step(-1);
        }}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <figure className="lightbox-stage" onClick={(event) => event.stopPropagation()}>
        {item.type === "video" ? (
          <video src={item.src} controls autoPlay playsInline />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.src} alt={item.alt} />
        )}
        <figcaption>
          <span>{item.alt}</span>
          <small>
            {index + 1} / {items.length}
          </small>
        </figcaption>
      </figure>

      <button
        className="lightbox-nav next"
        type="button"
        aria-label="Média suivant"
        onClick={(event) => {
          event.stopPropagation();
          step(1);
        }}
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
