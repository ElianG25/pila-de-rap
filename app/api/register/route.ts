import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validación básica
        if (!body.nombre || !body.alias || !body.telefono) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        const phoneRegex = /^\d{10}$/;

        if (!phoneRegex.test(body.telefono)) {
            return NextResponse.json(
                { error: "Teléfono inválido (debe tener 10 dígitos)" },
                { status: 400 }
            );
        }

        // 👉 Enviar a Google Sheets (Apps Script)
        const sheetsRes = await fetch(process.env.SHEETS_WEBHOOK!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!sheetsRes.ok) {
            throw new Error("Error en Sheets");
        }

        const mensaje = `🔥 Gracias por inscribirte en Pila de Ra', *${body.alias}*

🎤 Nos vemos en la plaza

📍 *Ubicación:*
https://maps.app.goo.gl/YBgeMyMwmDQ6AqhE8

💰 *Inscripción:* $200
🕒 *Hora:* 3:00 PM

🏆 *PREMIOS*
🥇 Medalla + efectivo
🥈 Medalla

⚠️ Llega temprano y *confírmame tu asistencia*.`;

        const encodedMessage = encodeURIComponent(mensaje);
        const whatsappLink = `https://api.whatsapp.com/send?phone=1${body.telefono}&text=${encodedMessage}`;

        // 👉 Notificación Telegram
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
🔥 <b>NUEVA INSCRIPCION</b>

👤 <b>Nombre:</b> ${body.nombre}
🎤 <b>Alias:</b> ${body.alias}
📱 <b>Teléfono:</b> ${body.telefono}
📸 <b>Instagram:</b> ${body.instagram || "No IG ❌"}
📆 <b>Evento:</b> ${body.fecha || "FECHA 1 | 30 de mayo"}

👉 <a href="${whatsappLink}">Escribir por WhatsApp</a>
      `,
                }),
            }
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        );
    }
}