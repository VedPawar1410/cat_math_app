import { gradeInteger } from "./percentMath";
import { randomDraw, range, type Draw, type DrillDefinition, type DrillQuestion } from "./drillTypes";

const SQUARE_BASES = range(6, 30);
const CUBE_BASES = range(2, 15);
/** Every table question, 13 to 25 × 2 to 12, so a session works through all of them. */
const TABLE_PAIRS = range(13, 25).flatMap((base) => range(2, 12).map((times) => ({ base, times })));

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

export function generateSquare(draw: Draw = randomDraw): DrillQuestion {
  const base = draw(SQUARE_BASES, "squares");
  return integerQuestion(`${base}²`, `${base} squared`, base * base, `${base}² = ${base * base}`, { base });
}

export function generateSquareRoot(draw: Draw = randomDraw): DrillQuestion {
  const root = draw(SQUARE_BASES, "square-roots");
  const square = root * root;
  return integerQuestion(`√${square}`, `square root of ${square}`, root, `${root}² = ${square}`, { radicand: square });
}

export function generateCube(draw: Draw = randomDraw): DrillQuestion {
  const base = draw(CUBE_BASES, "cubes");
  const cube = base * base * base;
  return integerQuestion(`${base}³`, `${base} cubed`, cube, `${base}³ = ${cube}`, { base });
}

export function generateCubeRoot(draw: Draw = randomDraw): DrillQuestion {
  const root = draw(CUBE_BASES, "cube-roots");
  const cube = root * root * root;
  return integerQuestion(`∛${cube}`, `cube root of ${cube}`, root, `${root}³ = ${cube}`, { radicand: cube });
}

export function generateTable(draw: Draw = randomDraw): DrillQuestion {
  const { base, times } = draw(TABLE_PAIRS, "tables");
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
  generate: (_level, draw) => generateSquare(draw),
};

export const squareRootsDrill: DrillDefinition = {
  id: "square-roots",
  title: "Square roots",
  levels: ONE_LEVEL("√36 to √900"),
  generate: (_level, draw) => generateSquareRoot(draw),
};

export const cubesDrill: DrillDefinition = {
  id: "cubes",
  title: "Cubes",
  levels: ONE_LEVEL("2³ to 15³"),
  generate: (_level, draw) => generateCube(draw),
};

export const cubeRootsDrill: DrillDefinition = {
  id: "cube-roots",
  title: "Cube roots",
  levels: ONE_LEVEL("∛8 to ∛3375"),
  generate: (_level, draw) => generateCubeRoot(draw),
};

export const tablesDrill: DrillDefinition = {
  id: "tables",
  title: "Tables",
  levels: ONE_LEVEL("13 to 25, × 2 to × 12"),
  generate: (_level, draw) => generateTable(draw),
};
