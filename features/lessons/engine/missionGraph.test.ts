import { describe, expect, it } from "vitest";

import { missions } from "../data/missions";
import { buildMissionGraph, getActiveMissionId } from "./missionGraph";

describe("buildMissionGraph", () => {
  it("marks the first mission as current when nothing is completed", () => {
    const nodes = buildMissionGraph(missions, []);
    const first = nodes.find((n) => n.order === 1)!;
    expect(first.status).toBe("current");
  });

  it("marks all subsequent missions as locked when nothing is completed", () => {
    const nodes = buildMissionGraph(missions, []);
    const nonFirst = nodes.filter((n) => n.order > 1);
    expect(nonFirst.every((n) => n.status === "locked")).toBe(true);
  });

  it("marks a mission as completed when its id is in completedMissionIds", () => {
    const nodes = buildMissionGraph(missions, ["mission-blink"]);
    const first = nodes.find((n) => n.missionId === "mission-blink")!;
    expect(first.status).toBe("completed");
  });

  it("unlocks the next mission when its prerequisite is completed", () => {
    const nodes = buildMissionGraph(missions, ["mission-blink"]);
    const second = nodes.find((n) => n.missionId === "mission-pwm")!;
    expect(second.status).toBe("current");
  });

  it("keeps a mission locked if its prerequisite is not yet completed", () => {
    const nodes = buildMissionGraph(missions, []);
    const second = nodes.find((n) => n.missionId === "mission-pwm")!;
    expect(second.status).toBe("locked");
  });

  it("marks all missions as completed when all ids are provided", () => {
    const allIds = missions.map((m) => m.id);
    const nodes = buildMissionGraph(missions, allIds);
    expect(nodes.every((n) => n.status === "completed")).toBe(true);
  });

  it("returns nodes sorted by order ascending", () => {
    const nodes = buildMissionGraph(missions, []);
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i].order).toBeGreaterThan(nodes[i - 1].order);
    }
  });

  it("includes xpReward from the mission reward", () => {
    const nodes = buildMissionGraph(missions, []);
    nodes.forEach((node, i) => {
      expect(node.xpReward).toBe(missions.find((m) => m.id === node.missionId)!.reward.xp);
    });
  });
});

describe("getActiveMissionId", () => {
  it("returns the first mission id when nothing is completed", () => {
    const nodes = buildMissionGraph(missions, []);
    expect(getActiveMissionId(nodes)).toBe("mission-blink");
  });

  it("returns the next unlocked mission after completions", () => {
    const nodes = buildMissionGraph(missions, ["mission-blink"]);
    expect(getActiveMissionId(nodes)).toBe("mission-pwm");
  });

  it("returns the last mission id when all are completed", () => {
    const allIds = missions.map((m) => m.id);
    const nodes = buildMissionGraph(missions, allIds);
    const lastMission = missions.reduce((a, b) => (a.order > b.order ? a : b));
    expect(getActiveMissionId(nodes)).toBe(lastMission.id);
  });
});
