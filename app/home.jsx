"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { bookingMessage, whatsappLink } from "../lib/whatsapp";
import Lightbox from "./lightbox";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import TripCarousel from "./trip-carousel";

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

function SectionTitle({ heading, centered = true, id }) {
  if (!heading) return null;
  return (
    <div className={`section-title ${centered ? "centered" : ""}`}>
      {heading.eyebrow ? <p className="eyebrow">{heading.eyebrow}</p> : null}
      <h2 id={id}>
        {heading.title} {heading.highlight ? <span>{heading.highlight}</span> : null}
      </h2>
      {heading.text ? <p>{heading.text}</p> : null}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-head">
        {review.photo?.url ? (
          <Image className="review-avatar" src={review.photo.url} alt="" width={92} height={92} />
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
      {/* Pas d'attribut autoPlay: le navigateur l'interprete comme un ordre de
          telecharger la video tout de suite et ignore preload="none". Les trois
          videos (plus de 11 Mo) arrivaient donc des l'ouverture de la page, alors
          qu'elles sont tout en bas. C'est l'observateur ci-dessus qui lance la
          lecture, uniquement quand la video approche de l'ecran.
          L'image de couverture reste indispensable: sur iOS la lecture auto peut
          etre bloquee (mode economie d'energie). */}
      <video
        ref={ref}
        src={item.src}
        poster={item.poster || undefined}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
      />
      <span className="video-slot-play" aria-hidden="true" />
    </button>
  );
}

function formatPhone(phone) {
  const match = /^(\+\d{3})(\d{3})(\d{3})(\d{3})$/.exec(phone || "");
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone;
}

function instagramHandle(url) {
  const slug = (url || "").replace(/\/+$/, "").split("/").pop();
  return slug ? `@${slug}` : "";
}

export default function Home({ content }) {
  const { settings, offers, reviews, gallery, ui } = content;

  const [lightbox, setLightbox] = useState(null);

  const handle = instagramHandle(settings.instagramUrl);
  const featuredVideos = gallery.filter((item) => item.type === "video" && item.featured).slice(0, 3);
  const emptySlots = Math.max(0, 3 - featuredVideos.length);

  function handleSubmit(event) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email") || "";
    window.location.href = whatsappLink(
      settings.phone,
      `Bonjour EcoTrips Women, je veux recevoir les prochaines sorties. E-mail: ${email}`
    );
  }

  return (
    <>
      <SiteHeader settings={settings} />

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <Image
            className="hero-photo"
            src={settings.hero.photo.url}
            alt="Groupe de voyageuses EcoTrips Women"
            fill
            priority
            sizes="(max-width: 1180px) calc(100vw - 32px), 1180px"
          />
          <div className="hero-overlay" />
          <div className="hero-copy">
            <span className="hero-logo">
              <Image
                src={settings.logo.url}
                alt="EcoTrips Women"
                width={settings.logo.width}
                height={settings.logo.height}
                priority
              />
            </span>
            {/* Le sous-titre est dans le h1: c'est le titre principal de la
                page, celui que Google lit en premier pour comprendre le metier. */}
            <h1 id="hero-title">
              {settings.hero.title}
              {settings.hero.tagline ? (
                <span className="hero-tagline">{settings.hero.tagline}</span>
              ) : null}
            </h1>
            <p>{settings.hero.text}</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#offres">
                {settings.hero.primaryLabel}
              </a>
              <a className="ghost-btn" href={whatsappLink(settings.phone, bookingMessage())}>
                {settings.hero.secondaryLabel}
              </a>
            </div>
          </div>
        </section>

        <section className="promise-strip" aria-label="Pourquoi voyager avec EcoTrips Women">
          {settings.promises.map((promise) => (
            <article key={promise.title}>
              <strong>{promise.title}</strong>
              <p>{promise.text}</p>
            </article>
          ))}
        </section>

        <section className="section trips" id="offres">
          <SectionTitle heading={settings.offersTitle} />
          <TripCarousel
            offers={offers}
            phone={settings.phone}
            labels={settings.labels}
            guarantees={settings.guarantees}
            ui={ui}
          />
          <div className="trips-more">
            <Link className="primary-btn" href={`${ui.langue === "en" ? "/en" : ""}/offres`}>
              {settings.labels.allOffers}
            </Link>
          </div>
        </section>

        <section className="how-section" id="fonctionnement">
          <SectionTitle heading={settings.howTitle} />
          <div className="steps">
            {settings.steps.map((item, index) => (
              <article key={item.title}>
                <span>{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="stats-row">
            {settings.stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section wanderers" id="videos">
          <SectionTitle heading={settings.videosTitle} />
          <div className="video-row">
            {featuredVideos.map((item, position) => (
              <ScrollVideo
                key={item.src}
                item={item}
                tall={position === 1}
                onOpen={() => setLightbox(gallery.indexOf(item))}
              />
            ))}
            {/* Emplacements libres tant qu'il y a moins de 3 videos mises en avant. */}
            {Array.from({ length: emptySlots }).map((_, index) => (
              <div className="video-slot empty" key={`empty-${index}`} aria-hidden="true">
                <span />
              </div>
            ))}
          </div>
        </section>

        <section className="reviews" id="avis" aria-labelledby="reviews-title">
          <SectionTitle heading={settings.reviewsTitle} id="reviews-title" />

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
            <a
              className="reviews-link"
              href={settings.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <GoogleMark />
              Voir tous les avis sur Google
            </a>
          </div>
        </section>

        <section className="section gallery" id="galerie">
          <SectionTitle heading={settings.galleryTitle} />
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
                    <video src={item.src} poster={item.poster || undefined} muted playsInline preload="none" />
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

        <section className="community-band">
          <div>
            {settings.communityTitle?.eyebrow ? (
              <p className="eyebrow">{settings.communityTitle.eyebrow}</p>
            ) : null}
            <h2>
              {settings.communityTitle?.title}{" "}
              {settings.communityTitle?.highlight ? (
                <span>{settings.communityTitle.highlight}</span>
              ) : null}
            </h2>
            {settings.communityTitle?.text ? <p>{settings.communityTitle.text}</p> : null}
          </div>
          <a className="qr-card" href={settings.instagramUrl} aria-label="Ouvrir Instagram EcoTrips Women">
            <Image
              src={settings.qrCode.url}
              alt="QR code vers Instagram EcoTrips Women"
              width={260}
              height={260}
            />
            <span>{handle}</span>
          </a>
        </section>

        {settings.faq.length > 0 && (
          <section className="section faq" id="faq" aria-labelledby="faq-titre">
            <SectionTitle heading={settings.faqTitle} id="faq-titre" />
            <div className="faq-liste">
              {settings.faq.map((item) => (
                /* <details>: la reponse est dans le HTML meme repliee, donc lue
                   par Google, tout en gardant la page courte a l'ecran. */
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <span className="faq-plus" aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="newsletter" id="contact">
          <div>
            {settings.contactTitle?.eyebrow ? (
              <p className="eyebrow">{settings.contactTitle.eyebrow}</p>
            ) : null}
            <h2>
              {settings.contactTitle?.title}{" "}
              {settings.contactTitle?.highlight ? <span>{settings.contactTitle.highlight}</span> : null}
            </h2>
            {settings.contactTitle?.text ? <p>{settings.contactTitle.text}</p> : null}
            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="email" name="email" placeholder="Ton email" aria-label="Ton email" />
              <button type="submit">Envoyer</button>
            </form>
            <div className="contact-links">
              <a href={`tel:${settings.phone}`}>{formatPhone(settings.phone)}</a>
              <a href={settings.instagramUrl}>{handle}</a>
            </div>
          </div>
          <Image
            src={settings.contactImage.url}
            alt="Voyage EcoTrips Women"
            width={settings.contactImage.width}
            height={settings.contactImage.height}
            sizes="(max-width: 1080px) 100vw, 360px"
          />
        </section>
      </main>

      {lightbox !== null && (
        <Lightbox items={gallery} index={lightbox} onChange={setLightbox} ui={ui} />
      )}

      <SiteFooter settings={settings} />
    </>
  );
}
