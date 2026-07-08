import { describe, it, expect } from "vitest";
import { getErrorStatus, getErrorMessage } from "./registrationErrors";

describe("getErrorStatus", () => {
  it("mapea códigos conocidos a su status HTTP", () => {
    expect(getErrorStatus("INSCRIPCIONES_CERRADAS")).toBe(403);
    expect(getErrorStatus("CUPOS_AGOTADOS")).toBe(409);
    expect(getErrorStatus("YA_INSCRITO")).toBe(409);
    expect(getErrorStatus("RATE_LIMITED")).toBe(429);
    expect(getErrorStatus("TELEFONO_INVALIDO")).toBe(400);
  });
  it("cae a 400 para códigos desconocidos", () => {
    expect(getErrorStatus("ALGO_NUEVO_DEL_BACKEND")).toBe(400);
  });
});

describe("getErrorMessage", () => {
  it("devuelve el mensaje de usuario para códigos conocidos", () => {
    expect(getErrorMessage("CUPOS_AGOTADOS")).toBe("Los cupos están agotados.");
  });
  it("cae a un mensaje genérico para códigos desconocidos", () => {
    expect(getErrorMessage("ALGO_NUEVO_DEL_BACKEND")).toBe("No se pudo completar la inscripción.");
  });
});
