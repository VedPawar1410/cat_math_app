import { gradeInteger } from "./percentMath";
import { randomInt, type DrillDefinition, type DrillQuestion } from "./drillTypes";

/** Squares to 30, cubes to 15, their roots and tables to 25: the list to memorise from class. */

function integerQuestion(display: string, spoken: string, answer: number, explanation: string, facts: DrillQuestion["facts"]): DrillQuestion {
  return {
    display,
    spoken,
    answerKind: "integer",
    answer: String(answer),
    grade: (input) => gradeInteger(input, answer),
    explanation,
    facts,
  };
}

export function generateSquare(): DrillQuestion {
  const base = randomInt(6, 30);
  return integerQuestion(`${base}²`, `${base} squared`, base * base, `${base}² = ${base * base}`, { base });
}

export function generateSquareRoot(): DrillQuestion {
  const root = randomInt(6, 30);
  const square = root * root;
  return integerQuestion(`√${square}`, `square root of ${square}`, root, `${root}² = ${square}`, { radicand: square });
}

export function generateCube(): DrillQuestion {
  const base = randomInt(2, 15);
  const cube = base * base * base;
  return integerQuestion(`${base}³`, `${base} cubed`, cube, `${base}³ = ${cube}`, { base });
}

export function generateCubeRoot(): DrillQuestion {
  const root = randomInt(2, 15);
  const cube = root * root * root;
  return integerQuestion(`∛${cube}`, `cube root of ${cube}`, root, `${root}³ = ${cube}`, { radicand: cube });
}

export function generateTable(): DrillQuestion {
  const base = randomInt(13, 25);
  const times = randomInt(2, 12);
  const product = base * times;
  return integerQuestion(`${base} × ${times}`, `${base} times ${times}`, product, `${base} × ${times} = ${product}`, { base, times });
}

/** Reference lists for the Learn view. */
export function squaresUpTo(limit: number): [number, number][] {
  return Array.from({ length: limit }, (_, i) => [i + 1, (i + 1) * (i + 1)]);
}

export function cubesUpTo(limit: number): [number, number][] {
  return Array.from({ length: limit }, (_, i) => [i + 1, (i + 1) ** 3]);
}

export function tableOf(base: number): number[] {
  return Array.from({ length: 11 }, (_, i) => base * (i + 2));
}

const ONE_LEVEL = (label: string) => [{ level: 1, label }];

export const squaresDrill: DrillDefinition = {
  id: "squares",
  title: "Squares",
  levels: ONE_LEVEL("6² to 30²"),
  generate: generateSquare,
};

export const squareRootsDrill: DrillDefinition = {
  id: "square-roots",
  title: "Square roots",
  levels: ONE_LEVEL("√36 to √900"),
  generate: generateSquareRoot,
};

export const cubesDrill: DrillDefinition = {
  id: "cubes",
  title: "Cubes",
  levels: ONE_LEVEL("2³ to 15³"),
  generate: generateCube,
};

export const cubeRootsDrill: DrillDefinition = {
  id: "cube-roots",
  title: "Cube roots",
  levels: ONE_LEVEL("∛8 to ∛3375"),
  generate: generateCubeRoot,
};

export const tablesDrill: DrillDefinition = {
  id: "tables",
  title: "Tables",
  levels: ONE_LEVEL("13 to 25, × 2 to × 12"),
  generate: generateTable,
};
