import type { Chapter, FractionForm } from "./types";

/**
 * Percentages, from my TIME Foundation 2 class (12 Nov 2026, handout QAHO1002703).
 * Only what the class taught; anything listed but not taught is in comingLater.
 */

/** The chart sir built on the board, in the order it was written to be learnt. */
export const percentChart: FractionForm[] = [
  { k: 1, n: 2, percent: "50" },
  { k: 1, n: 3, percent: "33.33" },
  { k: 1, n: 4, percent: "25" },
  { k: 1, n: 5, percent: "20" },
  { k: 1, n: 6, percent: "16.66" },
  { k: 1, n: 7, percent: "14.28" },
  { k: 1, n: 8, percent: "12.5" },
  { k: 1, n: 9, percent: "11.11" },
  { k: 1, n: 10, percent: "10" },
  { k: 1, n: 11, percent: "9.09" },
  { k: 1, n: 12, percent: "8.33" },
  { k: 1, n: 13, percent: "7.69" },
  { k: 1, n: 14, percent: "7.14" },
  { k: 1, n: 15, percent: "6.66" },
  { k: 1, n: 16, percent: "6.25" },
  { k: 1, n: 17, percent: "5.88" },
  { k: 1, n: 18, percent: "5.55" },
  { k: 1, n: 19, percent: "5.26" },
  { k: 1, n: 20, percent: "5" },
];

/** Multiples of chart entries that were used in class. */
export const classForms: FractionForm[] = [
  { k: 2, n: 3, percent: "66.66", source: "Class Q2" },
  { k: 4, n: 9, percent: "44.44", source: "Class Q1" },
  { k: 3, n: 8, percent: "37.5", source: "Class Q4, method B" },
  { k: 5, n: 8, percent: "62.5", source: "Class Q3" },
  { k: 7, n: 8, percent: "87.5", source: "Class Q4" },
  { k: 4, n: 5, percent: "80", source: "Handout Q4(d), Q5(a)" },
  { k: 5, n: 4, percent: "125", source: "Handout Q4(c)" },
  { k: 4, n: 3, percent: "133.33", source: "Handout Q6(b), up 33⅓%" },
];

const asRow = ({ k, n, percent }: FractionForm): [string, string] => [`${k}/${n}`, `${percent}%`];

