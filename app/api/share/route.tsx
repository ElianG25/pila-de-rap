// Ruta retirada: la imagen de Instagram Story del "roster reveal" pre-temporada
// (v1) dependía de un formato de datos que el backend actual ya no expone —
// ver app/api/mcs/route.ts. Se conserva como 410 Gone para no romper
// clientes/bots que aún la consulten.
export const dynamic = "force-static";

export function GET() {
  return new Response("Gone", { status: 410 });
}
