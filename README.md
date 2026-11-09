# CAT-Fast

A keyboard-first mental math trainer for CAT and similar exams, with five drill modes and offline support. It runs entirely in the browser.

**Live:** [cat-math-app.vercel.app](https://cat-math-app.vercel.app/)

[![CI](https://github.com/VedPawar1410/cat_math_app/actions/workflows/ci.yml/badge.svg)](https://github.com/VedPawar1410/cat_math_app/actions/workflows/ci.yml)

| Headline metric | Result |
|---|---|
| Automated tests | 93 passing |
| Percentage grading | 0 errors across all 78,908 level/question combinations |
| Lighthouse (mobile, production) | Accessibility 100, Best Practices 100, SEO 100 |
| axe WCAG A/AA | 0 violations across 18 screens |
| Offline | All 5 modes work with the server shut down |
| Lint | 0 errors, 0 warnings |

## Drill modes

| Mode | What you practise | Difficulty |
|---|---|---|
| **Mental Math** | Addition and subtraction | 5 levels, from 2-digit up to 4-digit with 5-digit |
| **Percentage** | Convert a ratio such as 53/81 to a percentage | 5 levels, 1 or 2 decimals, over 100% at levels 4-5 |
| **Ratio** | Pick the larger of two ratios | 5 levels, from a 15-40% gap down to 0.5-2% |
| **Chain** | 10-20 additions where each answer feeds the next | 5 levels, numbers grow as the chain goes on |
| **Divisibility** | Is it divisible, then what is the remainder | 5 levels, 5-20 problems, negative remainders optional |

Sessions end with a summary that compares your median time with your last 5 sessions at that level. A chart below the Start button shows your speed and accuracy trend for the selected mode and level. Level, stats and session history are saved on your device.

| Key | Action |
|---|---|
| `Enter` | Start, submit, or leave a summary |
| `Esc` | End the session |
| `1` / `←` / `A` and `2` / `→` / `B` | Pick the left or right ratio |
| `Y` / `1` and `N` / `0` | Divisible: yes or no |
| `Tab` | Skip a Chain step |
| `Space` | Next problem in Divisibility feedback |

## How it works

```text
 Keyboard or on-screen NumPad
             |
             v
 Game component (Math, Percentage, Ratio, Chain, Divisibility)
     |                 |                        |
     v                 v                        v
 Engine            Hooks                    Zustand stores
 (pure functions:  useCancellableTimeout    (level and stats)
  makes questions, useSessionRecorder              |
  grades answers)                                  v
                                             localStorage

 Service worker: caches the app so it runs offline
```

There is no backend. Questions are generated in the browser, so there's no dataset or server to run.

**Why these choices**

- **Engines are pure functions.** Maths can be tested without a browser, and the percentage grader is checked against every possible question.
- **Zustand with `persist`.** Saving progress to `localStorage` is a few lines, and no account is needed.
- **Keyboard events on `window`.** You can start typing an answer without clicking anything first.
- **Chain feedback keeps its own copy of the answered step.** The store moves on at once, so you can type the next answer straight away.
- **One always-mounted status element per game.** Screen readers only reliably announce changes to a live region that already exists.
- **Shortcuts use `#mode=ratio`, not `?mode=ratio`.** The service worker's cached home page matches the exact URL, so a query string would miss it offline.

## Results

Measured on 8 November 2026. Lighthouse and load figures come from the production site.

| Check | Before | After |
|---|---|---|
| Tests | 0 | 93 |
| Installed iPhone app can scroll | No, the bottom was cut off | Yes |
| Enter and End on a 390x844 screen, measured in Chrome | End off screen in 4 of 5 modes | On screen in every mode, no scrolling |
| Percentage combinations graded wrongly | 18 of 78,908 | 0 of 78,908 |
| Service worker | Never registered | Active on production |
| Offline | Browser error page | All 5 modes start |
| Lighthouse Accessibility | 82 | 100 |
| Lint, whole project | 8 errors, 91 warnings | 0 errors, 0 warnings |
| Critical advisories in production dependencies | 1 | 0 |
| All advisories in production dependencies | 24 | 18 |
| Chain feedback after a wrong answer | Showed the next step's answer | Shows the step answered |
| Typing during Chain feedback | Erased | Kept |
| Recorded time for a question | Always 0 | Real time |
| First-visit LCP (Slow 4G, 4x CPU, one run each) | 2.9 s | 3.6 s, no improvement |
| Repeat-visit LCP (same conditions, one run) | Not measured | 0.45 s, served by the service worker |
| Layout shift (CLS) | 0 | 0 |
| JS and CSS, gzipped (approximate) | 217 KB | 231 KB |

Generated answers were also simulated before the rebuild: 250,000 questions each for Math, Ratio and Divisibility, and 25,000 chains, with 0 wrong answers.

To check that the tests catch real bugs, I reintroduced 8 of them one at a time, covering rounding, timers, Chain feedback, question timing, input resets and the iPhone scroll lock. Each one made at least one test fail.

## Project structure

```text
src/
  app/
    globals.css                 Theme colours and global styles
    layout.tsx                  Root layout, metadata, service worker setup
    page.tsx                    Mode switcher and #mode= links
  components/
    ServiceWorkerRegister.tsx   Registers the worker and caches the home page
    game/
      MathGame.tsx              Addition and subtraction
      MathQuestion.tsx          Question display for Math
      PercentageGame.tsx        Ratio to percentage
      RatioGame.tsx             Compare two ratios
      ChainGame.tsx             Addition chain
      DivisibilityGame.tsx      Divisibility and remainders
      SessionSummary.tsx        End-of-session results
      __tests__/                UI regression tests
    ui/
      Button.tsx, GameCard.tsx  Shared UI pieces
      EndSessionButton.tsx      Always-visible way out of a session
      NumPad.tsx                On-screen number pad
      ScreenReaderStatus.tsx    Live region for announcements
      StatsPreview.tsx          Lifetime stats on the setup screen
      ProgressChart.tsx         Speed trend for the selected mode and level
      ProgressComparison.tsx    This session against recent ones
  hooks/
    useCancellableTimeout.ts    Delayed action that can be cancelled
    useSessionRecorder.ts       Tallies a session for the summary
  lib/
    engines/                    One pure question engine per mode
    store.ts                    Math settings and stats
    practiceStore.ts            Percentage and Ratio settings and stats
    chainStore.ts               Chain game state and stats
    divisibilityStore.ts        Divisibility game state and stats
    progressStore.ts            One row per finished session, and the trend maths
    __tests__/                  Engine and store tests
  types/next-pwa.d.ts           Types for next-pwa
public/                         Icons, manifest (sw.js is generated at build)
scripts/generate-icons.mjs      Builds PNG icons from the SVGs
vitest.config.mts               Test configuration
.github/workflows/ci.yml        Lint, tests and build on every push
```

## Run locally

Tested with Node 24. The test runner needs Node 22.12 or newer.

```bash
git clone https://github.com/VedPawar1410/cat_math_app.git
cd cat_math_app
npm ci
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The service worker only runs in production builds.

```bash
npm test
```
```bash
npm run lint
```
```bash
npm run build
npm start
```

## Deployment

Hosted on Vercel, and every push to `main` deploys to production.

- **CI:** GitHub Actions runs lint, tests and the production build on every push to `main` and on pull requests.
- **Build:** `npm run build`, which runs `next build --webpack` because `next-pwa` needs webpack.
- **Versions:** `next` 16.4.5 and `react` 19.2.3 are pinned exactly.
- **Service worker:** `public/sw.js` and `public/workbox-*.js` are generated by each build and aren't in git.
- **Environment variables:** none.

## Limitations

- Progress stays on one device and browser. There are no accounts or sync, so the app can't report how much its users improved overall.
- The speed chart starts empty. Earlier sessions weren't logged per session, so there's nothing to backfill. Sessions under 3 answers aren't logged.
- The chart sits below the Start button, so Ratio, Chain and Divisibility need a scroll to see it on a 390x844 phone. Its layout was measured in Chrome, not on a real iPhone.
- Difficulty is chosen manually. It doesn't adapt to how you're doing.
- First-visit load on a slow phone is still about 3.6 s in the lab. Only repeat visits got faster.
- 18 advisories remain in the production dependency tree. Most look like `next-pwa` build tooling (workbox, rollup, babel), but I haven't traced each one. `next-pwa` itself is unmaintained.
- On a real iPhone I've checked installing to the Home Screen, opening offline, the mode tabs, fast numpad taps and pinch-zoom. The later layout fix was measured in Chrome at iPhone sizes and hasn't been re-checked on the phone.
- On a 375x667 phone, Enter and End stay on screen but some modes need a few pixels of scrolling.
- Not tested with a real screen reader. Announcements were checked by reading the live region.
- Ratio levels are defined only by the percentage gap. The two ratios aren't guaranteed to share a 10% or 1% band: at level 5, 89% share a 10% band and 11% share a 1% band.
- Percentage answers must be rounded exactly, so a close estimate counts as wrong.
- Older saved Math stats contain 0-second times. They aren't displayed.
- Lighthouse reported SEO 91 once, when its fetch of `robots.txt` timed out. The next run was 100. The site has no `robots.txt`.

## Learning log: mistakes and what I learned

I built this in layers while preparing for CAT, then came back to it ten months later. Each layer records what went wrong and the lesson.

### Layer 1 - The first build (4 January 2026, Next.js 16, TypeScript, Tailwind, Zustand, next-pwa)

*What I built:* Math, Percentage and Ratio drills with a numpad, installable as a PWA, deployed on Vercel.

| # | Mistake | What actually happened | Lesson |
|---|---|---|---|
| 1.1 | **Shipped a PWA I never tested offline** | `next-pwa` adds its registration to `main.js`, a Pages Router file. My App Router page loads `main-app.js`, so 0 service workers ever registered and offline showed Chrome's error page. | A config file is not a feature. Test the behaviour you're claiming. |
| 1.2 | **Floating-point rounding marked right answers wrong** | `(23 / 80) * 100` lands just under 28.75, so the app expected 28.7 and rejected 28.8. 18 of 78,908 level/question combinations were affected. | Keep values in whole numbers until the final step. |
| 1.3 | **Timers that were never cancelled** | Ending and restarting a session within about a second changed the question: 61 + 12 became 31 + 34. | Anything you schedule needs a way to be cancelled. |
| 1.4 | **A metric that could only ever be zero** | `setQuestion` restarted the clock right before `submitAnswer` read it, so saved times were `[0]`. Nothing displayed the number, so I never noticed. | Unused data hides bugs. Look at what you're actually storing. |
| 1.5 | **Accessibility ignored** | Lighthouse 82, no `aria-` attributes anywhere in `src`, 7 unnamed buttons, and pinch-zoom turned off. | Icon-only buttons need names, and disabling zoom is the wrong fix for double-tap. |
| 1.6 | **Links to things that didn't exist** | Three `apple-splash` images returned 404, and the `?mode=` shortcuts in the manifest were ignored by the page. | Click every link you ship. |
| 1.7 | **A README describing a different app** | It promised "adaptive difficulty" that was never built, had a placeholder clone URL and named folders that didn't exist. It also listed PWA as a future idea. | Write the README from the code, not from the plan. |
| 1.8 | **Committed build output** | Generated `public/sw.js` and `workbox-*.js` sat in git. | Generated files don't belong in version control. |
| 1.9 | **No tests** | 0 tests, so every bug above stayed live for ten months. | The cheapest tests are for pure logic, and I had plenty of it. |

### Layer 2 - Two more modes (11 January 2026, same stack)

*What I built:* The Chain and Divisibility modes, each with its own Zustand store and a real results screen.

| # | Mistake | What actually happened | Lesson |
|---|---|---|---|
| 2.1 | **Feedback read state that had already moved on** | After a wrong Chain answer the real answer was 166, but the screen said "Answer: 190", which was the next step's answer. | When state moves on, anything describing the past needs its own copy. |
| 2.2 | **A timer with too many jobs** | The feedback timer also cleared the input, so "12" typed on the next step vanished 800 ms later. | Timers should do one thing. This one hit fast users hardest. |
| 2.3 | **The modes drifted apart** | New modes got summaries and saved stats. Math, Percentage and Ratio had no summary, Percentage and Ratio forgot your level, and Esc did different things in each mode. | Adding a feature means checking the existing ones still match. |
| 2.4 | **Results that weren't true** | Stopping after one step still said "Chain Complete!", and an empty Divisibility session was recorded as a game. | Celebration text is still data. It should be accurate. |
| 2.5 | **Left the README behind** | It listed 3 of the 5 modes. | Documentation has to be part of finishing a feature. |
| 2.6 | **Then left it alone for ten months** | `next` 16.1.1 picked up a critical advisory, among 24 in production dependencies. | Live apps age even when you don't touch them. |

### Layer 3 - The rebuild (November 2026)

*What I did:* Audited the live site, measured a baseline, then fixed it one commit at a time and verified each deploy on production.

| # | Decision | Why |
|---|---|---|
| 3.1 | Feedback stores the step it describes, and the keypad never locks | Fixes 2.1 and 2.2 without slowing down a speed drill |
| 3.2 | Multiply before dividing when rounding | Fixes 1.2, checked against every possible question |
| 3.3 | One `useCancellableTimeout` hook for all timed games | Fixes 1.3 once instead of four times |
| 3.4 | Start the clock when the question appears | Fixes 1.4 |
| 3.5 | Upgrade Next and register the service worker myself | Fixes 2.6 and 1.1. Also caches the home page, because the page that registers a worker is fetched before the worker exists |
| 3.6 | Tested offline by shutting the server down | Stronger than a browser's offline toggle, which may not cut off the worker |
| 3.7 | Tested that updates reach users | A service worker can strand people on an old version if this breaks |
| 3.8 | Named buttons, restored zoom, computed contrast ratios | Fixes 1.5. `touch-action: manipulation` handles double-tap, and axe found placeholder contrast that Lighthouse never saw |
| 3.9 | Shared summary, recorder and practice store | Fixes 2.3 and 2.4 without a large refactor |
| 3.10 | Live region for screen-reader announcements | Without it the drill itself couldn't be used without sight |
| 3.11 | Vitest and React Testing Library, then put bugs back to prove the tests fail | Fixes 1.9. A test you've never seen fail doesn't prove much |
| 3.12 | Removed generated files, dead code and false README claims | Fixes 1.6, 1.7, 1.8 and 2.5 |

*Known gaps I chose not to fix:* `next-pwa` is unmaintained and carries most of the remaining advisories. First-visit load is still slow. Five game components still share a lot of duplicated code. There's no CI.

### Layer 4 - The iPhone test (November 2026, a real iPhone and Chrome at iPhone sizes)

*What I did:* Installed the app on my iPhone for the first time since the rebuild. Offline worked, but two serious problems showed up that every earlier check had missed.

| # | Mistake | What actually happened | Lesson |
|---|---|---|---|
| 4.1 | **A rule that only runs in the installed app** | Since January, `html { overflow: hidden }` applied only in standalone mode. The body grew to fit its content (1000 px, so it never scrolled), which left the app unable to scroll at all. | Code behind a condition needs testing in that condition. |
| 4.2 | **The only exit was off screen** | End Session sat below the fold at 903-971 px on an 844 px screen, in 4 of 5 modes. Phones have no Esc key, so you couldn't leave a session. | Check that every action works with the input the device actually has. |
| 4.3 | **Perfect scores on the wrong thing** | Lighthouse 100, axe clean on 18 screens and 69 passing tests, and none of them noticed. My 360 px check only looked for sideways overflow on one screen. | Automated scores measure what they measure. Use the product on the real device. |

| # | Decision | Why |
|---|---|---|
| 4.4 | Removed `overflow` from the standalone rules and kept `overscroll-behavior` | Fixes 4.1 while still stopping pull-to-refresh |
| 4.5 | One shared End button at the top of every game | Fixes 4.2, and it can't drift below the fold |
| 4.6 | Hide the header during a session with CSS `:has()` watching for that button | Gives the game the screen without lifting game state up to the page |
| 4.7 | Took the notch areas out of the page's minimum height | The page was as tall as the screen plus the safe areas, so it could never fit |
| 4.8 | Added a test that fails if `overflow` returns to the standalone rules | Fixes the cause permanently, not just this time |
| 4.9 | Added GitHub Actions for lint, tests and the build | Closes the "no CI" gap from Layer 3, so a broken commit shows up without me remembering to run anything |

### Layer 5 - Measuring improvement (November 2026, a session log and a hand-drawn SVG chart)

*What I built:* One saved row per finished session in all 5 modes, a speed and accuracy trend on each setup screen, and a line on the results screen comparing the session with recent ones.

| # | Mistake | What actually happened | Lesson |
|---|---|---|---|
| 5.1 | **Assumed the data already existed** | I expected per-session times to be saved. Only Math saved times, as one flat list with no dates or session boundaries. The other modes measured time and threw it away. | Read what's actually stored before designing on top of it. |
| 5.2 | **New UI pushed a control off screen again** | The chart moved Start to 905-986 px on an 844 px screen in 3 of 5 modes. It's the same class of bug as 4.2, and only measuring found it. | Re-measure the phone layout whenever anything is added to a screen. |

| # | Decision | Why |
|---|---|---|
| 5.3 | Median per session, not average | One long pause would wreck an average but barely moves a median |
| 5.4 | Trends kept per mode and level, and Math per operation | Otherwise moving up a level looks like getting slower |
| 5.5 | Accuracy shown next to speed | Guessing quickly shouldn't look like improving |
| 5.6 | Sessions under 3 answers aren't logged | Ending after one question would add a meaningless point |
| 5.7 | Hand-drawn SVG instead of a chart library | A line chart doesn't justify a dependency when first-visit load is already the weakest number |
| 5.8 | Chart below the Start button | Fixes 5.2: Start is back at 614-824 px, and the chart can't push it down again |
| 5.9 | Reintroduced 7 bugs to check the new tests | Each one made at least one test fail |

### Key takeaways

1. **Claims need tests.** "PWA" sat in my README and config for ten months while offline had never worked once.
2. **Compare like with like.** My first after-number for load time was 0.45 s, but the service worker had served it. The honest cold-load number was 3.6 s, slightly worse than before.
3. **Prove your tests can fail.** Putting each bug back showed the suite really catches them.
4. **Tests with random inputs need answers that can't be right by luck.** The suite failed once across dozens of runs. The likely cause was a test typing `1` as a wrong answer, when 45 − 44 is 1. I fixed that, but never reproduced the failure to confirm it.
5. **Audit more than the landing page.** Lighthouse saw one screen. Scanning all 18 with axe found a real contrast problem it had missed.
6. **The riskiest bugs are the ones nothing displays.** A timing stat stuck at 0 caused no visible problem at all.
7. **Nothing replaces using it on the real device.** Two minutes on my iPhone found what perfect automated scores had missed.

## Future improvements

- Finish checking on a real iPhone: the new play-screen layout, stats after reopening the app, and VoiceOver announcements.
- Improve first-visit load. I suspect the entrance animations hide content until JavaScript runs, but haven't confirmed it.
- Replace `next-pwa` with a maintained option such as Serwist.
- Add adaptive difficulty and spaced repetition for weak areas.
- Add multiplication and division drills.
- Add `robots.txt`.
- Possible larger redesign: merge the five game shells and stores, and add accounts and sync.

## License

MIT. See [LICENSE](LICENSE).

The Percentage mode is inspired by the "Percentage Rule" in *How to Prepare for Quantitative Aptitude for the CAT* by Arun Sharma.
