import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityEnabled } from "./env";

export const client = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Sans CDN: au moment du build, la liste des voyages doit etre exacte,
      // sinon une offre tout juste publiee n'obtient pas sa page de detail. Le
      // site ne relit de toute facon Sanity qu'une fois par minute (revalidate).
      useCdn: false,
      perspective: "published",
    })
  : null;
