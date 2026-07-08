// Ruta retirada: el "roster reveal" pre-temporada (v1) ya no existe en el front
// — la landing con McsView.tsx que lo consumía se reemplazó por el sistema de
// Liga/Eventos/Ranking. Se conserva como 410 Gone para no romper clientes/bots
// que aún la consulten.
export const dynamic = "force-static";

export function GET() {
  return new Response("Gone", { status: 410 });
}
