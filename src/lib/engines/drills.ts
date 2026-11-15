import type { DrillId } from "@/content/coaching/types";
import type { DrillDefinition } from "./drillTypes";
import { fractionToPercentDrill, percentToFractionDrill } from "./fractionPercentEngine";
import { cubeRootsDrill, cubesDrill, squareRootsDrill, squaresDrill, tablesDrill } from "./memoryBankEngine";
import { percentOfDrill } from "./percentOfEngine";
import { moreLessDrill } from "./moreLessEngine";

/** Every coaching drill, by id. Content files refer to drills by these ids. */
export const drills: Record<DrillId, DrillDefinition> = {
  "fraction-to-percent": fractionToPercentDrill,
  "percent-to-fraction": percentToFractionDrill,
  squares: squaresDrill,
  "square-roots": squareRootsDrill,
  cubes: cubesDrill,
  "cube-roots": cubeRootsDrill,
  tables: tablesDrill,
  "percent-of": percentOfDrill,
  "more-less": moreLessDrill,
};

export function findDrill(id: string): DrillDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(drills, id) ? drills[id as DrillId] : undefined;
}
