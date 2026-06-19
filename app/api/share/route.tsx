import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_CUPOS = 32;

type MC = {
  alias?: string;
  nombre?: string;
  visible?: boolean;
};

const FIRST_REVEAL_AT_UTC = Date.UTC(2026, 3, 28, 23, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;
const MC_PER_DROP = 2;

function getVisibleCount(total: number, now = Date.now()) {
  if (now < FIRST_REVEAL_AT_UTC) return 0;

  const dropsPassed = Math.floor((now - FIRST_REVEAL_AT_UTC) / DAY_MS) + 1;
  return Math.min(total, dropsPassed * MC_PER_DROP, MAX_CUPOS);
}

async function getMcs(): Promise<MC[]> {
  try {
    const sheetsUrl = process.env.SHEETS_GET_URL;

    if (!sheetsUrl) return [];

    const res = await fetch(sheetsUrl, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data.slice(0, MAX_CUPOS) : [];
    const visibleCount = getVisibleCount(data.length);

    return data.map((mc: MC, index: number) => ({
      ...mc,
      visible: index < visibleCount,
    }));
  } catch {
    return [];
  }
}

function getMcName(mc: MC) {
  return String(mc.alias || mc.nombre || "MC").trim();
}

async function loadFont(url: string) {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET() {
  const mcs = await getMcs();
  const visibles = mcs.filter((mc) => mc.visible).slice(0, MAX_CUPOS);
  const names = visibles.map(getMcName);

  while (names.length < MAX_CUPOS) {
    names.push("MC");
  }

  const [displayFont, bodyFont] = await Promise.all([
    loadFont("https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm0K0.ttf"),
    loadFont("https://fonts.gstatic.com/s/oswald/v57/TK3_WkUHHAIjg75cFRf3bXL8LICs1xZogUE.ttf"),
  ]);

  const fontOptions = [
    ...(displayFont
      ? [
          {
            name: "Display",
            data: displayFont,
            weight: 400 as const,
            style: "normal" as const,
          },
        ]
      : []),
    ...(bodyFont
      ? [
          {
            name: "Body",
            data: bodyFont,
            weight: 700 as const,
            style: "normal" as const,
          },
        ]
      : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#030303",
          color: "#ffffff",
          padding: 54,
          fontFamily: bodyFont ? "Body" : "Arial",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -70,
            left: -120,
            width: 1400,
            height: 260,
            backgroundColor: "#facc15",
            opacity: 0.18,
            transform: "rotate(-10deg)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 110,
            right: -220,
            width: 1300,
            height: 230,
            backgroundColor: "#facc15",
            opacity: 0.12,
            transform: "rotate(-10deg)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 2,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: displayFont ? "Display" : "Arial",
                  fontSize: 48,
                  fontWeight: 400,
                  color: "#facc15",
                }}
              >
                PILA DE RA&apos;
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#d4d4d8",
                  letterSpacing: 3,
                }}
              >
                ¡LA PLAZA SIGUE VIVA!
              </div>
            </div>

            <div
              style={{
                display: "flex",
                backgroundColor: "#facc15",
                color: "#000000",
                borderRadius: 999,
                padding: "14px 24px",
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              32/32 MCs
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 58,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: displayFont ? "Display" : "Arial",
                fontSize: 132,
                fontWeight: 400,
                lineHeight: 0.88,
                color: "#ffffff",
              }}
            >
              LINEUP
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: displayFont ? "Display" : "Arial",
                fontSize: 132,
                fontWeight: 400,
                lineHeight: 0.88,
                color: "#facc15",
              }}
            >
              COMPLETO
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 31,
                fontWeight: 900,
                color: "#ffffff",
              }}
            >
              Los 32 MCs ya fueron revelados
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              width: "100%",
            }}
          >
            {["30 DE MAYO, 2026", "3:00 PM", "ESTACION DEL METRO CASANDRA DAMIRÓN"].map((text) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  backgroundColor: "rgba(250,204,21,0.14)",
                  border: "1px solid rgba(250,204,21,0.35)",
                  color: "#fef3c7",
                  borderRadius: 24,
                  padding: "18px 22px",
                  marginRight: 14,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                {text}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              marginTop: 42,
              width: "100%",
              backgroundColor: "rgba(0,0,0,0.66)",
              border: "1px solid rgba(250,204,21,0.25)",
              borderRadius: 38,
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#facc15",
                  letterSpacing: 3,
                }}
              >
                ROSTER OFICIAL
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#a1a1aa",
                }}
              >
                COMPARTE TU FAVORITO
              </div>
            </div>

            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  flex: 1,
                  marginBottom: rowIndex === 7 ? 0 : 12,
                }}
              >
                {Array.from({ length: 4 }).map((_, colIndex) => {
                  const index = rowIndex * 4 + colIndex;
                  const name = names[index] || "MC";

                  return (
                    <div
                      key={`${name}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        marginRight: colIndex === 3 ? 0 : 12,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(250,204,21,0.22)",
                        borderRadius: 18,
                        padding: "10px 8px",
                        fontSize: name.length > 12 ? 22 : 27,
                        fontWeight: 900,
                        color: "#ffffff",
                        textAlign: "center",
                      }}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 34,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: displayFont ? "Display" : "Arial",
                fontSize: 62,
                fontWeight: 400,
                color: "#ffffff",
              }}
            >
              ¿QUIEN SE LLEVA LA PILA? 🔋
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 16,
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#facc15",
                }}
              >
                VAMO&apos; A PRENDER LA PLAZA!
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#d4d4d8",
                }}
              >
                piladerap.vercel.app
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fontOptions,
    }
  );
}