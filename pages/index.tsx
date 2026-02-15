import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import HardwareModePanel, { type LearningMode } from "@/components/HardwareModePanel";
import MissionCard from "@/components/MissionCard";
import OnboardingCard from "@/components/OnboardingCard";
import ProgressSummary from "@/components/ProgressSummary";
import { missions } from "@/features/lessons/data/missions";
import {
  type MissionValidationResult,
  validateMissionCode
} from "@/features/lessons/engine/validator";
import { getLevelForXp } from "@/features/gamification/levels";
import type { Mission } from "@/features/lessons/types";
import { completeMission, withProfile } from "@/features/progress/engine";
import type { LearnerProgress } from "@/features/progress/types";
import { runtimeConfig } from "@/lib/config/runtime";
import { loadProgress, saveProgress } from "@/lib/storage/progressStorage";

type MissionRunState = {
  code: string;
  attempts: number;
  validationResult: MissionValidationResult | null;
};

function getInitialRunState(mission: Mission): MissionRunState {
  return {
    code: mission.starterCode,
    attempts: 0,
    validationResult: null
  };
}

function getVisibleHints(hints: string[], attempts: number, isCompleted: boolean): string[] {
  if (isCompleted) {
    return hints;
  }

  if (attempts < 2) {
    return [];
  }

  const count = Math.min(hints.length, 1 + Math.floor((attempts - 2) / 2));
  return hints.slice(0, count);
}

export default function HomePage() {
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [missionRuns, setMissionRuns] = useState<Record<string, MissionRunState>>({});
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>("simulator");

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    if (!progress) return;
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (!runtimeConfig.hardwareModeEnabled && learningMode === "hardware") {
      setLearningMode("simulator");
    }
  }, [learningMode]);

  const nextMission = useMemo(() => {
    if (!progress) return missions[0];
    return (
      missions.find((mission) => !progress.completedMissionIds.includes(mission.id)) ??
      missions[missions.length - 1]
    );
  }, [progress]);

  useEffect(() => {
    setMissionRuns((current) => {
      if (current[nextMission.id]) {
        return current;
      }

      return {
        ...current,
        [nextMission.id]: getInitialRunState(nextMission)
      };
    });
  }, [nextMission]);

  if (!progress) {
    return null;
  }

  function handleSetNickname(nickname: string): void {
    setProgress((current) => {
      if (!current) return current;
      return withProfile(current, nickname);
    });
  }

  const currentRun = missionRuns[nextMission.id] ?? getInitialRunState(nextMission);
  const isCompleted = progress.completedMissionIds.includes(nextMission.id);
  const visibleHints = getVisibleHints(nextMission.hints, currentRun.attempts, isCompleted);
  const level = getLevelForXp(progress.xp);

  function updateCurrentRun(partial: Partial<MissionRunState>): void {
    setMissionRuns((current) => ({
      ...current,
      [nextMission.id]: {
        ...(current[nextMission.id] ?? getInitialRunState(nextMission)),
        ...partial
      }
    }));
  }

  function handleValidateMission(): void {
    const result = validateMissionCode(nextMission, currentRun.code);
    const nextAttemptCount = currentRun.attempts + 1;

    updateCurrentRun({
      attempts: nextAttemptCount,
      validationResult: result
    });

    if (!result.isPass || isCompleted) {
      return;
    }

    setProgress((current) => {
      if (!current) {
        return current;
      }
      return completeMission(current, nextMission);
    });
    setCelebrationMessage(
      `Mission complete. You earned ${nextMission.reward.xp} XP and ${nextMission.reward.badgeLabel}.`
    );
  }

  function handleResetCode(): void {
    updateCurrentRun({
      code: nextMission.starterCode
    });
  }

  return (
    <>
      <Head>
        <title>Arduino Quest</title>
        <meta
          name="description"
          content="Arduino Quest teaches beginners through short game-like coding missions."
        />
      </Head>

      <AppShell
        title="Build. Code. Win."
        subtitle="This pilot is simulator-first, child-safe by default, and designed for fast beginner wins."
      >
        <section
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700"
          aria-live="polite"
        >
          <p className="font-semibold text-slateBlue">Launch mode: No third-party analytics SDK</p>
          <p className="mt-1">
            Analytics mode is set to <code>{runtimeConfig.analyticsMode}</code>. Region notice is{" "}
            <code>{runtimeConfig.regionNotice}</code>.
          </p>
        </section>

        {celebrationMessage ? (
          <section className="rounded-2xl border border-neonMint bg-[#ecfff4] px-5 py-3 text-sm font-semibold text-slateBlue">
            {celebrationMessage}
          </section>
        ) : null}

        {!progress.profile ? (
          <OnboardingCard onSubmit={handleSetNickname} />
        ) : (
          <>
            <ProgressSummary
              nickname={progress.profile.nickname}
              levelTitle={level.title}
              levelNumber={level.level}
              xp={progress.xp}
              badges={progress.badges.length}
              completedMissions={progress.completedMissionIds.length}
              totalMissions={missions.length}
              streakDays={progress.streakDays}
            />
            {runtimeConfig.hardwareModeEnabled ? (
              <HardwareModePanel mode={learningMode} onModeChange={setLearningMode} />
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-card">
                Hardware mode is disabled by runtime config. Simulator mode is active.
              </section>
            )}
            <MissionCard
              mission={nextMission}
              isCompleted={isCompleted}
              modeLabel={learningMode === "hardware" ? "Real Arduino (Web Serial)" : "Simulator"}
              code={currentRun.code}
              attemptCount={currentRun.attempts}
              visibleHints={visibleHints}
              validationResult={currentRun.validationResult}
              onCodeChange={(value) => updateCurrentRun({ code: value })}
              onValidate={handleValidateMission}
              onReset={handleResetCode}
            />
          </>
        )}
      </AppShell>
    </>
  );
}
