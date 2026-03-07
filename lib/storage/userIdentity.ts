const USER_ID_KEY = "arduino-quest-user-id";

/**
 * Returns the stable UUID that identifies this browser/device.
 * On the very first visit a new UUID is generated and persisted in localStorage.
 * The UUID is used as the database primary key; the nickname remains display-only.
 * Returns an empty string during SSR (no localStorage available).
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(USER_ID_KEY, id);
  return id;
}

/**
 * Removes the stored user ID. Only used when the user resets all progress.
 * A new UUID will be generated on the next call to getOrCreateUserId().
 */
export function clearUserId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_ID_KEY);
}
