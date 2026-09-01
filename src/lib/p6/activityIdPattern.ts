import { Activity } from '../../types/p6';

export interface ActivityIdPattern {
  prefix: string;
  maxNumber: number;
  digitCount: number;
  stepIncrement: number;
}

/**
 * Analyzes the existing activities in the project (or selected WBS branch)
 * to automatically detect the Activity ID naming convention (prefix, zero-padding, step).
 */
export function analyzeActivityIdPattern(
  existingActivities: Activity[],
  targetWbsId?: string | null
): ActivityIdPattern {
  if (!existingActivities || existingActivities.length === 0) {
    return {
      prefix: 'A',
      maxNumber: 1000,
      digitCount: 4,
      stepIncrement: 10,
    };
  }

  // Filter by target WBS if available, otherwise analyze all activities
  let relevantActs = targetWbsId
    ? existingActivities.filter(a => a.wbsId === targetWbsId)
    : [];

  if (relevantActs.length === 0) {
    relevantActs = existingActivities;
  }

  const prefixCounts = new Map<string, number>();
  const parsedNumbers: { prefix: string; num: number; digits: number }[] = [];

  for (const act of relevantActs) {
    const id = act.activityId.trim();
    // Match prefix (letters, dashes, underscores) + numeric part
    const match = id.match(/^([A-Za-z_\-\.\s]*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      const num = parseInt(numStr, 10);
      const digits = numStr.length;

      prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
      parsedNumbers.push({ prefix, num, digits });
    }
  }

  // Find dominant prefix
  let dominantPrefix = 'A';
  let maxCount = 0;
  for (const [pfx, count] of prefixCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      dominantPrefix = pfx;
    }
  }

  // Filter numbers matching dominant prefix
  const matching = parsedNumbers.filter(p => p.prefix === dominantPrefix);

  if (matching.length === 0) {
    return {
      prefix: dominantPrefix || 'A',
      maxNumber: 1000,
      digitCount: 4,
      stepIncrement: 10,
    };
  }

  const nums = matching.map(m => m.num);
  const maxNumber = Math.max(...nums);
  const avgDigits = Math.max(...matching.map(m => m.digits));

  // Determine step increment (usually 10, 5, or 1)
  let stepIncrement = 10;
  if (nums.length >= 2) {
    const sorted = [...nums].sort((a, b) => a - b);
    const diffs: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i] - sorted[i - 1];
      if (diff > 0 && diff <= 100) diffs.push(diff);
    }
    if (diffs.length > 0) {
      const minDiff = Math.min(...diffs);
      if (minDiff === 1 || minDiff === 5 || minDiff === 10 || minDiff === 20) {
        stepIncrement = minDiff;
      }
    }
  }

  return {
    prefix: dominantPrefix,
    maxNumber,
    digitCount: avgDigits,
    stepIncrement,
  };
}

/**
 * Formats a sequential Activity ID conforming to the detected pattern
 */
export function formatActivityId(pattern: ActivityIdPattern, sequenceIndex: number): string {
  const nextNum = pattern.maxNumber + (sequenceIndex + 1) * pattern.stepIncrement;
  const numStr = String(nextNum).padStart(pattern.digitCount, '0');
  return `${pattern.prefix}${numStr}`;
}
