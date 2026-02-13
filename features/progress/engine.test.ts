import { describe, expect, it } from "vitest";

import { missions } from "../lessons/data/missions";

import { completeMission, getDefaultProgress, withProfile } from "./engine";

describe("progress engine", () => {
  it("sets a sanitized nickname", () => {
    const progress = getDefaultProgress();
    const updated = withProfile(progress, "  CircuitNinja  ");

    expect(updated.profile?.nickname).toBe("CircuitNinja");
  });

  it("grants xp, badge, and first streak day on completion", () => {
    const mission = missions[0];
    const progress = getDefaultProgress();

    const updated = completeMission(progress, mission, new Date("2026-02-13T12:00:00Z"));

    expect(updated.completedMissionIds).toContain(mission.id);
    expect(updated.xp).toBe(mission.reward.xp);
    expect(updated.badges).toContain(mission.reward.badgeId);
    expect(updated.streakDays).toBe(1);
    expect(updated.lastActiveDate).toBe("2026-02-13");
  });

  it("increments streak on next day and resets after a gap", () => {
    const missionA = missions[0];
    const missionB = missions[1];
    const missionC = missions[2];
    const progress = getDefaultProgress();

    const dayOne = completeMission(progress, missionA, new Date("2026-02-13T12:00:00Z"));
    const dayTwo = completeMission(dayOne, missionB, new Date("2026-02-14T12:00:00Z"));
    const dayFive = completeMission(dayTwo, missionC, new Date("2026-02-18T12:00:00Z"));

    expect(dayTwo.streakDays).toBe(2);
    expect(dayFive.streakDays).toBe(1);
  });
});
