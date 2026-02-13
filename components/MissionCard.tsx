import type { Mission } from "@/features/lessons/types";
import type { MissionValidationResult } from "@/features/lessons/engine/validator";
import SimulatorPanel from "@/components/SimulatorPanel";

type MissionCardProps = {
  mission: Mission;
  isCompleted: boolean;
  modeLabel: string;
  code: string;
  attemptCount: number;
  visibleHints: string[];
  validationResult: MissionValidationResult | null;
  onCodeChange: (value: string) => void;
  onValidate: () => void;
  onReset: () => void;
};

export default function MissionCard({
  mission,
  isCompleted,
  modeLabel,
  code,
  attemptCount,
  visibleHints,
  validationResult,
  onCodeChange,
  onValidate,
  onReset
}: MissionCardProps) {
  const passedIds = new Set(validationResult?.passedCheckpointIds ?? []);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slateBlue">{mission.title}</h2>
        <span className="rounded-full bg-warmSun px-3 py-1 text-sm font-bold text-slateBlue">
          {mission.estimatedMinutes} min
        </span>
      </div>

      <p className="mt-2 text-slate-700">{mission.summary}</p>
      <p className="mt-2 text-sm font-semibold text-slate-600">Goal: {mission.objective}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Running in: {modeLabel}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl bg-slateBlue p-4 text-sm text-slate-100">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-sky">Code editor (MVP)</p>
          <label className="sr-only" htmlFor="mission-code-editor">
            Mission code editor
          </label>
          <textarea
            id="mission-code-editor"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            rows={16}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-slate-500 bg-[#0b132b] p-3 font-mono text-sm text-slate-100"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onValidate}
              className="rounded-xl bg-neonMint px-4 py-2 font-bold text-slateBlue transition hover:brightness-105"
            >
              Run checkpoint check
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slateBlue"
            >
              Reset starter code
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-300">Attempts: {attemptCount}</p>
        </article>

        <div className="flex flex-col gap-4">
          <SimulatorPanel mission={mission} code={code} />

          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Checkpoints</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {mission.checkpoints.map((checkpoint) => (
                <li
                  key={checkpoint.id}
                  className={`rounded-xl border p-2 ${
                    passedIds.has(checkpoint.id)
                      ? "border-neonMint bg-[#ecfff4]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold">
                    {passedIds.has(checkpoint.id) ? "Passed: " : "Pending: "}
                    {checkpoint.title}
                  </p>
                  <p className="text-slate-600">{checkpoint.description}</p>
                </li>
              ))}
            </ul>

            {validationResult && !validationResult.isPass ? (
              <p className="mt-3 rounded-xl border border-coral bg-[#fff1ee] p-2 text-xs font-semibold text-coral">
                Keep going. Complete every checkpoint to finish this mission.
              </p>
            ) : null}

            {validationResult?.isPass ? (
              <p className="mt-3 rounded-xl border border-neonMint bg-[#ecfff4] p-2 text-xs font-semibold text-slateBlue">
                Mission check passed.
              </p>
            ) : null}
          </article>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Hint ladder</p>
        {visibleHints.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Hints unlock after two failed checks.</p>
        ) : (
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-700">
            {visibleHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ol>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-700">
          Reward: +{mission.reward.xp} XP and badge{" "}
          <span className="font-extrabold">&quot;{mission.reward.badgeLabel}&quot;</span>
        </p>
        {isCompleted ? (
          <p className="rounded-full bg-[#ecfff4] px-3 py-1 text-sm font-bold text-slateBlue">
            Completed
          </p>
        ) : null}
      </div>
    </section>
  );
}
