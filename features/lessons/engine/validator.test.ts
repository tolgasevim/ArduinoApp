import { describe, expect, it } from "vitest";

import { missions } from "../data/missions";
import { validateMissionCode } from "./validator";

describe("validateMissionCode", () => {
  it("passes mission 1 when required blink calls exist", () => {
    const mission = missions.find((entry) => entry.id === "mission-blink");
    expect(mission).toBeDefined();

    const code = `void setup(){ pinMode(13, OUTPUT); }
void loop(){
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;

    const result = validateMissionCode(mission!, code);
    expect(result.isPass).toBe(true);
    expect(result.missingCheckpointIds).toHaveLength(0);
    expect(result.profile.deterministic).toBe(true);
    expect(result.checkpointResults.every((entry) => entry.passed)).toBe(true);
  });

  it("fails mission 2 when analogWrite value is out of range", () => {
    const mission = missions.find((entry) => entry.id === "mission-pwm");
    expect(mission).toBeDefined();

    const code = `void setup(){ pinMode(9, OUTPUT); }
void loop(){ analogWrite(9, 999); }`;

    const result = validateMissionCode(mission!, code);
    expect(result.isPass).toBe(false);
    expect(result.missingCheckpointIds).toContain("pwm-write");
    const pwmCheckpoint = result.checkpointResults.find((entry) => entry.checkpointId === "pwm-write");
    expect(pwmCheckpoint?.passed).toBe(false);
    expect(pwmCheckpoint?.failureReason.length).toBeGreaterThan(0);
  });

  it("passes mission 5 when Serial.begin and Serial.println exist", () => {
    const mission = missions.find((entry) => entry.id === "mission-serial");
    expect(mission).toBeDefined();

    const code = `void setup(){ Serial.begin(9600); }
void loop(){
  int sensorValue = analogRead(A0);
  Serial.println(sensorValue);
}`;

    const result = validateMissionCode(mission!, code);
    expect(result.isPass).toBe(true);
    const serialPrint = result.checkpointResults.find((entry) => entry.checkpointId === "serial-print");
    expect(serialPrint?.evidence.length).toBeGreaterThan(0);
  });
});
