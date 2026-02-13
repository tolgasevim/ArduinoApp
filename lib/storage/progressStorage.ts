import { getDefaultProgress } from "@/features/progress/engine";
import type { LearnerProgress } from "@/features/progress/types";

const STORAGE_KEY = "arduino-quest-progress-v1";

export function loadProgress(): LearnerProgress {
  if (typeof window === "undefined") {
    return getDefaultProgress();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return getDefaultProgress();
  }

  try {
    const parsed = JSON.parse(saved) as LearnerProgress;
    return {
      ...getDefaultProgress(),
      ...parsed
    };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: LearnerProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

