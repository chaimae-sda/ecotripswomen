import Home from "./home";
import { getSiteContent } from "../lib/content";

// Le contenu est relu au maximum toutes les 60 secondes: une modification faite
// dans le Studio apparait sur le site en moins d'une minute.
export const revalidate = 60;

export default async function HomePage() {
  const content = await getSiteContent();
  return <Home content={content} />;
}
