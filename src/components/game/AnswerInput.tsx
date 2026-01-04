"use client";

import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";

interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  feedbackState?: "neutral" | "correct" | "incorrect";
  onReset?: () => void;
}

export function AnswerInput({
  onSubmit,
  disabled = false,
  autoFocus = true,
  feedbackState = "neutral",
  onReset,
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount and when feedback state changes back to neutral
  useEffect(() => {
    if (autoFocus && inputRef.current && feedbackState === "neutral") {
      inputRef.current.focus();
    }
  }, [autoFocus, feedbackState]);

  // Clear input when feedback changes (new question)
  useEffect(() => {
    if (feedbackState === "neutral") {
      setValue("");
    }
  }, [feedbackState]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and negative sign
    const newValue = e.target.value.replace(/[^0-9-]/g, "");
    // Only allow negative sign at the start
    if (newValue.indexOf("-") > 0) return;
    setValue(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() !== "" && !disabled) {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        onSubmit(numericValue);
      }
    }
    if (e.key === "Escape" && onReset) {
      onReset();
    }
  };

  const handleSubmitClick = () => {
    if (value.trim() !== "" && !disabled) {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        onSubmit(numericValue);
      }
    }
  };

  // Determine styling based on feedback state
  const inputStyles = {
    neutral: "border-soft-slate/30 focus:border-neon-indigo",
    correct: "border-success bg-success/10 text-success",
    incorrect: "border-error bg-error/10 text-error animate-shake",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-xs mx-auto"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Your answer"
          autoComplete="off"
          className={`
            w-full
            px-4 py-4
            text-2xl sm:text-3xl font-mono font-bold
            text-center
            bg-charcoal-light
            border-2 rounded-xl
            transition-all duration-200
            placeholder:text-text-muted/50
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-neon-indigo/30
            ${inputStyles[feedbackState]}
          `}
        />

        {/* Submit hint */}
        {value && feedbackState === "neutral" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <button
              onClick={handleSubmitClick}
              disabled={disabled}
              className="px-2 py-1 text-xs font-medium text-text-muted hover:text-neon-indigo bg-charcoal-medium rounded-md transition-colors"
            >
              Enter ↵
            </button>
          </motion.div>
        )}
      </div>

      {/* Feedback message */}
      {feedbackState !== "neutral" && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center text-sm font-medium mt-2 ${
            feedbackState === "correct" ? "text-success" : "text-error"
          }`}
        >
          {feedbackState === "correct" ? "Correct! 🎉" : "Not quite. Try the next one!"}
        </motion.p>
      )}
    </motion.div>
  );
}

