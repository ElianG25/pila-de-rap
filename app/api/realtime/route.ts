import { NextRequest } from "next/server";

const MC_PER_DROP = 2;
const FIRST_REVEAL_AT_UTC = Date.UTC(2026, 3, 28, 23, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function getNextRevealAt(now = Date.now()) {
  if (now < FIRST_REVEAL_AT_UTC) return FIRST_REVEAL_AT_UTC;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return FIRST_REVEAL_AT_UTC + dropsPassed * DAY_MS;
}

function getHypeCount(now = Date.now()) {
  const minutes = Math.floor(now / 60000);
  const wave = Math.abs(Math.sin(minutes / 11)) * 140;
  const pulse = Math.abs(Math.cos(minutes / 5)) * 45;
  return Math.round(420 + wave + pulse);
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const now = Date.now();
        const payload = {
          serverTime: now,
          nextRevealAt: getNextRevealAt(now),
          hypeCount: getHypeCount(now),
          mcPerDrop: MC_PER_DROP,
        };

        controller.enqueue(
          encoder.encode(`event: tick\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      send();
      const interval = setInterval(send, 1000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
