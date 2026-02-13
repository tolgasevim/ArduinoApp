import { useEffect, useMemo, useRef, useState } from "react";

import {
  disconnectPort,
  getWebSerialCapability,
  requestAndOpenPort,
  sendSerialText,
  type SerialPortLike,
  type WebSerialCapability
} from "@/features/hardware/webSerial";

export type LearningMode = "simulator" | "hardware";

type HardwareModePanelProps = {
  mode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
};

function nowStamp(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export default function HardwareModePanel({ mode, onModeChange }: HardwareModePanelProps) {
  const [capability, setCapability] = useState<WebSerialCapability | null>(null);
  const [port, setPort] = useState<SerialPortLike | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [serialInput, setSerialInput] = useState("ping");
  const [serialLog, setSerialLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  useEffect(() => {
    setCapability(getWebSerialCapability());
  }, []);

  useEffect(() => {
    return () => {
      const reader = readerRef.current;
      if (reader) {
        void reader.cancel();
        readerRef.current = null;
      }
      if (port) {
        void disconnectPort(port);
      }
    };
  }, [port]);

  const modeBadge = useMemo(() => {
    if (mode === "hardware") {
      return "Hardware mode";
    }
    return "Simulator mode";
  }, [mode]);

  async function beginReadLoop(targetPort: SerialPortLike): Promise<void> {
    if (!targetPort.readable) {
      return;
    }

    const decoder = new TextDecoder();
    const reader = targetPort.readable.getReader();
    readerRef.current = reader;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value || value.length === 0) continue;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => `[${nowStamp()}] board: ${line}`);

        if (lines.length > 0) {
          setSerialLog((current) => [...current.slice(-80), ...lines]);
        }
      }
    } finally {
      reader.releaseLock();
      readerRef.current = null;
    }
  }

  async function handleConnect(): Promise<void> {
    if (!capability?.canUseHardwareMode) {
      setError(capability?.reason ?? "Hardware mode is unavailable.");
      onModeChange("simulator");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const nextPort = await requestAndOpenPort(9600);
      setPort(nextPort);
      onModeChange("hardware");
      setSerialLog((current) => [...current, `[${nowStamp()}] connected at 9600 baud`]);
      void beginReadLoop(nextPort);
    } catch (connectError) {
      const message =
        connectError instanceof Error ? connectError.message : "Connection failed.";
      setError(message);
      onModeChange("simulator");
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect(): Promise<void> {
    setError(null);
    const reader = readerRef.current;
    if (reader) {
      await reader.cancel();
      readerRef.current = null;
    }
    await disconnectPort(port);
    setPort(null);
    onModeChange("simulator");
    setSerialLog((current) => [...current, `[${nowStamp()}] disconnected`]);
  }

  async function handleSendSerial(): Promise<void> {
    if (!port) {
      setError("Connect to hardware first.");
      return;
    }
    if (!serialInput.trim()) {
      return;
    }

    try {
      await sendSerialText(port, serialInput.trim());
      setSerialLog((current) => [...current, `[${nowStamp()}] you: ${serialInput.trim()}`]);
      setSerialInput("");
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Send failed.";
      setError(message);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slateBlue">Learning mode</h2>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
          {modeBadge}
        </p>
      </div>

      <p className="mt-2 text-sm text-slate-700">
        Start in simulator mode. Hardware mode is optional and works only in Chrome/Edge with HTTPS
        or localhost.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onModeChange("simulator")}
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-left font-semibold text-slateBlue"
        >
          Use simulator (no hardware)
        </button>
        <button
          type="button"
          onClick={port ? handleDisconnect : handleConnect}
          disabled={isConnecting}
          className="rounded-xl bg-coral px-4 py-3 text-left font-semibold text-white disabled:opacity-70"
        >
          {port ? "Disconnect Arduino" : isConnecting ? "Connecting..." : "Connect Arduino"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold">Web Serial status</p>
        <p className="mt-1">{capability?.reason ?? "Checking browser support..."}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Serial monitor</p>
        <div className="mt-2 h-32 overflow-y-auto rounded-xl bg-slateBlue p-3 text-xs text-slate-100">
          {serialLog.length === 0 ? (
            <p className="text-slate-300">No serial messages yet.</p>
          ) : (
            serialLog.map((line) => (
              <p key={line} className="font-mono">
                {line}
              </p>
            ))
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={serialInput}
            onChange={(event) => setSerialInput(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Type command and send"
            aria-label="Serial command"
          />
          <button
            type="button"
            onClick={handleSendSerial}
            disabled={!port}
            className="rounded-xl bg-slateBlue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-coral bg-[#fff1ee] px-3 py-2 text-sm font-semibold text-coral">
          {error}
        </p>
      ) : null}
    </section>
  );
}
