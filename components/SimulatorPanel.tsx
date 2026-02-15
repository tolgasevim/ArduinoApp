import type { Mission } from "@/features/lessons/types";
import { evaluateSimulation } from "@/features/simulator/evaluate";

type SimulatorPanelProps = {
  mission: Mission;
  code: string;
};

export default function SimulatorPanel({ mission, code }: SimulatorPanelProps) {
  const snapshot = evaluateSimulation(mission, code);
  const intensity = snapshot.brightness / 255;
  const ledStyle = {
    opacity: 0.25 + intensity * 0.75,
    boxShadow: `0 0 ${12 + intensity * 18}px rgba(255, 111, 89, ${0.45 + intensity * 0.4})`
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Simulated circuit</p>
      <div className="mt-3 rounded-2xl bg-slateBlue p-4 text-slate-100">
        <p className="text-xs uppercase tracking-[0.12em] text-sky">Virtual LED</p>
        <div className="mt-4 flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-full bg-coral ${
              snapshot.ledShouldBlink ? "animate-pulse" : ""
            }`}
            style={ledStyle}
            aria-label={`LED ${snapshot.ledOn ? "on" : "off"}`}
            title={snapshot.ledOn ? "LED on" : "LED off"}
          />
          <div className="text-sm">
            <p className="font-semibold">
              State: {snapshot.ledOn ? "On" : "Off"}
              {snapshot.ledShouldBlink ? " (blinking)" : ""}
            </p>
            <p className="text-slate-200">Brightness: {snapshot.brightness}/255</p>
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {snapshot.notes.map((note) => (
          <li key={note}>- {note}</li>
        ))}
      </ul>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Sim events</p>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {snapshot.events.slice(0, 4).map((eventItem) => (
            <li key={`${eventItem.timestamp}-${eventItem.eventType}-${eventItem.pin}`}>
              [{eventItem.timestamp}ms] {eventItem.eventType} {eventItem.pin} {eventItem.value}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
