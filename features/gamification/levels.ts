export type LevelBand = {
  level: number;
  minXp: number;
  title: string;
};

export const LEVEL_BANDS: LevelBand[] = [
  { level: 1, minXp: 0, title: "Spark Rookie" },
  { level: 2, minXp: 120, title: "Wire Wrangler" },
  { level: 3, minXp: 260, title: "Signal Scout" },
  { level: 4, minXp: 430, title: "Circuit Crafter" },
  { level: 5, minXp: 620, title: "Prototype Prodigy" },
  { level: 6, minXp: 820, title: "Arduino Ace" }
];

export function getLevelForXp(xp: number): LevelBand {
  let current = LEVEL_BANDS[0];

  for (const band of LEVEL_BANDS) {
    if (xp >= band.minXp) {
      current = band;
    }
  }

  return current;
}

