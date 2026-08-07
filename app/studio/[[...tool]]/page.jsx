import { sanityEnabled } from "../../../sanity/env";
import StudioClient from "./studio-client";

export const dynamic = "force-static";

export const metadata = {
  title: "Administration EcoTrips Women",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <div style={{ padding: "60px 24px", fontFamily: "system-ui", maxWidth: 640, margin: "0 auto" }}>
        <h1>Espace d&apos;administration pas encore connecté</h1>
        <p>
          Il manque l&apos;identifiant du projet Sanity. Crée un fichier <code>.env.local</code> à la
          racine du site avec ces deux lignes, puis relance le serveur :
        </p>
        <pre style={{ background: "#f4f4f6", padding: 16, borderRadius: 8, overflowX: "auto" }}>
          {"NEXT_PUBLIC_SANITY_PROJECT_ID=ton-identifiant\nNEXT_PUBLIC_SANITY_DATASET=production"}
        </pre>
        <p>
          L&apos;identifiant se trouve sur <a href="https://sanity.io/manage">sanity.io/manage</a>,
          dans les réglages de ton projet.
        </p>
      </div>
    );
  }

  return <StudioClient />;
}
