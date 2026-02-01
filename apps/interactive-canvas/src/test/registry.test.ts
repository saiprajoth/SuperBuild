import { describe, expect, test } from "vitest";
import { REGISTRY } from "../renderer/registry";

describe("REGISTRY", () => {
  test("registry entries have defaultProps and displayName", () => {
    const keys = Object.keys(REGISTRY);
    expect(keys.length).toBeGreaterThan(0);

    for (const k of keys) {
      const entry = REGISTRY[k];
      expect(entry).toBeTruthy();
      expect(entry.component).toBeTruthy();
      expect(entry.defaultProps).toBeTruthy();
      expect(entry.displayName).toBeTruthy();
    }
  });

  test("propsSchema validates defaultProps where present", () => {
    for (const k of Object.keys(REGISTRY)) {
      const entry = REGISTRY[k];
      if (entry.propsSchema?.parse) {
        expect(() => entry.propsSchema.parse(entry.defaultProps)).not.toThrow();
      }
    }
  });
});
