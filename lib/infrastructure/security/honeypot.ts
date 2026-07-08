/** Campo oculto que un humano nunca rellena; si viene con datos, es un bot. */
export function isHoneypotTriggered(value: unknown): boolean {
  return String(value ?? "").trim() !== "";
}
