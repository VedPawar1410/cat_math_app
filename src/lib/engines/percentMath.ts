/**
 * Exact percentage helpers for the coaching drills.
 *
 * Whole numbers until the last step: (23 / 80) * 100 in floating point is what
 * made a right answer grade as wrong in the Arun Sharma track. Typed answers are
 * read from their digits, never with parseFloat.
 */

export interface Fraction {
  k: number;
  n: number;
}

export interface Grade {
  correct: boolean;
  /** Explains a known slip, e.g. multiplying a cut-off chart value. */
  trap?: string;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function simplify({ k, n }: Fraction): Fraction {
  const divisor = gcd(k, n) || 1;
  return { k: k / divisor, n: n / divisor };
}

/** k/n as a percentage in hundredths, cut off after 2 decimals: 1/6 gives 1666 (16.66). */
export function truncatedHundredths({ k, n }: Fraction): number {
  return Math.floor((k * 10000) / n);
}

/** k/n as a percentage in hundredths, rounded half up: 1/6 gives 1667 (16.67). */
export function roundedHundredths({ k, n }: Fraction): number {
  return Math.floor((k * 20000 + n) / (2 * n));
}

/** 4285 gives "42.85", 1250 gives "12.5", 5000 gives "50". */
export function formatHundredths(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  const decimals = String(hundredths % 100).padStart(2, "0").replace(/0+$/, "");
  return decimals ? `${whole}.${decimals}` : String(whole);
}

/** The percentage as shown in the chart, cut off after 2 decimals. */
export function formatPercent(fraction: Fraction): string {
  return formatHundredths(truncatedHundredths(fraction));
}

/** True when 2 decimals don't capture the value exactly (16.66 for 1/6). */
export function isCutOff({ k, n }: Fraction): boolean {
  return (k * 10000) % n !== 0;
}

/** Three decimals with "…" when it keeps going: 3/7 gives "42.857…". */
export function describeExact({ k, n }: Fraction): string {
  const thousandths = Math.floor((k * 100000) / n);
  const whole = Math.floor(thousandths / 1000);
  const decimals = String(thousandths % 1000).padStart(3, "0").replace(/0+$/, "");
  const shown = decimals ? `${whole}.${decimals}` : String(whole);
  return (k * 100000) % n === 0 ? shown : `${shown}…`;
}

/** Reads "42.857" as 4285 hundredths (cut off), or null if it isn't a number. */
export function parseHundredths(input: string): number | null {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(input.trim());
  if (!match) return null;
  const decimals = (match[2] ?? "").padEnd(2, "0").slice(0, 2);
  return Number(match[1]) * 100 + Number(decimals);
}

/**
 * Accepts the cut-off or the rounded value (16.66 or 16.67), and extra decimals
 * that cut off to the right value (42.857). Flags k times the cut-off 1/n
 * (3 x 14.28 = 42.84), which is the slip from class.
 */
export function gradePercent(input: string, value: Fraction): Grade {
  const fraction = simplify(value);
  const typed = parseHundredths(input);
  if (typed === null) return { correct: false };
  if (typed === truncatedHundredths(fraction) || typed === roundedHundredths(fraction)) {
    return { correct: true };
  }

  if (fraction.k > 1) {
    const unit = truncatedHundredths({ k: 1, n: fraction.n });
    if (typed === unit * fraction.k) {
      return {
        correct: false,
        trap: `That's ${fraction.k} × ${formatHundredths(unit)}. The chart value is cut off, so multiplying it loses a little: ${fraction.k}/${fraction.n} = ${describeExact(fraction)}%.`,
      };
    }
  }
  return { correct: false };
}

/** Reads "4/3"; returns null for anything else, or a zero part. */
export function parseFraction(input: string): Fraction | null {
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(input.trim());
  if (!match) return null;
  const k = Number(match[1]);
  const n = Number(match[2]);
  return k === 0 || n === 0 ? null : { k, n };
}

/** Equal by cross-multiplying, so 8/6 equals 4/3. */
export function fractionsEqual(a: Fraction, b: Fraction): boolean {
  return a.k * b.n === b.k * a.n;
}

export function gradeFraction(input: string, value: Fraction): Grade {
  const typed = parseFraction(input);
  return { correct: typed !== null && fractionsEqual(typed, value) };
}

export function gradeInteger(input: string, answer: number): Grade {
  const trimmed = input.trim();
  return { correct: /^\d+$/.test(trimmed) && Number(trimmed) === answer };
}
