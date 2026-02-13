export type WebSerialCapability = {
  isSupported: boolean;
  isSecureContext: boolean;
  canUseHardwareMode: boolean;
  reason: string;
};

export type SerialPortLike = {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable?: ReadableStream<Uint8Array> | null;
  writable?: WritableStream<Uint8Array> | null;
  getInfo?: () => { usbVendorId?: number; usbProductId?: number };
};

type NavigatorWithSerial = Navigator & {
  serial?: {
    requestPort: () => Promise<SerialPortLike>;
  };
};

function getNavigatorSerial(): NavigatorWithSerial["serial"] | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  return (navigator as NavigatorWithSerial).serial ?? null;
}

export function getWebSerialCapability(): WebSerialCapability {
  const serial = getNavigatorSerial();
  const isSupported = serial !== null;
  const isSecure = typeof window !== "undefined" ? window.isSecureContext : false;

  if (!isSupported) {
    return {
      isSupported: false,
      isSecureContext: isSecure,
      canUseHardwareMode: false,
      reason: "Web Serial is not available in this browser. Use Chrome or Edge."
    };
  }

  if (!isSecure) {
    return {
      isSupported: true,
      isSecureContext: false,
      canUseHardwareMode: false,
      reason: "Hardware mode requires HTTPS or localhost."
    };
  }

  return {
    isSupported: true,
    isSecureContext: true,
    canUseHardwareMode: true,
    reason: "Hardware mode is available."
  };
}

export async function requestAndOpenPort(baudRate = 9600): Promise<SerialPortLike> {
  const serial = getNavigatorSerial();
  if (!serial) {
    throw new Error("Web Serial is unavailable.");
  }

  const port = await serial.requestPort();
  await port.open({ baudRate });
  return port;
}

export async function disconnectPort(port: SerialPortLike | null): Promise<void> {
  if (!port) return;
  await port.close();
}

export async function sendSerialText(port: SerialPortLike, value: string): Promise<void> {
  if (!port.writable) {
    throw new Error("No writable serial stream available.");
  }

  const writer = port.writable.getWriter();
  try {
    const payload = new TextEncoder().encode(`${value}\n`);
    await writer.write(payload);
  } finally {
    writer.releaseLock();
  }
}

