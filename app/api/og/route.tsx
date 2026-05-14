import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_CUPOS = 32;
const MAX_VISIBLE_NAMES = 18;

type MC = {
  alias?: string;
  nombre?: string;
  visible?: boolean;
};

type McsResponse = {
  data?: MC[];
  revealed?: number;
  max?: number;
  isRosterComplete?: boolean;
  nextRevealHour?: string | null;
};

async function getMcs(): Promise<McsResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://piladerap.vercel.app";

  try {
    const res = await fetch(`${baseUrl}/api/mcs`, {
      cache: "no-store",
    });

    if (!res.ok) return {};

    return (await res.json()) as McsResponse;
  } catch {
    return {};
  }
}

function getMcName(mc: MC) {
  return String(mc.alias || mc.nombre || "MC").trim();
}

export async function GET() {
  const response = await getMcs();

  const mcs = Array.isArray(response.data) ? response.data : [];
  const max = response.max || MAX_CUPOS;

  const visibles = mcs
    .filter((mc) => mc.visible)
    .slice(0, MAX_VISIBLE_NAMES);

  const revealed = response.revealed ?? mcs.filter((mc) => mc.visible).length;

  const isRosterComplete =
    Boolean(response.isRosterComplete) || revealed >= MAX_CUPOS;

  const hiddenVisibleCount = Math.max(0, revealed - visibles.length);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          backgroundColor: "#000000",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: 60,
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 900,
              color: "#facc15",
            }}
          >
            PILA DE RAP
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: isRosterComplete ? "#facc15" : "#18181b",
              color: isRosterComplete ? "#000000" : "#fde68a",
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            {revealed}/{max} MCs
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {isRosterComplete ? "ROSTER COMPLETO" : "ROSTER REVELADO"}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 28,
            color: "#fde68a",
          }}
        >
          {isRosterComplete
            ? "Los 32 MCs ya fueron revelados"
            : `${revealed} MCs confirmados - Proximo drop 7:00 PM RD`}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 38,
            width: "100%",
          }}
        >
          {visibles.map((mc, index) => (
            <div
              key={`${getMcName(mc)}-${index}`}
              style={{
                display: "flex",
                backgroundColor: "#27272a",
                color: "#ffffff",
                borderRadius: 999,
                padding: "13px 22px",
                marginRight: 16,
                marginBottom: 16,
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {getMcName(mc)}
            </div>
          ))}

          {hiddenVisibleCount > 0 && (
            <div
              style={{
                display: "flex",
                backgroundColor: "#facc15",
                color: "#000000",
                borderRadius: 999,
                padding: "13px 22px",
                marginRight: 16,
                marginBottom: 16,
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              +{hiddenVisibleCount} mas
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "auto",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: 24,
            color: "#d4d4d8",
          }}
        >
          <div style={{ display: "flex" }}>
            {isRosterComplete ? "La lista esta completa" : "La plaza sigue viva"}
          </div>

          <div style={{ display: "flex" }}>piladerap.vercel.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}