/**
 * Exact arithmetic for tests, written separately from the engines so a test never
 * checks a formula against itself. Long division with BigInt, digit by digit.
 * (BigInt(10) rather than 10n: tsconfig targets ES2017.)
 */

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);
const HUNDRED = BigInt(100);

function longDivision(k: number, n: number, places: number) {
  const divisor = BigInt(n);
  let remainder = BigInt(k) * HUNDRED;
  const whole = remainder / divisor;
  remainder %= divisor;
  const digits: number[] = [];
  for (let i = 0; i < places; i++) {
    remainder *= TEN;
    digits.push(Number(remainder / divisor));
    remainder %= divisor;
  }
  return { whole, digits, exact: remainder === ZERO };
}

function join(whole: bigint, digits: number[]): string {
  const decimals = digits.join("").replace(/0+$/, "");
  return decimals ? `${whole}.${decimals}` : String(whole);
}

/** k/n as a percentage cut off after 2 decimals, e.g. "42.85" for 3/7. */
export function truncatedPercent(k: number, n: number): string {
  const { whole, digits } = longDivision(k, n, 2);
  return join(whole, digits);
}

/** k/n as a percentage rounded half up to 2 decimals, e.g. "42.86" for 3/7. */
export function roundedPercent(k: number, n: number): string {
  const { whole, digits } = longDivision(k, n, 3);
  let hundredths = whole * HUNDRED + BigInt(digits[0] * 10 + digits[1]);
  if (digits[2] >= 5) hundredths += ONE;
  const rest = hundredths % HUNDRED;
  return join(hundredths / HUNDRED, [Number(rest / TEN), Number(rest % TEN)]);
}

/** a/b equals c/d, by cross-multiplying in BigInt. */
export function sameRatio(a: number | bigint, b: number | bigint, c: number | bigint, d: number | bigint): boolean {
  return BigInt(a) * BigInt(d) === BigInt(c) * BigInt(b);
}

/** Multiplication by repeated addition. */
export function timesByAdding(value: number, count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += value;
  return total;
}
