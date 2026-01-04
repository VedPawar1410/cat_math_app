"use client";

import { motion } from "framer-motion";
import { Delete, CornerDownLeft } from "lucide-react";

interface NumPadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onDelete: () => void;
  onEnter: () => void;
  onClear?: () => void;
  disabled?: boolean;
  showDecimal?: boolean;
  showNegative?: boolean;
}

const buttonBase = `
  flex items-center justify-center
  text-xl sm:text-2xl font-bold font-mono
  rounded-xl
  transition-all duration-150
  active:scale-95
  disabled:opacity-40 disabled:cursor-not-allowed
`;

const digitButton = `
  ${buttonBase}
  bg-charcoal-light hover:bg-charcoal-medium
  text-text-primary
  border border-soft-slate/20 hover:border-soft-slate/40
`;

const actionButton = `
  ${buttonBase}
  bg-charcoal-medium hover:bg-soft-slate/50
  text-text-secondary hover:text-text-primary
  border border-soft-slate/30
`;

const enterButton = `
  ${buttonBase}
  bg-neon-indigo hover:bg-neon-indigo-glow
  text-white
  shadow-lg shadow-neon-indigo/25
`;

export function NumPad({
  onDigit,
  onDecimal,
  onDelete,
  onEnter,
  disabled = false,
  showDecimal = true,
  showNegative = false,
}: NumPadProps) {
  const handleDigit = (digit: string) => {
    if (!disabled) onDigit(digit);
  };

  const handleDecimal = () => {
    if (!disabled) onDecimal();
  };

  const handleDelete = () => {
    if (!disabled) onDelete();
  };

  const handleEnter = () => {
    if (!disabled) onEnter();
  };

  // Animation for button press
  const buttonVariants = {
    tap: { scale: 0.92 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-xs mx-auto mt-4"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Row 1: 1 2 3 */}
        {["1", "2", "3"].map((digit) => (
          <motion.button
            key={digit}
            whileTap={buttonVariants.tap}
            onClick={() => handleDigit(digit)}
            disabled={disabled}
            className={`${digitButton} h-12 sm:h-14`}
          >
            {digit}
          </motion.button>
        ))}

        {/* Row 2: 4 5 6 */}
        {["4", "5", "6"].map((digit) => (
          <motion.button
            key={digit}
            whileTap={buttonVariants.tap}
            onClick={() => handleDigit(digit)}
            disabled={disabled}
            className={`${digitButton} h-12 sm:h-14`}
          >
            {digit}
          </motion.button>
        ))}

        {/* Row 3: 7 8 9 */}
        {["7", "8", "9"].map((digit) => (
          <motion.button
            key={digit}
            whileTap={buttonVariants.tap}
            onClick={() => handleDigit(digit)}
            disabled={disabled}
            className={`${digitButton} h-12 sm:h-14`}
          >
            {digit}
          </motion.button>
        ))}

        {/* Row 4: ./- 0 Delete */}
        {showDecimal ? (
          <motion.button
            whileTap={buttonVariants.tap}
            onClick={handleDecimal}
            disabled={disabled}
            className={`${actionButton} h-12 sm:h-14`}
          >
            .
          </motion.button>
        ) : showNegative ? (
          <motion.button
            whileTap={buttonVariants.tap}
            onClick={() => handleDigit("-")}
            disabled={disabled}
            className={`${actionButton} h-12 sm:h-14`}
          >
            −
          </motion.button>
        ) : (
          <div className="h-12 sm:h-14" /> // Empty spacer
        )}

        <motion.button
          whileTap={buttonVariants.tap}
          onClick={() => handleDigit("0")}
          disabled={disabled}
          className={`${digitButton} h-12 sm:h-14`}
        >
          0
        </motion.button>

        <motion.button
          whileTap={buttonVariants.tap}
          onClick={handleDelete}
          disabled={disabled}
          className={`${actionButton} h-12 sm:h-14`}
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

        {/* Row 5: Enter button spanning full width */}
        <motion.button
          whileTap={buttonVariants.tap}
          onClick={handleEnter}
          disabled={disabled}
          className={`${enterButton} h-12 sm:h-14 col-span-3`}
        >
          <CornerDownLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          <span>Enter</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

