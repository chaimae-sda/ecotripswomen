"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import TripCard from "./trip-card";

// Bande de voyages qui defile: on la fait glisser au doigt sur mobile, et les
// deux triangles avancent d'une carte a la fois sur ordinateur.
export default function TripCarousel({ offers, phone, labels, guarantees, ui }) {
  const track = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const refresh = useCallback(() => {
    const node = track.current;
    if (!node) return;

    // Une marge d'un pixel evite que le bouton reste actif a cause des arrondis.
    setAtStart(node.scrollLeft <= 1);
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
  }, []);

  useEffect(() => {
    refresh();
    const node = track.current;
    if (!node) return undefined;

    window.addEventListener("resize", refresh);
    return () => window.removeEventListener("resize", refresh);
  }, [refresh]);

  function scrollByCard(direction) {
    const node = track.current;
    if (!node) return;

    const card = node.querySelector(".trip-card");
    const step = card ? card.offsetWidth + 22 : node.clientWidth;
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="trip-carousel">
      <button
        className="trip-arrow prev"
        type="button"
        aria-label="Voyages précédents"
        disabled={atStart}
        onClick={() => scrollByCard(-1)}
      >
        <span aria-hidden="true" />
      </button>

      <div className="trip-track" ref={track} onScroll={refresh}>
        {offers.map((offer) => (
          <TripCard
              key={offer.slug}
              offer={offer}
              phone={phone}
              labels={labels}
              guarantees={guarantees}
              ui={ui}
            />
        ))}
      </div>

      <button
        className="trip-arrow next"
        type="button"
        aria-label="Voyages suivants"
        disabled={atEnd}
        onClick={() => scrollByCard(1)}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}
