// Icones des reseaux sociaux, dessinees en SVG: elles restent nettes a toutes
// les tailles et prennent la couleur du texte, sans fichier image a charger.
const ICONES = {
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14.5 8.5h2.2V5.6h-2.6c-2.3 0-3.7 1.4-3.7 3.7v1.9H8.1v2.9h2.3V21h3v-6.9h2.3l.4-2.9h-2.7V9.6c0-.7.4-1.1 1.1-1.1z" />
  ),
  tiktok: (
    <path d="M16.6 3h-2.9v12.1a2.5 2.5 0 1 1-2-2.4V9.6a5.6 5.6 0 1 0 5 5.5V9.4a6.4 6.4 0 0 0 3.7 1.2V7.7a3.6 3.6 0 0 1-3.8-3.6V3z" />
  ),
  youtube: (
    <>
      <rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4" />
      <path d="M10.4 9.6l5 2.4-5 2.4V9.6z" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function SocialLinks({ settings }) {
  const reseaux = [
    { cle: "instagram", url: settings.instagramUrl, nom: "Instagram" },
    { cle: "facebook", url: settings.facebookUrl, nom: "Facebook" },
    { cle: "tiktok", url: settings.tiktokUrl, nom: "TikTok" },
    { cle: "youtube", url: settings.youtubeUrl, nom: "YouTube" },
  ].filter((reseau) => reseau.url);

  if (!reseaux.length) return null;

  return (
    <ul className="social-links">
      {reseaux.map((reseau) => (
        <li key={reseau.cle}>
          <a
            href={reseau.url}
            aria-label={`EcoTrips Women sur ${reseau.nom}`}
            target="_blank"
            // noreferrer: le site vers lequel on part ne doit pas pouvoir
            // reprendre la main sur l'onglet d'origine.
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {ICONES[reseau.cle]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
