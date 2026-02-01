import { act, renderHook } from "@testing-library/react";
import useHistory from "../hooks/useHistory";
import { describe, test, expect } from "vitest";

describe("useHistory", () => {
  test("undo/redo basic", () => {
    const { result } = renderHook(() => useHistory<number>(0, { limit: 50 }));

    act(() => result.current.set(1));
    act(() => result.current.set(2));

    expect(result.current.present).toBe(2);

    act(() => result.current.undo());
    expect(result.current.present).toBe(1);

    act(() => result.current.undo());
    expect(result.current.present).toBe(0);

    act(() => result.current.redo());
    expect(result.current.present).toBe(1);

    act(() => result.current.redo());
    expect(result.current.present).toBe(2);
  });

  test("coalesce produces one undo step", () => {
    const { result } = renderHook(() => useHistory<number>(0, { limit: 50 }));

    act(() => result.current.setWithCoalesce("drag", (p) => p + 1));
    act(() => result.current.setWithCoalesce("drag", (p) => p + 1));
    act(() => result.current.setWithCoalesce("drag", (p) => p + 1));

    // commit clears the session; undo stack should still be one entry
    act(() => result.current.commitCoalesce("drag"));

    expect(result.current.present).toBe(3);

    act(() => result.current.undo());
    expect(result.current.present).toBe(0);

    act(() => result.current.redo());
    expect(result.current.present).toBe(3);
  });
});
