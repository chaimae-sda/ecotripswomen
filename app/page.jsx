"use client";

import Image from "next/image";
import { useState } from "react";

const instagramUrl = "https://www.instagram.com/ecotrips_women";
const phone = "+212600368626";

const trips = [
  {
    image: "/assets/offre-nador-el-houceima.png",
    alt: "Offre Nador El Houceima",
    badge: "Vente flash",
    badgeClass: "",
    title: "Nador - El Houceima",
    date: "14 - 16 août",
    departure: "Départ Tanger - Tétouan",
    price: "999 DHS",
    message: "Bonjour EcoTrips Women, je veux réserver Nador El Houceima",
  },
  {
    image: "/assets/offre-camping-boujimil.png",
    alt: "Offre Camping Boujimil",
    badge: "Camping",
    badgeClass: "yellow",
    title: "Camping Boujimil",
    date: "08 - 09 août",
    departure: "Départ Tanger - Tétouan",
    price: "499 DHS",
    message: "Bonjour EcoTrips Women, je veux réserver Camping Boujimil",
  },
  {
    image: "/assets/offre-belyounech-boujimil-fnideq.png",
    alt: "Offre Belyounech Boujimil Fnideq",
    badge: "Promotion",
    badgeClass: "blue",
    title: "Belyounech - Boujimil - Fnideq",
    date: "07 - 09 août",
    departure: "Départ Rabat - Salé",
    price: "999 DH",
    message: "Bonjour EcoTrips Women, je veux réserver Belyounech Boujimil Fnideq",
  },
];

