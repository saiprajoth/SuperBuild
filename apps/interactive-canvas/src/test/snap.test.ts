import { describe, expect, test } from "vitest";

const SNAP_DISTANCE = 6;
function snap(a: number, b: number) {
  return Math.abs(a - b) <= SNAP_DISTANCE ? b : a;
}

describe("snap helper", () => {
  test("snaps within threshold", () => {
    expect(snap(100, 105)).toBe(105);
    expect(snap(100, 106)).toBe(106);
  });

  test("does not snap outside threshold", () => {
    expect(snap(100, 120)).toBe(100);
  });
});
