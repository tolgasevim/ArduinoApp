import type { Mission } from "@/features/lessons/types";

export type SimulationSnapshot = {
  mode: "blink" | "pwm" | "button" | "sensor" | "serial" | "buzzer" | "idle";
  ledOn: boolean;
  ledShouldBlink: boolean;
  brightness: number;
  notes: string[];
};

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, " ").toLowerCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function evaluateSimulation(mission: Mission, code: string): SimulationSnapshot {
  const normalized = normalizeCode(code);

  if (mission.id === "mission-blink") {
    const hasHigh = normalized.includes("digitalwrite(13, high)");
    const hasLow = normalized.includes("digitalwrite(13, low)");
    const hasDelay = normalized.includes("delay(1000)");
    const shouldBlink = hasHigh && hasLow && hasDelay;

    return {
      mode: "blink",
      ledOn: hasHigh,
      ledShouldBlink: shouldBlink,
      brightness: shouldBlink || hasHigh ? 255 : 0,
      notes: shouldBlink
        ? ["LED is blinking every second."]
        : ["Add HIGH, LOW, and delay(1000) calls to make it blink."]
    };
  }

  if (mission.id === "mission-pwm") {
    const match = normalized.match(/analogwrite\(\s*9\s*,\s*(\d{1,3})\s*\)/);
    const rawBrightness = match ? Number(match[1]) : 0;
    const brightness = clamp(rawBrightness, 0, 255);

    return {
      mode: "pwm",
      ledOn: brightness > 0,
      ledShouldBlink: false,
      brightness,
      notes: [`Current brightness value: ${brightness}.`]
    };
  }

  if (mission.id === "mission-button") {
    const hasRead = normalized.includes("digitalread(2)");
    const hasHigh = normalized.includes("digitalwrite(13, high)");
    const hasLow = normalized.includes("digitalwrite(13, low)");

    return {
      mode: "button",
      ledOn: hasHigh,
      ledShouldBlink: false,
      brightness: hasHigh ? 255 : 0,
      notes: [
        hasRead ? "Button input is being read on pin 2." : "Add digitalRead(2) to read the button.",
        hasHigh && hasLow
          ? "LED logic for pressed and released states is present."
          : "Use both HIGH and LOW writes for if/else logic."
      ]
    };
  }

  if (mission.id === "mission-potentiometer") {
    const hasRead = normalized.includes("analogread(a0)");
    const hasMap = normalized.includes("map(");
    const hasWrite = normalized.includes("analogwrite(9");

    return {
      mode: "sensor",
      ledOn: hasWrite,
      ledShouldBlink: false,
      brightness: hasWrite ? 180 : 0,
      notes: [
        hasRead ? "A0 sensor values are being read." : "Add analogRead(A0).",
        hasMap ? "Mapping to 0-255 is present." : "Use map(value, 0, 1023, 0, 255).",
        hasWrite ? "PWM output on pin 9 detected." : "Write mapped value with analogWrite(9, value)."
      ]
    };
  }

  if (mission.id === "mission-serial") {
    const hasBegin = normalized.includes("serial.begin(9600)");
    const hasPrint = normalized.includes("serial.println(");

    return {
      mode: "serial",
      ledOn: false,
      ledShouldBlink: false,
      brightness: 0,
      notes: [
        hasBegin ? "Serial port initialized at 9600." : "Add Serial.begin(9600) in setup().",
        hasPrint ? "Serial output is being printed." : "Add Serial.println(value) in loop()."
      ]
    };
  }

  if (mission.id === "mission-buzzer") {
    const hasTone = normalized.includes("tone(8");
    const hasNoTone = normalized.includes("notone(8)");

    return {
      mode: "buzzer",
      ledOn: false,
      ledShouldBlink: hasTone && hasNoTone,
      brightness: 0,
      notes: [
        hasTone ? "Tone call detected on pin 8." : "Add tone(8, frequency, duration).",
        hasNoTone ? "Tone stop detected." : "Add noTone(8) to stop each note."
      ]
    };
  }

  return {
    mode: "idle",
    ledOn: false,
    ledShouldBlink: false,
    brightness: 0,
    notes: ["Simulator preview is not available for this mission yet."]
  };
}
