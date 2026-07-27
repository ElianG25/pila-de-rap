/** ¿"fechaEvento" cae el mismo día calendario que "now"? Pura — "now" se pasa explícito para poder testear. */
export function isEventToday(fechaEvento: string, now: Date): boolean {
  if (!fechaEvento) return false;
  const base = fechaEvento.includes("T") ? fechaEvento : fechaEvento + "T00:00:00";
  const eventDate = new Date(base);
  if (isNaN(eventDate.getTime())) return false;

  return (
    eventDate.getFullYear() === now.getFullYear() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getDate() === now.getDate()
  );
}
