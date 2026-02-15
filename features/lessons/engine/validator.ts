import type {
  CheckpointRule,
  Mission,
  MissionCheckpointResult,
  MissionValidationProfile
} from "@/features/lessons/types";

export type MissionValidationResult = {
  isPass: boolean;
  passedCheckpointIds: string[];
  missingCheckpointIds: string[];
  checkpointResults: MissionCheckpointResult[];
  profile: MissionValidationProfile;
};

type ParsedCall = {
  functionName: string;
  args: string[];
};

type RuleOutcome = {
  passed: boolean;
  evidence: string[];
  failureReason: string;
};

const DEFAULT_FAILURE_REASON = "Rule did not pass.";

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, " ").trim().toLowerCase();
}

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
      functionName: normalizeCode(fnName),
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

function passOutcome(evidence: string): RuleOutcome {
  return {
    passed: true,
    evidence: [evidence],
    failureReason: ""
  };
}

function failOutcome(failureReason: string): RuleOutcome {
  return {
    passed: false,
    evidence: [],
    failureReason
  };
}

function evaluateRule(rule: CheckpointRule, normalizedCode: string, parsedCalls: ParsedCall[]): RuleOutcome {
  if (rule.type === "contains") {
    const needle = normalizeCode(rule.text);
    if (normalizedCode.includes(needle)) {
      return passOutcome(`Contains "${rule.text}"`);
    }
    return failOutcome(`Missing expected snippet "${rule.text}".`);
  }

  if (rule.type === "regex") {
    const regex = new RegExp(rule.pattern, rule.flags);
    if (regex.test(normalizedCode)) {
      return passOutcome(`Matches pattern /${rule.pattern}/${rule.flags ?? ""}`);
    }
    return failOutcome(`Code does not match pattern /${rule.pattern}/${rule.flags ?? ""}.`);
  }

  if (rule.type === "anyOf") {
    const outcomes = rule.rules.map((nestedRule) =>
      evaluateRule(nestedRule, normalizedCode, parsedCalls)
    );
    const passed = outcomes.find((outcome) => outcome.passed);
    if (passed) {
      return passed;
    }

    const reasons = outcomes.map((outcome) => outcome.failureReason).filter(Boolean);
    return failOutcome(reasons.join(" OR ") || DEFAULT_FAILURE_REASON);
  }

  if (rule.type === "call") {
    const targetFn = normalizeCode(rule.functionName);
    const matchingCalls = parsedCalls.filter((call) => call.functionName === targetFn);
    const minCount = rule.minCount ?? 1;
    const expectedArgs = rule.args ?? [];
    const matchMode = rule.matchMode ?? "exact";

    if (expectedArgs.length === 0) {
      if (matchingCalls.length >= minCount) {
        return passOutcome(`Found ${matchingCalls.length} call(s) to ${rule.functionName}.`);
      }
      return failOutcome(
        `Expected at least ${minCount} call(s) to ${rule.functionName}, found ${matchingCalls.length}.`
      );
    }

    const count = matchingCalls.filter((call) =>
      matchesArgs(call.args, expectedArgs, matchMode)
    ).length;

    if (count >= minCount) {
      return passOutcome(
        `Found ${count} matching ${rule.functionName} call(s) with args ${expectedArgs.join(", ")}.`
      );
    }

    return failOutcome(
      `Expected ${rule.functionName}(${expectedArgs.join(", ")}) with mode ${matchMode}; found ${count} match(es).`
    );
  }

  if (rule.type === "numericArgRange") {
    const targetFn = normalizeCode(rule.functionName);
    const minCount = rule.minCount ?? 1;
    const prefixArgs = (rule.argsPrefix ?? []).map((arg) => normalizeCode(arg));

    const matchingCount = parsedCalls.filter((call) => {
      if (call.functionName !== targetFn) return false;

      if (prefixArgs.length > 0 && !matchesArgs(call.args, prefixArgs, "startsWith")) {
        return false;
      }

      const numericRaw = call.args[rule.argIndex];
      if (!numericRaw) return false;

      const numericValue = Number(numericRaw);
      return Number.isFinite(numericValue) && numericValue >= rule.min && numericValue <= rule.max;
    }).length;

    if (matchingCount >= minCount) {
      return passOutcome(
        `Found ${matchingCount} ${rule.functionName} call(s) with arg[${rule.argIndex}] in range ${rule.min}-${rule.max}.`
      );
    }

    return failOutcome(
      `Expected ${rule.functionName} arg[${rule.argIndex}] in range ${rule.min}-${rule.max}.`
    );
  }

  return failOutcome(DEFAULT_FAILURE_REASON);
}

function buildCheckpointResult(
  checkpointId: string,
  ruleOutcomes: RuleOutcome[]
): MissionCheckpointResult {
  const failed = ruleOutcomes.find((outcome) => !outcome.passed);

  return {
    checkpointId,
    passed: !failed,
    evidence: ruleOutcomes.flatMap((outcome) => outcome.evidence),
    failureReason: failed?.failureReason ?? ""
  };
}

export function validateMissionCode(mission: Mission, code: string): MissionValidationResult {
  const normalized = normalizeCode(code);
  const parsedCalls = parseCalls(code);

  const checkpointResults = mission.checkpoints.map((checkpoint) => {
    const outcomes = checkpoint.rules.map((rule) => evaluateRule(rule, normalized, parsedCalls));
    return buildCheckpointResult(checkpoint.id, outcomes);
  });

  const passedCheckpointIds = checkpointResults
    .filter((result) => result.passed)
    .map((result) => result.checkpointId);

  const missingCheckpointIds = checkpointResults
    .filter((result) => !result.passed)
    .map((result) => result.checkpointId);

  return {
    isPass: missingCheckpointIds.length === 0,
    passedCheckpointIds,
    missingCheckpointIds,
    checkpointResults,
    profile: {
      profileId: mission.validatorVersion,
      deterministic: true
    }
  };
}

