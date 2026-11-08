"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Zap, Calculator, Percent, Scale, Link2, Divide } from "lucide-react";
import { MathGame } from "@/components/game/MathGame";
import { PercentageGame } from "@/components/game/PercentageGame";
import { RatioGame } from "@/components/game/RatioGame";
import { ChainGame } from "@/components/game/ChainGame";
import { DivisibilityGame } from "@/components/game/DivisibilityGame";

type GameMode = "math" | "percentage" | "ratio" | "chain" | "divisibility";

const gameModes: { id: GameMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "math",
    label: "Mental Math",
    icon: <Calculator className="w-4 h-4" />,
    description: "Addition & Subtraction",
  },
  {
    id: "percentage",
    label: "Percentage",
    icon: <Percent className="w-4 h-4" />,
    description: "Calculate ratio %",
  },
  {
    id: "ratio",
    label: "Ratio",
    icon: <Scale className="w-4 h-4" />,
    description: "Compare ratios",
  },
  {
    id: "chain",
    label: "Chain",
    icon: <Link2 className="w-4 h-4" />,
    description: "Addition chain",
  },
  {
    id: "divisibility",
    label: "Divide",
    icon: <Divide className="w-4 h-4" />,
    description: "Remainders",
  },
];

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

// App-icon shortcuts link to /#mode=ratio. It's a hash rather than ?mode= because
// the service worker's cached home page only matches the exact URL "/".
function getLinkedMode(): GameMode | null {
  const mode = window.location.hash.replace("#mode=", "");
  return gameModes.find((m) => m.id === mode)?.id ?? null;
}

export default function Home() {
  const linkedMode = useSyncExternalStore(subscribeToHash, getLinkedMode, () => null);
  const [pickedMode, setPickedMode] = useState<GameMode | null>(null);
  const activeMode = pickedMode ?? linkedMode ?? "math";

  return (
    <main className="min-h-[calc(100dvh-var(--sat)-var(--sab))] flex flex-col items-center justify-center px-4 py-4 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="app-chrome text-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-indigo/20 mb-3 neon-glow"
        >
          <Zap className="w-7 h-7 text-neon-indigo-glow" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-1">
          CAT-Fast
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-xs mx-auto">
          Mental math trainer for competitive exams
        </p>
      </motion.div>

      {/* Mode Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="app-modes flex gap-1.5 p-1.5 bg-charcoal-light rounded-xl mb-4 border border-soft-slate/20"
      >
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setPickedMode(mode.id)}
            aria-label={mode.label}
            aria-pressed={activeMode === mode.id}
            className={`
              relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${activeMode === mode.id
                ? "bg-neon-indigo text-white shadow-lg shadow-neon-indigo/25"
                : "text-text-secondary hover:text-text-primary hover:bg-charcoal-medium"
              }
            `}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Game Container */}
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {activeMode === "math" && <MathGame />}
        {activeMode === "percentage" && <PercentageGame />}
        {activeMode === "ratio" && <RatioGame />}
        {activeMode === "chain" && <ChainGame />}
        {activeMode === "divisibility" && <DivisibilityGame />}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="app-chrome text-text-muted text-xs text-center mt-6"
      >
        <kbd className="px-1.5 py-0.5 rounded bg-charcoal-medium text-text-secondary font-mono text-[10px]">Enter</kbd> to start · <kbd className="px-1.5 py-0.5 rounded bg-charcoal-medium text-text-secondary font-mono text-[10px]">Esc</kbd> to reset
      </motion.p>
    </main>
  );
}
