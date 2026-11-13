import { useRef } from "react";
import { AlertTriangle, Play } from "lucide-react";
import type { Chapter, ContentTable, ReferenceGrid, Trick } from "@/content/coaching/types";
import { drills } from "@/lib/engines/drills";
import { cubesUpTo, squaresUpTo, tableOf } from "@/lib/engines/memoryBankEngine";
import { TopBar } from "@/components/ui/TopBar";

interface TrickLearnProps {
  chapter: Chapter;
  trick: Trick;
  onBack: () => void;
  onPractice: (drillId: string) => void;
}

const sectionTitle = "text-sm font-semibold uppercase tracking-wider text-neon-indigo-glow";

/** A two-column table as a compact grid, so the chart fits on a phone without a long scroll. */
function TableGrid({ table }: { table: ContentTable }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-2">{table.title}</h3>
      <dl className="grid grid-cols-3 gap-1.5">
        {table.rows.map(([left, right]) => (
          <div key={left} className="px-2 py-1.5 rounded-lg bg-charcoal-light text-center">
            <dt className="text-xs text-text-muted">{left}</dt>
            <dd className="font-mono text-sm text-text-primary">{right}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Reference({ grid }: { grid: ReferenceGrid }) {
  if (grid === "tables") {
    const bases = Array.from({ length: 13 }, (_, i) => i + 13);
    return (
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-2">Tables 13 to 25 (× 2 to × 12)</h3>
        <ul className="space-y-1 font-mono text-xs text-text-secondary">
          {bases.map((base) => (
            <li key={base}>
              <span className="text-text-primary font-semibold">{base}:</span> {tableOf(base).join(", ")}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const rows = grid === "squares" ? squaresUpTo(30) : cubesUpTo(15);
  const mark = grid === "squares" ? "²" : "³";
  return (
    <TableGrid
      table={{
        title: grid === "squares" ? "Squares 1 to 30" : "Cubes 1 to 15",
        columns: ["Number", "Value"],
        rows: rows.map(([base, value]) => [`${base}${mark}`, String(value)]),
      }}
    />
  );
}

export function TrickLearn({ chapter, trick, onBack, onPractice }: TrickLearnProps) {
  const practiceRef = useRef<HTMLElement>(null);
  const singleDrill = trick.drills.length === 1 ? trick.drills[0] : null;

  const startPractice = () => {
    if (singleDrill) onPractice(singleDrill);
    else practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <TopBar title={trick.title} backLabel={chapter.title} onBack={onBack} />

      <div className="w-full max-w-md space-y-6 pb-4">
        <p className="text-sm text-text-secondary">{trick.summary}</p>

        <section className="space-y-2">
          <h2 className={sectionTitle}>Rule</h2>
          <ul className="space-y-2 text-sm text-text-primary list-disc pl-5">
            {trick.rule.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {(trick.tables?.length || trick.referenceGrids?.length) && (
          <section className="space-y-4">
            <h2 className={sectionTitle}>To remember</h2>
            {trick.tables?.map((table) => <TableGrid key={table.title} table={table} />)}
            {trick.referenceGrids?.map((grid) => <Reference key={grid} grid={grid} />)}
          </section>
        )}

        <section className="space-y-3">
          <h2 className={sectionTitle}>Worked examples</h2>
          {trick.examples.length === 0 && <p className="text-sm text-text-muted">None noted in class yet.</p>}
          {trick.examples.map((example) => (
            <article key={example.question} className="p-3 rounded-xl bg-charcoal-light space-y-1.5">
              <h3 className="text-sm font-semibold text-text-primary">{example.question}</h3>
              <ol className="list-decimal pl-5 space-y-0.5 text-sm text-text-secondary">
                {example.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="text-sm">
                <span className="text-text-muted">Answer: </span>
                <span className="font-semibold text-success">{example.answer}</span>
              </p>
              <p className="text-xs text-text-muted">{example.source}</p>
            </article>
          ))}
        </section>

        <section className="space-y-2">
          <h2 className={sectionTitle}>Common traps</h2>
          {trick.traps.length === 0 && <p className="text-sm text-text-muted">None noted in class yet.</p>}
          <ul className="space-y-2">
            {trick.traps.map((trap) => (
              <li key={trap} className="flex gap-2 text-sm text-text-primary">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                <span>{trap}</span>
              </li>
            ))}
          </ul>
        </section>

        {!singleDrill && (
          <section ref={practiceRef} className="space-y-2">
            <h2 className={sectionTitle}>Practice</h2>
            <div className="grid grid-cols-2 gap-2">
              {trick.drills.map((drillId) => (
                <button
                  key={drillId}
                  type="button"
                  onClick={() => onPractice(drillId)}
                  className="px-3 py-2.5 rounded-xl bg-charcoal-medium text-sm font-medium text-text-primary hover:bg-soft-slate/50 transition-colors"
                >
                  {drills[drillId].title}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Stays at the bottom while the page scrolls, so Practice is always one tap away */}
      <div className="sticky bottom-[var(--sab)] z-20 w-full max-w-md py-3 bg-charcoal/90 backdrop-blur">
        <button
          type="button"
          onClick={startPractice}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white bg-neon-indigo hover:bg-neon-indigo-glow transition-colors"
        >
          <Play className="w-5 h-5" />
          {singleDrill ? `Practice: ${drills[singleDrill].title}` : "Choose a practice drill"}
        </button>
      </div>
    </>
  );
}
