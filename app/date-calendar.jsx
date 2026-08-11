"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Lundi en premier, comme les calendriers francais.
const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const MOIS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

// Les dates sont des jours sans heure: tout est calcule en UTC pour qu'un
// fuseau horaire ne decale pas l'affichage d'un jour.
function moisDe(iso) {
  return `${iso.slice(0, 4)}-${iso.slice(5, 7)}`;
}

function libelleMois(cle) {
  const [annee, mois] = cle.split("-");
  return `${MOIS[Number(mois) - 1]} ${annee}`;
}

// Grille du mois: cases vides jusqu'au premier jour, puis les jours.
function grille(cle) {
  const [annee, mois] = cle.split("-").map(Number);
  const premier = new Date(Date.UTC(annee, mois - 1, 1));
  const nbJours = new Date(Date.UTC(annee, mois, 0)).getUTCDate();

  // getUTCDay: 0 = dimanche. On decale pour que lundi vaille 0.
  const decalage = (premier.getUTCDay() + 6) % 7;

  const cases = Array.from({ length: decalage }, () => null);
  for (let jour = 1; jour <= nbJours; jour += 1) {
    const mm = String(mois).padStart(2, "0");
    const jj = String(jour).padStart(2, "0");
    cases.push({ jour, iso: `${annee}-${mm}-${jj}` });
  }
  return cases;
}

// `dates` : [{ value: "2026-09-14", label: "lundi 14 septembre 2026" }]
//
// Le calendrier reste replie: le champ affiche la date retenue et ne se deploie
// qu'au clic, pour ne pas occuper toute la fenetre de reservation.
export default function DateCalendar({ dates, value, onChange, id }) {
  const [ouvert, setOuvert] = useState(false);
  const boite = useRef(null);
  const panneau = useRef(null);

  const disponibles = useMemo(
    () => new Map(dates.filter((date) => date.value).map((date) => [date.value, date.label])),
    [dates]
  );

  // On ne navigue que dans les mois qui contiennent des departs: inutile de
  // laisser feuilleter des mois vides.
  const moisDisponibles = useMemo(
    () => [...new Set([...disponibles.keys()].map(moisDe))].sort(),
    [disponibles]
  );

  const [index, setIndex] = useState(() => {
    const position = moisDisponibles.indexOf(value ? moisDe(value) : null);
    return position >= 0 ? position : 0;
  });

  useEffect(() => {
    if (!ouvert) return undefined;

    // Un clic ailleurs referme le calendrier, sans fermer la fenetre.
    function surClic(event) {
      if (!boite.current?.contains(event.target)) setOuvert(false);
    }

    // Le calendrier s'ouvre en bas du formulaire: on l'amene dans la vue.
    panneau.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });

    document.addEventListener("pointerdown", surClic);
    return () => document.removeEventListener("pointerdown", surClic);
  }, [ouvert]);

  const cle = moisDisponibles[index];
  if (!cle) return null;

  const libelleChoisi = value ? disponibles.get(value) : null;

  function choisir(iso) {
    onChange(iso);
    // Le choix fait, on referme: la cliente voit sa date dans le champ.
    setOuvert(false);
  }

  return (
    <div
      className="cal-champ"
      ref={boite}
      id={id}
      onKeyDown={(event) => {
        // Echap referme d'abord le calendrier: sans cela toute la fenetre de
        // reservation se fermerait d'un coup.
        if (event.key === "Escape" && ouvert) {
          event.stopPropagation();
          setOuvert(false);
        }
      }}
    >
      <button
        type="button"
        className={`cal-declencheur${ouvert ? " est-ouvert" : ""}${
          libelleChoisi ? "" : " est-vide"
        }`}
        aria-expanded={ouvert}
        onClick={() => setOuvert((valeur) => !valeur)}
      >
        <span className="cal-valeur">{libelleChoisi || "Choisir une date"}</span>
        <span className="cal-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {ouvert ? (
        <div className="cal" ref={panneau}>
          <div className="cal-tete">
            <button
              className="cal-fleche"
              type="button"
              aria-label="Mois précédent"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <strong aria-live="polite">{libelleMois(cle)}</strong>
            <button
              className="cal-fleche"
              type="button"
              aria-label="Mois suivant"
              disabled={index === moisDisponibles.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="cal-jours" aria-hidden="true">
            {JOURS.map((jour, i) => (
              <span key={`${jour}-${i}`}>{jour}</span>
            ))}
          </div>

          <div className="cal-grille" role="group" aria-label="Dates de départ disponibles">
            {grille(cle).map((cellule, i) => {
              if (!cellule) return <span key={`vide-${i}`} className="cal-vide" />;

              const libelle = disponibles.get(cellule.iso);
              if (!libelle) {
                return (
                  <span key={cellule.iso} className="cal-jour est-indispo">
                    {cellule.jour}
                  </span>
                );
              }

              const active = value === cellule.iso;
              return (
                <button
                  key={cellule.iso}
                  type="button"
                  className={`cal-jour est-dispo${active ? " est-choisie" : ""}`}
                  aria-pressed={active}
                  aria-label={`${libelle}${active ? " (sélectionnée)" : ""}`}
                  // Toujours selectionner: recliquer sa propre date ne doit pas
                  // vider un champ obligatoire, seulement refermer.
                  onClick={() => choisir(cellule.iso)}
                >
                  {active ? <span aria-hidden="true">✓</span> : cellule.jour}
                </button>
              );
            })}
          </div>

          <p className="cal-legende">
            <span className="cal-pastille est-dispo" aria-hidden="true" /> Disponible
            <span className="cal-pastille est-choisie" aria-hidden="true" /> Ton choix
          </p>
        </div>
      ) : null}
    </div>
  );
}
