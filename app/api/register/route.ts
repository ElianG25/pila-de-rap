import { NextResponse } from "next/server";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function getErrorStatus(error: string) {
  if (error === "INSCRIPCIONES_CERRADAS") return 403;
  if (error === "CUPOS_AGOTADOS") return 409;
  if (error === "YA_INSCRITO") return 409;
  if (error === "TELEFONO_INVALIDO") return 400;
  if (error === "CAMPOS_INCOMPLETOS") return 400;
  return 400;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nombre = String(body.nombre ?? "").trim();
    const alias = String(body.alias ?? "").trim();
    const telefono = normalizePhone(body.telefono);
    const instagram = String(body.instagram ?? "").trim();
    const fecha = String(body.fecha ?? "FECHA 1 | 30 de mayo").trim();

    if (!nombre || !alias || !telefono) {
      return NextResponse.json(
        { error: "CAMPOS_INCOMPLETOS" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(telefono)) {
      return NextResponse.json(
        { error: "TELEFONO_INVALIDO" },
        { status: 400 }
      );
    }

    if (!process.env.SHEETS_WEBHOOK) {
      throw new Error("Missing SHEETS_WEBHOOK");
    }

    const payload = {
      nombre,
      alias,
      telefono,
      instagram,
      fecha,
    };

    const res = await fetch(process.env.SHEETS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const raw = await res.text();
    let data: {
      ok?: boolean;
      error?: string;
      restantes?: number;
    } = {};

    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse error:", err, raw);

      return NextResponse.json(
        { error: "RESPUESTA_INVALIDA_SHEETS" },
        { status: 500 }
      );
    }

    if (!data.ok) {
      const error = data.error || "ERROR_SHEETS";

      return NextResponse.json(
        {
          error,
          restantes: data.restantes ?? null,
        },
        { status: getErrorStatus(error) }
      );
    }

    const mensaje = `🔥 Gracias por inscribirte en Pila de Ra', *${alias}*

🎤 Nos vemos en la plaza

📍 *Ubicación:*
https://maps.app.goo.gl/YBgeMyMwmDQ6AqhE8

💰 *Inscripción:* $200
🕒 *Hora:* 3:00 PM
📆 *Fecha:* ${fecha}

🏆 *PREMIOS*
🥇 Medalla + efectivo
🥈 Medalla

⚠️ Llega temprano y *confírmame tu asistencia*.`;

    const encodedMessage = encodeURIComponent(mensaje);
    const whatsappLink = `https://api.whatsapp.com/send?phone=1${telefono}&text=${encodedMessage}`;

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

👤 <b>Nombre:</b> ${escapeHtml(nombre)}
🎤 <b>Alias:</b> ${escapeHtml(alias)}
📱 <b>Teléfono:</b> ${escapeHtml(telefono)}
📸 <b>Instagram:</b> ${escapeHtml(instagram || "No IG ❌")}
📆 <b>Evento:</b> ${escapeHtml(fecha)}

👉 <a href="${escapeHtml(whatsappLink)}">Escribir por WhatsApp</a>
            `,
          }),
          cache: "no-store",
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
      { error: "ERROR_INTERNO" },
      { status: 500 }
    );
  }
}