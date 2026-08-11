"use client";

import { useEffect, useRef, useState } from "react";

import { whatsappLink } from "../lib/whatsapp";
import DateCalendar from "./date-calendar";

// Message envoye a l'equipe: une phrase complete, lisible telle quelle dans
// WhatsApp, qui reprend les reponses du formulaire.
function bookingMessage(offer, booking) {
  return (
    `Bonjour, je suis ${booking.firstName} ${booking.lastName} ` +
    `et je souhaite réserver pour le voyage ${offer.title} ` +
    `au départ de ${booking.city} le ${booking.departureDate}.`
  );
}

// Formulaire de reservation en fenetre surgissante. A l'envoi, les reponses
// sont enregistrees dans la Google Sheet puis WhatsApp s'ouvre avec le message
// deja redige.
export default function BookingModal({ offer, phone, labels, onClose }) {
  const firstField = useRef(null);
  const [sending, setSending] = useState(false);

  // Le calendrier n'a de sens que si les departs sont de vraies dates.
  const avecCalendrier = offer.departureDates.some((date) => date.value);
  const [dateChoisie, setDateChoisie] = useState(
    () => offer.departureDates.find((date) => date.value)?.value || null
  );
  const [erreurDate, setErreurDate] = useState(false);

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

    const form = new FormData(event.currentTarget);
    const value = (name) => (form.get(name) || "").toString().trim();

    // Le calendrier n'est pas un champ de formulaire: sa validation est faite ici.
    const dateLabel = avecCalendrier
      ? offer.departureDates.find((date) => date.value === dateChoisie)?.label
      : value("departureDate");

    if (!dateLabel) {
      setErreurDate(true);
      return;
    }

    setErreurDate(false);
    setSending(true);

    const booking = {
      offer: offer.title,
      firstName: value("firstName"),
      lastName: value("lastName"),
      city: value("city"),
      phone: value("phone"),
      departureDate: dateLabel,
    };

    // On enregistre dans la Google Sheet, puis on part vers WhatsApp. Une
    // feuille injoignable ne doit pas empecher la reservation: le message
    // WhatsApp contient de toute facon toutes les informations.
    try {
      await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
    } catch {
      /* on poursuit vers WhatsApp */
    }

    window.location.href = whatsappLink(phone, bookingMessage(offer, booking));
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

          <div className="booking-field">
            <span className="booking-label" id="booking-date">
              Date de départ souhaitée
            </span>

            {avecCalendrier ? (
              <>
                <DateCalendar
                  dates={offer.departureDates}
                  value={dateChoisie}
                  onChange={(date) => {
                    setDateChoisie(date);
                    // Le reproche disparait des que la cliente corrige.
                    if (date) setErreurDate(false);
                  }}
                />
                {erreurDate ? (
                  <p className="booking-erreur" role="alert">
                    Choisis une date de départ dans le calendrier.
                  </p>
                ) : null}
              </>
            ) : (
              // Voyage sans date precise (« Chaque dimanche »): pas de
              // calendrier possible, on garde une liste.
              <select
                name="departureDate"
                aria-labelledby="booking-date"
                defaultValue={offer.departureDates[0]?.label || ""}
                required
              >
                {offer.departureDates.map((date) => (
                  <option key={date.label} value={date.label}>
                    {date.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button className="booking-submit" type="submit" disabled={sending}>
            {sending ? "Envoi en cours…" : labels.formSubmit}
          </button>
          <p className="booking-note">{labels.formNote}</p>
        </form>
      </div>
    </div>
  );
}
