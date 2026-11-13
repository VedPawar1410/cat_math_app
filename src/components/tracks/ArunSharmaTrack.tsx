"use client";

import { motion } from "framer-motion";
import { Calculator, Percent, Scale, Link2, Divide } from "lucide-react";
import { MathGame } from "@/components/game/MathGame";
import { PercentageGame } from "@/components/game/PercentageGame";
import { RatioGame } from "@/components/game/RatioGame";
import { ChainGame } from "@/components/game/ChainGame";
import { DivisibilityGame } from "@/components/game/DivisibilityGame";
import { TopBar } from "@/components/ui/TopBar";
import type { ArunMode } from "@/lib/route";

const gameModes: { id: ArunMode; label: string; icon: React.ReactNode }[] = [
  { id: "math", label: "Mental Math", icon: <Calculator className="w-4 h-4" /> },
  { id: "percentage", label: "Percentage", icon: <Percent className="w-4 h-4" /> },
  { id: "ratio", label: "Ratio", icon: <Scale className="w-4 h-4" /> },
  { id: "chain", label: "Chain", icon: <Link2 className="w-4 h-4" /> },
  { id: "divisibility", label: "Divide", icon: <Divide className="w-4 h-4" /> },
];

interface ArunSharmaTrackProps {
  mode: ArunMode;
  onModeChange: (mode: ArunMode) => void;
  onHome: () => void;
}

/** The five original drill modes, unchanged; only how you reach them is new. */
export function ArunSharmaTrack({ mode, onModeChange, onHome }: ArunSharmaTrackProps) {
  return (
    <>
      <TopBar title="Arun Sharma" backLabel="Home" onBack={onHome} />

      {/* Mode Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="app-modes flex gap-1.5 p-1.5 bg-charcoal-light rounded-xl mb-4 border border-soft-slate/20"
      >
        {gameModes.map((gameMode) => (
          <button
            key={gameMode.id}
            onClick={() => onModeChange(gameMode.id)}
            aria-label={gameMode.label}
            aria-pressed={mode === gameMode.id}
            className={`
              relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${mode === gameMode.id
                ? "bg-neon-indigo text-white shadow-lg shadow-neon-indigo/25"
                : "text-text-secondary hover:text-text-primary hover:bg-charcoal-medium"
              }
            `}
          >
            {gameMode.icon}
            <span className="hidden sm:inline">{gameMode.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Game Container */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {mode === "math" && <MathGame />}
        {mode === "percentage" && <PercentageGame />}
        {mode === "ratio" && <RatioGame />}
        {mode === "chain" && <ChainGame />}
        {mode === "divisibility" && <DivisibilityGame />}
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
    </>
  );
}
