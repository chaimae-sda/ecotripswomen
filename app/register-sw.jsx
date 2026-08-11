"use client";

import { useEffect } from "react";

// Enregistre le service worker. Sans lui, les navigateurs ne proposent pas
// l'installation de l'application.
//
// Uniquement en production: en developpement, les fichiers de /_next/static
// gardent le meme nom d'une modification a l'autre. Les mettre en cache y
// ferait tourner une ancienne version du site sans qu'on comprenne pourquoi.
// En production ces fichiers portent un nom unique par version, le cache est
// alors sans danger.
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Menage: un service worker installe lors d'un test precedent continuerait
      // sinon de servir de vieux fichiers pendant le developpement.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) reg.unregister();
      });
      return;
    }

    // On attend la fin du chargement: l'enregistrement ne doit pas retarder
    // l'affichage de la page.
    function enregistrer() {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker non enregistre:", error.message);
      });
    }

    if (document.readyState === "complete") enregistrer();
    else window.addEventListener("load", enregistrer, { once: true });
  }, []);

  return null;
}
