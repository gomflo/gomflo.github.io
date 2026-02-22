/**
 * Line-by-line diff for Compare/Diff viewer.
 * Produces a list of operations (add, remove, equal) with line numbers.
 */

export type DiffOp = "add" | "remove" | "equal";

export interface DiffLine {
  type: DiffOp;
  content: string;
  /** 1-based line number in the left (old) text */
  lineLeft?: number;
  /** 1-based line number in the right (new) text */
  lineRight?: number;
}

function splitLines(s: string): string[] {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

/**
 * Compute longest common subsequence length table for two arrays.
 * Uses dynamic programming; returns the LCS length table (a.length+1 x b.length+1).
 */
function lcsTable<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): number[][] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (eq(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

/**
 * Backtrack over the LCS table to produce a list of (type, line, lineLeft, lineRight).
 * We traverse from (n, m) to (0, 0); when we go diagonal we emit equal, when we go up we emit remove, when we go left we emit add.
 */
function backtrack<T>(
  a: T[],
  b: T[],
  dp: number[][],
  eq: (x: T, y: T) => boolean
): DiffLine[] {
  const result: DiffLine[] = [];
  let i = a.length;
  let j = b.length;
  const content = (line: T) => (typeof line === "string" ? line : String(line));

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && eq(a[i - 1], b[j - 1])) {
      result.unshift({
        type: "equal",
        content: content(a[i - 1]),
        lineLeft: i,
        lineRight: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: "add",
        content: content(b[j - 1]),
        lineRight: j,
      });
      j--;
    } else {
      result.unshift({
        type: "remove",
        content: content(a[i - 1]),
        lineLeft: i,
      });
      i--;
    }
  }
  return result;
}

/**
 * Compare two strings line-by-line and return a list of diff operations.
 */
export function diffLines(left: string, right: string): DiffLine[] {
  const a = splitLines(left);
  const b = splitLines(right);
  const eq = (x: string, y: string) => x === y;
  const dp = lcsTable(a, b, eq);
  return backtrack(a, b, dp, eq);
}

/**
 * Try to parse and re-stringify JSON for a cleaner diff (optional use in UI).
 */
export function tryFormatJson(text: string): { ok: true; formatted: string } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, formatted: "" };
  try {
    const parsed = JSON.parse(trimmed);
    return { ok: true, formatted: JSON.stringify(parsed, null, 2) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
