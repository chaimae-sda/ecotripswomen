"use client";

import { useEffect } from "react";

// Enregistre le service worker. Sans lui, les navigateurs ne proposent pas
// l'installation de l'application.
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

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
