import { defaultProgress } from "@/features/progress/defaults";
import type { Mission } from "@/features/lessons/types";
import type { LearnerProgress } from "@/features/progress/types";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayDelta(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`);
  const to = new Date(`${toIso}T00:00:00Z`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function withProfile(progress: LearnerProgress, nickname: string): LearnerProgress {
  const trimmed = nickname.trim();
  if (!trimmed) return progress;

  return {
    ...progress,
    profile: {
      nickname: trimmed.slice(0, 24)
    }
  };
}

export function completeMission(
  progress: LearnerProgress,
  mission: Mission,
  today = new Date()
): LearnerProgress {
  if (progress.completedMissionIds.includes(mission.id)) {
    return progress;
  }

  const currentDay = toIsoDate(today);
  const previousDay = progress.lastActiveDate;
  let streak = progress.streakDays;

  if (!previousDay) {
    streak = 1;
  } else {
    const delta = dayDelta(previousDay, currentDay);
    if (delta === 0) {
      streak = progress.streakDays;
    } else if (delta === 1) {
      streak = progress.streakDays + 1;
    } else {
      streak = 1;
    }
  }

  return {
    ...progress,
    completedMissionIds: [...progress.completedMissionIds, mission.id],
    xp: progress.xp + mission.reward.xp,
    badges: progress.badges.includes(mission.reward.badgeId)
      ? progress.badges
      : [...progress.badges, mission.reward.badgeId],
    streakDays: streak,
    lastActiveDate: currentDay
  };
}

export function getDefaultProgress(): LearnerProgress {
  return structuredClone(defaultProgress);
}

