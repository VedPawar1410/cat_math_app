import type { Chapter } from "./types";
import { percentages } from "./percentages";

/** Every chapter in the coaching track. Adding a chapter: one data file plus one line here. */
export const chapters: Chapter[] = [percentages];

export function findChapter(id: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === id);
}
