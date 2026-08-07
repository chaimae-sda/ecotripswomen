"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const instagramUrl = "https://www.instagram.com/ecotrips_women";
const phone = "+212600368626";
const googleReviewsUrl = "https://maps.app.goo.gl/9kDDvpmfCwGGzgcQ8";

// Avis publiés sur la fiche Google EcoTrips Women (texte repris tel quel).
// Pour afficher la vraie photo de profil d'une voyageuse: enregistre l'image dans
// public/assets/avis/ puis renseigne photo: "/assets/avis/mon-fichier.jpg".
// Sans photo, l'initiale colorée est affichée.
const reviews = [
  {
    name: "Ikram Chairi",
    rating: 5,
    date: "il y a un mois",
    color: "#8e44ad",
    photo: null,
    text:
      "Merci à toute l'équipe pour votre professionnalisme et votre excellente organisation. " +
      "J'ai beaucoup apprécié les voyages entre femmes, dans une ambiance conviviale et chaleureuse. " +
      "Une très belle expérience, je recommande vivement !",
  },
  {
    name: "Safae Chairi Lingerie",
    rating: 5,
    date: "il y a un mois",
    localGuide: true,
    color: "#e51f79",
    photo: null,
    text:
      "Superbe expérience avec cette agence 100% féminine. Le programme était parfaitement ciblé, " +
      "l'ambiance chaleureuse et les rencontres inspirantes. Tout était bien géré du début à la fin. " +
      "Merci pour ces souvenirs gravés à jamais !",
  },
  {
    name: "Imane Chairi",
    rating: 5,
    date: "il y a un mois",
    color: "#7b1fa2",
    photo: null,
    text:
      "Je recommande vivement cette agence de voyage ! J'ai voyagé avec eux à cinq reprises, et chaque " +
      "expérience a été une vraie réussite. Les voyages étaient très bien organisés, dans une ambiance " +
      "agréable, conviviale et rassurante. J'ai particulièrement apprécié le concept des voyages entre " +
      "femmes, qui permet de voyager en toute sérénité, de faire de belles rencontres et de partager des " +
      "moments inoubliables. Merci pour votre professionnalisme, votre disponibilité et la qualité de " +
      "votre accompagnement. Hâte de repartir avec vous pour de nouvelles aventures !",
  },
  {
    name: "Siham Fakkar",
    rating: 5,
    date: "il y a un mois",
    color: "#1a73e8",
    photo: null,
    text:
      "Une belle expérience ! une organisation sérieuse, une ambiance conviviale et de très beaux " +
      "souvenirs. Je recommande vivement à toutes celles qui aiment voyager et découvrir de nouveaux " +
      "endroits. Hâte de participer au prochain voyage ! 😊",
  },
  {
    name: "Hind Aabou",
    rating: 5,
    date: "il y a 4 semaines",
    color: "#176f8b",
    photo: null,
    text:
      "Une expérience vraiment magnifique avec cette agence. Tout était super bien organisé et l'ambiance " +
      "était au top. Un grand merci spécial à Salma pour son organisation impeccable et son attention aux " +
      "moindres détails. J'attends avec impatience la prochaine opportunité pour repartir avec vous.",
  },
  {
    name: "kezzou khadija",
    rating: 5,
    date: "il y a un mois",
    color: "#c2185b",
    photo: null,
    text:
      "I had such an amazing experience with this girls-only group trip. Everything was well organized, " +
      "and the atmosphere was so welcoming and fun. A special thanks to the organizer (Salma) she is " +
      "incredibly kind, funny, and thoughtful. She made sure everyone felt comfortable and enjoyed every " +
      "moment. Her positive energy and attention to every little detail made the trip truly unforgettable.",
  },
];

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#4285f4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34a853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#fbbc04"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#ea4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-head">
        {review.photo ? (
          <Image className="review-avatar" src={review.photo} alt="" width={88} height={88} />
        ) : (
          <span className="review-avatar" style={{ background: review.color }} aria-hidden="true">
            {review.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <div className="review-identity">
          <strong>{review.name}</strong>
          <small>
            <GoogleMark />
            {review.localGuide ? "Local Guide · " : ""}
            {review.date}
          </small>
        </div>
      </div>
      <div className="review-stars" role="img" aria-label={`${review.rating} étoiles sur 5`}>
        {"★★★★★".slice(0, review.rating)}
      </div>
      <p>{review.text}</p>
    </article>
  );
}

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

// Galerie souvenirs: fichiers dans public/assets/galerie.
const gallery = [
  { type: "image", src: "/assets/galerie/groupe-rocher-champignon-drapeau.jpg", alt: "Le groupe EcoTrips Women devant le rocher champignon au bord de la mer" },
  { type: "image", src: "/assets/galerie/groupe-sommet-monte-blanco.jpg", alt: "Voyageuses réunies au sommet du Monte Blanco face à la baie" },
  { type: "video", src: "/assets/galerie/video-desert-dunes.mp4", alt: "Vidéo souvenir dans les dunes du désert" },
  { type: "image", src: "/assets/galerie/duo-coeur-montagne-neige.jpg", alt: "Deux voyageuses formant un cœur avec leurs mains devant la montagne enneigée" },
  { type: "image", src: "/assets/galerie/caravane-dromadaires-desert.jpg", alt: "Caravane de dromadaires traversant les dunes orangées" },
  { type: "image", src: "/assets/galerie/sommet-toubkal-hiver.jpg", alt: "Voyageuse au sommet du Toubkal en hiver" },
  { type: "image", src: "/assets/galerie/plongee-coeur-sous-marin.jpg", alt: "Plongeuse formant un cœur avec ses mains sous l'eau" },
  { type: "image", src: "/assets/galerie/groupe-neige-drapeau.jpg", alt: "Le groupe brandissant le drapeau EcoTrips Women dans la neige" },
  { type: "image", src: "/assets/galerie/duo-jardin-maison-hotes.jpg", alt: "Deux voyageuses dans le jardin fleuri d'une maison d'hôtes" },
  { type: "image", src: "/assets/galerie/desert-dune-drapeau-ecotrips.jpg", alt: "Voyageuse allongée sur une dune à côté du drapeau EcoTrips Women" },
  { type: "video", src: "/assets/galerie/video-souvenir-voyage.mp4", alt: "Vidéo souvenir d'une sortie EcoTrips Women" },
  { type: "image", src: "/assets/galerie/groupe-rocher-champignon-ete.jpg", alt: "Groupe de voyageuses en été devant le rocher champignon" },
  { type: "image", src: "/assets/galerie/riviere-turquoise-montagne.jpg", alt: "Voyageuse sur un pont au-dessus d'une rivière turquoise en montagne" },
  { type: "image", src: "/assets/galerie/groupe-4x4-desert.jpg", alt: "Le groupe autour du 4x4 au milieu des dunes" },
  { type: "image", src: "/assets/galerie/groupe-sommet-jbel-karbou.jpg", alt: "Le groupe au sommet du Jbel Karbou, à 1618 mètres" },
  { type: "image", src: "/assets/galerie/plongee-fonds-marins.jpg", alt: "Fonds marins et poissons observés pendant une plongée" },
  { type: "image", src: "/assets/galerie/groupe-randonnee-neige.jpg", alt: "Randonnée du groupe dans la neige avec bâtons de marche" },
  { type: "image", src: "/assets/galerie/duo-panneau-jbel-boujmil.jpg", alt: "Deux voyageuses devant le panneau du Jbel Boujmil" },
  { type: "image", src: "/assets/galerie/groupe-randonnee-collines.jpg", alt: "Le groupe en randonnée sur les collines verdoyantes" },
  { type: "image", src: "/assets/galerie/sommet-jbel-karbou-panneau.jpg", alt: "Voyageuse posant au panneau du sommet du Jbel Karbou" },
  { type: "image", src: "/assets/galerie/combinaison-ski-neige.jpg", alt: "Voyageuse en combinaison de ski dans la neige" },
  { type: "image", src: "/assets/galerie/groupe-rocher-champignon-falaise.jpg", alt: "Le groupe posant sur la falaise devant le rocher champignon" },
];

// Les deux videos mises en avant dans la section "Videos de voyageuses".
const featuredVideos = [
  "/assets/galerie/video-desert-dunes.mp4",
  "/assets/galerie/video-souvenir-voyage.mp4",
];

// Se precharge et se lance sans son des qu'elle approche de l'ecran, se met en pause en sortant.
function ScrollVideo({ item, tall, onOpen }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    node.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.preload = "auto";
          const played = node.play();
          if (played) played.catch(() => {});
        } else {
          node.pause();
        }
      },
      { rootMargin: "150px 0px", threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      className={`video-slot ${tall ? "tall" : ""}`}
      type="button"
      aria-label={`Agrandir: ${item.alt}`}
      onClick={onOpen}
    >
      <video ref={ref} src={item.src} muted loop playsInline preload="metadata" tabIndex={-1} />
      <span className="video-slot-play" aria-hidden="true" />
    </button>
  );
}

