export type TimeOfDay = { hours: number; minutes: number };

/**
 * Interpreta la hora tal como se guarda en Sheets: "3:00 PM", "8:00 am",
 * o 24h "15:00". Devuelve null si el string no matchea nada reconocible
 * (en vez de producir horas/minutos NaN que corromperían el Date).
 */
export function parseTimeOfDay(horaEvento: string): TimeOfDay | null {
  if (!horaEvento) return null;
  const match = horaEvento.trim().match(/^(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const meridiem = match[3]?.toUpperCase().replace(/[.\s]/g, "");
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Combina fechaEvento ("2026-08-02" o ISO completo) + horaEvento en un Date
 * real. Si horaEvento no matchea un formato reconocible, se ignora (el
 * evento queda a medianoche) en vez de invalidar toda la fecha.
 */
export function parseEventDate(fechaEvento: string, horaEvento: string): Date | null {
  if (!fechaEvento) return null;
  try {
    const base = fechaEvento.includes("T") ? fechaEvento : fechaEvento + "T00:00:00";
    const d = new Date(base);
    if (isNaN(d.getTime())) return null;

    const time = parseTimeOfDay(horaEvento);
    if (time) d.setHours(time.hours, time.minutes, 0, 0);

    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