function whatsappLink(message) {
  return `https://wa.me/212600368626?text=${encodeURIComponent(message)}`;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(
    instagramUrl
  )}`;

  function handleSubmit(event) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email") || "";
    window.location.href = whatsappLink(
      `Bonjour EcoTrips Women, je veux recevoir les prochaines sorties. E-mail: ${email}`
    );
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className={`site-header ${menuOpen ? "is-open" : ""}`} id="top">
        <a className="brand" href="#top" aria-label="EcoTrips Women" onClick={closeMenu}>
          <Image src="/assets/logo.png" alt="EcoTrips Women" width={1080} height={1080} priority />
        </a>
        <nav className="main-nav" aria-label="Navigation principale">
          <a href="#offres" onClick={closeMenu}>
            Offres
          </a>
          <a href="#fonctionnement" onClick={closeMenu}>
            Fonctionnement
          </a>
          <a href="#videos" onClick={closeMenu}>
            Vidéos
          </a>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
        </nav>
        <a className="header-cta" href={whatsappLink("Bonjour EcoTrips Women, je veux réserver une place")}>
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

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <Image
            className="hero-photo"
            src="/assets/hero-ecotrips-women.jpg"
            alt="Groupe de voyageuses EcoTrips Women dans la neige"
            fill
            priority
            sizes="(max-width: 1180px) calc(100vw - 32px), 1180px"
          />
          <div className="hero-overlay" />
          <div className="hero-copy">
            <p className="eyebrow">EcoTrips Women</p>
            <h1 id="hero-title">
              Pars seule, <span>mais jamais seule</span>
            </h1>
            <p>Voyages 100% femmes au Maroc, organisés avec transport, activités et accompagnement.</p>
            <a className="primary-btn" href="#offres">
              Voir les départs
            </a>
          </div>
        </section>

        <section className="promise-strip" aria-label="Pourquoi voyager avec EcoTrips Women">
          <article>
            <strong>100% femmes</strong>
            <p>Groupes féminins, ambiance bienveillante et accompagnement.</p>
          </article>
          <article>
            <strong>Transport inclus</strong>
            <p>Départ selon l&apos;offre: Tanger, Tétouan, Rabat ou Salé.</p>
          </article>
          <article>
            <strong>Nature et mer</strong>
            <p>Plages, randonnées, piscine, camping et villages côtiers.</p>
          </article>
          <article>
            <strong>Places limitées</strong>
            <p>Réservation directe par WhatsApp avec l&apos;équipe EcoTrips.</p>
          </article>
        </section>

        <section className="section trips" id="offres">
          <div className="section-title centered">
            <p className="eyebrow">Prochains départs</p>
            <h2>
              Voyages <span>à venir</span>
            </h2>
          </div>
          <div className="trip-grid">
            {trips.map((trip) => (
              <article className="trip-card" key={trip.title}>
                <Image src={trip.image} alt={trip.alt} width={1080} height={1350} sizes="(max-width: 1080px) 100vw, 33vw" />
                <div className="trip-content">
                  <span className={`badge ${trip.badgeClass}`}>{trip.badge}</span>
                  <h3>{trip.title}</h3>
                  <p>
                    {trip.date} · {trip.departure}
                  </p>
                  <strong>{trip.price}</strong>
                  <a href={whatsappLink(trip.message)}>Réserver</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="how-section" id="fonctionnement">
          <div className="section-title centered">
            <p className="eyebrow">Simple et rassurant</p>
            <h2>
              Comment ça <span>marche</span>
            </h2>
            <p>Tu choisis ton voyage, EcoTrips Women gère les détails essentiels.</p>
          </div>
          <div className="steps">
            <article>
              <span>1</span>
              <h3>Choisis ton voyage</h3>
              <p>Mer, camping, randonnée ou week-end détente.</p>
            </article>
            <article>
              <span>2</span>
              <h3>Réserve sur WhatsApp</h3>
              <p>Confirme ta place, ton départ et les infos pratiques.</p>
            </article>
            <article>
              <span>3</span>
              <h3>Voyage accompagnée</h3>
              <p>Transport touristique, activités et groupe féminin.</p>
            </article>
            <article>
              <span>4</span>
              <h3>Partage tes souvenirs</h3>
              <p>Photos, vidéos, souvenirs et nouvelles amitiés.</p>
            </article>
          </div>
          <div className="stats-row">
            <div>
              <strong>100%</strong>
              <span>femmes</span>
            </div>
            <div>
              <strong>3</strong>
              <span>offres actives</span>
            </div>
            <div>
              <strong>+212</strong>
              <span>contact direct</span>
            </div>
            <div>
              <strong>4</strong>
              <span>ambiances: mer, nature, camping, détente</span>
            </div>
          </div>
        </section>

        <section className="section wanderers" id="videos">
          <div className="section-title centered">
            <p className="eyebrow">Moments de voyage</p>
            <h2>
              Vidéos de <span>voyageuses</span>
            </h2>
          </div>
          <div className="video-row">
            <article className="video-placeholder small">
              <span>Emplacement vidéo réel</span>
            </article>
            <article className="video-placeholder tall">
              <span>Emplacement vidéo témoignage</span>
            </article>
            <article className="video-placeholder small alt">
              <span>Emplacement vidéo voyage</span>
            </article>
          </div>
        </section>

        <section className="community-band">
          <div>
            <p className="eyebrow">Communauté</p>
            <h2>
              Rejoins-nous <span>sur Instagram</span>
            </h2>
            <p>Scanne le QR code ou clique dessus pour ouvrir la page Instagram EcoTrips Women.</p>
          </div>
          <a className="qr-card" href={instagramUrl} aria-label="Ouvrir Instagram EcoTrips Women">
            <Image src={qrUrl} alt="QR code vers Instagram EcoTrips Women" width={260} height={260} unoptimized />
            <span>@ecotrips_women</span>
          </a>
        </section>

        <section className="section signature">
          <div className="section-title">
            <p className="eyebrow">Offres favorites</p>
            <h2>
              Voyages <span>signature</span>
            </h2>
            <p>Les annonces importantes restent visibles avec prix, dates et lien de réservation.</p>
          </div>
          <div className="signature-strip">
            {trips.map((trip) => (
              <article key={`signature-${trip.title}`}>
                <Image src={trip.image} alt={trip.alt} width={1080} height={1350} sizes="(max-width: 1080px) 260px, 20vw" />
                <span>
                  {trip.title.split(" - ")[0]} · {trip.price}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="newsletter" id="contact">
          <div>
            <p className="eyebrow">Prochains voyages</p>
            <h2>
              EcoTrips peut <span>t&apos;emmener loin</span>
            </h2>
            <p>Pour recevoir les prochaines sorties ou réserver une place, contacte directement l&apos;équipe.</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="email" name="email" placeholder="Ton email" aria-label="Ton email" />
              <button type="submit">Envoyer</button>
            </form>
            <div className="contact-links">
              <a href={`tel:${phone}`}>+212 600 368 626</a>
              <a href={instagramUrl}>@ecotrips_women</a>
            </div>
          </div>
          <Image
            src="/assets/offre-belyounech-boujimil-fnideq.png"
            alt="Voyage EcoTrips Women"
            width={1080}
            height={1350}
            sizes="(max-width: 1080px) 100vw, 360px"
          />
        </section>

        <section className="section archive">
          <div className="section-title centered">
            <p className="eyebrow">Souvenirs</p>
            <h2>
              EcoTrips <span>au fil des voyages</span>
            </h2>
          </div>
          <div className="archive-grid">
            <article className="memory-card large">
              <div className="video-placeholder memory">
                <span>Emplacement vidéo souvenir grand format</span>
              </div>
              <h3>Sorties entre femmes au Maroc</h3>
            </article>
            <article className="memory-card">
              <div className="video-placeholder memory dark">
                <span>Emplacement story vidéo</span>
              </div>
              <h3>Train, plage ou montagne</h3>
            </article>
          </div>
        </section>

        <section className="more-ways">
          <div className="section-title centered">
            <p className="eyebrow">Formats de voyage</p>
            <h2>
              Plusieurs façons <span>d&apos;explorer</span>
            </h2>
          </div>
          <div className="ways-grid">
            <article>
              <Image src="/assets/hero-morocco.jpg" alt="Voyages entre femmes" width={1800} height={980} sizes="(max-width: 1080px) 100vw, 50vw" />
              <h3>Voyages en groupe féminin</h3>
              <p>Sorties ouvertes aux voyageuses qui veulent rejoindre un groupe.</p>
            </article>
            <article>
              <Image
                src="/assets/brand-cover.png"
                alt="Itinéraires personnalisés"
                width={1080}
                height={1080}
                sizes="(max-width: 1080px) 100vw, 50vw"
              />
              <h3>Itinéraires sur mesure</h3>
              <p>Programmes personnalisés pour un groupe privé.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-claim">
          <p>
            on t&apos;aide <span>à</span>
          </p>
          <p>explorer le Maroc</p>
        </div>
        <Image src="/assets/logo.png" alt="EcoTrips Women" width={1080} height={1080} />
        <nav aria-label="Pied de page">
          <a href="#offres">Offres</a>
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#videos">Vidéos</a>
          <a href="#contact">Contact</a>
        </nav>
      </footer>
    </>
  );
}
