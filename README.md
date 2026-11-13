# CAT-Fast

A keyboard-first mental math trainer for CAT and similar exams, with offline support. It has two tracks: five drill modes based on Arun Sharma's book, and "My CAT coaching tricks", which teaches and drills the tricks from my own coaching classes, chapter by chapter. It runs entirely in the browser.

**Live:** [cat-math-app.vercel.app](https://cat-math-app.vercel.app/)

[![CI](https://github.com/VedPawar1410/cat_math_app/actions/workflows/ci.yml/badge.svg)](https://github.com/VedPawar1410/cat_math_app/actions/workflows/ci.yml)

| Headline metric | Result |
|---|---|
| Automated tests | 214 passing |
| Percentage grading | 0 errors across all 78,908 level/question combinations |
| Lighthouse (mobile, production) | Accessibility 100, Best Practices 100, SEO 100 |
| axe WCAG A/AA | 0 violations across the 18 original screens and 43 coaching-track screen states |
| Offline | Both tracks work with the server shut down, including a deep link to a drill |
| Lint | 0 errors, 0 warnings |

## Drill modes

The app opens on a choice between the two tracks. Each screen has a back control at the top, which stays on screen while you scroll, because the installed iPhone app has no back button.

### Arun Sharma track

| Mode | What you practise | Difficulty |
|---|---|---|
| **Mental Math** | Addition and subtraction | 5 levels, from 2-digit up to 4-digit with 5-digit |
| **Percentage** | Convert a ratio such as 53/81 to a percentage | 5 levels, 1 or 2 decimals, over 100% at levels 4-5 |
| **Ratio** | Pick the larger of two ratios | 5 levels, from a 15-40% gap down to 0.5-2% |
| **Chain** | 10-20 additions where each answer feeds the next | 5 levels, numbers grow as the chain goes on |
| **Divisibility** | Is it divisible, then what is the remainder | 5 levels, 5-20 problems, negative remainders optional |

Sessions end with a summary that compares your median time with your last 5 sessions at that level. A chart below the Start button shows your speed and accuracy trend for the selected mode and level. Level, stats and session history are saved on your device.

### My CAT coaching tricks track

Chapters come from my TIME coaching class notes, and only what the class taught is included. The first chapter is **Percentages** (class of 12 Nov 2026). Each trick has a Learn view (the rule, tables to remember, worked examples with their class source, and common traps) and a Practice button.

| Trick | Learn view | Practice drills |
|---|---|---|
| **The % chart (1/2 to 1/20)** | The chart from class, plus the multiples used in class (2/3, 4/9, 3/8, 5/8, 7/8, 4/5, 5/4, 4/3) | Fraction to %, % to fraction (3 levels each, including over 100%) |
| **Memory bank** | Squares to 30, cubes to 15, tables 13 to 25 | Squares 6-30, square roots, cubes 2-15, cube roots, tables 13-25 × 2-12 |
| **x% of N** | The given number is 100%, chart fractions, splits, the swap rule | Chart fractions, class multiples and splits, swap rule (whole-number answers) |
| **More vs less** | The base rule, "what % of", and the one-step chart ladder | Chart ladder, ladder or the long way, two numbers |

**Coming later** (listed in class, not taught yet): successive percentage change, percentage point, and reduction and consumption.

Recurring percentages are shown cut off to 2 decimals, as on the class chart (16.66, 14.28, 3/7 = 42.85). An answer is accepted if it's the cut-off or the rounded value (42.85 or 42.86). Typing 42.84, which is 3 × the cut-off 14.28, gets a message explaining that trap. Fraction answers accept any equivalent fraction, so 8/6 counts as 4/3.

| Key | Action |
|---|---|
| `Enter` | Start, submit, skip to the next question after feedback (coaching drills), or leave a summary |
| `Esc` | End the session |
| `/` | Fraction bar, in "% to fraction" drills |
| `1` / `←` / `A` and `2` / `→` / `B` | Pick the left or right ratio |
| `Y` / `1` and `N` / `0` | Divisible: yes or no |
| `Tab` | Skip a Chain step |
| `Space` | Next problem in Divisibility feedback |

## How it works

```text
 URL hash (#mode=ratio, #coaching=percentages/x-percent-of-n/...)
             |  parseRoute / useHashRoute
             v
 Home screen ── Arun Sharma track ── Coaching track: chapters, tricks,
                                     Learn view (from src/content)
             |
 Keyboard or on-screen NumPad
             |
             v
 Game component (5 Arun Sharma games, or one DrillGame for every coaching drill)
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
- **Every screen lives in the hash, not in Next.js routes.** The app stays on `/`, so the one cached page covers both tracks offline with no service worker changes. Separate routes would only work offline after being visited once. Old `#mode=` links still work.
- **Coaching content is typed data in `src/content/coaching/`.** A chapter is one file plus one line in `index.ts`. A test checks every chart value typed from my notes against long division.
- **One `DrillGame` for every coaching drill.** Engines return a question with its own grader, so the shell, summary, progress chart and saved level are shared rather than copied per drill.
- **Coaching engines are tested a different way from how they compute.** The tests use BigInt long division, repeated addition and worked numbers, never the same formula.

## Results

Measured on 8 November 2026. Lighthouse and load figures come from the production site.

| Check | Before | After |
|---|---|---|
| Tests | 0 | 214 |
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

**Coaching track (measured 13 Nov 2026, production build in Chrome):**

| Check | Result |
|---|---|
| Back control on screen, at the top and after scrolling to the bottom, on every new screen at 390x844 (notch simulated) | Yes. The longest Learn view is 2,691 px |
| Practice bar on screen while scrolling a Learn view | Yes |
| All 9 drills at 390x844: play screen fits with no scrolling, End and Enter visible | Yes, including during feedback after wrong answers |
| The same at 375x667 | Yes |
| axe WCAG A/AA: home, chapter list, chapter, 4 Learn views, and each drill's setup, play, feedback and summary | 0 violations |
| Offline with the server shut down: deep link to a drill, Learn view, an old `#mode=ratio` link, home screen | All work |
| Reintroduced bugs: float rounding (`k/n × 100`), accepting 42.84, a ladder that leaves the chart, dropping old `#mode=` links | Each made tests fail (1, 4, 1 and 9 tests) |

## Project structure

```text
src/
  app/
    globals.css                 Theme colours and global styles
    layout.tsx                  Root layout, metadata, service worker setup
    page.tsx                    Picks the screen from the URL hash
    __tests__/                  Home screen, routing and Learn view tests
  content/
    coaching/
      types.ts                  Chapter, trick, worked example and drill id types
      percentages.ts            Percentages chapter, from my class notes
      index.ts                  The list of chapters
    __tests__/                  Checks the content against exact arithmetic
  components/
    ServiceWorkerRegister.tsx   Registers the worker and caches the home page
    home/HomeScreen.tsx         The choice between the two tracks
    tracks/ArunSharmaTrack.tsx  The five original modes and their tabs
    coaching/
      CoachingTrack.tsx         Chapters, tricks, Learn view or drill, from the route
      ChapterList.tsx           Chapters in the coaching track
      TrickList.tsx             Tricks in a chapter, and what's coming later
      TrickLearn.tsx            Rule, tables, worked examples, traps, Practice
      DrillGame.tsx             One timed practice session for any coaching drill
      __tests__/                Drill screen tests
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
      TopBar.tsx                Sticky back control and screen title
      NumPad.tsx                On-screen number pad
      ScreenReaderStatus.tsx    Live region for announcements
      StatsPreview.tsx          Lifetime stats on the setup screen
      ProgressChart.tsx         Speed trend for the selected mode and level
      ProgressComparison.tsx    This session against recent ones
  hooks/
    useCancellableTimeout.ts    Delayed action that can be cancelled
    useSessionRecorder.ts       Tallies a session for the summary
    useHashRoute.ts             The current screen from the hash, and navigation
  lib/
    route.ts                    Reads and writes the hash for every screen
    engines/                    One pure question engine per mode, plus:
      percentMath.ts            Exact percentages: cut off, rounded, grading, fractions
      fractionPercentEngine.ts  Fraction to % and back
      memoryBankEngine.ts       Squares, cubes, roots and tables
      percentOfEngine.ts        x% of N
      moreLessEngine.ts         More vs less and the chart ladder
      drills.ts                 Every coaching drill, by id
    store.ts                    Math settings and stats
    practiceStore.ts            Saved level and stats for Percentage, Ratio and each coaching drill
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
- On a 375x667 phone, Enter and End stay on screen but some Arun Sharma modes need a few pixels of scrolling. The coaching drills fit with no scrolling.
- The coaching track has one chapter so far. Simple Interest and reduction and consumption are left out until the class covers their questions.
- Adding a chapter takes one data file plus one line in `src/content/coaching/index.ts`. The browser bundle can't discover files on its own.
- The coaching screens were measured in Chrome at iPhone sizes, not on a real iPhone, and not with a real screen reader.
- The 42.84 trap message is about twice as long as other feedback. It didn't come up in my random measuring runs, so the feedback area may grow by a line or two when it does. End stays at the top either way.
- Learn views are long (2,293 to 2,691 px at 390 px wide). The back control and Practice button stay on screen, but the content scrolls.
- The session log keeps the last 500 sessions across every mode, and each coaching drill now adds its own rows, so older history drops off sooner.
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

### Layer 6 - The coaching track (13 November 2026, typed content files, hash routing, a generic drill shell)

*What I built:* A home screen with two tracks, and a "My CAT coaching tricks" track whose Percentages chapter comes from my class notes, with Learn views and 9 practice drills.

| # | Mistake | What actually happened | Lesson |
|---|---|---|---|
| 6.1 | **The class's own answer had a rounding slip** | 30% less was written as 42.84% more: 3 × the cut-off 14.28. The exact value is 42.857%, so the cut-off is 42.85 and the rounded value 42.86. | Multiplying a value that's already cut off loses accuracy. The app now explains this when you type 42.84. |
| 6.2 | **My measuring script lied** | It pressed `1` and Enter in the same instant, before the app had registered the `1`, so no answer was submitted. It reported "Next button missing" on every drill. | Check that a measurement measured what you think before believing a failure, or a pass. |
| 6.3 | **A test matched the same text twice** | The trap message appears on screen and in the screen-reader live region, so a loose text query found both and failed. | Duplicated text for accessibility is deliberate. Tests should target the element they mean. |
| 6.4 | **The config's target year blocked BigInt literals** | `tsconfig` targets ES2017, so `100n` failed the type check even though the tests passed. | Run the type check separately. Vitest doesn't do it. |

| # | Decision | Why |
|---|---|---|
| 6.5 | Content in typed files, with drill ids as a union type | A chapter is one file, and a typo in a drill id fails the build |
| 6.6 | Only the forms used in class, and "coming later" for topics not taught | The app should match what I was actually taught, not what I could add |
| 6.7 | Hash routes instead of Next.js routes | Avoids repeating 1.1: new routes would have needed extra caching to work offline, and would only work after being visited once |
| 6.8 | Show cut-off values, accept cut-off or rounded, flag 42.84 | Matches the class chart, and makes 6.1 a lesson instead of a silent wrong answer |
| 6.9 | Engines tested by long division, repeated addition and worked numbers | A test that reuses the engine's formula can't catch the engine's mistake |
| 6.10 | One generic `DrillGame` | Avoids repeating 2.3: the five original games had drifted apart because each was its own copy |
| 6.11 | Sticky back control and Practice bar, then measured at two phone sizes | Learn views are long, and 4.2 and 5.2 both came from not measuring |

### Key takeaways

1. **Claims need tests.** "PWA" sat in my README and config for ten months while offline had never worked once.
2. **Compare like with like.** My first after-number for load time was 0.45 s, but the service worker had served it. The honest cold-load number was 3.6 s, slightly worse than before.
3. **Prove your tests can fail.** Putting each bug back showed the suite really catches them.
4. **Tests with random inputs need answers that can't be right by luck.** The suite failed once across dozens of runs. The likely cause was a test typing `1` as a wrong answer, when 45 − 44 is 1. I fixed that, but never reproduced the failure to confirm it.
5. **Audit more than the landing page.** Lighthouse saw one screen. Scanning all 18 with axe found a real contrast problem it had missed.
6. **The riskiest bugs are the ones nothing displays.** A timing stat stuck at 0 caused no visible problem at all.
7. **Nothing replaces using it on the real device.** Two minutes on my iPhone found what perfect automated scores had missed.

## Future improvements

- Finish checking on a real iPhone: the play-screen layout, the coaching track, stats after reopening the app, and VoiceOver announcements.
- Add coaching chapters as classes cover them, starting with Simple Interest and reduction and consumption.
- Improve first-visit load. I suspect the entrance animations hide content until JavaScript runs, but haven't confirmed it.
- Replace `next-pwa` with a maintained option such as Serwist.
- Add adaptive difficulty and spaced repetition for weak areas.
- Add multiplication and division drills.
- Add `robots.txt`.
- Possible larger redesign: merge the five game shells and stores, and add accounts and sync.

## License

MIT. See [LICENSE](LICENSE).

The Arun Sharma track's Percentage mode is inspired by the "Percentage Rule" in *How to Prepare for Quantitative Aptitude for the CAT* by Arun Sharma. The coaching track's content comes from my own notes on my TIME coaching classes.
