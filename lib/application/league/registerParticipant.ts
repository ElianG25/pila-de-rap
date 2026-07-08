import { submitRegistrationRaw } from "@/lib/infrastructure/sheets/sheetsClient";
import { notifyRegistration } from "@/lib/infrastructure/telegram/telegramNotifier";

export type RegisterParticipantInput = {
  nombre: string;
  alias: string;
  telefono: string;
  instagram: string;
  eventId: string;
};

export type RegisterParticipantResult =
  | { ok: true; restantes: number | null | undefined }
  | { ok: false; error: string; restantes: number | null | undefined };

/**
 * Caso de uso: registrar un participante. Envía la inscripción a Sheets y,
 * si se aceptó, dispara la notificación de Telegram (best-effort, no bloquea
 * la respuesta). La validación de forma del input (campos completos, formato
 * de teléfono) es responsabilidad del adaptador HTTP que llama a esto.
 */
export async function registerParticipant(
  input: RegisterParticipantInput
): Promise<RegisterParticipantResult> {
  const response = await submitRegistrationRaw(input);

  if (!response.ok) {
    return { ok: false, error: response.error || "ERROR_SHEETS", restantes: response.restantes ?? null };
  }

  notifyRegistration(input);

  return { ok: true, restantes: response.restantes };
}
