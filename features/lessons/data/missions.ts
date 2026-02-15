import type { Mission } from "@/features/lessons/types";

export const missions: Mission[] = [
  {
    id: "mission-blink",
    order: 1,
    difficulty: "starter",
    prerequisiteMissionIds: [],
    validatorVersion: "v1-blink",
    title: "Mission 1: Blink",
    summary: "Make the built-in LED blink on and off every second.",
    objective: "Use pin 13 to turn LED on, wait, then turn it off and repeat.",
    safetyNotes: ["No hardware needed in simulator mode.", "If using hardware, connect only to USB."],
    estimatedMinutes: 8,
    starterCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    hints: [
      "Use digitalWrite(13, HIGH) to turn LED on.",
      "Use delay(1000) to wait one second.",
      "Use digitalWrite(13, LOW) to turn LED off."
    ],
    checkpoints: [
      {
        id: "set-pin-mode",
        title: "Pin mode set",
        description: "Pin 13 is configured as OUTPUT.",
        rules: [
          {
            type: "call",
            functionName: "pinMode",
            args: ["13", "OUTPUT"]
          }
        ]
      },
      {
        id: "led-high",
        title: "LED on",
        description: "Code sets pin 13 HIGH.",
        rules: [
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["13", "HIGH"]
          }
        ]
      },
      {
        id: "led-low",
        title: "LED off",
        description: "Code sets pin 13 LOW and uses a delay.",
        rules: [
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["13", "LOW"]
          },
          {
            type: "call",
            functionName: "delay",
            args: ["1000"],
            minCount: 1
          }
        ]
      }
    ],
    reward: {
      xp: 40,
      badgeId: "first-flash",
      badgeLabel: "First Flash"
    }
  },
  {
    id: "mission-pwm",
    order: 2,
    difficulty: "starter",
    prerequisiteMissionIds: ["mission-blink"],
    validatorVersion: "v1-pwm",
    title: "Mission 2: Light Dimmer",
    summary: "Change LED brightness using PWM on pin 9.",
    objective: "Use analogWrite to set brightness from 0 to 255.",
    safetyNotes: ["PWM values must stay between 0 and 255."],
    estimatedMinutes: 10,
    starterCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  analogWrite(9, 128);
  delay(700);
}`,
    hints: [
      "Try values 0, 128, and 255.",
      "Lower means dimmer, higher means brighter.",
      "Keep PWM values in range 0-255."
    ],
    checkpoints: [
      {
        id: "pwm-pin",
        title: "PWM pin used",
        description: "Pin 9 is set as OUTPUT.",
        rules: [
          {
            type: "call",
            functionName: "pinMode",
            args: ["9", "OUTPUT"]
          }
        ]
      },
      {
        id: "pwm-write",
        title: "Brightness set",
        description: "Code writes a valid PWM value to pin 9.",
        rules: [
          {
            type: "call",
            functionName: "analogWrite",
            args: ["9"],
            matchMode: "startsWith"
          },
          {
            type: "numericArgRange",
            functionName: "analogWrite",
            argsPrefix: ["9"],
            argIndex: 1,
            min: 0,
            max: 255
          }
        ]
      }
    ],
    reward: {
      xp: 45,
      badgeId: "light-artist",
      badgeLabel: "Light Artist"
    }
  },
  {
    id: "mission-button",
    order: 3,
    difficulty: "easy",
    prerequisiteMissionIds: ["mission-pwm"],
    validatorVersion: "v1-button",
    title: "Mission 3: Button Control",
    summary: "Read a button and light LED 13 while pressed.",
    objective: "Use digitalRead on pin 2 and if/else to control LED 13.",
    safetyNotes: ["Use INPUT_PULLUP in starter wiring for stable reads."],
    estimatedMinutes: 10,
    starterCode: `void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(2);
  if (buttonState == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}`,
    hints: [
      "With INPUT_PULLUP, pressed is usually LOW.",
      "Read button state using digitalRead(2).",
      "Set LED HIGH in one branch and LOW in the other."
    ],
    checkpoints: [
      {
        id: "button-mode",
        title: "Button input set",
        description: "Pin 2 uses INPUT or INPUT_PULLUP.",
        rules: [
          {
            type: "anyOf",
            rules: [
              {
                type: "call",
                functionName: "pinMode",
                args: ["2", "INPUT_PULLUP"]
              },
              {
                type: "call",
                functionName: "pinMode",
                args: ["2", "INPUT"]
              }
            ]
          }
        ]
      },
      {
        id: "button-read",
        title: "Button state read",
        description: "Code reads digital pin 2.",
        rules: [
          {
            type: "call",
            functionName: "digitalRead",
            args: ["2"]
          }
        ]
      },
      {
        id: "if-logic",
        title: "Condition logic used",
        description: "Code uses if and drives LED high/low.",
        rules: [
          {
            type: "contains",
            text: "if ("
          },
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["13", "HIGH"]
          },
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["13", "LOW"]
          }
        ]
      }
    ],
    reward: {
      xp: 50,
      badgeId: "button-boss",
      badgeLabel: "Button Boss"
    }
  },
  {
    id: "mission-potentiometer",
    order: 4,
    difficulty: "easy",
    prerequisiteMissionIds: ["mission-button"],
    validatorVersion: "v1-pot",
    title: "Mission 4: Potentiometer Dimmer",
    summary: "Turn a potentiometer and map input values to LED brightness.",
    objective: "Read A0, map 0-1023 to 0-255, and write to pin 9.",
    safetyNotes: ["Analog input values should stay in 0-1023 range."],
    estimatedMinutes: 12,
    starterCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(A0);
  int brightness = map(sensorValue, 0, 1023, 0, 255);
  analogWrite(9, brightness);
}`,
    hints: [
      "analogRead(A0) gives 0-1023.",
      "Use map(value, 0, 1023, 0, 255).",
      "Write final value with analogWrite(9, brightness)."
    ],
    checkpoints: [
      {
        id: "pot-read",
        title: "Potentiometer read",
        description: "Code reads analog pin A0.",
        rules: [
          {
            type: "call",
            functionName: "analogRead",
            args: ["A0"]
          }
        ]
      },
      {
        id: "map-used",
        title: "Map conversion",
        description: "Code maps 0-1023 to 0-255.",
        rules: [
          {
            type: "regex",
            pattern: "map\\s*\\(\\s*[^,]+\\s*,\\s*0\\s*,\\s*1023\\s*,\\s*0\\s*,\\s*255\\s*\\)"
          }
        ]
      },
      {
        id: "pwm-output",
        title: "PWM output written",
        description: "Code writes mapped brightness to pin 9.",
        rules: [
          {
            type: "call",
            functionName: "analogWrite",
            args: ["9"],
            matchMode: "startsWith"
          }
        ]
      }
    ],
    reward: {
      xp: 55,
      badgeId: "sensor-shaper",
      badgeLabel: "Sensor Shaper"
    }
  },
  {
    id: "mission-serial",
    order: 5,
    difficulty: "easy",
    prerequisiteMissionIds: ["mission-potentiometer"],
    validatorVersion: "v1-serial",
    title: "Mission 5: Serial Debug",
    summary: "Print sensor values to Serial Monitor for debugging.",
    objective: "Start Serial at 9600 and print analog values in loop.",
    safetyNotes: ["Keep print frequency moderate to avoid flooding serial output."],
    estimatedMinutes: 10,
    starterCode: `void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(A0);
  Serial.println(sensorValue);
  delay(250);
}`,
    hints: [
      "Initialize with Serial.begin(9600).",
      "Print values using Serial.println().",
      "Add a short delay for readable output."
    ],
    checkpoints: [
      {
        id: "serial-begin",
        title: "Serial initialized",
        description: "Serial starts at 9600 baud.",
        rules: [
          {
            type: "call",
            functionName: "Serial.begin",
            args: ["9600"]
          }
        ]
      },
      {
        id: "sensor-read",
        title: "Sensor read",
        description: "Code reads A0 sensor value.",
        rules: [
          {
            type: "call",
            functionName: "analogRead",
            args: ["A0"]
          }
        ]
      },
      {
        id: "serial-print",
        title: "Value printed",
        description: "Code prints to Serial Monitor.",
        rules: [
          {
            type: "call",
            functionName: "Serial.println",
            minCount: 1
          }
        ]
      }
    ],
    reward: {
      xp: 55,
      badgeId: "debug-detective",
      badgeLabel: "Debug Detective"
    }
  },
  {
    id: "mission-buzzer",
    order: 6,
    difficulty: "easy",
    prerequisiteMissionIds: ["mission-serial"],
    validatorVersion: "v1-buzzer",
    title: "Mission 6: Buzzer Beat",
    summary: "Play a repeating tone pattern on a buzzer.",
    objective: "Use tone, delay, and noTone to create a rhythm.",
    safetyNotes: ["Keep sound levels low and avoid prolonged loud tones."],
    estimatedMinutes: 11,
    starterCode: `void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
  tone(8, 440, 200);
  delay(300);
  noTone(8);
  delay(300);
}`,
    hints: [
      "tone(pin, freq, duration) starts a note.",
      "noTone(pin) stops playback.",
      "Use delay between notes."
    ],
    checkpoints: [
      {
        id: "buzzer-pin",
        title: "Buzzer pin setup",
        description: "Pin 8 is set to OUTPUT.",
        rules: [
          {
            type: "call",
            functionName: "pinMode",
            args: ["8", "OUTPUT"]
          }
        ]
      },
      {
        id: "tone-used",
        title: "Tone played",
        description: "Code calls tone on pin 8.",
        rules: [
          {
            type: "call",
            functionName: "tone",
            args: ["8"],
            matchMode: "startsWith"
          }
        ]
      },
      {
        id: "tone-stop",
        title: "Tone stopped",
        description: "Code calls noTone on pin 8.",
        rules: [
          {
            type: "call",
            functionName: "noTone",
            args: ["8"]
          }
        ]
      }
    ],
    reward: {
      xp: 60,
      badgeId: "rhythm-builder",
      badgeLabel: "Rhythm Builder"
    }
  },
  {
    id: "mission-temperature",
    order: 7,
    difficulty: "medium",
    prerequisiteMissionIds: ["mission-buzzer"],
    validatorVersion: "v1-temp",
    title: "Mission 7: Temperature Alert",
    summary: "Read a temperature sensor and trigger LED alert when too warm.",
    objective: "Read A1, compare against a threshold, and control LED 13.",
    safetyNotes: ["Threshold logic should avoid rapid flickering near boundary."],
    estimatedMinutes: 12,
    starterCode: `void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int tempValue = analogRead(A1);
  if (tempValue > 550) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  Serial.println(tempValue);
  delay(300);
}`,
    hints: [
      "Read temperature from analog pin A1.",
      "Use an if condition with a threshold.",
      "Turn LED on for values above threshold."
    ],
    checkpoints: [
      {
        id: "temp-read",
        title: "Temperature read",
        description: "Code reads analog pin A1.",
        rules: [
          {
            type: "call",
            functionName: "analogRead",
            args: ["A1"]
          }
        ]
      },
      {
        id: "temp-condition",
        title: "Threshold condition",
        description: "Code compares the sensor value using if.",
        rules: [
          {
            type: "contains",
            text: "if ("
          },
          {
            type: "regex",
            pattern: "if\\s*\\([^\\)]*>\\s*\\d+\\s*\\)"
          }
        ]
      },
      {
        id: "temp-alert-output",
        title: "Alert output",
        description: "Code writes HIGH and LOW to LED 13.",
        rules: [
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["13", "HIGH"]
          },
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["13", "LOW"]
          }
        ]
      }
    ],
    reward: {
      xp: 65,
      badgeId: "temp-guardian",
      badgeLabel: "Temp Guardian"
    }
  },
  {
    id: "mission-ultrasonic",
    order: 8,
    difficulty: "medium",
    prerequisiteMissionIds: ["mission-temperature"],
    validatorVersion: "v1-ultra",
    title: "Mission 8: Distance Sensor",
    summary: "Use ultrasonic sensor timing to estimate distance.",
    objective: "Use trig/echo pins and pulseIn to compute and print distance.",
    safetyNotes: ["Avoid wiring changes while board is powered."],
    estimatedMinutes: 13,
    starterCode: `int trigPin = 7;
int echoPin = 6;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int distanceCm = duration * 0.034 / 2;
  Serial.println(distanceCm);
  delay(200);
}`,
    hints: [
      "Send a short HIGH pulse on trig pin.",
      "Use pulseIn on echo pin to measure duration.",
      "Convert to cm and print to Serial."
    ],
    checkpoints: [
      {
        id: "ultra-pin-modes",
        title: "Pins configured",
        description: "Trig and echo pins are configured.",
        rules: [
          {
            type: "call",
            functionName: "pinMode",
            args: ["trigPin", "OUTPUT"]
          },
          {
            type: "call",
            functionName: "pinMode",
            args: ["echoPin", "INPUT"]
          }
        ]
      },
      {
        id: "ultra-pulse",
        title: "Pulse sent",
        description: "Code sends a HIGH pulse and uses pulseIn.",
        rules: [
          {
            type: "call",
            functionName: "digitalWrite",
            args: ["trigPin", "HIGH"]
          },
          {
            type: "call",
            functionName: "pulseIn",
            args: ["echoPin", "HIGH"]
          }
        ]
      },
      {
        id: "ultra-report",
        title: "Distance reported",
        description: "Distance is calculated and printed.",
        rules: [
          {
            type: "contains",
            text: "0.034"
          },
          {
            type: "call",
            functionName: "Serial.println",
            minCount: 1
          }
        ]
      }
    ],
    reward: {
      xp: 70,
      badgeId: "range-ranger",
      badgeLabel: "Range Ranger"
    }
  },
  {
    id: "mission-servo",
    order: 9,
    difficulty: "medium",
    prerequisiteMissionIds: ["mission-ultrasonic"],
    validatorVersion: "v1-servo",
    title: "Mission 9: Servo Sweep",
    summary: "Control a servo motor between angles.",
    objective: "Attach servo, write angles, and create a sweep motion.",
    safetyNotes: ["Keep servo movement clear of fingers and loose wires."],
    estimatedMinutes: 13,
    starterCode: `#include <Servo.h>

Servo gateServo;

void setup() {
  gateServo.attach(5);
}

void loop() {
  gateServo.write(20);
  delay(500);
  gateServo.write(160);
  delay(500);
}`,
    hints: [
      "Create a Servo object and attach to a PWM pin.",
      "Use write(angle) with safe angle range.",
      "Add delays so movement is visible."
    ],
    checkpoints: [
      {
        id: "servo-attach",
        title: "Servo attached",
        description: "Code attaches servo to pin 5.",
        rules: [
          {
            type: "call",
            functionName: "gateServo.attach",
            args: ["5"]
          }
        ]
      },
      {
        id: "servo-low-angle",
        title: "Lower angle set",
        description: "Code writes a low servo angle.",
        rules: [
          {
            type: "regex",
            pattern: "gateservo\\.write\\s*\\(\\s*[0-8]?\\d\\s*\\)"
          }
        ]
      },
      {
        id: "servo-high-angle",
        title: "Higher angle set",
        description: "Code writes a higher servo angle and delays.",
        rules: [
          {
            type: "regex",
            pattern: "gateservo\\.write\\s*\\(\\s*1[0-7]\\d\\s*\\)"
          },
          {
            type: "call",
            functionName: "delay",
            minCount: 2
          }
        ]
      }
    ],
    reward: {
      xp: 75,
      badgeId: "servo-smith",
      badgeLabel: "Servo Smith"
    }
  },
  {
    id: "mission-reaction-timer",
    order: 10,
    difficulty: "hard",
    prerequisiteMissionIds: ["mission-servo"],
    validatorVersion: "v1-reaction",
    title: "Mission 10: Reaction Timer Mini-Game",
    summary: "Build a simple reaction timer game with button and LED.",
    objective: "Use random delay, wait for button press, print reaction time.",
    safetyNotes: ["Use INPUT_PULLUP for stable button state."],
    estimatedMinutes: 15,
    starterCode: `const int ledPin = 13;
const int buttonPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int waitMs = random(1000, 3000);
  delay(waitMs);
  digitalWrite(ledPin, HIGH);
  unsigned long startTime = millis();

  while (digitalRead(buttonPin) == HIGH) {
    // wait for press
  }

  unsigned long reaction = millis() - startTime;
  digitalWrite(ledPin, LOW);
  Serial.println(reaction);
  delay(800);
}`,
    hints: [
      "Use random(min, max) for unpredictable start time.",
      "Store millis() when LED turns on.",
      "Print difference after button press."
    ],
    checkpoints: [
      {
        id: "reaction-random-delay",
        title: "Random wait",
        description: "Code uses random delay before signal.",
        rules: [
          {
            type: "call",
            functionName: "random",
            minCount: 1
          }
        ]
      },
      {
        id: "reaction-millis",
        title: "Time measured",
        description: "Code reads millis for timing.",
        rules: [
          {
            type: "call",
            functionName: "millis",
            minCount: 2
          }
        ]
      },
      {
        id: "reaction-report",
        title: "Reaction printed",
        description: "Code prints reaction time.",
        rules: [
          {
            type: "call",
            functionName: "Serial.println",
            minCount: 1
          }
        ]
      }
    ],
    reward: {
      xp: 80,
      badgeId: "speed-sensei",
      badgeLabel: "Speed Sensei"
    }
  },
  {
    id: "mission-night-light",
    order: 11,
    difficulty: "hard",
    prerequisiteMissionIds: ["mission-reaction-timer"],
    validatorVersion: "v1-night-light",
    title: "Mission 11: Smart Night Light",
    summary: "Create a light that turns on automatically in the dark.",
    objective: "Read LDR on A2 and set LED brightness based on darkness.",
    safetyNotes: ["Use resistor values recommended by your kit guide."],
    estimatedMinutes: 15,
    starterCode: `void setup() {
  pinMode(9, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(A2);
  int brightness = map(lightLevel, 1023, 0, 0, 255);
  analogWrite(9, brightness);
  Serial.println(brightness);
  delay(250);
}`,
    hints: [
      "Read light sensor from A2.",
      "Map dark values to higher brightness.",
      "Drive LED with PWM on pin 9."
    ],
    checkpoints: [
      {
        id: "night-read",
        title: "Light sensor read",
        description: "Code reads A2.",
        rules: [
          {
            type: "call",
            functionName: "analogRead",
            args: ["A2"]
          }
        ]
      },
      {
        id: "night-map",
        title: "Reverse mapping",
        description: "Code maps from high-to-low input range.",
        rules: [
          {
            type: "regex",
            pattern: "map\\s*\\(\\s*[^,]+\\s*,\\s*1023\\s*,\\s*0\\s*,\\s*0\\s*,\\s*255\\s*\\)"
          }
        ]
      },
      {
        id: "night-output",
        title: "Brightness output",
        description: "Code writes brightness to pin 9 and prints.",
        rules: [
          {
            type: "call",
            functionName: "analogWrite",
            args: ["9"],
            matchMode: "startsWith"
          },
          {
            type: "call",
            functionName: "Serial.println",
            minCount: 1
          }
        ]
      }
    ],
    reward: {
      xp: 85,
      badgeId: "night-architect",
      badgeLabel: "Night Architect"
    }
  },
  {
    id: "mission-distance-alarm",
    order: 12,
    difficulty: "hard",
    prerequisiteMissionIds: ["mission-night-light"],
    validatorVersion: "v1-distance-alarm",
    title: "Mission 12: Distance Alarm Project",
    summary: "Combine ultrasonic sensor and buzzer for a distance alarm.",
    objective: "Measure distance and play a warning tone when object is near.",
    safetyNotes: ["Keep objects and wires clear of moving or powered parts."],
    estimatedMinutes: 16,
    starterCode: `int trigPin = 7;
int echoPin = 6;
int buzzerPin = 8;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int distanceCm = duration * 0.034 / 2;

  if (distanceCm < 20) {
    tone(buzzerPin, 880, 120);
  } else {
    noTone(buzzerPin);
  }

  Serial.println(distanceCm);
  delay(200);
}`,
    hints: [
      "Read distance first using trig/echo pulse flow.",
      "Use an if condition with distance threshold.",
      "Trigger tone when close, noTone when far."
    ],
    checkpoints: [
      {
        id: "alarm-distance-read",
        title: "Distance measured",
        description: "Code uses pulseIn and distance formula.",
        rules: [
          {
            type: "call",
            functionName: "pulseIn",
            args: ["echoPin", "HIGH"]
          },
          {
            type: "contains",
            text: "0.034"
          }
        ]
      },
      {
        id: "alarm-condition",
        title: "Distance threshold condition",
        description: "Code checks if distance is below threshold.",
        rules: [
          {
            type: "regex",
            pattern: "if\\s*\\(\\s*distancecm\\s*<\\s*\\d+\\s*\\)"
          }
        ]
      },
      {
        id: "alarm-output",
        title: "Alarm output logic",
        description: "Code uses tone and noTone behavior.",
        rules: [
          {
            type: "call",
            functionName: "tone",
            args: ["buzzerPin"],
            matchMode: "startsWith"
          },
          {
            type: "call",
            functionName: "noTone",
            args: ["buzzerPin"]
          },
          {
            type: "call",
            functionName: "Serial.println",
            minCount: 1
          }
        ]
      }
    ],
    reward: {
      xp: 100,
      badgeId: "project-pioneer",
      badgeLabel: "Project Pioneer"
    }
  }
];

