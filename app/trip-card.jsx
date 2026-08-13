"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import BookingModal from "./booking-modal";

// La carte d'un voyage, utilisee par le carrousel de l'accueil et par la page
// « Toutes les offres ». Le bouton Reserver ouvre le meme formulaire que la
// page de detail.
export default function TripCard({ offer, phone, labels, guarantees }) {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <article className="trip-card">
      {/* L'affiche occupe toute la largeur, sans rien par-dessus: les infos
          passent dans le bandeau blanc en dessous. */}
      <div className="trip-photo">
        {offer.image?.url ? (
          <Image
            src={offer.image.url}
            alt={`Offre ${offer.title}`}
            width={offer.image.width}
            height={offer.image.height}
            sizes="(max-width: 760px) 86vw, (max-width: 1080px) 44vw, 33vw"
          />
        ) : null}
        {offer.badge ? <span className={`badge ${offer.badgeColor}`}>{offer.badge}</span> : null}
      </div>

      <div className="trip-content">
        <h3>{offer.title}</h3>
        <p>
          {offer.date}
          {offer.date && offer.departure ? " · " : ""}
          {offer.departure}
        </p>
        <strong>{offer.price}</strong>
        <div className="trip-actions">
          <button className="trip-book" type="button" onClick={() => setBookingOpen(true)}>
            Réserver
          </button>
          <Link className="trip-more" href={`/offres/${offer.slug}`}>
            {labels.moreInfo}
          </Link>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          offer={offer}
          phone={phone}
          labels={labels}
          guarantees={guarantees}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </article>
  );
}
