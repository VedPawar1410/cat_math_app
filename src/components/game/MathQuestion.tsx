"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MathProblem } from "@/lib/engines/mathEngine";

interface MathQuestionProps {
  problem: MathProblem;
  showAnswer?: boolean;
}

export function MathQuestion({ problem, showAnswer = false }: MathQuestionProps) {
  const [left, operator, right] = problem.question.split(" ");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={problem.question}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="text-center py-6"
      >
        {/* Main question display */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* First operand */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary font-mono tracking-tight"
          >
            {left}
          </motion.span>

          {/* Operator */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
              operator === "+" ? "text-success" : "text-error"
            }`}
          >
            {operator}
          </motion.span>

          {/* Second operand */}
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary font-mono tracking-tight"
          >
            {right}
          </motion.span>
        </div>

        {/* Equals sign and answer (when showing) */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-4"
          >
            <span className="text-2xl sm:text-3xl text-text-muted">=</span>
            <span className="text-3xl sm:text-4xl font-bold text-neon-indigo font-mono">
              {problem.answer}
            </span>
          </motion.div>
        )}

        {/* Difficulty indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4"
        >
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-medium text-text-muted border border-soft-slate/30">
            Level {problem.difficulty}
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

