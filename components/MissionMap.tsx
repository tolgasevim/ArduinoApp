import type { MissionNode } from "@/features/lessons/engine/missionGraph";

type MissionMapProps = {
  nodes: MissionNode[];
  activeMissionId: string;
  selectedMissionId: string | null;
  onSelectMission: (missionId: string) => void;
};

export default function MissionMap({
  nodes,
  activeMissionId,
  selectedMissionId,
  onSelectMission
}: MissionMapProps) {
  const effectiveSelectedId = selectedMissionId ?? activeMissionId;

  return (
    <section aria-label="Mission progress map" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Mission Map
      </p>
      <ol className="flex flex-nowrap items-center overflow-x-auto pb-1" role="list">
        {nodes.map((node, index) => (
          <li key={node.missionId} className="flex flex-none items-center" role="listitem">
            <NodeButton
              node={node}
              isSelected={node.missionId === effectiveSelectedId}
              onSelect={onSelectMission}
            />
            {index < nodes.length - 1 && (
              <div
                className={`h-1 w-5 flex-none ${node.status === "completed" ? "bg-neonMint" : "bg-slate-200"}`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

type NodeButtonProps = {
  node: MissionNode;
  isSelected: boolean;
  onSelect: (missionId: string) => void;
};

function NodeButton({ node, isSelected, onSelect }: NodeButtonProps) {
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";

  let classes =
    "flex h-14 w-14 flex-none flex-col items-center justify-center rounded-xl text-sm font-bold transition-transform ";

  if (isLocked) {
    classes += "cursor-not-allowed bg-slate-100 text-slate-400";
  } else if (isCompleted) {
    classes += "cursor-pointer bg-neonMint text-slateBlue hover:scale-105";
  } else {
    classes += "cursor-pointer bg-warmSun text-slateBlue hover:scale-105";
  }

  if (isSelected && !isLocked) {
    classes += " ring-2 ring-slateBlue ring-offset-1";
  }

  const statusLabel = isCompleted ? "completed" : isLocked ? "locked" : "in progress";

  return (
    <button
      type="button"
      className={classes}
      disabled={isLocked}
      onClick={() => !isLocked && onSelect(node.missionId)}
      aria-label={`Mission ${node.order}: ${node.title} — ${statusLabel}`}
      aria-current={isSelected && !isLocked ? "step" : undefined}
    >
      <span className="text-base leading-none">
        {isCompleted ? "✓" : isLocked ? "🔒" : node.order}
      </span>
      <span className="text-[10px] font-medium leading-tight">M{node.order}</span>
    </button>
  );
}
