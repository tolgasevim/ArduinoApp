/**
 * Returns the subset of hints the learner should see given their attempt count.
 *
 * - 0 attempts: no hints (mission not yet tried)
 * - 1 attempt:  no hints (first failure — give them a chance)
 * - 2 attempts: first hint unlocked
 * - every 2 additional attempts: one more hint revealed
 * - isCompleted: all hints visible regardless of attempts
 */
export function getVisibleHints(
  hints: string[],
  attempts: number,
  isCompleted: boolean
): string[] {
  if (isCompleted) {
    return hints;
  }

  if (attempts < 2) {
    return [];
  }

  const count = Math.min(hints.length, 1 + Math.floor((attempts - 2) / 2));
  return hints.slice(0, count);
}
