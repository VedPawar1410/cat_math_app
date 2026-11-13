"use client";

import { findChapter } from "@/content/coaching";
import type { DrillId } from "@/content/coaching/types";
import { findDrill } from "@/lib/engines/drills";
import { DrillGame } from "./DrillGame";
import { TopBar } from "@/components/ui/TopBar";
import type { CoachingRoute, Route } from "@/lib/route";
import { ChapterList } from "./ChapterList";
import { TrickList } from "./TrickList";
import { TrickLearn } from "./TrickLearn";

interface CoachingTrackProps {
  route: CoachingRoute;
  navigate: (route: Route) => void;
  onHome: () => void;
}

function NotFound({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <>
      <TopBar title="Not found" backLabel="Chapters" onBack={onBack} />
      <p className="w-full max-w-md glass-card rounded-2xl p-4 text-sm text-text-secondary">{message}</p>
    </>
  );
}

/** Chapters, then tricks, then a trick's Learn view or its practice drill. */
export function CoachingTrack({ route, navigate, onHome }: CoachingTrackProps) {
  const toChapters = () => navigate({ screen: "chapters" });

  if (route.screen === "chapters") {
    return <ChapterList onHome={onHome} onOpen={(chapterId) => navigate({ screen: "chapter", chapterId })} />;
  }

  const chapter = findChapter(route.chapterId);
  if (!chapter) return <NotFound message="That chapter isn't here yet." onBack={toChapters} />;

  if (route.screen === "chapter") {
    return (
      <TrickList
        chapter={chapter}
        onBack={toChapters}
        onOpen={(trickId) => navigate({ screen: "trick", chapterId: chapter.id, trickId })}
      />
    );
  }

  const trick = chapter.tricks.find((item) => item.id === route.trickId);
  if (!trick) return <NotFound message="That trick isn't in this chapter." onBack={toChapters} />;
  const toChapter = () => navigate({ screen: "chapter", chapterId: chapter.id });
  const toTrick = () => navigate({ screen: "trick", chapterId: chapter.id, trickId: trick.id });

  if (route.screen === "trick") {
    return (
      <TrickLearn
        chapter={chapter}
        trick={trick}
        onBack={toChapter}
        onPractice={(drillId) => navigate({ screen: "drill", chapterId: chapter.id, trickId: trick.id, drillId })}
      />
    );
  }

  const drill = trick.drills.includes(route.drillId as DrillId) ? findDrill(route.drillId) : undefined;
  if (!drill) return <NotFound message="That practice drill isn't part of this trick." onBack={toTrick} />;
  return <DrillGame key={drill.id} drill={drill} trickTitle={trick.title} onBack={toTrick} />;
}
