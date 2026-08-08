"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// En changeant de page on doit arriver tout en haut. Next le fait deja, mais le
// `scroll-behavior: smooth` de la feuille de style transforme ce retour en une
// animation que la navigation interrompt: on arrive alors au milieu de la page.
// `behavior: "instant"` ignore le reglage CSS et repositionne d'un coup.
export default function ScrollToTop() {
  const pathname = usePathname();
  const wentBack = useRef(false);

  // Retour arriere du navigateur: la position d'origine doit etre restauree,
  // c'est ce que le visiteur attend. On laisse alors Next faire son travail.
  useEffect(() => {
    function onPopState() {
      wentBack.current = true;
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (wentBack.current) {
      wentBack.current = false;
      return undefined;
    }

    // Un lien vers une ancre (/#offres) doit rejoindre sa section, pas le haut.
    if (window.location.hash) return undefined;

    // Next repositionne lui aussi la page a l'arrivee. On passe apres lui, sur
    // l'image suivante, sinon les deux se marchent dessus et on atterrit a
    // quelques pixels du haut.
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
