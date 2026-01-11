/**
 * Divisibility & Remainder Practice Engine
 * 
 * Generates divisibility problems to help users practice:
 * - Divisibility rules
 * - Factor identification
 * - Remainder calculation (positive and negative)
 * 
 * This is a completely standalone module with no dependencies on other game engines.
 */

export type DivisibilityDifficulty = 1 | 2 | 3 | 4 | 5;

export type RemainderType = "positive" | "negative" | "both";

export interface DivisibilityProblem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number; // Standard positive remainder (0 ≤ r < divisor)
  negativeRemainder: number; // Negative remainder alternative
  isDivisible: boolean;
  display: string;
  difficulty: DivisibilityDifficulty;
}

export interface DivisibilityConfig {
  difficulty: DivisibilityDifficulty;
  remainderType: RemainderType;
  includeExactDivisibility: boolean;
}

// Difficulty configurations
const difficultyRanges: Record<DivisibilityDifficulty, {
  dividendRange: { min: number; max: number };
  divisorRange: { min: number; max: number };
  description: string;
}> = {
  1: {
    dividendRange: { min: 10, max: 50 },
    divisorRange: { min: 2, max: 5 },
    description: "Easy: 2-digit ÷ small divisors (2-5)",
  },
  2: {
    dividendRange: { min: 20, max: 99 },
    divisorRange: { min: 2, max: 9 },
    description: "Medium: 2-digit ÷ single digit",
  },
  3: {
    dividendRange: { min: 50, max: 200 },
    divisorRange: { min: 3, max: 12 },
    description: "Challenging: 2-3 digit ÷ up to 12",
  },
  4: {
    dividendRange: { min: 100, max: 500 },
    divisorRange: { min: 5, max: 25 },
    description: "Hard: 3-digit ÷ 2-digit divisors",
  },
  5: {
    dividendRange: { min: 200, max: 999 },
    divisorRange: { min: 7, max: 50 },
    description: "Expert: Large dividends & divisors",
  },
};

// Common divisibility-friendly divisors for generating exact division problems
const commonDivisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25];

/**
 * Generate a random integer within a range (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a problem that results in exact divisibility
 */
function generateExactDivisibilityProblem(
  difficulty: DivisibilityDifficulty
): DivisibilityProblem {
  const config = difficultyRanges[difficulty];
  
  // Pick a divisor within range
  const divisor = randomInt(config.divisorRange.min, config.divisorRange.max);
  
  // Calculate quotient range based on dividend range
  const minQuotient = Math.ceil(config.dividendRange.min / divisor);
  const maxQuotient = Math.floor(config.dividendRange.max / divisor);
  
  // Ensure we have valid quotients
  const quotient = randomInt(Math.max(2, minQuotient), Math.max(3, maxQuotient));
  const dividend = quotient * divisor;
  
  return {
    dividend,
    divisor,
    quotient,
    remainder: 0,
    negativeRemainder: 0,
    isDivisible: true,
    display: `${dividend} ÷ ${divisor}`,
    difficulty,
  };
}

/**
 * Generate a problem with a non-zero remainder
 */
function generateRemainderProblem(
  difficulty: DivisibilityDifficulty
): DivisibilityProblem {
  const config = difficultyRanges[difficulty];
  
  // Pick a divisor within range
  const divisor = randomInt(config.divisorRange.min, config.divisorRange.max);
  
  // Generate a dividend that is NOT divisible by the divisor
  let dividend: number;
  let attempts = 0;
  do {
    dividend = randomInt(config.dividendRange.min, config.dividendRange.max);
    attempts++;
  } while (dividend % divisor === 0 && attempts < 50);
  
  // If we couldn't find a non-divisible number, adjust
  if (dividend % divisor === 0) {
    dividend += randomInt(1, divisor - 1);
  }
  
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  
  // Negative remainder: r - divisor (when remainder > 0)
  // This gives the "distance to the next multiple" going backwards
  const negativeRemainder = remainder > 0 ? remainder - divisor : 0;
  
  return {
    dividend,
    divisor,
    quotient,
    remainder,
    negativeRemainder,
    isDivisible: false,
    display: `${dividend} ÷ ${divisor}`,
    difficulty,
  };
}

/**
 * Generate a random divisibility problem
 */
