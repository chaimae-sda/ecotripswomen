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

    if (!response.ok) throw new Error(`Google a repondu ${response.status}`);
    return Response.json({ saved: true });
  } catch (error) {
    // Une panne de la feuille ne doit jamais empecher une cliente de reserver.
    console.error("Enregistrement dans la Google Sheet impossible:", error.message);
    return Response.json({ saved: false, reason: "upstream" }, { status: 200 });
  }
}
