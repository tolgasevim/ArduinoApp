import { getDefaultProgress } from "@/features/progress/engine";
import type { LearnerProgress } from "@/features/progress/types";

// Bump the key to discard progress earned while starter code incorrectly passed validation.
const STORAGE_KEY = "arduino-quest-progress-v2";

// ---------------------------------------------------------------------------
// localStorage helpers (synchronous, always available client-side)
// ---------------------------------------------------------------------------

function readFromLocalStorage(): LearnerProgress | null {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as LearnerProgress;
    return { ...getDefaultProgress(), ...parsed };
  } catch {
    return null;
  }
}

function writeToLocalStorage(progress: LearnerProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function removeFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Remote API helpers (fire-and-forget; never throw)
// ---------------------------------------------------------------------------

async function fetchProgressFromApi(userId: string): Promise<LearnerProgress | null> {
  if (!userId || typeof window === "undefined" || !window.location?.origin) return null;

  try {
    const res = await fetch(`/api/progress/load?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return (await res.json()) as LearnerProgress;
  } catch {
    return null;
  }
}

function pushProgressToApi(userId: string, progress: LearnerProgress): void {
  // Only attempt network calls in a real browser context (not SSR, not Vitest Node env).
  if (!userId || typeof window === "undefined" || !window.location?.origin) return;

  // Non-blocking background sync — failures are logged but never surface to the UI.
  fetch("/api/progress/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, progress })
  }).catch((err: unknown) => {
    console.warn("[progressStorage] Background save failed:", err);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Loads progress synchronously from localStorage (instant, works offline).
 * Returns default progress when nothing is cached.
 */
export function loadProgress(): LearnerProgress {
  return readFromLocalStorage() ?? getDefaultProgress();
}

/**
 * Loads progress from the remote API first; falls back to localStorage if the
 * network request fails or returns nothing. The result is also written to
 * localStorage so subsequent synchronous reads are always fresh.
 */
export async function loadProgressFromApi(userId: string): Promise<LearnerProgress> {
  const remote = await fetchProgressFromApi(userId);

  if (remote) {
    writeToLocalStorage(remote);
    return { ...getDefaultProgress(), ...remote };
  }

  return readFromLocalStorage() ?? getDefaultProgress();
}

/**
 * Persists progress to localStorage immediately (synchronous) and fires a
 * background POST to the API so the database stays in sync.
 */
export function saveProgress(userId: string, progress: LearnerProgress): void {
  writeToLocalStorage(progress);
  pushProgressToApi(userId, progress);
}

/**
 * Clears all locally cached progress and resets the remote record to the
 * default state (a background API call with an empty progress payload).
 */
export function clearProgress(userId: string): void {
  removeFromLocalStorage();

  if (userId) {
    pushProgressToApi(userId, getDefaultProgress());
  }
}
