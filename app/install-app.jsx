"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const REQUETE_AUTONOME = "(display-mode: standalone)";

// useSyncExternalStore est l'outil prevu par React pour lire un etat du
// navigateur: il renvoie false pendant le rendu serveur, puis la vraie valeur
// sur l'appareil, sans double rendu ni avertissement d'hydratation.
function useAutonome() {
  return useSyncExternalStore(
    (rafraichir) => {
      const mq = window.matchMedia(REQUETE_AUTONOME);
      mq.addEventListener("change", rafraichir);
      return () => mq.removeEventListener("change", rafraichir);
    },
    () => window.matchMedia(REQUETE_AUTONOME).matches || window.navigator.standalone === true,
    () => false
  );
}

function useIOS() {
  return useSyncExternalStore(
    () => () => {},
    () =>
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      // iPadOS se declare comme un Mac: on le reconnait a l'ecran tactile.
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    () => false
  );
}

// Bouton « Installer l'application ».
//
// Chrome, Edge et Android previennent le site quand l'installation est possible
// (evenement beforeinstallprompt): on affiche alors un vrai bouton.
// Safari sur iPhone et iPad ne propose rien automatiquement: il faut passer par
// le menu Partager, donc on affiche la marche a suivre.
export default function InstallApp() {
  const [invite, setInvite] = useState(null);
  const [aideVisible, setAideVisible] = useState(false);
  const autonome = useAutonome();
  const iOS = useIOS();

  useEffect(() => {
    function surInvite(event) {
      // Sans preventDefault, Chrome affiche sa propre banniere.
      event.preventDefault();
      setInvite(event);
    }

    function surInstallation() {
      setInvite(null);
    }

    window.addEventListener("beforeinstallprompt", surInvite);
    window.addEventListener("appinstalled", surInstallation);

    return () => {
      window.removeEventListener("beforeinstallprompt", surInvite);
      window.removeEventListener("appinstalled", surInstallation);
    };
  }, []);

  async function installer() {
    if (!invite) return;
    invite.prompt();
    await invite.userChoice;
    // L'invite ne peut servir qu'une fois.
    setInvite(null);
  }

  // Deja installee, ou appareil qui ne sait pas installer: rien a proposer.
  if (autonome) return null;
  if (!invite && !iOS) return null;

  return (
    <div className="install-app">
      <button
        className="install-btn"
        type="button"
        onClick={() => (iOS ? setAideVisible((v) => !v) : installer())}
        aria-expanded={iOS ? aideVisible : undefined}
      >
        <span aria-hidden="true">⬇</span> Installer l&apos;application
      </button>

      {iOS && aideVisible ? (
        <p className="install-help">
          Sur iPhone : touche le bouton <strong>Partager</strong> en bas de Safari, puis{" "}
          <strong>Sur l&apos;écran d&apos;accueil</strong>.
        </p>
      ) : null}
    </div>
  );
}
