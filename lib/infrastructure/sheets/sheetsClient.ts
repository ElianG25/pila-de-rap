/**
 * Único punto de contacto HTTP con el Web App de Apps Script. Nadie más en
 * el proyecto debe leer `SHEETS_GET_URL` ni hacer fetch a Sheets directamente
 * — así, si el backend cambia de transporte, solo se toca este archivo.
 */
export class SheetsConfigError extends Error {
  constructor(message = "SHEETS_GET_URL no configurado") {
    super(message);
    this.name = "SheetsConfigError";
  }
}

export class SheetsUnavailableError extends Error {
  constructor(message = "Error al conectar con la base de datos") {
    super(message);
    this.name = "SheetsUnavailableError";
  }
}

export class SheetsInvalidResponseError extends Error {
  constructor(message = "RESPUESTA_INVALIDA_SHEETS") {
    super(message);
    this.name = "SheetsInvalidResponseError";
  }
}

export function isSheetsConfigured(): boolean {
  return Boolean(process.env.SHEETS_GET_URL);
}

function requireSheetsUrl(): string {
  const url = process.env.SHEETS_GET_URL;
  if (!url) throw new SheetsConfigError();
  return url;
}

/** Payload crudo del `doGet()` del Apps Script — sin validar ni tipar todavía. */
export async function fetchLeaguePayloadRaw(revalidateSeconds: number): Promise<unknown> {
  const url = requireSheetsUrl();
  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) throw new SheetsUnavailableError();
  return response.json();
}

export type RegistrationSheetPayload = {
  nombre: string;
  alias: string;
  telefono: string;
  instagram: string;
  eventId: string;
};

export type RegistrationSheetResponse = {
  ok?: boolean;
  error?: string;
  restantes?: number | null;
};

/** Envía la inscripción al `doPost()` del Apps Script. */
export async function submitRegistrationRaw(
  payload: RegistrationSheetPayload
): Promise<RegistrationSheetResponse> {
  const url = requireSheetsUrl();
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    cache: "no-store",
  });

  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    console.error("JSON parse error from Sheets:", raw);
    throw new SheetsInvalidResponseError();
  }
}