function whatsappLink(message) {
  return `https://wa.me/212600368626?text=${encodeURIComponent(message)}`;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const touchStart = useRef(null);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(
    instagramUrl
  )}`;

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const step = useCallback((direction) => {
    setLightbox((current) => {
      if (current === null) return current;
      return (current + direction + gallery.length) % gallery.length;
    });
  }, []);

  useEffect(() => {
    if (lightbox === null) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightbox, closeLightbox, step]);

  function onTouchStart(event) {
    touchStart.current = event.changedTouches[0].clientX;
  }

  function onTouchEnd(event) {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
  }

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
          <a href="#avis" onClick={closeMenu}>
            Avis
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
            <span className="hero-logo">
              <Image src="/assets/logo.png" alt="EcoTrips Women" width={1080} height={1080} priority />
            </span>
            <h1 id="hero-title">
              She can travel !
            </h1>
            <p>Voyages 100% femmes au Maroc, organisés avec transport, activités et accompagnement.</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#offres">
                Voir les départs
              </a>
              <a
                className="ghost-btn"
                href={whatsappLink("Bonjour EcoTrips Women, je veux réserver une place")}
              >
                Réserver sur WhatsApp
              </a>
            </div>
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
              <span>Voyages entre femmes</span>
            </div>
            <div>
              {/* TODO: remplacer par le vrai nombre de voyageuses */}
              <strong>+150</strong>
              <span>Voyageuses satisfaites</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Offres actives</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Ambiances de voyage</span>
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
            {featuredVideos.map((src, position) => {
              const index = gallery.findIndex((item) => item.src === src);
              return (
                <ScrollVideo
                  key={src}
                  item={gallery[index]}
                  tall={position === 1}
                  onOpen={() => setLightbox(index)}
                />
              );
            })}
            {/* Emplacement libre en attendant la 3e video. */}
            <div className="video-slot empty" aria-hidden="true">
              <span />
            </div>
          </div>
        </section>

        <section className="reviews" id="avis" aria-labelledby="reviews-title">
          <div className="section-title centered">
            <p className="eyebrow">Avis Google</p>
            <h2 id="reviews-title">
              Les avis de <span>nos voyageuses</span>
            </h2>
            <p>Ce que racontent les femmes qui sont déjà parties avec EcoTrips Women.</p>
          </div>

          <div className="reviews-marquee">
            <div className="reviews-track">
              {reviews.map((review) => (
                <ReviewCard key={review.name} review={review} />
              ))}
              <div className="reviews-clone" aria-hidden="true">
                {reviews.map((review) => (
                  <ReviewCard key={`clone-${review.name}`} review={review} />
                ))}
              </div>
            </div>
          </div>

          <div className="reviews-actions">
            <a className="reviews-link" href={googleReviewsUrl} target="_blank" rel="noreferrer">
              <GoogleMark />
              Voir tous les avis sur Google
            </a>
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

        {/* Section "Voyages signature" masquee pour l'instant - decommenter pour la reactiver.
        <section className="section signature">
          <div className="section-title">
            <p className="eyebrow">Offres favorites</p>
            <h2>
              Voyages <span>signature</span>
            </h2>
            <p>Les annonces importantes restent visibles avec prix, dates et lien de reservation.</p>
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
        */}

        <section className="section gallery" id="galerie">
          <div className="section-title centered">
            <p className="eyebrow">Souvenirs</p>
            <h2>
              EcoTrips <span>au fil des voyages</span>
            </h2>
            <p>Photos et vidéos prises pendant nos sorties. Clique pour agrandir.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <button
                className="gallery-tile"
                key={item.src}
                type="button"
                aria-label={`Agrandir: ${item.alt}`}
                onClick={() => setLightbox(index)}
              >
                {item.type === "video" ? (
                  <>
                    <video src={`${item.src}#t=0.1`} muted playsInline preload="metadata" />
                    <span className="gallery-play" aria-hidden="true" />
                  </>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 760px) 50vw, (max-width: 1080px) 33vw, 25vw"
                  />
                )}
              </button>
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

        {/* Section "Plusieurs facons d'explorer" masquee pour l'instant - decommenter pour la reactiver.
        <section className="more-ways">
          <div className="section-title centered">
            <p className="eyebrow">Formats de voyage</p>
            <h2>
              Plusieurs facons <span>d&apos;explorer</span>
            </h2>
          </div>
          <div className="ways-grid">
            <article>
              <Image src="/assets/hero-morocco.jpg" alt="Voyages entre femmes" width={1800} height={980} sizes="(max-width: 1080px) 100vw, 50vw" />
              <h3>Voyages en groupe feminin</h3>
              <p>Sorties ouvertes aux voyageuses qui veulent rejoindre un groupe.</p>
            </article>
            <article>
              <Image
                src="/assets/brand-cover.png"
                alt="Itineraires personnalises"
                width={1080}
                height={1080}
                sizes="(max-width: 1080px) 100vw, 50vw"
              />
              <h3>Itineraires sur mesure</h3>
              <p>Programmes personnalises pour un groupe prive.</p>
            </article>
          </div>
        </section>
        */}
      </main>

      {lightbox !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie EcoTrips Women"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="lightbox-close" type="button" aria-label="Fermer" onClick={closeLightbox}>
            <span aria-hidden="true">×</span>
          </button>

          <button
            className="lightbox-nav prev"
            type="button"
            aria-label="Média précédent"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
          >
            <span aria-hidden="true">‹</span>
          </button>

          <figure className="lightbox-stage" onClick={(event) => event.stopPropagation()}>
            {gallery[lightbox].type === "video" ? (
              <video src={gallery[lightbox].src} controls autoPlay playsInline />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={gallery[lightbox].src} alt={gallery[lightbox].alt} />
            )}
            <figcaption>
              <span>{gallery[lightbox].alt}</span>
              <small>
                {lightbox + 1} / {gallery.length}
              </small>
            </figcaption>
          </figure>

          <button
            className="lightbox-nav next"
            type="button"
            aria-label="Média suivant"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}

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
          <a href="#avis">Avis</a>
          <a href="#contact">Contact</a>
        </nav>
      </footer>
    </>
  );
}
