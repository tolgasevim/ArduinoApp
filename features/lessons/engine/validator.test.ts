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

  it("'contains' rule passes when the expected text is present and fails when absent", () => {
    // Mission 3 uses a `contains` rule checking for "if ("
    const mission = missions.find((entry) => entry.id === "mission-button");
    expect(mission).toBeDefined();

    const passingCode = `void setup(){ pinMode(2, INPUT_PULLUP); pinMode(13, OUTPUT); }
void loop(){
  int s = digitalRead(2);
  if (s == LOW){ digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`;
    const passResult = validateMissionCode(mission!, passingCode);
    const ifCheckpoint = passResult.checkpointResults.find((r) => r.checkpointId === "if-logic");
    expect(ifCheckpoint?.passed).toBe(true);

    const failingCode = `void setup(){ pinMode(2, INPUT_PULLUP); pinMode(13, OUTPUT); }
void loop(){
  int s = digitalRead(2);
  digitalWrite(13, HIGH);
  digitalWrite(13, LOW);
}`;
    const failResult = validateMissionCode(mission!, failingCode);
    const ifFail = failResult.checkpointResults.find((r) => r.checkpointId === "if-logic");
    expect(ifFail?.passed).toBe(false);
    expect(ifFail?.failureReason).toContain("if (");
  });

  it("'regex' rule passes on a matching pattern and fails on a mismatch", () => {
    // Mission 7 uses a regex rule: if (... > number)
    const mission = missions.find((entry) => entry.id === "mission-temperature");
    expect(mission).toBeDefined();

    const passingCode = `void setup(){ pinMode(13, OUTPUT); Serial.begin(9600); }
void loop(){
  int tempValue = analogRead(A1);
  if (tempValue > 500){ digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`;
    const passResult = validateMissionCode(mission!, passingCode);
    const condCheckpoint = passResult.checkpointResults.find((r) => r.checkpointId === "temp-condition");
    expect(condCheckpoint?.passed).toBe(true);

    const failingCode = `void setup(){ pinMode(13, OUTPUT); Serial.begin(9600); }
void loop(){
  int tempValue = analogRead(A1);
  digitalWrite(13, HIGH);
  digitalWrite(13, LOW);
}`;
    const failResult = validateMissionCode(mission!, failingCode);
    const condFail = failResult.checkpointResults.find((r) => r.checkpointId === "temp-condition");
    expect(condFail?.passed).toBe(false);
  });

  it("'anyOf' rule passes if at least one sub-rule matches", () => {
    // Mission 3 button-mode checkpoint uses anyOf: INPUT_PULLUP or INPUT
    const mission = missions.find((entry) => entry.id === "mission-button");
    expect(mission).toBeDefined();

    // Using INPUT (the second alternative)
    const codeWithInput = `void setup(){ pinMode(2, INPUT); pinMode(13, OUTPUT); }
void loop(){
  int s = digitalRead(2);
  if (s == LOW){ digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`;
    const result = validateMissionCode(mission!, codeWithInput);
    const buttonMode = result.checkpointResults.find((r) => r.checkpointId === "button-mode");
    expect(buttonMode?.passed).toBe(true);

    // Using neither INPUT nor INPUT_PULLUP → should fail
    const codeWithNeither = `void setup(){ pinMode(2, OUTPUT); pinMode(13, OUTPUT); }
void loop(){
  int s = digitalRead(2);
  if (s == LOW){ digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`;
    const failResult = validateMissionCode(mission!, codeWithNeither);
    const buttonModeFail = failResult.checkpointResults.find((r) => r.checkpointId === "button-mode");
    expect(buttonModeFail?.passed).toBe(false);
  });

  it("'numericArgRange' rule passes for in-range value and fails for out-of-range", () => {
    // Mission 2 uses numericArgRange: analogWrite(9, 0-255)
    const mission = missions.find((entry) => entry.id === "mission-pwm");
    expect(mission).toBeDefined();

    const inRangeCode = `void setup(){ pinMode(9, OUTPUT); }
void loop(){ analogWrite(9, 128); }`;
    const inRange = validateMissionCode(mission!, inRangeCode);
    const pwmCheck = inRange.checkpointResults.find((r) => r.checkpointId === "pwm-write");
    expect(pwmCheck?.passed).toBe(true);

    const outOfRangeCode = `void setup(){ pinMode(9, OUTPUT); }
void loop(){ analogWrite(9, 300); }`;
    const outOfRange = validateMissionCode(mission!, outOfRangeCode);
    const pwmFail = outOfRange.checkpointResults.find((r) => r.checkpointId === "pwm-write");
    expect(pwmFail?.passed).toBe(false);
    expect(pwmFail?.failureReason).toContain("0-255");
  });
});
