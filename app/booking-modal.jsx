"use client";

import { useEffect, useRef, useState } from "react";

import { whatsappLink } from "../lib/whatsapp";

function detailsMessage(offer, booking) {
  return [
    `Bonjour EcoTrips Women, je veux réserver « ${offer.title} »${
      offer.price ? ` (${offer.price})` : ""
    }.`,
    `Prénom et nom : ${booking.firstName} ${booking.lastName}`,
    `Ville de départ : ${booking.city}`,
    `Téléphone : ${booking.phone}`,
    `Date souhaitée : ${booking.departureDate}`,
  ].join("\n");
}

// Formulaire de reservation en fenetre surgissante. Les reponses partent dans
// la Google Sheet de l'equipe, puis un ecran de confirmation propose WhatsApp.
export default function BookingModal({ offer, phone, labels, onClose }) {
  const firstField = useRef(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    firstField.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);

    const form = new FormData(event.currentTarget);
    const value = (name) => (form.get(name) || "").toString().trim();

    const booking = {
      offer: offer.title,
      firstName: value("firstName"),
      lastName: value("lastName"),
      city: value("city"),
      phone: value("phone"),
      departureDate: value("departureDate"),
    };

    // Si la feuille est injoignable, l'ecran de confirmation bascule sur un
    // message WhatsApp complet: une reservation ne doit jamais se perdre.
    let saved = false;
    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      saved = (await response.json())?.saved === true;
    } catch {
      saved = false;
    }

    setSending(false);
    setDone({ booking, saved });
  }

  return (
    <div
      className="booking-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      onClick={onClose}
    >
      <div className="booking-modal" onClick={(event) => event.stopPropagation()}>
        <button className="booking-close" type="button" aria-label="Fermer" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        {done ? (
          <div className="booking-done">
            <span className="booking-check" aria-hidden="true">
              ✓
            </span>
            <p className="booking-eyebrow">
              {done.saved ? "Réservation envoyée" : "Dernière étape"}
            </p>
            <h2 id="booking-title">{offer.title}</h2>

            {done.saved ? (
              <p className="booking-intro">
                C&apos;est noté, {done.booking.firstName} ! L&apos;équipe te recontacte pour
                confirmer ta place.
              </p>
            ) : (
              <p className="booking-intro">
                Ta demande n&apos;a pas pu être enregistrée. Envoie-la directement sur WhatsApp
                avec le bouton ci-dessous, elle est déjà écrite.
              </p>
            )}

            <p className="booking-question">Une question ?</p>
            <a
              className="booking-whatsapp"
              href={whatsappLink(
                phone,
                done.saved
                  ? `Bonjour, je vous contacte au sujet de ma réservation pour ${offer.title}`
                  : detailsMessage(offer, done.booking)
              )}
            >
              {done.saved ? "Contactez-nous sur WhatsApp" : "Envoyer ma réservation sur WhatsApp"}
            </a>

            <button className="booking-later" type="button" onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <p className="booking-eyebrow">Réservation</p>
            <h2 id="booking-title">{offer.title}</h2>
            <p className="booking-intro">{labels.formIntro}</p>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="booking-row">
                <label>
                  <span>Prénom</span>
                  <input
                    ref={firstField}
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label>
                  <span>Nom</span>
                  <input name="lastName" type="text" autoComplete="family-name" required />
                </label>
              </div>

              <label>
                <span>Ville de départ</span>
                <input
                  name="city"
                  type="text"
                  list="booking-cities"
                  placeholder={offer.departureCities[0] || "Ta ville"}
                  autoComplete="address-level2"
                  required
                />
                {/* Les villes de l'offre sont proposees, sans empecher d'en saisir une autre. */}
                <datalist id="booking-cities">
                  {offer.departureCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </label>

              <label>
                <span>Numéro de téléphone</span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="06 00 00 00 00"
                  pattern="[0-9+\s().-]{8,}"
                  title="Indique un numéro de téléphone valide"
                  required
                />
              </label>

              <label>
                <span>Date de départ souhaitée</span>
                <select name="departureDate" defaultValue={offer.departureDates[0] || ""} required>
                  {offer.departureDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </label>

              <button className="booking-submit" type="submit" disabled={sending}>
                {sending ? "Envoi en cours…" : labels.formSubmit}
              </button>
              <p className="booking-note">{labels.formNote}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
