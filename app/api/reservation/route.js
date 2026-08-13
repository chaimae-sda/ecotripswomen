import { after } from "next/server";

// Recoit une reservation du formulaire et l'ajoute a la Google Sheet.
// L'adresse du script Google est un secret: elle reste sur le serveur, jamais
// dans le navigateur.
const FIELDS = ["offer", "firstName", "lastName", "city", "phone", "departureDate"];

// Large: Apps Script depasse regulierement les 25 secondes.
const GOOGLE_TIMEOUT = 45000;

// Laisse le temps a l'ecriture en arriere-plan de se terminer.
export const maxDuration = 60;

const MAX_LENGTH = 200;
// La liste des voyageuses peut etre longue: 12 personnes tiennent large.
const MAX_TRAVELLERS_LENGTH = 800;
const MAX_PEOPLE = 12;

export async function POST(request) {
  const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  // Tant que la feuille n'est pas branchee, on ne bloque pas la reservation:
  // le formulaire bascule sur WhatsApp comme avant.
  if (!webhook) {
    return Response.json({ saved: false, reason: "not-configured" }, { status: 200 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ saved: false, reason: "bad-request" }, { status: 400 });
  }

  const row = {};
  for (const field of FIELDS) {
    const value = typeof body?.[field] === "string" ? body[field].trim() : "";
    if (!value) {
      return Response.json({ saved: false, reason: `missing:${field}` }, { status: 400 });
    }
    row[field] = value.slice(0, MAX_LENGTH);
  }

  // Nombre de voyageuses et liste des noms. Facultatifs: une reservation
  // envoyee par une version plus ancienne du formulaire reste acceptee.
  const people = Number(body?.people);
  row.people = Number.isFinite(people) ? Math.min(MAX_PEOPLE, Math.max(1, Math.trunc(people))) : 1;

  const travellers = typeof body?.travellers === "string" ? body.travellers.trim() : "";
  row.travellers = travellers
    ? travellers.slice(0, MAX_TRAVELLERS_LENGTH)
    : `${row.firstName} ${row.lastName}`;

  row.receivedAt = new Date().toISOString();

  // Google Apps Script met couramment 20 a 30 secondes a repondre: la
  // requete passe par une redirection vers script.googleusercontent.com.
  // Faire patienter la cliente tout ce temps avant WhatsApp serait insupportable,
  // et l'annuler ferait perdre la reservation. On repond donc tout de suite et
  // l'ecriture se poursuit en arriere-plan, apres l'envoi de la reponse.
  after(() => envoyerAGoogle(webhook, row));

  return Response.json({ queued: true });
}

async function envoyerAGoogle(webhook, row) {
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(GOOGLE_TIMEOUT),
    });

    const text = await response.text();

    if (!response.ok) {
      return echec(`google-${response.status}`, `Google a repondu ${response.status}`, row);
    }

    // Un code 200 ne suffit pas: quand le script n'est pas publie en acces
    // "Tout le monde", Google renvoie une page de connexion en HTML, avec un
    // 200. Sans cette verification on croirait la ligne enregistree.
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      const cause = /accounts\.google\.com|<form|Sign in|Connexion/i.test(text)
        ? "google-login"
        : "google-not-json";
      return echec(
        cause,
        cause === "google-login"
          ? "Le script Google n'est pas accessible publiquement: redeploie-le avec " +
              '"Qui a acces = Tout le monde".'
          : "Le script Google n'a pas renvoye de JSON.",
        row
      );
    }

    if (payload?.ok !== true) {
      return echec("google-error", `Le script Google a repondu: ${text.slice(0, 200)}`, row);
    }

    return true;
  } catch (error) {
    return echec("upstream", error.message, row);
  }
}

// La reponse est deja partie: on ne peut plus prevenir la cliente. On journalise
// la reservation en entier pour qu'aucune demande ne soit perdue, meme si la
// feuille est injoignable.
function echec(reason, message, row) {
  console.error(
    `Enregistrement dans la Google Sheet impossible (${reason}): ${message}`,
    JSON.stringify(row)
  );
  return false;
}
