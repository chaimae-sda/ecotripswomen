"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { CONTACT_MESSAGE, NAV_LINKS } from "../lib/nav";
import { whatsappLink } from "../lib/whatsapp";

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
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={`${base}${link.href}`} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
        {/* Contact ouvre directement la conversation WhatsApp: c'est la seule
            facon de nous joindre, autant y aller en un clic. */}
        <a href={whatsappLink(settings.phone, CONTACT_MESSAGE)} onClick={closeMenu}>
          Contact
        </a>
      </nav>
      {/* Le bouton mene aux voyages a venir plutot qu'a WhatsApp: on ne demande
          pas de reserver avant d'avoir montre ce qu'il y a a reserver. */}
      <Link className="header-cta" href={`${base}#offres`} onClick={closeMenu}>
        Réserver
      </Link>
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
