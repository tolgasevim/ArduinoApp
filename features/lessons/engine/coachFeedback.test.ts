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

  it("does NOT include failure reason in message before 3 attempts (attemptCount = 2)", () => {
    expect(mission).toBeDefined();

    const result = validateMissionCode(mission!, "void setup(){} void loop(){}");
    expect(result.isPass).toBe(false);

    const feedback = getCoachFeedback(result, mission!.checkpoints, 2);

    // Generic fallback message only — no specific function name leaked
    expect(feedback.message).toContain("Read the pending checkpoint and update your code.");
    expect(feedback.message).not.toContain("pinMode");
  });

  it("DOES include failure reason in message at 3 or more attempts (attemptCount = 3)", () => {
    expect(mission).toBeDefined();

    const result = validateMissionCode(mission!, "void setup(){} void loop(){}");
    expect(result.isPass).toBe(false);

    const feedback = getCoachFeedback(result, mission!.checkpoints, 3);

    // Should now reveal the specific failure reason (e.g. expected function call)
    expect(feedback.message).toContain("pinMode");
  });

  it("shows struggle encouragement at 4+ attempts and standard encouragement below that", () => {
    expect(mission).toBeDefined();

    const result = validateMissionCode(mission!, "void setup(){} void loop(){}");
    expect(result.isPass).toBe(false);

    const feedbackEarly = getCoachFeedback(result, mission!.checkpoints, 3);
    const feedbackLate = getCoachFeedback(result, mission!.checkpoints, 4);

    expect(feedbackEarly.message).toContain("Nice progress.");
    expect(feedbackLate.message).toContain("You are close.");
  });
});
