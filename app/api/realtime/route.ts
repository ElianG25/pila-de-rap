// Ruta retirada: el contador de "reveal" en tiempo real ya no se usa en el front.
// Se conserva como 410 Gone para no romper clientes antiguos que aún la consulten.
export const dynamic = "force-static";

export function GET() {
  return new Response("Gone", { status: 410 });
}
