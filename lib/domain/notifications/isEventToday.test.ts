import { describe, it, expect } from "vitest";
import { isEventToday } from "./isEventToday";

describe("isEventToday", () => {
  it("true si la fecha coincide con 'now'", () => {
    expect(isEventToday("2026-08-02", new Date(2026, 7, 2, 10, 0))).toBe(true);
  });
  it("false si es un día distinto", () => {
    expect(isEventToday("2026-08-02", new Date(2026, 7, 1, 23, 59))).toBe(false);
    expect(isEventToday("2026-08-02", new Date(2026, 7, 3, 0, 1))).toBe(false);
  });
  it("false si fechaEvento está vacía o es inválida", () => {
    expect(isEventToday("", new Date())).toBe(false);
    expect(isEventToday("no-es-una-fecha", new Date())).toBe(false);
  });
});
