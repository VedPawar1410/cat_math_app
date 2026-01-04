"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  className?: string;
}

export function GameCard({ children, className = "" }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
      }}
      className={`
        glass-card
        w-full
        max-w-md
        mx-auto
        rounded-2xl
        p-6
        sm:p-8
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

interface GameCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function GameCardHeader({ title, subtitle, icon }: GameCardHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon && (
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-indigo/20 text-neon-indigo"
        >
          {icon}
        </motion.div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-text-primary tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface GameCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GameCardContent({ children, className = "" }: GameCardContentProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}

interface GameCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function GameCardFooter({ children, className = "" }: GameCardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-soft-slate/30 ${className}`}>
      {children}
    </div>
  );
}