export function generateDivisibilityProblem(
  config: DivisibilityConfig
): DivisibilityProblem {
  const { difficulty, includeExactDivisibility } = config;
  
  // Decide whether to generate exact divisibility or remainder problem
  // ~30% chance for exact divisibility if enabled
  const shouldBeExact = includeExactDivisibility && Math.random() < 0.3;
  
  if (shouldBeExact) {
    return generateExactDivisibilityProblem(difficulty);
  }
  
  return generateRemainderProblem(difficulty);
}

/**
 * Generate a problem with default configuration
 */
export function generateDefaultProblem(
  difficulty: DivisibilityDifficulty = 2
): DivisibilityProblem {
  return generateDivisibilityProblem({
    difficulty,
    remainderType: "positive",
    includeExactDivisibility: true,
  });
}

/**
 * Get difficulty description
 */
export function getDivisibilityDifficultyDescription(
  difficulty: DivisibilityDifficulty
): string {
  return difficultyRanges[difficulty].description;
}

/**
 * Validate user's divisibility answer
 */
export function validateDivisibilityAnswer(
  problem: DivisibilityProblem,
  userSaidDivisible: boolean
): boolean {
  return userSaidDivisible === problem.isDivisible;
}

/**
 * Validate user's remainder answer
 * Accepts both positive and negative remainder conventions
 */
export function validateRemainderAnswer(
  problem: DivisibilityProblem,
  userRemainder: number,
  acceptNegative: boolean = true
): boolean {
  if (problem.isDivisible && userRemainder === 0) {
    return true;
  }
  
  if (userRemainder === problem.remainder) {
    return true;
  }
  
  if (acceptNegative && userRemainder === problem.negativeRemainder) {
    return true;
  }
  
  return false;
}

/**
 * Get divisibility rule hint for common divisors
 */
export function getDivisibilityHint(divisor: number): string | null {
  const hints: Record<number, string> = {
    2: "A number is divisible by 2 if its last digit is even (0, 2, 4, 6, 8)",
    3: "A number is divisible by 3 if the sum of its digits is divisible by 3",
    4: "A number is divisible by 4 if its last two digits form a number divisible by 4",
    5: "A number is divisible by 5 if its last digit is 0 or 5",
    6: "A number is divisible by 6 if it's divisible by both 2 and 3",
    7: "Double the last digit, subtract from the rest. If result is divisible by 7, so is the original",
    8: "A number is divisible by 8 if its last three digits form a number divisible by 8",
    9: "A number is divisible by 9 if the sum of its digits is divisible by 9",
    10: "A number is divisible by 10 if its last digit is 0",
    11: "Alternately add and subtract digits from right to left. If result is divisible by 11, so is the original",
    12: "A number is divisible by 12 if it's divisible by both 3 and 4",
  };
  
  return hints[divisor] || null;
}

/**
 * Calculate statistics for a session
 */
export interface DivisibilityStats {
  totalProblems: number;
  correctDivisibility: number;
  correctRemainders: number;
  accuracy: number;
  averageTime: number;
}

export function calculateStats(
  totalProblems: number,
  correctDivisibility: number,
  correctRemainders: number,
  totalTimeMs: number
): DivisibilityStats {
  const accuracy =
    totalProblems > 0
      ? ((correctDivisibility + correctRemainders) / (totalProblems * 2)) * 100
      : 0;
  const averageTime = totalProblems > 0 ? totalTimeMs / totalProblems / 1000 : 0;
  
  return {
    totalProblems,
    correctDivisibility,
    correctRemainders,
    accuracy: Math.round(accuracy),
    averageTime: Math.round(averageTime * 10) / 10,
  };
}

/**
 * Explain the remainder calculation
 */
export function explainRemainder(problem: DivisibilityProblem): string {
  const { dividend, divisor, quotient, remainder, negativeRemainder } = problem;
  
  if (problem.isDivisible) {
    return `${dividend} = ${divisor} × ${quotient} (exact division, remainder = 0)`;
  }
  
  let explanation = `${dividend} = ${divisor} × ${quotient} + ${remainder}`;
  
  if (negativeRemainder !== 0) {
    explanation += `\nAlternatively: ${dividend} = ${divisor} × ${quotient + 1} + (${negativeRemainder})`;
  }
  
  return explanation;
}
