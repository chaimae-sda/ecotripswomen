"use client";

import { useEffect, useRef, useState } from "react";

import { format } from "../lib/ui";
import { whatsappLink } from "../lib/whatsapp";
import DateCalendar from "./date-calendar";
import Guarantees from "./guarantees";

const MAX_PERSONNES = 12;

// "Sara Benali, Imane Alami et Nadia Chaoui"
function enumerer(noms, et) {
  if (noms.length < 2) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} ${et} ${noms[noms.length - 1]}`;
}

// Message envoye a l'equipe: une phrase complete, lisible telle quelle dans
// WhatsApp, qui reprend les reponses du formulaire.
function bookingMessage(offer, booking, ui) {
  const debut = format(ui.messageDebut, {
    prenom: booking.firstName,
    nom: booking.lastName,
    voyage: offer.title,
    ville: booking.city,
    date: booking.departureDate,
  });

  if (booking.people < 2) return `${debut}.`;

  const noms = enumerer([`${booking.firstName} ${booking.lastName}`, ...booking.companions], ui.et);
  return `${debut}${format(ui.messagePersonnes, { n: booking.people, noms })}.`;
}

// Formulaire de reservation en fenetre surgissante. A l'envoi, les reponses
// sont enregistrees dans la Google Sheet puis WhatsApp s'ouvre avec le message
// deja redige.
export default function BookingModal({ offer, phone, labels, guarantees = [], ui, onClose }) {
  const firstField = useRef(null);
  const [sending, setSending] = useState(false);

  // Le calendrier n'a de sens que si les departs sont de vraies dates.
  const avecCalendrier = offer.departureDates.some((date) => date.value);
  const [dateChoisie, setDateChoisie] = useState(
    () => offer.departureDates.find((date) => date.value)?.value || null
  );
  const [erreurDate, setErreurDate] = useState(false);

  // Nombre de voyageuses. Au-dela d'une, on demande le prenom et le nom de
  // chaque accompagnante, et rien d'autre.
  const [personnes, setPersonnes] = useState(1);
  const accompagnantes = Math.max(0, personnes - 1);

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

    const companions = Array.from({ length: accompagnantes }, (_, i) =>
      `${value(`companionFirstName${i}`)} ${value(`companionLastName${i}`)}`.trim()
    ).filter(Boolean);

    const booking = {
      offer: offer.title,
      firstName: value("firstName"),
      lastName: value("lastName"),
      city: value("city"),
      phone: value("phone"),
      departureDate: dateLabel,
      people: personnes,
      companions,
      // Une seule colonne lisible dans la feuille, plutot qu'un nom par colonne.
      travellers: [`${value("firstName")} ${value("lastName")}`, ...companions].join(", "),
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

    window.location.href = whatsappLink(phone, bookingMessage(offer, booking, ui));
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
        <button className="booking-close" type="button" aria-label={ui.fermer} onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        <p className="booking-eyebrow">{ui.reservation}</p>
        <h2 id="booking-title">{offer.title}</h2>
        <p className="booking-intro">{labels.formIntro}</p>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="booking-body">
          <div className="booking-row">
            <label>
              <span>{ui.prenom}</span>
              <input
                ref={firstField}
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
              />
            </label>
            <label>
              <span>{ui.nom}</span>
              <input name="lastName" type="text" autoComplete="family-name" required />
            </label>
          </div>

          <div className="booking-row">
            <label>
            <span>{ui.villeDepart}</span>
            <input
              name="city"
              type="text"
              list="booking-cities"
              placeholder={offer.departureCities[0] || ui.taVille}
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
            <span>{ui.telephone}</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="06 00 00 00 00"
              pattern="[0-9+\s().-]{8,}"
              title={ui.telephoneInvalide}
              required
            />
            </label>
          </div>

          <div className="booking-row">
            <label>
            <span>{ui.nombrePersonnes}</span>
            <input
              name="people"
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PERSONNES}
              step="1"
              value={personnes}
              onChange={(event) => {
                const saisi = Number(event.target.value);
                // On borne tout de suite: un champ vide ou 99 ferait apparaitre
                // un nombre absurde de lignes de noms.
                if (!Number.isFinite(saisi)) return;
                setPersonnes(Math.min(MAX_PERSONNES, Math.max(1, Math.trunc(saisi))));
              }}
              required
            />
            </label>

            <div className="booking-field">
              <span className="booking-label" id="booking-date">
                {ui.dateDepart}
              </span>
            {avecCalendrier ? (
              <>
                <DateCalendar
                  ui={ui}
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
          </div>

          {accompagnantes > 0 && (
            <fieldset className="booking-groupe">
              <legend>
                {accompagnantes === 1
                  ? ui.accompagnanteUne
                  : format(ui.accompagnantesPlusieurs, { n: accompagnantes })}
              </legend>

              {Array.from({ length: accompagnantes }, (_, i) => (
                <div className="booking-row" key={i}>
                  <label>
                    <span>{format(ui.prenomPersonne, { n: i + 2 })}</span>
                    <input name={`companionFirstName${i}`} type="text" required />
                  </label>
                  <label>
                    <span>{format(ui.nomPersonne, { n: i + 2 })}</span>
                    <input name={`companionLastName${i}`} type="text" required />
                  </label>
                </div>
              ))}
            </fieldset>
          )}


          </div>

          {/* Pied fixe: le bouton et les garanties restent visibles meme quand
              le formulaire depasse la hauteur de l'ecran. */}
          <div className="booking-pied">
            <button className="booking-submit" type="submit" disabled={sending}>
              {sending ? ui.envoiEnCours : labels.formSubmit}
            </button>

            <Guarantees items={guarantees} />

            <p className="booking-note">{labels.formNote}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
