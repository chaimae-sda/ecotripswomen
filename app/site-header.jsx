"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { bookingMessage, whatsappLink } from "../lib/whatsapp";

const LINKS = [
  { href: "#offres", label: "Offres" },
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#videos", label: "Vidéos" },
  { href: "#avis", label: "Avis" },
  { href: "#contact", label: "Contact" },
];

// `base` vaut "/" depuis une page de voyage: les liens du menu ramenent alors a
// la section correspondante de la page d'accueil.
export default function SiteHeader({ settings, base = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={`site-header ${menuOpen ? "is-open" : ""}`} id="top">
      <Link className="brand" href={base || "#top"} aria-label="EcoTrips Women" onClick={closeMenu}>
        <Image
          src={settings.logo.url}
          alt="EcoTrips Women"
          width={settings.logo.width}
          height={settings.logo.height}
          priority
        />
      </Link>
      <nav className="main-nav" aria-label="Navigation principale">
        {LINKS.map((link) => (
          <Link key={link.href} href={`${base}${link.href}`} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
      </nav>
      <a className="header-cta" href={whatsappLink(settings.phone, bookingMessage())}>
        Réserver
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
