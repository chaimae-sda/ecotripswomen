import Image from "next/image";
import Link from "next/link";

import { CONTACT_MESSAGE, NAV_LINKS } from "../lib/nav";
import { whatsappLink } from "../lib/whatsapp";
import InstallApp from "./install-app";
import SocialLinks from "./social-links";

export default function SiteFooter({ settings, base = "" }) {
  return (
    <footer className="site-footer">
      <div className="footer-claim">
        <p>
          {settings.footerLine1}{" "}
          {settings.footerHighlight ? <span>{settings.footerHighlight}</span> : null}
        </p>
        <p>{settings.footerLine2}</p>
      </div>
      <Image
        src={settings.logo.url}
        alt="EcoTrips Women"
        width={settings.logo.width}
        height={settings.logo.height}
      />
      {/* Trois groupes distincts: sans eux, les liens, les icones et le bouton
          se melangeaient sur une meme ligne qui se cassait n'importe ou. */}
      <nav aria-label="Pied de page">
        <SocialLinks settings={settings} />

        <div className="footer-links">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={`${base}${link.href}`}>
              {link.label}
            </Link>
          ))}
          {/* Comme dans le bandeau du haut: Contact ouvre WhatsApp. */}
          <a href={whatsappLink(settings.phone, CONTACT_MESSAGE)}>Contact</a>
        </div>

        {/* Ne s'affiche que si l'appareil peut installer l'application. */}
        <InstallApp />
      </nav>
    </footer>
  );
}
