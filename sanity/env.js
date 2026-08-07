export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

// Tant que l'identifiant de projet n'est pas renseigne dans .env.local, le site
// continue de fonctionner avec le contenu de secours (lib/fallback-content.js).
export const sanityEnabled = Boolean(projectId);