export const percentages: Chapter = {
  id: "percentages",
  title: "Percentages",
  summary: "The % chart, the memory bank, x% of N, and more vs less",
  source: "TIME Foundation 2 class, 12 Nov 2026 (handout QAHO1002703)",
  comingLater: [
    "Successive (effective) percentage change: listed in class, not taught yet",
    "Percentage point: listed in class, not taught yet",
    "Reduction and consumption: introduced briefly; practice comes after a later class",
  ],
  tricks: [
    {
      id: "percent-chart",
      title: "The % chart (1/2 to 1/20)",
      summary: "Fraction to % and back, using the chart built in class",
      rule: [
        "Percentage means out of 100. Fraction to %: multiply by 100. % to fraction: divide by 100.",
        "Build the chart by halving: 1/2, 1/4, 1/8, 1/16; 1/3, 1/6; 1/5, 1/10, 1/20; 1/9, 1/18. Remember the rest: 1/13 = 7.69, 1/15 = 6.66, 1/17 = 5.88, 1/19 = 5.26.",
        "1/9 = 11.11 and 1/11 = 9.09 look alike, so learn them as a pair.",
        "A recurring percentage (33.33, 11.11, 16.66) is worked with the fraction, not the decimal.",
        "Spot the entry: repeated digits (44.44, 66.66) point to 1/9 or 1/3; 0.5 after the decimal (not 0.55) points to 1/8 = 12.5.",
        "Learn the chart in the order it was written: the ladder in More vs less depends on it.",
        "Recurring values are shown truncated to 2 decimals, as on the chart (16.66, 14.28).",
      ],
      tables: [
        { title: "The chart", columns: ["Fraction", "%"], rows: percentChart.map(asRow) },
        { title: "Multiples used in class", columns: ["Fraction", "%"], rows: classForms.map(asRow) },
      ],
      examples: [
        {
          question: "Write 62.5% as a fraction",
          steps: [
            "0.5 after the decimal points to 1/8 = 12.5%",
            "12 × 5 = 60 and 0.5 × 5 = 2.5, so 62.5 = 12.5 × 5",
          ],
          answer: "62.5% = 5/8",
          source: "Class Q3 (the route to learn)",
        },
        {
          question: "Write 44.44% as a fraction",
          steps: ["Repeated digits point to 11.11% = 1/9", "44.44 = 11.11 × 4"],
          answer: "44.44% = 4/9",
          source: "Class Q1",
        },
        {
          question: "Write 87.5% as a fraction",
          steps: ["12 × 7 = 84 and 0.5 × 7 = 3.5, so 87.5 = 12.5 × 7"],
          answer: "87.5% = 7/8",
          source: "Class Q4",
        },
        {
          question: "Write 3/7 as a percentage",
          steps: [
            "1/7 = 14.28% on the chart, but that is truncated",
            "3 × 14.28 = 42.84 loses a little",
            "Exact: 3/7 = 42.857…%",
          ],
          answer: "3/7 = 42.85% truncated (about 42.86%), not 42.84%",
          source: "Class, 30% less example; Handout Q5(b)",
        },
      ],
      traps: [
        "Reading 2% as 1/5. 1/5 is 20%; 2% is 1/50.",
        "Multiplying a truncated chart value: 3 × 14.28 = 42.84, but 3/7 = 42.857. If the options are close, work with the fraction.",
      ],
      drills: ["fraction-to-percent", "percent-to-fraction"],
    },
    {
      id: "memory-bank",
      title: "Memory bank",
      summary: "Squares to 30, cubes to 15, their roots, tables to 25",
      rule: [
        "The list to memorise: tables up to 25, squares up to 30, cubes up to 15, and the % chart.",
        "If remembering is hard, write them on a sheet and use it in every class: what you use most is what you end up remembering.",
        "Many students know the tables but not how to use them. The other tricks in this chapter are the 'how to use it' part.",
      ],
      referenceGrids: ["squares", "cubes", "tables"],
      examples: [],
      traps: [],
      drills: ["squares", "square-roots", "cubes", "cube-roots", "tables"],
    },
    {
      id: "x-percent-of-n",
      title: "x% of N",
      summary: "The given number is 100%; chart fractions; the swap rule",
      rule: [
        "Whatever number is given, it is 100%. Get 10% (cancel one zero) and 1% first.",
        "Build the rest from those and from chart entries: 20% = 10% × 2 or 1/5; 5% = half of 10% or 1/20; 25% = 1/4 or 20% + 5%.",
        "Turn the % into a chart fraction: 44.44% = 4/9, 62.5% = 5/8, 87.5% = 7/8.",
        "If the % isn't in the chart, split it into pieces that are: 143.33% = 100% + 10% + 1/3; 56.66% = 50% + 1/15; 67.5% = 62.5% + 5%.",
        "Swap rule: a% of b = b% of a. Use it when one side is easier: 32% of 150 = 150% of 32.",
        "Take the quickest route. These are meant to be done orally, not with the full a × b ÷ 100.",
      ],
      tables: [
        {
          title: "Class example: 500 is 100%",
          columns: ["%", "Value"],
          rows: [
            ["100%", "500"],
            ["10%", "50"],
            ["1%", "5"],
            ["20%", "100"],
            ["5%", "25"],
            ["25%", "125"],
          ],
        },
      ],
      examples: [
        {
          question: "44.44% of 270",
          steps: ["44.44% = 4/9", "1/9 of 270 = 30, so 4 × 30", "Or 33.33% + 11.11%: 90 + 30"],
          answer: "120",
          source: "Class Q1",
        },
        {
          question: "66.66% of 300",
          steps: ["66.66% = 2/3 (11.11% × 6 or 33.33% × 2)", "2/3 × 300"],
          answer: "200",
          source: "Class Q2",
        },
        {
          question: "62.5% of 240",
          steps: ["62.5% = 12.5% × 5 = 5/8", "5/8 × 240", "Or 50% + 12.5%: 120 + 30"],
          answer: "150",
          source: "Class Q3",
        },
        {
          question: "87.5% of 360",
          steps: ["87.5% = 12.5% × 7 = 7/8", "7/8 × 360 = 7 × 45", "Or 100% − 12.5%: 360 − 45"],
          answer: "315",
          source: "Class Q4",
        },
        {
          question: "143.33% of 300",
          steps: ["43 isn't in the chart; split as 100% + 10% + 33.33%", "300 + 30 + 1/3 × 300 = 300 + 30 + 100"],
          answer: "430",
          source: "Class Q5",
        },
        {
          question: "32% of 150",
          steps: ["Swap: 32% of 150 = 150% of 32", "100% + 50% of 32 = 32 + 16"],
          answer: "48",
          source: "Class Q6",
        },
        {
          question: "67.5% of 2,560",
          steps: ["62.5% + 5%", "5/8 × 2560 = 1600; 5% is half of 256 = 128", "1600 + 128"],
          answer: "1,728",
          source: "Handout Q1(a)",
        },
        {
          question: "56.66% of 1,980",
          steps: ["50% + 6.66%, and 6.66% = 1/15", "990 + 1980/15 = 990 + 132"],
          answer: "1,122",
          source: "Handout Q1(b)",
        },
        {
          question: "19.2% of 250",
          steps: ["Swap: 250% of 19.2", "Cancel the zeros: 25% of 192 = 1/4 × 192"],
          answer: "48",
          source: "Handout Q1(c)",
        },
      ],
      traps: [
        "Reading 2% as 1/5 (it is 1/50). The 30% + 2% try for 32% of 150 gave 75; the 2% term is 3, so the answer is 48.",
        "Doing the full 25 × 500 ÷ 100 calculation when a chart entry gives it at once.",
      ],
      drills: ["percent-of"],
    },
    {
      id: "more-vs-less",
      title: "More vs less",
      summary: "The base changes; the one-step chart ladder",
      rule: [
        "More and less both mean difference, and the × 100 always stays. Never disturb the 100, or the chart stops helping.",
        "A is less than B by what %: difference ÷ higher value × 100.",
        "B is more than A by what %: difference ÷ lesser value × 100.",
        "'A is what % of B' needs no difference: A ÷ B × 100.",
        "Increase and decrease work exactly like more and less. In an increase between two years, the earlier year is the base.",
        "Chart ladder: if the given % is in the chart, 'more' is one step up the chart and 'less' is one step down (1/n more goes with 1/(n+1) less). Only for percentages in the chart; otherwise take B = 100 and do it the long way.",
        "In any percentage question the base is taken as 100%, every time.",
      ],
      tables: [
        {
          title: "The ladder around 1/10",
          columns: ["Fraction", "%"],
          rows: [
            ["1/9", "11.11%"],
            ["1/10", "10%"],
            ["1/11", "9.09%"],
          ],
        },
      ],
      examples: [
        {
          question: "A = 40, B = 50. A is less than B by what %? B is more than A by what %?",
          steps: ["Less: 10 ÷ 50 (the higher) = 1/5", "More: 10 ÷ 40 (the lesser) = 1/4"],
          answer: "20% less, 25% more",
          source: "Class",
        },
        {
          question: "A is 10% more than B. B is less than A by what %?",
          steps: ["Long way: B = 100, A = 110, 10 ÷ 110 = 1/11", "Ladder: 10% is 1/10; asked for less, one step down to 1/11"],
          answer: "9.09%",
          source: "Class",
        },
        {
          question: "A is 25% less than B. B is more than A by what %?",
          steps: ["25% is 1/4; asked for more, one step up to 1/3", "Check: B = 100, A = 75, 25 ÷ 75 = 1/3"],
          answer: "33.33%",
          source: "Class",
        },
        {
          question: "A is 30% less than B. B is more than A by what %?",
          steps: ["30% isn't in the chart, so no ladder", "B = 100, A = 70, 30 ÷ 70 = 3/7"],
          answer: "3/7 = 42.857…% (the class wrote 42.84 by truncating 1/7)",
          source: "Class; Handout Q5(b)",
        },
        {
          question: "A has ₹75 and B has ₹60. Compare them four ways.",
          steps: [
            "A more than B: 15 ÷ 60 = 25%",
            "B less than A: 15 ÷ 75 = 20%",
            "A is what % of B: 75 ÷ 60 = 5/4 = 125%",
            "B is what % of A: 60 ÷ 75 = 4/5 = 80%",
          ],
          answer: "25%, 20%, 125%, 80%",
          source: "Handout Q4",
        },
        {
          question: "A scored 25% more than B. B's score is what % of A's?",
          steps: ["B = 100, A = 125", "'What % of' needs no difference: 100 ÷ 125 = 4/5"],
          answer: "80%",
          source: "Handout Q5(a)",
        },
        {
          question: "Rice production was 30,000 t in 2018 after an increase of 3,000 t. Find the % increase.",
          steps: ["The earlier year is the base: 2017 = 27,000", "3,000 ÷ 27,000 = 1/9"],
          answer: "11.11%",
          source: "Handout Q6(a)",
        },
        {
          question: "Millet production rose 40% in 2018 to 56,000. Find 2017.",
          steps: ["2017 is 100%, so 2018 is 140% = 56,000", "Divide by 14: 10% = 4,000", "Multiply by 10"],
          answer: "40,000",
          source: "Handout Q6(c)",
        },
      ],
      traps: [
        "Wrong base: 'B is more than A' divides by A (the lesser); 'A is less than B' divides by B (the higher).",
        "Using the ladder on a % that isn't in the chart: 30% less is 3/7 more, not a chart step.",
        "Taking the later year as the base: in Q6(a) it is 3,000 on 27,000, not 30,000.",
        "Truncating 1/7: 3/7 is 42.857%, not 42.84%.",
        "Disturbing the × 100 so the chart no longer helps.",
      ],
      drills: ["more-less"],
    },
  ],
};
