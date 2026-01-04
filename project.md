Project Plan: CAT-Fast (Mental Math Trainer)

1. Tech Stack RecommendationFramework: Next.js 14+ (App Router) for seamless Mac/iPhone performance.Styling: Tailwind CSS (Modern, responsive).Animations: Framer Motion (For that "playful" and smooth feel).State Management: Zustand (Lightweight for tracking streaks and timers).Icons: Lucide React. Persistence: LocalStorage (To track metrics without a complex backend).

2. Folder StructurePlaintextcat-fast/
├── src/
│   ├── app/                 # Next.js pages & routing
│   ├── components/
│   │   ├── ui/             # Reusable aesthetic components
│   │   ├── game/           # Addition, Subtraction, Ratio modules
│   │   └── shared/         # Timer, Scoreboard, Feedback
│   ├── lib/
│   │   ├── engines/        # Logic for generating math problems
│   │   └── store.js        # Zustand state for performance tracking
│   └── hooks/              # Custom hooks for timers and keyboard shortcuts


3. Core Logic & Difficulty Scaling
A. The Math Engines 
(lib/engines/)Addition/Subtraction: Uses a level parameter.Level 1: 2-digit (10-99)Level 2: 2-digit + 3-digitLevel 3: 3-digit + 3-digit...up to 5-digit. Percentage Rule Engine: Generates a ratio $X/Y$. The user must calculate the percentage. Ratio Comparison Engine: Generates two ratios $A/B$ and $C/D$. Logic must ensure they are "close" (e.g., within 5% of each other) to simulate CAT difficulty.
B. Feedback LoopInput: Number only. Validation: Compare userInput with calculatedAnswer.Feedback: Trigger a brief screen shake and "Red Flash" for wrong, "Green Glow" for right.

4. UI/UX Features for Speed
Auto-Submit: For Ratio Comparisons (one-tap selection).
Quick-Restart: A simple "Reset" button that clears the current session.
Haptic Feedback: (For iPhone) Trigger light vibration on incorrect answers.
Keyboard Shortcuts: On Mac, pressing 'Enter' submits, and numbers 1-4 can select ratios.