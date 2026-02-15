# Incident Response Runbook

## Severity levels

- `P0`: App unavailable or unsafe behavior affecting all users.
- `P1`: Core learning flow broken for most users.
- `P2`: Partial degradation or non-critical bug.

## Immediate actions

1. Acknowledge incident in team channel.
2. Record start time and impacted surfaces.
3. Triage latest deployment and browser-specific failures.
4. If P0/P1, rollback to previous stable deployment.

## Containment checklist

- Disable hardware mode if it causes instability by setting:
  - `NEXT_PUBLIC_HARDWARE_MODE_ENABLED=false`
- Keep simulator mode active.
- Confirm policy and safety pages still accessible.

## Communication template

Use short status updates:

- Current impact.
- Temporary workaround.
- Next expected update time.

## Post-incident

1. Root cause summary.
2. User impact summary.
3. Preventive action items.
4. Add missing test cases for regression prevention.

