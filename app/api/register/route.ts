import { NextResponse } from "next/server";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre || !body.alias || !body.telefono) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(body.telefono)) {
      return NextResponse.json(
        { error: "Teléfono inválido (10 dígitos)" },
        { status: 400 }
      );
    }

    if (!process.env.SHEETS_WEBHOOK) {
      throw new Error("Missing SHEETS_WEBHOOK");
    }

    const res = await fetch(process.env.SHEETS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let data: any = {};

    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse error:", err, raw);
      return NextResponse.json(
        { error: "Respuesta inválida del backend Sheets" },
        { status: 500 }
      );
    }

    if (!data.ok) {
      return NextResponse.json(
        {
          error: data.error || "Error desconocido",
          restantes: data.restantes ?? null,
        },
        { status: 400 }
      );
    }

    const mensaje = `🔥 Gracias por inscribirte en Pila de Ra', *${body.alias}*

🎤 Nos vemos en la plaza

📍 *Ubicación:*
https://maps.app.goo.gl/YBgeMyMwmDQ6AqhE8

💰 *Inscripción:* $200
🕒 *Hora:* 3:00 PM
📆 *Fecha:* Sábado, 30 de mayo

🏆 *PREMIOS*
🥇 Medalla + efectivo
🥈 Medalla

⚠️ Llega temprano y *confírmame tu asistencia*.`;

    const encodedMessage = encodeURIComponent(mensaje);
    const whatsappLink = `https://api.whatsapp.com/send?phone=1${body.telefono}&text=${encodedMessage}`;

    if (process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            parse_mode: "HTML",
            text: `
🔥 <b>NUEVA INSCRIPCIÓN</b>

👤 <b>Nombre:</b> ${escapeHtml(body.nombre)}
🎤 <b>Alias:</b> ${escapeHtml(body.alias)}
📱 <b>Teléfono:</b> ${escapeHtml(body.telefono)}
📸 <b>Instagram:</b> ${escapeHtml(body.instagram || "No IG ❌")}
📆 <b>Evento:</b> ${escapeHtml(body.fecha || "FECHA 1 | 30 de mayo")}

👉 <a href="${escapeHtml(whatsappLink)}">Escribir por WhatsApp</a>
            `,
          }),
        }
      );
    }

    return NextResponse.json({
      ok: true,
      restantes: data.restantes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
