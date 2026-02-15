export type AnalyticsMode = "off" | "privacy";

function parseAnalyticsMode(value: string | undefined): AnalyticsMode {
  if (value === "privacy") return "privacy";
  return "off";
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

export const runtimeConfig = {
  analyticsMode: parseAnalyticsMode(process.env.NEXT_PUBLIC_ANALYTICS_MODE),
  hardwareModeEnabled: parseBoolean(process.env.NEXT_PUBLIC_HARDWARE_MODE_ENABLED, true),
  regionNotice: process.env.NEXT_PUBLIC_REGION_NOTICE ?? "us_eu_child"
};

