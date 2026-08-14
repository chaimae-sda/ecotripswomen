"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LANGUES = [
  { code: "fr", nom: "Français", court: "FR" },
  { code: "en", nom: "English", court: "EN" },
  { code: "dr", nom: "Darija", court: "DR" },
];

// Menu deroulant de langue. Il reste sur la meme page: /offres devient
// /en/offres, et inversement. Seul le prefixe change, l'adresse des voyages
// est identique dans les deux langues.
export default function LanguageSwitch({ ui }) {
  const chemin = usePathname() || "/";
  const [ouvert, setOuvert] = useState(false);
  const boite = useRef(null);

  useEffect(() => {
    if (!ouvert) return undefined;

    function surClic(event) {
      if (!boite.current?.contains(event.target)) setOuvert(false);
    }

    function surTouche(event) {
      if (event.key === "Escape") setOuvert(false);
    }

    document.addEventListener("pointerdown", surClic);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("pointerdown", surClic);
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert]);

  // Le chemin sans son prefixe de langue, pour reconstruire les autres versions.
  const nu = chemin.replace(/^\/(en|dr)(?=\/|$)/, "") || "/";
  const adresse = (code) => (code === "fr" ? nu : `/${code}${nu === "/" ? "" : nu}`);

  const actuelle = LANGUES.find((l) => l.code === ui.langue) || LANGUES[0];

  return (
    <div className="lang-menu" ref={boite}>
      <button
        type="button"
        className={`lang-btn${ouvert ? " est-ouvert" : ""}`}
        aria-expanded={ouvert}
        aria-haspopup="true"
        aria-label={ui.choisirLangue}
        onClick={() => setOuvert((v) => !v)}
      >
        <span aria-hidden="true">{actuelle.court}</span>
        <span className="lang-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {ouvert ? (
        <ul className="lang-liste">
          {LANGUES.map((langue) => (
            <li key={langue.code}>
              <Link
                href={adresse(langue.code)}
                hrefLang={langue.code}
                className={langue.code === ui.langue ? "est-active" : ""}
                aria-current={langue.code === ui.langue ? "true" : undefined}
                onClick={() => setOuvert(false)}
              >
                <span className="lang-code">{langue.court}</span>
                {langue.nom}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
