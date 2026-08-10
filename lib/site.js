// Adresse publique du site, utilisee pour les liens absolus: partages sur les
// reseaux sociaux, plan du site, adresse canonique.
//
// C'est bien la version "www" qui fait foi: ecotripswomen.com redirige vers
// www.ecotripswomen.com. En cas de nouveau changement de domaine, il suffit de
// definir NEXT_PUBLIC_SITE_URL dans les variables d'environnement Vercel.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecotripswomen.com"
).replace(/\/$/, "");
