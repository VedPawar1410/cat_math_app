<h1 align="center">CAT-Quick Math-Practice</h1>

<p align="center">
  <strong> Lightning-fast mental math trainer for competitive exams</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#game-modes">Game Modes</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://cat-math-app.vercel.app/">
    <img src="https://img.shields.io/badge/▲_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Deployment">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

##  About

**CAT-Fast** is a sleek, mental math training app designed to help you prepare for competitive exams like CAT, GRE, GMAT, and more. Practice addition, subtraction, percentage calculations, and ratio comparisons with adaptive difficulty that scales from simple 2-digit problems to complex 5-digit calculations.

Built with a focus on speed, the app features auto-focusing inputs, keyboard shortcuts, and instant feedback to help you develop lightning-fast mental calculation skills.

##  Features

- **Keyboard First** — Full keyboard navigation and shortcuts for speed
- **Streak Tracking** — Stay motivated with streak counters and session stats
- **Progress Persistence** — Your stats are saved locally across sessions
- **Adaptive Difficulty** — 5 levels from beginner to CAT-exam difficulty
- **Instant Feedback** — Visual cues for correct/incorrect answers with animations

## Game Modes

### 1. Mental Math (Addition & Subtraction)
Practice rapid addition and subtraction with configurable difficulty:

| Level | Description |
|-------|-------------|
| 1 | 2-digit + 2-digit (10-99) |
| 2 | 2-digit + 3-digit |
| 3 | 3-digit + 3-digit |
| 4 | 3-digit + 4-digit |
| 5 | 4-digit + 5-digit |

### 2. Percentage Rule
Calculate the percentage value of ratios using the powerful "Percentage Rule" method:

```
Example: 53/81 = ?%

Process: 53/81 = (40.5 + 12.5)/81 = 50% + 12.5/81
       = 50% + 10% + 4.4/81 ≈ 65.43%
```

- Levels 1-2: Simple ratios, 1 decimal place
- Levels 3-5: Complex ratios, 2 decimal places, including >100%

### 3. Ratio Comparison
Compare two ratios and identify the larger one — a critical skill for Data Interpretation:

| Level | Difficulty |
|-------|------------|
| 1 | >15% difference (Easy) |
| 2 | 8-15% difference |
| 3 | 4-8% difference |
| 4 | 2-4% difference (Same 10% range) |
| 5 | <2% difference (CAT-level) |

**Pro Tip:** Use the Percentage Value Comparison Method — estimate the 10% range for each ratio to quickly identify the larger one.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cat-fast.git
   cd cat-fast
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

##  Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Smooth animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [Lucide React](https://lucide.dev/) | Beautiful icons |

## 📁 Project Structure

```
cat-fast/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles & theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main page
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── GameCard.tsx
│   │   ├── game/               # Game components
│   │   │   ├── MathGame.tsx
│   │   │   ├── PercentageGame.tsx
│   │   │   ├── RatioGame.tsx
│   │   │   ├── MathQuestion.tsx
│   │   │   └── AnswerInput.tsx
│   │   └── shared/             # Shared components
│   ├── lib/
│   │   ├── engines/            # Math problem generators
│   │   │   ├── mathEngine.ts
│   │   │   ├── percentageEngine.ts
│   │   │   └── ratioEngine.ts
│   │   └── store.ts            # Zustand store
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
└── package.json
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Start game / Submit answer |
| `Escape` | End session / Reset |
| `1` or `←` | Select left ratio (Ratio mode) |
| `2` or `→` | Select right ratio (Ratio mode) |

##  Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features when applicable
- Update documentation as needed

### Ideas for Contribution

- [ ] Add multiplication/division mode
- [ ] Implement spaced repetition for weak areas
- [ ] Add sound effects and haptic feedback
- [ ] Create a leaderboard system
- [ ] Add timed challenge modes
- [ ] Support for custom problem sets
- [ ] PWA support for offline use

## License

This project is licensed under the MIT License

## Acknowledgments

- Inspired by the "Percentage Rule" method from *How to Prepare for Quantitative Aptitude for the CAT* by Arun Sharma
- Built with ❤️ for CAT aspirants everywhere

