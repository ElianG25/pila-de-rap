function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type RegistrationNotification = {
  nombre: string;
  alias: string;
  telefono: string;
  instagram: string;
  eventId: string;
};

/** Notificación best-effort a Telegram; no bloquea la respuesta al cliente. */
export function notifyRegistration(input: RegistrationNotification): void {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const whatsappLink =
    "https://api.whatsapp.com/send?phone=1" +
    input.telefono +
    "&text=" +
    encodeURIComponent("Inscripcion recibida en Pila de Ra' - " + input.alias);

  fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "HTML",
      text:
        "<b>NUEVA INSCRIPCION</b>\n\n" +
        "<b>Nombre:</b> " + escapeHtml(input.nombre) + "\n" +
        "<b>Alias:</b> " + escapeHtml(input.alias) + "\n" +
        "<b>Telefono:</b> " + escapeHtml(input.telefono) + "\n" +
        "<b>Instagram:</b> " + escapeHtml(input.instagram || "ninguno") + "\n" +
        (input.eventId ? "<b>Evento:</b> " + escapeHtml(input.eventId) + "\n" : "") +
        "\n<a href=\"" + escapeHtml(whatsappLink) + "\">WhatsApp</a>",
    }),
    cache: "no-store",
  }).catch((err: unknown) => console.error("Telegram error:", err));
}
