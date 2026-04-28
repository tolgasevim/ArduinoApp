import type { Mission, MissionDifficulty } from "@/features/lessons/types";

export type MissionNodeStatus = "completed" | "current" | "locked";

export type MissionNode = {
  missionId: string;
  order: number;
  title: string;
  difficulty: MissionDifficulty;
  xpReward: number;
  status: MissionNodeStatus;
};

export function buildMissionGraph(
  missions: Mission[],
  completedMissionIds: string[]
): MissionNode[] {
  const completedSet = new Set(completedMissionIds);
  return [...missions]
    .sort((a, b) => a.order - b.order)
    .map((mission) => {
      let status: MissionNodeStatus;
      if (completedSet.has(mission.id)) {
        status = "completed";
      } else if (mission.prerequisiteMissionIds.every((id) => completedSet.has(id))) {
        status = "current";
      } else {
        status = "locked";
      }
      return {
        missionId: mission.id,
        order: mission.order,
        title: mission.title,
        difficulty: mission.difficulty,
        xpReward: mission.reward.xp,
        status
      };
    });
}

export function getActiveMissionId(nodes: MissionNode[]): string {
  const sorted = [...nodes].sort((a, b) => a.order - b.order);
  const firstCurrent = sorted.find((n) => n.status === "current");
  if (firstCurrent) return firstCurrent.missionId;
  return sorted[sorted.length - 1]?.missionId ?? "";
}
