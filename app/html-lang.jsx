"use client";

import { useEffect } from "react";

// L'attribut lang de <html> est pose par la mise en page racine, commune aux
// deux langues. Sans un vrai second layout (impossible sans deplacer toutes les
// pages francaises), on le corrige des l'arrivee sur une page anglaise.
//
// Le referencement ne repose pas dessus: ce sont les balises hreflang, deja
// posees, qui indiquent la langue a Google.
export default function HtmlLang({ lang }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
