export type LearnerProfile = {
  nickname: string;
};

export type LearnerProgress = {
  profile: LearnerProfile | null;
  completedMissionIds: string[];
  xp: number;
  badges: string[];
  streakDays: number;
  lastActiveDate: string | null;
};

