import { describe, expect, it } from "vitest";

import { missions } from "./missions";

describe("missions content integrity", () => {
  it("contains 12 missions in strict order", () => {
    expect(missions).toHaveLength(12);
    const sortedOrders = missions.map((mission) => mission.order);
    expect(sortedOrders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("has unique ids and validator versions", () => {
    const ids = new Set(missions.map((mission) => mission.id));
    expect(ids.size).toBe(missions.length);

    const validators = missions.map((mission) => mission.validatorVersion);
    validators.forEach((validatorVersion) => expect(validatorVersion.trim().length).toBeGreaterThan(2));
  });

  it("ensures prerequisites reference earlier missions", () => {
    const byId = new Map(missions.map((mission) => [mission.id, mission]));

    missions.forEach((mission) => {
      mission.prerequisiteMissionIds.forEach((prereqId) => {
        const prereq = byId.get(prereqId);
        expect(prereq).toBeDefined();
        expect(prereq!.order).toBeLessThan(mission.order);
      });
    });
  });

  it("requires safety notes and checkpoints for every mission", () => {
    missions.forEach((mission) => {
      expect(mission.safetyNotes.length).toBeGreaterThan(0);
      expect(mission.checkpoints.length).toBeGreaterThan(0);
      mission.checkpoints.forEach((checkpoint) => {
        expect(checkpoint.rules.length).toBeGreaterThan(0);
      });
    });
  });
});

