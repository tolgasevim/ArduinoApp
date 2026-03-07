import { afterEach, describe, expect, it } from "vitest";

import { getDefaultProgress } from "@/features/progress/engine";

import { clearProgress, loadProgress, saveProgress } from "./progressStorage";

type LocalStorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createLocalStorageMock(): LocalStorageMock {
  const store = new Map<string, string>();

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

// A fake userId for tests — the background fetch is silently swallowed by the
// catch handler in pushProgressToApi, so no real network call is made.
const TEST_USER_ID = "test-user-uuid-1234";

describe("progressStorage", () => {
  afterEach(() => {
    delete (globalThis as { window?: { localStorage: LocalStorageMock } }).window;
  });

  it("loads the default progress after clearing saved data", () => {
    (globalThis as { window?: { localStorage: LocalStorageMock } }).window = {
      localStorage: createLocalStorageMock()
    };

    const savedProgress = {
      ...getDefaultProgress(),
      xp: 120,
      streakDays: 4,
      completedMissionIds: ["mission-blink"]
    };

    saveProgress(TEST_USER_ID, savedProgress);
    expect(loadProgress()).toMatchObject(savedProgress);

    clearProgress(TEST_USER_ID);

    expect(loadProgress()).toEqual(getDefaultProgress());
  });

  it("returns default progress when window is undefined (SSR)", () => {
    // window is intentionally not set — simulates server-side rendering
    expect(loadProgress()).toEqual(getDefaultProgress());
  });

  it("returns default progress when stored JSON is corrupt", () => {
    (globalThis as { window?: { localStorage: LocalStorageMock } }).window = {
      localStorage: createLocalStorageMock()
    };

    window.localStorage.setItem("arduino-quest-progress-v2", "{ not valid json }}}");

    expect(loadProgress()).toEqual(getDefaultProgress());
  });

  it("saveProgress and clearProgress are silent no-ops in SSR (window undefined)", () => {
    // Should not throw when window is undefined
    expect(() => saveProgress(TEST_USER_ID, getDefaultProgress())).not.toThrow();
    expect(() => clearProgress(TEST_USER_ID)).not.toThrow();
  });
});
