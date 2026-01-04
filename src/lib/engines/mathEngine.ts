export type Operation = "addition" | "subtraction";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface MathProblem {
  operand1: number;
  operand2: number;
  operation: Operation;
  question: string;
  answer: number;
  difficulty: Difficulty;
}

/**
 * Difficulty levels for operand digit counts:
 * Level 1: 2-digit + 2-digit (10-99)
 * Level 2: 2-digit + 3-digit
 * Level 3: 3-digit + 3-digit
 * Level 4: 3-digit + 4-digit
 * Level 5: 4-digit + 5-digit
 */
const DIFFICULTY_CONFIG: Record<Difficulty, { digits1: number; digits2: number }> = {
  1: { digits1: 2, digits2: 2 },
  2: { digits1: 2, digits2: 3 },
  3: { digits1: 3, digits2: 3 },
  4: { digits1: 3, digits2: 4 },
  5: { digits1: 4, digits2: 5 },
};

/**
 * Generate a random integer with the specified number of digits
 * e.g., digits=2 returns a number between 10-99
 *       digits=3 returns a number between 100-999
 */
function generateNumberWithDigits(digits: number): number {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random addition problem
 */
export function generateAddition(difficulty: Difficulty): MathProblem {
  const config = DIFFICULTY_CONFIG[difficulty];
  const operand1 = generateNumberWithDigits(config.digits1);
  const operand2 = generateNumberWithDigits(config.digits2);
  const answer = operand1 + operand2;

  return {
    operand1,
    operand2,
    operation: "addition",
    question: `${operand1} + ${operand2}`,
    answer,
    difficulty,
  };
}

/**
 * Generate a random subtraction problem
 * Always ensures the result is positive (larger - smaller)
 */
export function generateSubtraction(difficulty: Difficulty): MathProblem {
  const config = DIFFICULTY_CONFIG[difficulty];
  let num1 = generateNumberWithDigits(config.digits1);
  let num2 = generateNumberWithDigits(config.digits2);

  // Ensure we subtract smaller from larger for positive result
  const operand1 = Math.max(num1, num2);
  const operand2 = Math.min(num1, num2);
  const answer = operand1 - operand2;

  return {
    operand1,
    operand2,
    operation: "subtraction",
    question: `${operand1} − ${operand2}`,
    answer,
    difficulty,
  };
}

/**
 * Generate a random math problem (addition or subtraction)
 */
export function generateProblem(
  operation: Operation | "mixed",
  difficulty: Difficulty
): MathProblem {
  if (operation === "mixed") {
    const ops: Operation[] = ["addition", "subtraction"];
    operation = ops[Math.floor(Math.random() * ops.length)];
  }

  return operation === "addition"
    ? generateAddition(difficulty)
    : generateSubtraction(difficulty);
}

/**
 * Get the digit configuration for a difficulty level
 */
export function getDifficultyLabel(difficulty: Difficulty): string {
  const config = DIFFICULTY_CONFIG[difficulty];
  return `${config.digits1}-digit ${config.digits1 === config.digits2 ? "" : `+ ${config.digits2}-digit`}`;
}

/**
 * Get difficulty description
 */
export function getDifficultyDescription(difficulty: Difficulty): string {
  const descriptions: Record<Difficulty, string> = {
    1: "2-digit numbers (10-99)",
    2: "2-digit + 3-digit numbers",
    3: "3-digit + 3-digit numbers",
    4: "3-digit + 4-digit numbers",
    5: "4-digit + 5-digit numbers",
  };
  return descriptions[difficulty];
}

