import { describe, expect, it } from "vitest";

import { missions } from "@/features/lessons/data/missions";
import { getCoachFeedback } from "@/features/lessons/engine/coachFeedback";
import { validateMissionCode } from "@/features/lessons/engine/validator";

describe("getCoachFeedback", () => {
  const mission = missions.find((entry) => entry.id === "mission-blink");

  it("returns default guidance before any validation run", () => {
    expect(mission).toBeDefined();

    const feedback = getCoachFeedback(null, mission!.checkpoints, 0);

    expect(feedback.title).toContain("Try your first checkpoint run");
    expect(feedback.actionLabel).toBe("Run checkpoint check");
  });

  it("returns a focused checkpoint recommendation when validation fails", () => {
    expect(mission).toBeDefined();

    const result = validateMissionCode(
      mission!,
      "void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); }"
    );

    expect(result.isPass).toBe(false);

    const feedback = getCoachFeedback(result, mission!.checkpoints, 2);

    expect(feedback.title.startsWith("Focus checkpoint:")).toBe(true);
    expect(feedback.actionLabel).toBe("Fix checkpoint and re-run");
  });

  it("returns mastery message when validation passes", () => {
    expect(mission).toBeDefined();

    const result = validateMissionCode(
      mission!,
      `void setup(){ pinMode(13, OUTPUT); }
      void loop(){
        digitalWrite(13, HIGH);
        delay(1000);
        digitalWrite(13, LOW);
        delay(1000);
      }`
    );

    expect(result.isPass).toBe(true);

    const feedback = getCoachFeedback(result, mission!.checkpoints, 1);

    expect(feedback.title).toContain("Mission mastery unlocked");
    expect(feedback.actionLabel).toBe("Open next mission");
  });
});
