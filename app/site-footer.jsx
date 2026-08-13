import Image from "next/image";
import Link from "next/link";

import InstallApp from "./install-app";
import SocialLinks from "./social-links";

const LINKS = [
  { href: "#offres", label: "Offres" },
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#videos", label: "Vidéos" },
  { href: "#avis", label: "Avis" },
  { href: "#contact", label: "Contact" },
];

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
      <nav aria-label="Pied de page">
        <SocialLinks settings={settings} />
        {LINKS.map((link) => (
          <Link key={link.href} href={`${base}${link.href}`}>
            {link.label}
          </Link>
        ))}
        {/* Ne s'affiche que si l'appareil peut installer l'application. */}
        <InstallApp />
      </nav>
    </footer>
  );
}
