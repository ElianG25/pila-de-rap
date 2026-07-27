import { describe, it, expect } from "vitest";
import { parseEventDate, parseTimeOfDay } from "./eventTime";

describe("parseTimeOfDay", () => {
  it("interpreta formato 12h con AM/PM", () => {
    expect(parseTimeOfDay("3:00 PM")).toEqual({ hours: 15, minutes: 0 });
    expect(parseTimeOfDay("8:00 AM")).toEqual({ hours: 8, minutes: 0 });
    expect(parseTimeOfDay("12:00 PM")).toEqual({ hours: 12, minutes: 0 });
    expect(parseTimeOfDay("12:00 AM")).toEqual({ hours: 0, minutes: 0 });
  });
  it("interpreta formato 24h sin AM/PM", () => {
    expect(parseTimeOfDay("20:00")).toEqual({ hours: 20, minutes: 0 });
  });
  it("devuelve null si no matchea nada reconocible", () => {
    expect(parseTimeOfDay("")).toBeNull();
    expect(parseTimeOfDay("mediodía")).toBeNull();
  });
});

describe("parseEventDate", () => {
  it("combina fecha + hora 12h sin producir NaN (regresión del contador)", () => {
    const d = parseEventDate("2026-08-02", "3:00 PM");
    expect(d).not.toBeNull();
    expect(Number.isNaN(d!.getTime())).toBe(false);
    expect(d!.getHours()).toBe(15);
  });
  it("funciona sin hora (queda a medianoche)", () => {
    const d = parseEventDate("2026-08-02", "");
    expect(d).not.toBeNull();
    expect(Number.isNaN(d!.getTime())).toBe(false);
    expect(d!.getHours()).toBe(0);
  });
  it("devuelve null si fechaEvento está vacía", () => {
    expect(parseEventDate("", "3:00 PM")).toBeNull();
  });
});
