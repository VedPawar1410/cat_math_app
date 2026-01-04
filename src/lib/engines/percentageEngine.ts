export type PercentageDifficulty = 1 | 2 | 3 | 4 | 5;

export interface PercentageProblem {
  numerator: number;
  denominator: number;
  question: string;
  answer: number; // Percentage value rounded to 2 decimal places
  difficulty: PercentageDifficulty;
  decimalPlaces: 1 | 2; // How many decimal places required
}

/**
 * Difficulty levels for percentage calculations:
 * Level 1: Simple ratios (denominator 10-50, result 10-90%)
 * Level 2: Medium ratios (denominator 20-80, varied results)
 * Level 3: Harder ratios (denominator 50-100, any result)
 * Level 4: Complex ratios (denominator 50-150, including >100%)
 * Level 5: CAT-level ratios (denominator 60-250, any percentage)
 */
const DIFFICULTY_CONFIG: Record<PercentageDifficulty, {
  numRange: [number, number];
  denRange: [number, number];
  allowOver100: boolean;
  decimalPlaces: 1 | 2;
}> = {
  1: { numRange: [10, 45], denRange: [50, 100], allowOver100: false, decimalPlaces: 1 },
  2: { numRange: [15, 70], denRange: [40, 120], allowOver100: false, decimalPlaces: 1 },
  3: { numRange: [20, 90], denRange: [50, 150], allowOver100: false, decimalPlaces: 2 },
  4: { numRange: [30, 180], denRange: [60, 200], allowOver100: true, decimalPlaces: 2 },
  5: { numRange: [50, 300], denRange: [70, 250], allowOver100: true, decimalPlaces: 2 },
};

/**
 * Generate a random integer in range [min, max]
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate the percentage value of numerator/denominator
 * Returns value rounded to specified decimal places
 */
export function calculatePercentage(numerator: number, denominator: number, decimalPlaces: 1 | 2 = 2): number {
  const percentage = (numerator / denominator) * 100;
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(percentage * multiplier) / multiplier;
}

/**
 * Check if user's answer is correct within acceptable tolerance
 * For 1 decimal place: tolerance of 0.05
 * For 2 decimal places: tolerance of 0.005
 */
export function isPercentageCorrect(
  userAnswer: number,
  correctAnswer: number,
  decimalPlaces: 1 | 2
): boolean {
  const tolerance = decimalPlaces === 1 ? 0.05 : 0.005;
  return Math.abs(userAnswer - correctAnswer) <= tolerance;
}

/**
 * Generate a percentage calculation problem
 * Format: "What is X/Y as a percentage?"
 */
export function generatePercentageProblem(difficulty: PercentageDifficulty): PercentageProblem {
  const config = DIFFICULTY_CONFIG[difficulty];
  
  let numerator: number;
  let denominator: number;
  let percentage: number;

  // Generate valid ratio based on difficulty constraints
  do {
    denominator = randomInRange(config.denRange[0], config.denRange[1]);
    
    if (config.allowOver100) {
      numerator = randomInRange(config.numRange[0], config.numRange[1]);
    } else {
      // Ensure numerator < denominator for sub-100% results
      const maxNum = Math.min(config.numRange[1], denominator - 1);
      numerator = randomInRange(config.numRange[0], maxNum);
    }
    
    percentage = calculatePercentage(numerator, denominator, config.decimalPlaces);
  } while (
    // Avoid trivially easy ratios
    percentage === 50 || 
    percentage === 100 || 
    percentage === 25 || 
    percentage === 75 ||
    // Avoid very small percentages at lower levels
    (difficulty < 3 && percentage < 15) ||
    // Ensure we have a valid number
    isNaN(percentage) ||
    !isFinite(percentage)
  );

  return {
    numerator,
    denominator,
    question: `${numerator}/${denominator}`,
    answer: percentage,
    difficulty,
    decimalPlaces: config.decimalPlaces,
  };
}

/**
 * Get hint for percentage calculation
 * Shows the 10% range the answer falls in
 */
export function getPercentageHint(problem: PercentageProblem): string {
  const lowerBound = Math.floor(problem.answer / 10) * 10;
  const upperBound = lowerBound + 10;
  return `The answer is between ${lowerBound}% and ${upperBound}%`;
}

/**
 * Get difficulty description
 */
export function getPercentageDifficultyDescription(difficulty: PercentageDifficulty): string {
  const descriptions: Record<PercentageDifficulty, string> = {
    1: "Simple ratios, 1 decimal",
    2: "Medium ratios, 1 decimal",
    3: "Harder ratios, 2 decimals",
    4: "Complex ratios (can exceed 100%)",
    5: "CAT-level ratios, 2 decimals",
  };
  return descriptions[difficulty];
}

