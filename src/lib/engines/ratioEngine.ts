export type RatioDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Ratio {
  numerator: number;
  denominator: number;
  value: number; // Decimal value for comparison
  display: string; // Display format "num/den"
}

export interface RatioComparisonProblem {
  ratioA: Ratio;
  ratioB: Ratio;
  correctAnswer: "A" | "B";
  difficulty: RatioDifficulty;
  percentageDiff: number; // How close the ratios are (for difficulty indication)
}

/**
 * Difficulty levels for ratio comparisons:
 * Level 1: Easy (ratios differ by >15%)
 * Level 2: Medium (ratios differ by 8-15%)
 * Level 3: Moderate (ratios differ by 4-8%)
 * Level 4: Hard (ratios differ by 2-4%, same 10% range)
 * Level 5: CAT-level (ratios differ by <2%, same 1% range)
 */
const DIFFICULTY_CONFIG: Record<RatioDifficulty, {
  numRange: [number, number];
  denRange: [number, number];
  minDiffPercent: number;
  maxDiffPercent: number;
}> = {
  1: { numRange: [10, 50], denRange: [20, 80], minDiffPercent: 15, maxDiffPercent: 40 },
  2: { numRange: [15, 80], denRange: [30, 120], minDiffPercent: 8, maxDiffPercent: 15 },
  3: { numRange: [20, 120], denRange: [40, 180], minDiffPercent: 4, maxDiffPercent: 8 },
  4: { numRange: [50, 200], denRange: [80, 250], minDiffPercent: 2, maxDiffPercent: 4 },
  5: { numRange: [100, 300], denRange: [120, 350], minDiffPercent: 0.5, maxDiffPercent: 2 },
};

/**
 * Generate a random integer in range [min, max]
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a Ratio object
 */
function createRatio(numerator: number, denominator: number): Ratio {
  return {
    numerator,
    denominator,
    value: numerator / denominator,
    display: `${numerator}/${denominator}`,
  };
}

/**
 * Calculate the percentage difference between two ratios
 */
function getPercentageDifference(ratio1: Ratio, ratio2: Ratio): number {
  const larger = Math.max(ratio1.value, ratio2.value);
  const smaller = Math.min(ratio1.value, ratio2.value);
  return ((larger - smaller) / smaller) * 100;
}

/**
 * Generate a ratio comparison problem
 * Creates two ratios that are "close" based on difficulty level
 */
export function generateRatioComparison(difficulty: RatioDifficulty): RatioComparisonProblem {
  const config = DIFFICULTY_CONFIG[difficulty];
  
  let ratioA: Ratio;
  let ratioB: Ratio;
  let percentageDiff: number;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    attempts++;
    
    // Generate first ratio
    const num1 = randomInRange(config.numRange[0], config.numRange[1]);
    const den1 = randomInRange(config.denRange[0], config.denRange[1]);
    ratioA = createRatio(num1, den1);

    // Generate second ratio with controlled difference
    // Strategy: Adjust numerator or denominator to create close ratios
    
    if (difficulty >= 4) {
      // For hard difficulties, create ratios in the same percentage range
      // Use percentage value method: both ratios should be in same 10% or 1% range
      const basePercentage = (num1 / den1) * 100;
      const targetPercentage = basePercentage + (Math.random() > 0.5 ? 1 : -1) * 
        randomInRange(config.minDiffPercent * 10, config.maxDiffPercent * 10) / 10;
      
      // Generate den2 and calculate num2 to achieve target percentage
      const den2 = randomInRange(config.denRange[0], config.denRange[1]);
      const num2 = Math.round((targetPercentage / 100) * den2);
      
      if (num2 > 0 && num2 < den2 * 2) {
        ratioB = createRatio(num2, den2);
      } else {
        ratioB = createRatio(
          randomInRange(config.numRange[0], config.numRange[1]),
          randomInRange(config.denRange[0], config.denRange[1])
        );
      }
    } else {
      // For easier difficulties, just generate another random ratio
      const num2 = randomInRange(config.numRange[0], config.numRange[1]);
      const den2 = randomInRange(config.denRange[0], config.denRange[1]);
      ratioB = createRatio(num2, den2);
    }

    percentageDiff = getPercentageDifference(ratioA, ratioB);

  } while (
    (percentageDiff < config.minDiffPercent || 
     percentageDiff > config.maxDiffPercent ||
     ratioA.value === ratioB.value || // No equal ratios
     ratioA.display === ratioB.display) && // No identical displays
    attempts < maxAttempts
  );

  // If we couldn't find a good pair, just use what we have
  if (attempts >= maxAttempts) {
    // Fallback: slightly adjust one ratio
    const adjustment = 1 + (config.minDiffPercent / 100);
    ratioB = createRatio(
      Math.round(ratioA.numerator * adjustment),
      ratioA.denominator
    );
    percentageDiff = getPercentageDifference(ratioA, ratioB);
  }

  // Randomly swap to avoid positional bias
  if (Math.random() > 0.5) {
    [ratioA, ratioB] = [ratioB, ratioA];
  }

  const correctAnswer = ratioA.value > ratioB.value ? "A" : "B";

  return {
    ratioA,
    ratioB,
    correctAnswer,
    difficulty,
    percentageDiff: Math.round(percentageDiff * 100) / 100,
  };
}

/**
 * Get a hint about the comparison
 */
export function getRatioHint(problem: RatioComparisonProblem): string {
  const percentA = Math.round((problem.ratioA.value * 100) * 10) / 10;
  const percentB = Math.round((problem.ratioB.value * 100) * 10) / 10;
  
  const rangeA = Math.floor(percentA / 10) * 10;
  const rangeB = Math.floor(percentB / 10) * 10;
  
  if (rangeA !== rangeB) {
    return `Left is ${rangeA}-${rangeA + 10}%, Right is ${rangeB}-${rangeB + 10}%`;
  }
  return `Both are in the ${rangeA}-${rangeA + 10}% range`;
}

/**
 * Get difficulty description
 */
export function getRatioDifficultyDescription(difficulty: RatioDifficulty): string {
  const descriptions: Record<RatioDifficulty, string> = {
    1: "Easy (>15% difference)",
    2: "Medium (8-15% difference)",
    3: "Moderate (4-8% difference)",
    4: "Hard (2-4% difference)",
    5: "CAT-level (<2% difference)",
  };
  return descriptions[difficulty];
}

/**
 * Explain the comparison method used
 */
export function explainComparison(problem: RatioComparisonProblem): string {
  const { ratioA, ratioB, correctAnswer } = problem;
  const percentA = ((ratioA.value) * 100).toFixed(2);
  const percentB = ((ratioB.value) * 100).toFixed(2);
  
  return `${ratioA.display} = ${percentA}%, ${ratioB.display} = ${percentB}%. ` +
    `Ratio ${correctAnswer} is larger.`;
}

