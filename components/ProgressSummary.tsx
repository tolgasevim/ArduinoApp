type ProgressSummaryProps = {
  nickname: string;
  levelTitle: string;
  levelNumber: number;
  xp: number;
  badges: number;
  completedMissions: number;
  totalMissions: number;
  streakDays: number;
  onResetProgress: () => void;
};

export default function ProgressSummary({
  nickname,
  levelTitle,
  levelNumber,
  xp,
  badges,
  completedMissions,
  totalMissions,
  streakDays,
  onResetProgress
}: ProgressSummaryProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Pilot</p>
          <h2 className="mt-1 text-2xl font-black text-slateBlue">{nickname}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Level {levelNumber}: {levelTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onResetProgress}
          className="rounded-xl border border-coral px-4 py-2 text-sm font-semibold text-coral transition hover:bg-[#fff1ee]"
        >
          Reset progress
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">XP</dt>
          <dd className="text-2xl font-extrabold text-slateBlue">{xp}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Badges</dt>
          <dd className="text-2xl font-extrabold text-slateBlue">{badges}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Missions</dt>
          <dd className="text-2xl font-extrabold text-slateBlue">
            {completedMissions}/{totalMissions}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Streak</dt>
          <dd className="text-2xl font-extrabold text-slateBlue">{streakDays}d</dd>
        </div>
      </dl>
    </section>
  );
}
