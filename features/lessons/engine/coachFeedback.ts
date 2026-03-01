import type { MissionValidationResult } from "@/features/lessons/engine/validator";
import type { MissionCheckpoint } from "@/features/lessons/types";

export type CoachFeedback = {
  title: string;
  message: string;
  actionLabel: string;
};

export function getCoachFeedback(
  validationResult: MissionValidationResult | null,
  checkpoints: MissionCheckpoint[],
  attemptCount: number
): CoachFeedback {
  if (!validationResult) {
    return {
      title: "Try your first checkpoint run",
      message: "Run the checker once to see exactly which mission steps are already working.",
      actionLabel: "Run checkpoint check"
    };
  }

  if (validationResult.isPass) {
    return {
      title: "Mission mastery unlocked",
      message: "Great work. You proved each checkpoint with real code evidence.",
      actionLabel: "Open next mission"
    };
  }

  const firstMissingId = validationResult.missingCheckpointIds[0];
  const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.id === firstMissingId);
  const failedResult = validationResult.checkpointResults.find(
    (result) => result.checkpointId === firstMissingId
  );

  const encouragement =
    attemptCount >= 4
      ? "You are close. Focus on one checkpoint at a time."
      : "Nice progress. Fix the next checkpoint and run again.";

  return {
    title: nextCheckpoint ? `Focus checkpoint: ${nextCheckpoint.title}` : "Focus on the next checkpoint",
    message: `${encouragement} ${failedResult?.failureReason ?? "Read the pending checkpoint and update your code."}`,
    actionLabel: "Fix checkpoint and re-run"
  };
}
