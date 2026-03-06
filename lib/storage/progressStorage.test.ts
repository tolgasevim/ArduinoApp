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

    saveProgress(savedProgress);
    expect(loadProgress()).toMatchObject(savedProgress);

    clearProgress();

    expect(loadProgress()).toEqual(getDefaultProgress());
  });
});
