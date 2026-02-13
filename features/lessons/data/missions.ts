import type { Mission } from "@/features/lessons/types";

export const missions: Mission[] = [
  {
    id: "mission-blink",
    order: 1,
    title: "Mission 1: Blink",
    summary: "Make the built-in LED blink on and off every second.",
    objective: "Use pin 13 to turn LED on, wait, then turn it off and repeat.",
    estimatedMinutes: 8,
    starterCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  // TODO: Turn LED on

  // TODO: Wait 1000 ms

  // TODO: Turn LED off

  // TODO: Wait 1000 ms
}`,
    hints: [
      "Use digitalWrite(13, HIGH) to turn the LED on.",
      "Use delay(1000) to wait for one second.",
      "Use digitalWrite(13, LOW) to turn the LED off."
    ],
    checkpoints: [
      {
        id: "set-pin-mode",
        title: "Pin mode set",
        description: "Pin 13 is configured as OUTPUT in setup().",
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
        description: "Code sets pin 13 HIGH in loop().",
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
        description: "Code sets pin 13 LOW in loop().",
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
    title: "Mission 2: Light Dimmer",
    summary: "Change LED brightness using PWM on pin 9.",
    objective: "Use analogWrite to set brightness from 0 to 255.",
    estimatedMinutes: 10,
    starterCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  // TODO: Set a brightness value from 0 to 255
  analogWrite(9, 128);
}`,
    hints: [
      "Try analogWrite(9, 0), analogWrite(9, 128), and analogWrite(9, 255).",
      "Lower value means dimmer. Higher value means brighter.",
      "Add delay(700) if you want to see step changes."
    ],
    checkpoints: [
      {
        id: "pwm-pin",
        title: "PWM pin used",
        description: "Pin 9 is configured as OUTPUT.",
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
        description: "Code writes a PWM value to pin 9.",
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
    title: "Mission 3: Button Control",
    summary: "Read a button and light LED 13 only while the button is pressed.",
    objective: "Use digitalRead on pin 2 and an if/else to control LED 13.",
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
      "INPUT_PULLUP means pressed is usually LOW, not HIGH.",
      "Read the button using digitalRead(2).",
      "Use if/else to set LED HIGH or LOW."
    ],
    checkpoints: [
      {
        id: "button-mode",
        title: "Button input set",
        description: "Pin 2 is configured as INPUT or INPUT_PULLUP.",
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
        description: "Code reads pin 2 using digitalRead.",
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
        description: "Code uses if/else logic to change LED state.",
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
    title: "Mission 4: Potentiometer Dimmer",
    summary: "Turn a potentiometer and map input values to LED brightness.",
    objective: "Read A0, map 0-1023 to 0-255, then write to pin 9.",
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
      "analogRead(A0) gives values from 0 to 1023.",
      "Use map(value, 0, 1023, 0, 255) before analogWrite.",
      "analogWrite expects pin 9 and brightness 0-255."
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
        description: "Code uses map to convert 0-1023 to 0-255.",
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
    title: "Mission 5: Serial Debug",
    summary: "Print sensor values to the Serial Monitor for debugging.",
    objective: "Start Serial at 9600 and print analog values each loop.",
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
      "Call Serial.begin(9600) once in setup().",
      "Use Serial.println(value) inside loop().",
      "Add a short delay so output stays readable."
    ],
    checkpoints: [
      {
        id: "serial-begin",
        title: "Serial initialized",
        description: "Serial begins at 9600 baud.",
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
        description: "Code reads analog value from A0.",
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
        description: "Code prints values to Serial Monitor.",
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
    title: "Mission 6: Buzzer Beat",
    summary: "Play a repeating tone pattern with a buzzer on pin 8.",
    objective: "Use tone, delay, and noTone to make a simple rhythm.",
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
      "tone(pin, frequency, duration) starts a note.",
      "noTone(pin) stops the buzzer.",
      "Use delay between notes to create rhythm."
    ],
    checkpoints: [
      {
        id: "buzzer-pin",
        title: "Buzzer pin setup",
        description: "Pin 8 is configured as OUTPUT.",
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
  }
];
