"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useHashRoute } from "@/hooks/useHashRoute";
import { isCoachingRoute } from "@/lib/route";
import { HomeScreen } from "@/components/home/HomeScreen";
import { ArunSharmaTrack } from "@/components/tracks/ArunSharmaTrack";
import { CoachingTrack } from "@/components/coaching/CoachingTrack";

function BrandHeader() {
  return (
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
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-1">CAT-Fast</h1>
      <p className="text-text-secondary text-sm sm:text-base max-w-xs mx-auto">
        Mental math trainer for competitive exams
      </p>
    </motion.div>
  );
}

export default function Home() {
  const { route, navigate } = useHashRoute();
  const goHome = () => navigate({ screen: "home" });
  const isHome = route.screen === "home";

  return (
    <main
      className={`min-h-[calc(100dvh-var(--sat)-var(--sab))] flex flex-col items-center px-4 py-4 sm:py-12 ${
        isHome ? "justify-center" : "justify-start"
      }`}
    >
      {isHome && (
        <>
          <BrandHeader />
          <HomeScreen
            onArunSharma={() => navigate({ screen: "arun", mode: "math" })}
            onCoaching={() => navigate({ screen: "chapters" })}
          />
        </>
      )}

      {route.screen === "arun" && (
        <ArunSharmaTrack
          mode={route.mode}
          onModeChange={(mode) => navigate({ screen: "arun", mode }, { replace: true })}
          onHome={goHome}
        />
      )}

      {isCoachingRoute(route) && <CoachingTrack route={route} navigate={navigate} onHome={goHome} />}
    </main>
  );
}
