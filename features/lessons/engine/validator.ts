import type { CheckpointRule, Mission } from "@/features/lessons/types";

export type MissionValidationResult = {
  isPass: boolean;
  passedCheckpointIds: string[];
  missingCheckpointIds: string[];
};

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, " ").trim().toLowerCase();
}

type ParsedCall = {
  functionName: string;
  args: string[];
};

function splitArgs(rawArgs: string): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of rawArgs) {
    if (char === "," && depth === 0) {
      if (current.trim().length > 0) {
        args.push(current.trim());
      } else {
        args.push("");
      }
      current = "";
      continue;
    }

    if (char === "(") depth += 1;
    if (char === ")" && depth > 0) depth -= 1;
    current += char;
  }

  if (current.length > 0) {
    args.push(current.trim());
  }

  return args.filter((arg) => arg.length > 0);
}

function parseCalls(code: string): ParsedCall[] {
  const callRegex = /([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?)\s*\(([^)]*)\)/g;
  const calls: ParsedCall[] = [];

  for (const match of code.matchAll(callRegex)) {
    const [, fnName, rawArgs] = match;
    calls.push({
      functionName: fnName.toLowerCase(),
      args: splitArgs(rawArgs).map((arg) => normalizeCode(arg))
    });
  }

  return calls;
}

function matchesArgs(
  callArgs: string[],
  expectedArgs: string[],
  matchMode: "exact" | "startsWith"
): boolean {
  if (matchMode === "exact") {
    if (callArgs.length !== expectedArgs.length) return false;
    return expectedArgs.every((expected, index) => callArgs[index] === normalizeCode(expected));
  }

  if (callArgs.length < expectedArgs.length) return false;
  return expectedArgs.every((expected, index) =>
    callArgs[index].startsWith(normalizeCode(expected))
  );
}

function evaluateRule(rule: CheckpointRule, normalizedCode: string, parsedCalls: ParsedCall[]): boolean {
  if (rule.type === "contains") {
    return normalizedCode.includes(normalizeCode(rule.text));
  }

  if (rule.type === "regex") {
    const regex = new RegExp(rule.pattern, rule.flags);
    return regex.test(normalizedCode);
  }

  if (rule.type === "anyOf") {
    return rule.rules.some((nestedRule) => evaluateRule(nestedRule, normalizedCode, parsedCalls));
  }

  if (rule.type === "call") {
    const targetFn = normalizeCode(rule.functionName);
    const matchingCalls = parsedCalls.filter((call) => call.functionName === targetFn);
    const minCount = rule.minCount ?? 1;

    if (!rule.args || rule.args.length === 0) {
      return matchingCalls.length >= minCount;
    }

    const matchMode = rule.matchMode ?? "exact";
    const count = matchingCalls.filter((call) =>
      matchesArgs(call.args, rule.args ?? [], matchMode)
    ).length;
    return count >= minCount;
  }

  if (rule.type === "numericArgRange") {
    const targetFn = normalizeCode(rule.functionName);
    const minCount = rule.minCount ?? 1;
    const prefixArgs = (rule.argsPrefix ?? []).map((arg) => normalizeCode(arg));

    const count = parsedCalls.filter((call) => {
      if (call.functionName !== targetFn) {
        return false;
      }

      if (prefixArgs.length > 0 && !matchesArgs(call.args, prefixArgs, "startsWith")) {
        return false;
      }

      const numericRaw = call.args[rule.argIndex];
      if (!numericRaw) {
        return false;
      }

      const numericValue = Number(numericRaw);
      return Number.isFinite(numericValue) && numericValue >= rule.min && numericValue <= rule.max;
    }).length;

    return count >= minCount;
  }

  return false;
}

export function validateMissionCode(mission: Mission, code: string): MissionValidationResult {
  const normalized = normalizeCode(code);
  const parsedCalls = parseCalls(code);

  const passed = mission.checkpoints
    .filter((checkpoint) => checkpoint.rules.every((rule) => evaluateRule(rule, normalized, parsedCalls)))
    .map((checkpoint) => checkpoint.id);

  const missing = mission.checkpoints
    .map((checkpoint) => checkpoint.id)
    .filter((checkpointId) => !passed.includes(checkpointId));

  return {
    isPass: missing.length === 0,
    passedCheckpointIds: passed,
    missingCheckpointIds: missing
  };
}
