/**
 * Continuous Addition Chain Engine
 * 
 * Generates a chain of consecutive addition operations where each step
 * builds on the previous result. This is a completely standalone module
 * with no dependencies on other game engines.
 */

export type ChainDifficulty = 1 | 2 | 3 | 4 | 5;

export interface ChainStep {
  stepNumber: number;
  previousResult: number;
  addend: number;
  result: number;
  display: string; // e.g., "47 + 22 = ?"
}

export interface ChainConfig {
  minLength: number;
  maxLength: number;
  difficulty: ChainDifficulty;
}

export interface GeneratedChain {
  steps: ChainStep[];
  totalLength: number;
  finalResult: number;
  difficulty: ChainDifficulty;
}

// Difficulty configurations for number generation
const difficultyRanges: Record<ChainDifficulty, {
  startingNumbers: { min: number; max: number };
  addendProgression: Array<{ min: number; max: number }>;
  description: string;
}> = {
  1: {
    startingNumbers: { min: 10, max: 50 },
    addendProgression: [
      { min: 10, max: 30 },   // Steps 1-5
      { min: 20, max: 50 },   // Steps 6-10
      { min: 30, max: 70 },   // Steps 11-15
      { min: 40, max: 99 },   // Steps 16-20
    ],
    description: "Easy: 2-digit additions",
  },
  2: {
    startingNumbers: { min: 20, max: 99 },
    addendProgression: [
      { min: 20, max: 60 },   // Steps 1-5
      { min: 50, max: 150 },  // Steps 6-10
      { min: 100, max: 300 }, // Steps 11-15
      { min: 200, max: 500 }, // Steps 16-20
    ],
    description: "Medium: 2 to 3-digit additions",
  },
  3: {
    startingNumbers: { min: 50, max: 200 },
    addendProgression: [
      { min: 50, max: 150 },    // Steps 1-5
      { min: 100, max: 400 },   // Steps 6-10
      { min: 300, max: 700 },   // Steps 11-15
      { min: 500, max: 999 },   // Steps 16-20
    ],
    description: "Challenging: 2 to 4-digit results",
  },
  4: {
    startingNumbers: { min: 100, max: 500 },
    addendProgression: [
      { min: 100, max: 400 },     // Steps 1-5
      { min: 300, max: 800 },     // Steps 6-10
      { min: 500, max: 1500 },    // Steps 11-15
      { min: 1000, max: 3000 },   // Steps 16-20
    ],
    description: "Hard: Up to 4-digit results",
  },
  5: {
    startingNumbers: { min: 200, max: 999 },
    addendProgression: [
      { min: 200, max: 600 },     // Steps 1-5
      { min: 500, max: 1500 },    // Steps 6-10
      { min: 1000, max: 5000 },   // Steps 11-15
      { min: 3000, max: 9999 },   // Steps 16-20
    ],
    description: "Expert: Up to 5-digit results",
  },
};

/**
 * Generate a random integer within a range (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get the addend range based on current step number and difficulty
 */
function getAddendRange(
  stepNumber: number,
  difficulty: ChainDifficulty
): { min: number; max: number } {
  const ranges = difficultyRanges[difficulty].addendProgression;
  
  if (stepNumber <= 5) return ranges[0];
  if (stepNumber <= 10) return ranges[1];
  if (stepNumber <= 15) return ranges[2];
  return ranges[3];
}

/**
 * Generate the starting pair of numbers for the chain
 */
function generateStartingPair(difficulty: ChainDifficulty): {
  first: number;
  second: number;
} {
  const range = difficultyRanges[difficulty].startingNumbers;
  const first = randomInt(range.min, range.max);
  const second = randomInt(range.min, range.max);
  return { first, second };
}

/**
 * Generate a complete addition chain
 */
export function generateChain(config: ChainConfig): GeneratedChain {
  const { minLength, maxLength, difficulty } = config;
  
  // Random chain length between min and max
  const totalLength = randomInt(minLength, maxLength);
  
  const steps: ChainStep[] = [];
  
  // Generate starting pair
  const { first, second } = generateStartingPair(difficulty);
  let currentResult = first + second;
  
  // First step
  steps.push({
    stepNumber: 1,
    previousResult: first,
    addend: second,
    result: currentResult,
    display: `${first} + ${second} = ?`,
  });
  
  // Generate remaining steps
  for (let i = 2; i <= totalLength; i++) {
    const addendRange = getAddendRange(i, difficulty);
    const addend = randomInt(addendRange.min, addendRange.max);
    const previousResult = currentResult;
    currentResult = previousResult + addend;
    
    steps.push({
      stepNumber: i,
      previousResult,
      addend,
      result: currentResult,
      display: `${previousResult.toLocaleString()} + ${addend.toLocaleString()} = ?`,
    });
  }
  
  return {
    steps,
    totalLength,
    finalResult: currentResult,
    difficulty,
  };
}

/**
 * Generate a chain with default configuration
 */
export function generateDefaultChain(difficulty: ChainDifficulty = 2): GeneratedChain {
  return generateChain({
    minLength: 10,
    maxLength: 20,
    difficulty,
  });
}

/**
 * Get difficulty description for display
 */
export function getChainDifficultyDescription(difficulty: ChainDifficulty): string {
  return difficultyRanges[difficulty].description;
}

/**
 * Validate user answer for a specific step
 */
export function validateStepAnswer(step: ChainStep, userAnswer: number): boolean {
  return userAnswer === step.result;
}

/**
 * Calculate chain statistics
 */
export interface ChainStats {
  totalSteps: number;
  correctSteps: number;
  accuracy: number;
  averageTimePerStep: number;
  completed: boolean;
  finalScore: number;
}

export function calculateChainStats(
  totalSteps: number,
  correctSteps: number,
  totalTimeMs: number,
  completed: boolean
): ChainStats {
  const accuracy = totalSteps > 0 ? (correctSteps / totalSteps) * 100 : 0;
  const averageTimePerStep = totalSteps > 0 ? totalTimeMs / totalSteps / 1000 : 0;
  
  // Score formula: base points + speed bonus + accuracy bonus
  const basePoints = correctSteps * 10;
  const accuracyBonus = Math.round(accuracy * 2);
  const speedBonus = averageTimePerStep < 5 ? Math.round((5 - averageTimePerStep) * 10) : 0;
  const completionBonus = completed ? 50 : 0;
  
  const finalScore = basePoints + accuracyBonus + speedBonus + completionBonus;
  
  return {
    totalSteps,
    correctSteps,
    accuracy: Math.round(accuracy),
    averageTimePerStep: Math.round(averageTimePerStep * 10) / 10,
    completed,
    finalScore,
  };
}
