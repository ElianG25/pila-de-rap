/**
 * Códigos de error de negocio para la inscripción — fuente única compartida
 * entre el handler de la API (status HTTP) y la UI (mensaje al usuario).
 * Antes vivían duplicados como `getErrorStatus()` en la ruta y `ERR_MAP` en
 * el formulario; un código nuevo del backend solo se agrega acá.
 */
export const REGISTRATION_ERRORS: Record<string, { status: number; message: string }> = {
  NO_ACTIVE_EVENT: { status: 400, message: "No hay una fecha activa para inscribirse." },
  INSCRIPCIONES_CERRADAS: { status: 403, message: "Las inscripciones no están abiertas." },
  CAMPOS_INCOMPLETOS: { status: 400, message: "Completa nombre, AKA y teléfono." },
  TELEFONO_INVALIDO: { status: 400, message: "El teléfono debe tener 10 dígitos." },
  CUPOS_AGOTADOS: { status: 409, message: "Los cupos están agotados." },
  YA_INSCRITO: { status: 409, message: "Ese teléfono ya está inscrito para esta fecha." },
  HOJA_NO_EXISTE: { status: 400, message: "No se encontró la hoja de inscripciones." },
  RATE_LIMITED: { status: 429, message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
};

const DEFAULT_STATUS = 400;
const DEFAULT_MESSAGE = "No se pudo completar la inscripción.";

export function getErrorStatus(code: string): number {
  return REGISTRATION_ERRORS[code]?.status ?? DEFAULT_STATUS;
}

export function getErrorMessage(code: string): string {
  return REGISTRATION_ERRORS[code]?.message ?? DEFAULT_MESSAGE;
}
