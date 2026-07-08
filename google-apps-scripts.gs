// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetRowsByHeader(sheetName) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(sheetName);

  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => String(h || "").trim());

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const item = {};
      headers.forEach((header, i) => {
        if (!header) return;
        const value = row[i];
        item[header] =
          value instanceof Date
            ? Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss")
            : value === true  ? "TRUE"
            : value === false ? "FALSE"
            : String(value || "").trim();
      });
      return item;
    });
}

function toBool(value) {
  return value === true || String(value || "").toLowerCase() === "true";
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ─── League readers ────────────────────────────────────────────────────────────

function getLeagueConfig() {
  const defaults = {
    siteStatus:             "active",
    activeEventId:          "",
    featuredEventId:        "",
    latestCompletedEventId: "",
    showRanking:            "TRUE",
    showBattles:            "TRUE",
    showRoster:             "TRUE",
    showEvents:             "TRUE",
    brandName:              "Pila de Ra'",
    brandSlogan:            "Vamo' a prender la plaza",
    registrationMode:       "presencial",
    defaultMaxSlots:        "32",
    youtubeLiveUrl:         "",
    instagramUrl:           "",
    whatsappUrl:            "",
    backgroundVideoId:      "",
  };

  getSheetRowsByHeader("Config").forEach((row) => {
    const key = String(row.key || "").trim();
    const val = String(row.value || "").trim();
    if (key) defaults[key] = val;
  });

  return defaults;
}

function getLeagueEvents() {
  return getSheetRowsByHeader("Eventos")
    .map((e) => ({
      eventId:              e.eventId || "",
      numero:               toNumber(e.numero, 0),
      titulo:               e.titulo || "",
      label:                e.label || "",
      estado:               e.estado || "futura",
      fechaEvento:          e.fechaEvento || "",
      horaEvento:           e.horaEvento || "",
      ubicacion:            e.ubicacion || "",
      maxCupos:             toNumber(e.maxCupos, 32),
      campeon:              e.campeon || "",
      subcampeon:           e.subcampeon || "",
      mvp:                  e.mvp || "",
      resumen:              e.resumen || "",
      youtubePlaylist:      e.youtubePlaylist || "",
      inscripcionesAbiertas: toBool(e.inscripcionesAbiertas),
      visible:              toBool(e.visible || "TRUE"),
      orden:                toNumber(e.orden, 999),
    }))
    .filter((e) => e.visible)
    .sort((a, b) => a.orden - b.orden);
}

function getLeagueRanking() {
  return getSheetRowsByHeader("Ranking")
    .map((r) => ({
      alias:         r.alias || "",
      puntosLiga:    toNumber(r.puntosLiga, 0),
      puntosBatalla: toNumber(r.puntosBatalla, 0),
      victorias:     toNumber(r.victorias, 0),
      derrotas:      toNumber(r.derrotas, 0),
      replicas:      toNumber(r.replicas, 0),
      bonus:         toNumber(r.bonus, 0),
      estado:        r.estado || "activo",
      ultimaFecha:   r.ultimaFecha || "",
      movimiento:    r.movimiento || "",
    }))
    .filter((r) => r.alias)
    .sort((a, b) => {
      if (b.puntosLiga    !== a.puntosLiga)    return b.puntosLiga    - a.puntosLiga;
      if (b.victorias     !== a.victorias)     return b.victorias     - a.victorias;
      if (b.replicas      !== a.replicas)      return b.replicas      - a.replicas;
      if (a.derrotas      !== b.derrotas)      return a.derrotas      - b.derrotas;
      if (b.puntosBatalla !== a.puntosBatalla) return b.puntosBatalla - a.puntosBatalla;
      return a.alias.localeCompare(b.alias);
    });
}

function getLeagueBattles() {
  return getSheetRowsByHeader("Batallas")
    .map((r) => ({
      battleId:       r.battleId || "",
      eventId:        r.eventId || "",
      orden:          toNumber(r.orden, 999),
      ronda:          r.ronda || "",
      grupo:          r.grupo || "",
      mc1:            r.mc1 || "",
      mc2:            r.mc2 || "",
      mc3:            r.mc3 || "",
      mc4:            r.mc4 || "",
      ganador:        r.ganador || "",
      perdedor:       r.perdedor || "",
      youtubeUrl:     r.youtubeUrl || "",
      estado:         r.estado || "pendiente",
      tipoResultado:  r.tipoResultado || "pendiente",
      cuentaParaLiga: toBool(r.cuentaParaLiga),
      puntosMc1:      toNumber(r.puntosMc1, 0),
      puntosMc2:      toNumber(r.puntosMc2, 0),
      notas:          r.notas || "",
    }))
    .filter((b) => b.estado !== "oculta")
    .sort((a, b) => {
      if (a.eventId !== b.eventId) return a.eventId.localeCompare(b.eventId);
      return a.orden - b.orden;
    });
}

function getLeagueRegistrations() {
  return getSheetRowsByHeader("Inscripciones")
    .map((r) => ({
      createdAt: r.createdAt || "",
      eventId:   r.eventId || "",
      nombre:    r.nombre || "",
      alias:     r.alias || "",
      telefono:  r.telefono || "",
      instagram: r.instagram || "NO IG ❌",
      estado:    r.estado || "pendiente",
      source:    r.source || "web",
    }))
    .filter((r) => r.alias);
}

function getLeagueParticipants() {
  return getSheetRowsByHeader("Participantes")
    .map((r) => ({
      eventId:   r.eventId || "",
      alias:     r.alias || "",
      nombre:    r.nombre || "",
      instagram: r.instagram || "",
      estado:    r.estado || "inscrito",
      seed:      toNumber(r.seed, 0),
      asistio:   toBool(r.asistio),
      notas:     r.notas || "",
    }))
    .filter((r) => r.alias);
}

function getLeagueMedia() {
  return getSheetRowsByHeader("Media")
    .map((r) => ({
      eventId: r.eventId || "",
      tipo:    r.tipo || "",
      titulo:  r.titulo || "",
      url:     r.url || "",
      visible: toBool(r.visible || "TRUE"),
      orden:   toNumber(r.orden, 999),
    }))
    .filter((r) => r.visible && r.url)
    .sort((a, b) => a.orden - b.orden);
}

// ─── Payload assembler ────────────────────────────────────────────────────────

function getLeaguePayload() {
  const config        = getLeagueConfig();
  const events        = getLeagueEvents();
  const ranking       = getLeagueRanking();
  const battles       = getLeagueBattles();
  const registrations = getLeagueRegistrations();
  const participants  = getLeagueParticipants();
  const media         = getLeagueMedia();

  const activeEvent =
    events.find((e) => e.eventId === config.activeEventId) ||
    events.find((e) => e.estado === "inscripciones") ||
    events.find((e) => e.estado === "anunciada") ||
    events.find((e) => e.estado === "futura") ||
    null;

  const featuredEvent =
    events.find((e) => e.eventId === config.featuredEventId) ||
    activeEvent;

  const latestCompletedEvent =
    events.find((e) => e.eventId === config.latestCompletedEventId) ||
    [...events].reverse().find((e) => e.estado === "finalizada") ||
    null;

  const activeRegistrations = activeEvent
    ? registrations.filter((r) =>
        r.eventId === activeEvent.eventId &&
        ["pendiente", "confirmado"].includes(r.estado)
      )
    : [];

  const max   = activeEvent ? activeEvent.maxCupos : toNumber(config.defaultMaxSlots, 32);
  const total = activeRegistrations.length;

  return {
    config,
    activeEvent,
    featuredEvent,
    latestCompletedEvent,
    events,
    registrations,
    participants,
    ranking,
    battles,
    media,
    capacity: {
      total,
      restantes: Math.max(0, max - total),
      max,
    },
  };
}

// ─── HTTP handlers ────────────────────────────────────────────────────────────

function doGet() {
  try {
    return json({ ok: true, league: getLeaguePayload() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(5000);

    if (!e || !e.postData) {
      return json({ ok: false, error: "NO_DATA" });
    }

    const league      = getLeaguePayload();
    const activeEvent = league.activeEvent;

    if (!activeEvent) {
      return json({ ok: false, error: "NO_ACTIVE_EVENT" });
    }

    if (!activeEvent.inscripcionesAbiertas) {
      return json({ ok: false, error: "INSCRIPCIONES_CERRADAS" });
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.nombre || !data.alias || !data.telefono) {
      return json({ ok: false, error: "CAMPOS_INCOMPLETOS" });
    }

    const phone = String(data.telefono).trim();

    if (!/^\d{10}$/.test(phone)) {
      return json({ ok: false, error: "TELEFONO_INVALIDO" });
    }

    const active = league.registrations.filter((r) =>
      r.eventId === activeEvent.eventId &&
      ["pendiente", "confirmado"].includes(r.estado)
    );

    if (active.length >= activeEvent.maxCupos) {
      return json({ ok: false, error: "CUPOS_AGOTADOS", restantes: 0 });
    }

    if (active.some((r) => String(r.telefono || "").trim() === phone)) {
      return json({ ok: false, error: "YA_INSCRITO" });
    }

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("Inscripciones");

    if (!sheet) {
      return json({ ok: false, error: "HOJA_NO_EXISTE" });
    }

    sheet.appendRow([
      new Date(),
      activeEvent.eventId,
      String(data.nombre).trim(),
      String(data.alias).trim(),
      phone,
      String(data.instagram || "NO IG ❌").trim(),
      "pendiente",
      "web",
    ]);

    SpreadsheetApp.flush();

    return json({
      ok: true,
      eventId: activeEvent.eventId,
      restantes: Math.max(0, activeEvent.maxCupos - (active.length + 1)),
    });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}