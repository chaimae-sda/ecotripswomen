"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { whatsappLink } from "../../../lib/whatsapp";
import BookingModal from "../../booking-modal";
import Guarantees from "../../guarantees";
import Lightbox from "../../lightbox";

export default function OfferDetail({ offer, phone, labels, guarantees, ui }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [photo, setPhoto] = useState(null);

  return (
    <main className="offer-page">
      <Link className="offer-back" href={`${ui.langue === "en" ? "/en" : ""}/offres`}>
        <span aria-hidden="true">←</span> {labels.back}
      </Link>

      <div className="offer-layout">
        {/* Colonne gauche: l'affiche, le bouton de reservation, puis les photos
            de la fois precedente. */}
        <div className="offer-aside">
          <figure className="offer-poster">
            {offer.image?.url ? (
              <Image
                src={offer.image.url}
                alt={`Affiche du voyage ${offer.title}`}
                width={offer.image.width}
                height={offer.image.height}
                sizes="(max-width: 980px) 100vw, 460px"
                priority
              />
            ) : null}
            {offer.badge ? (
              <figcaption className={`badge ${offer.badgeColor}`}>{offer.badge}</figcaption>
            ) : null}
          </figure>

          <button className="offer-book" type="button" onClick={() => setBookingOpen(true)}>
            {labels.book}
            {offer.price ? <small>{offer.price}</small> : null}
          </button>

          <Guarantees
            items={guarantees}
            offer={offer}
            ui={ui}
            className="offer-garanties"
          />
        </div>

        {offer.previousGallery.length > 0 && (
          <section className="offer-memories" aria-labelledby="offer-memories-title">
            <h2 id="offer-memories-title">{labels.memories}</h2>
            <p>{labels.memoriesText}</p>
            <div className="offer-memories-grid">
              {offer.previousGallery.map((item, index) => (
                <button
                  key={item.src}
                  className="offer-memory"
                  type="button"
                  aria-label={`${ui.agrandir} : ${item.alt}`}
                  onClick={() => setPhoto(index)}
                >
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 980px) 33vw, 150px" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Colonne droite: tout le detail du voyage. */}
        <div className="offer-main">
          <h1>{offer.title}</h1>

          <ul className="offer-facts">
            {offer.date ? (
              <li>
                <span>{ui.dates}</span>
                <strong>{offer.date}</strong>
              </li>
            ) : null}
            {offer.departure ? (
              <li>
                <span>{ui.depart}</span>
                <strong>{offer.departure.replace(/^\s*d[ée]part\s*/i, "")}</strong>
              </li>
            ) : null}
            {offer.price ? (
              <li>
                <span>{ui.prix}</span>
                <strong className="offer-price">{offer.price}</strong>
              </li>
            ) : null}
          </ul>

          {offer.summary ? <p className="offer-summary">{offer.summary}</p> : null}

          {offer.program.length > 0 && (
            <section className="offer-block">
              <h2>{labels.program}</h2>
              <ol className="offer-program">
                {offer.program.map((day) => (
                  <li key={day.title}>
                    <h3>{day.title}</h3>
                    {day.text ? <p>{day.text}</p> : null}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {offer.included.length > 0 && (
            <section className="offer-block">
              <h2>{labels.included}</h2>
              <ul className="offer-list included">
                {offer.included.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {offer.toBring.length > 0 && (
            <section className="offer-block">
              <h2>{labels.toBring}</h2>
              <ul className="offer-list">
                {offer.toBring.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          <aside className="offer-cta">
            <p>{labels.question}</p>
            <a
              className="offer-whatsapp"
              href={whatsappLink(
                phone,
                `Bonjour EcoTrips Women, j'ai une question sur ${offer.title}`
              )}
            >
              {labels.questionButton}
            </a>
          </aside>
        </div>
      </div>

      {photo !== null && (
        <Lightbox
          items={offer.previousGallery}
          index={photo}
          onChange={setPhoto}
          ui={ui}
          label={`Photos de l'édition précédente : ${offer.title}`}
        />
      )}

      {bookingOpen && (
        <BookingModal
          offer={offer}
          phone={phone}
          labels={labels}
          guarantees={guarantees}
          ui={ui}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </main>
  );
}
