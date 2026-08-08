// Toutes les reservations passent par WhatsApp: on construit ici le lien
// wa.me avec le message deja ecrit.
export function whatsappLink(phone, message) {
  const number = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function bookingMessage(offer) {
  if (!offer) return "Bonjour EcoTrips Women, je veux réserver une place";
  return offer.message || `Bonjour EcoTrips Women, je veux réserver ${offer.title}`;
}
