import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  it("returns the minimum health response", () => {
    const controller = new HealthController();

    expect(controller.getHealth()).toEqual({ status: "ok" });
  });
});
