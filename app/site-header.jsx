"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { NAV_LINKS } from "../lib/nav";
import { whatsappLink } from "../lib/whatsapp";
import LanguageSwitch from "./language-switch";

// `base` vaut "/" depuis une page de voyage: les liens du menu ramenent alors a
// la section correspondante de la page d'accueil.
export default function SiteHeader({ settings, base = "" }) {
  const ui = settings.ui;
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

      <nav className="main-nav" aria-label={ui.navPrincipale}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={`${base}${link.href}`} onClick={closeMenu}>
            {ui[link.cle]}
          </Link>
        ))}
        {/* Contact ouvre directement la conversation WhatsApp: c'est la seule
            facon de nous joindre, autant y aller en un clic. */}
        <a href={whatsappLink(settings.phone, ui.contactMessage)} onClick={closeMenu}>
          {ui.contact}
        </a>
      </nav>

      {/* Les actions sont groupees. Sans ce bloc, l'espacement general du
          bandeau les eparpillait et poussait le menu vers la gauche au lieu de
          le laisser au centre. */}
      <div className="header-actions">
        <Link className="header-cta" href={`${base}#offres`} onClick={closeMenu}>
          {ui.reserver}
        </Link>
        <LanguageSwitch ui={ui} />
        <button
          className="menu-toggle"
          type="button"
          aria-label={ui.ouvrirMenu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
