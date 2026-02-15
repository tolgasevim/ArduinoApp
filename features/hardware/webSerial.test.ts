import { describe, expect, it } from "vitest";

import { deriveConnectionState } from "./webSerial";

describe("deriveConnectionState", () => {
  it("returns checking first", () => {
    const state = deriveConnectionState({
      isChecking: true,
      isConnecting: false,
      hasPort: false,
      hasError: false,
      isFallbackMode: false
    });
    expect(state).toBe("checking");
  });

  it("returns connected when port exists", () => {
    const state = deriveConnectionState({
      isChecking: false,
      isConnecting: false,
      hasPort: true,
      hasError: false,
      isFallbackMode: false
    });
    expect(state).toBe("connected");
  });

  it("returns fallback when simulator fallback is active", () => {
    const state = deriveConnectionState({
      isChecking: false,
      isConnecting: false,
      hasPort: false,
      hasError: true,
      isFallbackMode: true
    });
    expect(state).toBe("fallback");
  });
});

