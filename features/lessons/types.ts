export type CheckpointRule =
  | {
      type: "call";
      functionName: string;
      args?: string[];
      matchMode?: "exact" | "startsWith";
      minCount?: number;
    }
  | {
      type: "numericArgRange";
      functionName: string;
      argIndex: number;
      min: number;
      max: number;
      argsPrefix?: string[];
      minCount?: number;
    }
  | {
      type: "contains";
      text: string;
    }
  | {
      type: "regex";
      pattern: string;
      flags?: string;
    }
  | {
      type: "anyOf";
      rules: CheckpointRule[];
    };

export type MissionCheckpoint = {
  id: string;
  title: string;
  description: string;
  rules: CheckpointRule[];
};

export type MissionReward = {
  xp: number;
  badgeId: string;
  badgeLabel: string;
};

export type Mission = {
  id: string;
  order: number;
  title: string;
  summary: string;
  objective: string;
  estimatedMinutes: number;
  starterCode: string;
  hints: string[];
  checkpoints: MissionCheckpoint[];
  reward: MissionReward;
};
