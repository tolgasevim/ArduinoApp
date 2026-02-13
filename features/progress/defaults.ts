import type { LearnerProgress } from "@/features/progress/types";

export const defaultProgress: LearnerProgress = {
  profile: null,
  completedMissionIds: [],
  xp: 0,
  badges: [],
  streakDays: 0,
  lastActiveDate: null
};

