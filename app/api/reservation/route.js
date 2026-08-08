// Recoit une reservation du formulaire et l'ajoute a la Google Sheet.
// L'adresse du script Google est un secret: elle reste sur le serveur, jamais
// dans le navigateur.
const FIELDS = ["offer", "firstName", "lastName", "city", "phone", "departureDate"];

const MAX_LENGTH = 200;

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

  row.receivedAt = new Date().toISOString();

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
      // Google Apps Script repond parfois lentement au premier appel.
      signal: AbortSignal.timeout(8000),
    });

    const text = await response.text();

    if (!response.ok) {
      return failed(`google-${response.status}`, `Google a repondu ${response.status}`);
    }

    // Un code 200 ne suffit pas: quand le script n'est pas publie en acces
    // "Tout le monde", Google renvoie une page de connexion en HTML, avec un
    // 200. Sans cette verification le site croirait la ligne enregistree.
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      const cause = /accounts\.google\.com|<form|Sign in|Connexion/i.test(text)
        ? "google-login"
        : "google-not-json";
      return failed(
        cause,
        cause === "google-login"
          ? "Le script Google n'est pas accessible publiquement: redeploie-le avec " +
              '"Qui a acces = Tout le monde".'
          : "Le script Google n'a pas renvoye de JSON."
      );
    }

    if (payload?.ok !== true) {
      return failed("google-error", `Le script Google a repondu: ${text.slice(0, 200)}`);
    }

    return Response.json({ saved: true });
  } catch (error) {
    return failed("upstream", error.message);
  }
}

// Une panne de la feuille ne doit jamais empecher une cliente de reserver: on
// repond 200 pour que le formulaire bascule sur son ecran WhatsApp de secours.
function failed(reason, message) {
  console.error(`Enregistrement dans la Google Sheet impossible (${reason}):`, message);
  return Response.json({ saved: false, reason }, { status: 200 });
}
