# Contributing to CAT-Fast

First off, thank you for considering contributing to CAT-Fast! It's people like you that make CAT-Fast such a great tool for students preparing for competitive exams.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, inclusive, and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your browser and OS version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed feature**
- **Explain why this enhancement would be useful**
- **Include mockups or examples if possible**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the existing style conventions
4. Make sure your code lints without errors
5. Write a clear PR description

## Development Setup

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cat-fast.git
cd cat-fast

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use meaningful variable and function names

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use the `"use client"` directive only when necessary
- Follow the existing project structure

### CSS/Tailwind

- Use Tailwind utility classes
- Follow the existing color scheme (use CSS variables)
- Ensure responsive design (mobile-first)
- Use the existing component patterns

### Commits

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep commits focused on a single change

Examples:
```
Add multiplication mode to MathGame
Fix streak counter reset bug
Update README with new features
Remove deprecated API calls
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/
│   ├── ui/        # Reusable UI components (Button, Card, etc.)
│   ├── game/      # Game-specific components
│   └── shared/    # Shared components (Timer, Scoreboard)
├── lib/
│   ├── engines/   # Math problem generation logic
│   └── store.ts   # Zustand state management
└── hooks/         # Custom React hooks
```

### Adding a New Game Mode

1. Create a new engine in `src/lib/engines/` (e.g., `multiplicationEngine.ts`)
2. Create a new game component in `src/components/game/`
3. Add the mode to the switcher in `src/app/page.tsx`
4. Update the store if needed for tracking stats

### Engine Guidelines

Each engine should export:
- A problem generation function
- Type definitions for the problem structure
- Difficulty configuration
- Answer validation logic

## Feature Ideas

Looking for something to work on? Here are some ideas:

- [ ] **Multiplication/Division Mode** — Extend math operations
- [ ] **Timed Challenges** — 1-minute, 5-minute challenge modes
- [ ] **Difficulty Auto-Adjust** — Automatically increase difficulty based on accuracy
- [ ] **Sound Effects** — Audio feedback for correct/incorrect
- [ ] **Haptic Feedback** — Vibration on mobile for feedback
- [ ] **PWA Support** — Offline capability and installability
- [ ] **Spaced Repetition** — Track weak areas and focus practice
- [ ] **Statistics Dashboard** — Detailed performance analytics
- [ ] **Custom Problem Sets** — User-defined practice problems
- [ ] **Multiplayer Mode** — Compete with friends in real-time

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing.

---

Thank you for contributing! ⚡

