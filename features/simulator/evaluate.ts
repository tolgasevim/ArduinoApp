import type { Mission } from "@/features/lessons/types";

export type SimulationMode =
  | "blink"
  | "pwm"
  | "button"
  | "sensor"
  | "serial"
  | "buzzer"
  | "servo"
  | "project"
  | "idle";

export type SimulationEvent = {
  eventType:
    | "digitalWrite"
    | "analogWrite"
    | "analogRead"
    | "serialPrint"
    | "tone"
    | "servoWrite"
    | "info";
  pin: string;
  value: string;
  timestamp: number;
};

export type SimulationSnapshot = {
  mode: SimulationMode;
  ledOn: boolean;
  ledShouldBlink: boolean;
  brightness: number;
  notes: string[];
  events: SimulationEvent[];
};

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, " ").toLowerCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function event(
  index: number,
  eventType: SimulationEvent["eventType"],
  pin: string,
  value: string
): SimulationEvent {
  return {
    eventType,
    pin,
    value,
    timestamp: index * 100
  };
}

function has(normalized: string, snippet: string): boolean {
  return normalized.includes(snippet);
}

export function evaluateSimulation(mission: Mission, code: string): SimulationSnapshot {
  const normalized = normalizeCode(code);
  const events: SimulationEvent[] = [];

  if (mission.id === "mission-blink") {
    const hasHigh = has(normalized, "digitalwrite(13, high)");
    const hasLow = has(normalized, "digitalwrite(13, low)");
    const hasDelay = has(normalized, "delay(1000)");
    const shouldBlink = hasHigh && hasLow && hasDelay;

    if (hasHigh) events.push(event(events.length + 1, "digitalWrite", "13", "HIGH"));
    if (hasLow) events.push(event(events.length + 1, "digitalWrite", "13", "LOW"));

    return {
      mode: "blink",
      ledOn: hasHigh,
      ledShouldBlink: shouldBlink,
      brightness: shouldBlink || hasHigh ? 255 : 0,
      notes: shouldBlink
        ? ["LED is blinking every second."]
        : ["Add HIGH, LOW, and delay(1000) calls to make it blink."],
      events
    };
  }

  if (mission.id === "mission-pwm") {
    const match = normalized.match(/analogwrite\(\s*9\s*,\s*(\d{1,3})\s*\)/);
    const rawBrightness = match ? Number(match[1]) : 0;
    const brightness = clamp(rawBrightness, 0, 255);

    if (match) {
      events.push(event(1, "analogWrite", "9", String(brightness)));
    }

    return {
      mode: "pwm",
      ledOn: brightness > 0,
      ledShouldBlink: false,
      brightness,
      notes: [`Current brightness value: ${brightness}.`],
      events
    };
  }

  if (mission.id === "mission-button") {
    const hasRead = has(normalized, "digitalread(2)");
    const hasHigh = has(normalized, "digitalwrite(13, high)");
    const hasLow = has(normalized, "digitalwrite(13, low)");
    if (hasRead) events.push(event(events.length + 1, "analogRead", "2", "buttonState"));
    if (hasHigh) events.push(event(events.length + 1, "digitalWrite", "13", "HIGH"));
    if (hasLow) events.push(event(events.length + 1, "digitalWrite", "13", "LOW"));

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
      ],
      events
    };
  }

  if (mission.id === "mission-potentiometer" || mission.id === "mission-night-light") {
    const hasRead = has(normalized, "analogread(");
    const hasMap = has(normalized, "map(");
    const hasWrite = has(normalized, "analogwrite(9");
    if (hasRead) events.push(event(events.length + 1, "analogRead", "A0/A2", "sensor"));
    if (hasWrite) events.push(event(events.length + 1, "analogWrite", "9", "mappedValue"));

    return {
      mode: "sensor",
      ledOn: hasWrite,
      ledShouldBlink: false,
      brightness: hasWrite ? 180 : 0,
      notes: [
        hasRead ? "Sensor values are being read." : "Add analogRead from the mission sensor pin.",
        hasMap ? "Mapping step is present." : "Use map to convert sensor value to output range.",
        hasWrite ? "PWM output on pin 9 detected." : "Write mapped value with analogWrite."
      ],
      events
    };
  }

  if (mission.id === "mission-serial" || mission.id === "mission-temperature") {
    const hasBegin = has(normalized, "serial.begin(9600)");
    const hasPrint = has(normalized, "serial.println(");
    if (hasBegin) events.push(event(events.length + 1, "info", "Serial", "9600 baud"));
    if (hasPrint) events.push(event(events.length + 1, "serialPrint", "Serial", "println"));

    return {
      mode: "serial",
      ledOn: false,
      ledShouldBlink: false,
      brightness: 0,
      notes: [
        hasBegin ? "Serial port initialized at 9600." : "Add Serial.begin(9600) in setup().",
        hasPrint ? "Serial output is being printed." : "Add Serial.println(value) in loop()."
      ],
      events
    };
  }

  if (mission.id === "mission-buzzer" || mission.id === "mission-distance-alarm") {
    const hasTone = has(normalized, "tone(");
    const hasNoTone = has(normalized, "notone(");
    if (hasTone) events.push(event(events.length + 1, "tone", "8/buzzerPin", "ON"));
    if (hasNoTone) events.push(event(events.length + 1, "tone", "8/buzzerPin", "OFF"));

    return {
      mode: mission.id === "mission-distance-alarm" ? "project" : "buzzer",
      ledOn: false,
      ledShouldBlink: hasTone && hasNoTone,
      brightness: 0,
      notes: [
        hasTone ? "Tone call detected." : "Add tone(pin, frequency, duration).",
        hasNoTone ? "Tone stop detected." : "Add noTone(pin) to stop each note."
      ],
      events
    };
  }

  if (mission.id === "mission-servo") {
    const hasAttach = has(normalized, ".attach(");
    const hasWrite = has(normalized, ".write(");
    if (hasAttach) events.push(event(events.length + 1, "info", "servo", "attached"));
    if (hasWrite) events.push(event(events.length + 1, "servoWrite", "servo", "angle"));

    return {
      mode: "servo",
      ledOn: false,
      ledShouldBlink: false,
      brightness: 0,
      notes: [
        hasAttach ? "Servo attach detected." : "Attach servo to the mission pin.",
        hasWrite ? "Servo write calls detected." : "Use servo.write(angle)."
      ],
      events
    };
  }

  if (mission.id === "mission-reaction-timer" || mission.id === "mission-ultrasonic") {
    const hasPulse = has(normalized, "pulsein(");
    const hasMillis = has(normalized, "millis()");
    if (hasPulse) events.push(event(events.length + 1, "analogRead", "echo", "duration"));
    if (hasMillis) events.push(event(events.length + 1, "info", "timer", "millis"));

    return {
      mode: mission.id === "mission-ultrasonic" ? "sensor" : "project",
      ledOn: has(normalized, "digitalwrite(13, high)"),
      ledShouldBlink: false,
      brightness: has(normalized, "digitalwrite(13, high)") ? 255 : 0,
      notes: [
        hasPulse ? "Pulse timing logic detected." : "Use pulseIn for timing data.",
        hasMillis ? "Timing logic with millis detected." : "Use millis to measure reaction time."
      ],
      events
    };
  }

  return {
    mode: "idle",
    ledOn: false,
    ledShouldBlink: false,
    brightness: 0,
    notes: ["Simulator preview is not available for this mission yet."],
    events: [event(1, "info", "simulator", "no-preview")]
  };
}

