import { describe, expect, it } from "vitest";

import { getVisibleHints } from "./hintVisibility";

const HINTS = ["Hint A", "Hint B", "Hint C", "Hint D"];

describe("getVisibleHints", () => {
  it("returns empty array before first attempt (attempts = 0)", () => {
    expect(getVisibleHints(HINTS, 0, false)).toEqual([]);
  });

  it("returns empty array after first attempt (attempts = 1)", () => {
    expect(getVisibleHints(HINTS, 1, false)).toEqual([]);
  });

  it("reveals first hint on second attempt (attempts = 2)", () => {
    expect(getVisibleHints(HINTS, 2, false)).toEqual(["Hint A"]);
  });

  it("reveals hints progressively — one more hint every two additional attempts", () => {
    expect(getVisibleHints(HINTS, 3, false)).toEqual(["Hint A"]);
    expect(getVisibleHints(HINTS, 4, false)).toEqual(["Hint A", "Hint B"]);
    expect(getVisibleHints(HINTS, 5, false)).toEqual(["Hint A", "Hint B"]);
    expect(getVisibleHints(HINTS, 6, false)).toEqual(["Hint A", "Hint B", "Hint C"]);
  });

  it("never reveals more hints than are available", () => {
    const result = getVisibleHints(HINTS, 100, false);
    expect(result).toHaveLength(HINTS.length);
    expect(result).toEqual(HINTS);
  });

  it("returns all hints immediately when mission is already completed", () => {
    expect(getVisibleHints(HINTS, 0, true)).toEqual(HINTS);
    expect(getVisibleHints(HINTS, 1, true)).toEqual(HINTS);
  });
});
