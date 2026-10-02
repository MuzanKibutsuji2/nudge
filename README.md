# Nudge

**small steps. no pressure.**

A calm mobile app for the moment every student knows:

> "I know I need to do something, but I just sit there and can't make myself start."

Nudge doesn't track your productivity, rank your days, or tell you that you're falling
behind. It has one job: get you from *"I can't start"* to *"okay, I'm doing one tiny thing."*

Built with React Native + Expo + TypeScript. No account, no backend, no network calls.
Everything lives on your phone.

---

## Run it on your phone

```bash
npm install
npx expo start
```

Install **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) /
[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)), then scan the
QR code in the terminal. The app runs on the device, offline, as soon as the bundle loads.

```bash
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # browser (shown inside a phone frame)
npm test           # unit tests for the pure logic
npm run typecheck  # tsc --noEmit
npm run export:web && npm run test:e2e   # the whole journey, end to end
```

To ship a real build: `npx eas build -p ios` / `-p android`. The app has no native custom
code, so a managed build is all it needs.

---

## What's inside

**Five tabs.** Home · Today · **Start** (the raised centre button) · History · Settings.

**Onboarding** (5 short screens, skippable) — a hello, what Nudge is for, your name if you
feel like sharing it, what's on your plate, and "You're ready."

**Home** — a greeting, a prominent **"I'm overwhelmed"** button, *"What do you need right
now?"*, and three doors:

| Door | What happens |
| --- | --- |
| I'm stuck | The full shrinking flow (below) |
| I want to work | Pick a task, pick a length, start |
| I need a break | A real break, timed or not, with no guilt about coming back |

Below that: today's small wins, a quiet "I'm staring at the wall" link, and the footer
*"You don't have to do everything today."*

**The "I'm stuck" flow** — the heart of the app:

1. **How does it feel right now?** — overwhelmed / blank / can't start / exhausted /
   worried / don't know / something else. Your answer is recorded, never interpreted.
   It is not a diagnosis and the app never tells you what it "means".
2. **What are you trying to do?** — free text. "Study Physics", "clean my room", anything.
3. **"That sounds like a lot. Let's make it smaller."** — a few concrete first actions.
4. **Make it even smaller** — repeatable, all the way down to *"Put your textbook on the
   desk"*. There is no minimum size and no point at which the app pushes back.
5. **Your only job right now:** one action, alone on the screen. Nothing auto-starts.
6. **Five minutes.** A large timer, Pause, and "I'm done" — available from second one.
7. **Finished either way.** Stop early and it says *"That's okay. You started."* Run the
   clock out and it says *"You made it through five minutes."* Then three equal choices:
   keep going, take a break, or be done. Nothing continues on its own.

**"I'm overwhelmed" → Reset** — the fast lane for the moment everything is too loud. One
tap, no questions, no confirmation dialog, nothing resembling a deadline, a count or a
statistic on screen. It offers three doors and you can walk out of any of them:

| Door | What it is |
| --- | --- |
| Help me settle. | **Reset Room** — a soft breathing circle (start / pause / resume / stop, or hide it entirely, and it holds still if your device asks for reduced motion) and a set of optional noticing prompts you can skip one by one. No counting, no breath-holding, no rhythm to keep up with. |
| Help me untangle my thoughts. | **Brain Unclutter** — one box, one prompt: *"What's taking up space in your mind right now?"* Continue, Clear and Exit all work on an empty box. Afterwards you can optionally sort lines into NOW / LATER / NOT SURE, edit them, delete them, leave them alone, or skip sorting. |
| I just need a moment. | **Quiet Mode** — three lines, no timer, no transitions, no suggestions. |

Leaving any activity never assumes you're ready to work: you get four equal choices
(untangle, one tiny step, a break, or stop), and the app never asks how you feel now.

**The tiniest possible restart** — offered after Reset, reachable on its own, and never
automatic. Pick an existing task (shown as a plain title — no deadline, no size, no
"overdue") or type anything; Nudge suggests one tiny action you can **edit, shrink, replace
or skip**; then start a one- or five-minute session, or no timer at all. Afterwards: keep
going, make the next step smaller, take a break, or finish — *"That's okay. You can come
back whenever you're ready."*

Brain Unclutter text lives in memory only (`lib/unclutter.ts`) and is never written to
storage. A thought becomes a task only if you tick *"Also keep this on my task list"*, which
is off by default and goes through the normal task system.

Behind a quiet link on the Reset screen there's one more page: if something feels
seriously wrong, it says plainly that Nudge isn't medical care and points at a person or a
local emergency number. It is not shown by default — ordinary stress is not an emergency.

**Wall Mode** — for when even the stuck flow is too much. The UI strips back to one line at
a time: *I'm here. You don't have to do anything yet. Let's just sit for a second.* Then
three bodily steps (feet on the floor, one breath, a sip of water) and, only if you want
it, *"What's one thing you need to do?"* → straight into the micro-action system. It is a
pause, not a treatment, and says so.

**Tasks & Today** — add a task (title, category, size, optional deadline), break any task
into subtasks with **Make this smaller**, tick things off. Today shows *"Small things I
did"* and *"Things I might do."* Unfinished tasks roll over to tomorrow, unchanged — never
red, never overdue-shaming.

**History** — your sessions grouped by day. No streaks, no totals-versus-last-week, no
ranking. Underneath, *"What helps you start"* describes patterns once there are at least
three sessions to describe: *5–10 minute sessions · 6–8 PM · Opening your Physics textbook.*
Descriptive, never prescriptive.

**Settings** — name, Light/Dark/System, **six accent palettes** (Forest, Blush, Lavender,
Ocean, Clay, Ink — each one named as well as coloured, and each checked for AA contrast in
both light and dark), default session length (5/10/15), sounds, haptics, *Clear all local
data* behind a confirmation screen, and an About page.

**How Nudge works** — a plain-English explainer, reachable from Home, Settings and the last
onboarding step. It walks the loop step by step and, in particular, spells out what the
choices at the end of a session actually do — "Keep going on this" stays on the same thing
rather than moving you to a new task. Those buttons say so on their face too.

**Sit With Me** — a placeholder for a future "study alongside someone silently" feature.
Opt-in, clearly labelled **Coming later**, and honest that nothing is connected yet.

---

## Architecture

```
app/                      expo-router file routes
  _layout.tsx             providers, splash, root ErrorBoundary
  index.tsx               launch gate → onboarding or home
  onboarding.tsx          5 steps in one screen, local step state
  (tabs)/                 home · today · start · history · settings
  stuck/                  index (feeling) → task → smaller → action
  focus.tsx  done.tsx     the timer and the two endings
  wall.tsx  break.tsx     wall mode, break timer
  task/[id].tsx           task detail + "make this smaller"
  how-it-works.tsx        the instructions
  reset/                  index (I'm overwhelmed) · room · quiet · unclutter ·
                          sort · restart · tiny · after · support
  add-task.tsx  clear-data.tsx  sit-with-me.tsx  +not-found.tsx

components/               ~20 reusable pieces: Button, Card, ChoiceCard, MoodCard,
                          Timer, TaskCard, Screen, Header, Text, Chip, EmptyState,
                          SegmentedControl, PalettePicker, BreathingCircle, FadeIn,
                          Logo, TabBar, ErrorFallback…

constants/
  palette.ts              neutrals + the six accents, contrast-tested in plain node
  theme.ts                spacing, radii, type scale, shadows, buildTheme()
  copy.ts                 every user-facing string, in one reviewable file

lib/
  store.tsx               single AppProvider: state + actions, hydrate once, persist on change
  storage.ts              the ONLY module that touches AsyncStorage
  microActions.ts         the deterministic "make it smaller" engine
  sessionTime.ts          pure timer maths (elapsed / remaining / resumable)
  analytics.ts            local, descriptive "what helps you start" patterns
  unclutter.ts            Brain Unclutter's in-memory scratch space (never persisted)
  taskUtils.ts  time.ts  phrasing.ts  feedback.ts  navigation.ts  keepAwake.ts  id.ts
  theme.tsx               theme context, follows the system when set to System

types/                    Task, FocusSession, CheckIn, Settings
tests/                    node:test suites over the pure logic
  e2e/                    jsdom harness + smoke test against the exported build
scripts/make-brand-assets.mjs   regenerates the icon set from the logo geometry
```

**State** — one `AppProvider` at the root holding settings, tasks, sessions, check-ins and
the active session. Screens use `useSettings()`, `useTasks()`, `useSessions()`,
`useActiveSession()` and `useActions()`. No Redux: the state is small, mostly append-only,
and every mutation is a named action.

**Persistence** — `lib/storage.ts` owns the six `nudge/v1/*` keys. State is hydrated once at
launch and written back on change. If the storage backend is missing or throws (private
browsing, a wiped keychain, a full disk) it degrades to an in-memory map and the app keeps
working for the session; corrupted JSON is read as "no value" rather than an exception.

**The engine** — `buildPlan(text)` is pure, synchronous and offline. It recognises a domain
(study, writing, coding, cleaning, admin, exercise…) and a school subject if there is one,
then produces suggestions plus a *chain*: steps ranked `0` (as you typed it) to `100` (about
as small as a thing gets). "Make it even smaller" just walks to the next rung, so it always
terminates at something physical. `planFor()` goes through a `MicroActionProvider` seam —
swapping in a server or an on-device model later means implementing one interface, with the
local engine as the fallback. No screen changes.

**Theming** — `buildTheme(scheme, accent)` composes one of six accent token sets over the
warm neutrals, and tints the focus/wall background faintly with the chosen hue. Swapping
palettes is a single setting; nothing in the screens knows which colour is active.

**Timers survive everything.** A session is persisted the moment it starts, with its planned
length and accumulated pause time. Close the app mid-session and Home offers to pick it back
up; past a 15-minute grace window it's quietly dropped rather than resumed into nonsense.
Delete a task you're focusing on and the session keeps its own copy of the title.

---

## Testing

```bash
npm test                                 # 42 unit tests
npm run export:web && npm run test:e2e   # ~190 end-to-end checks, two suites
```

The unit tests cover the parts where correctness actually matters: the shrinking ladder
(monotonic, terminating, ends somewhere physical), domain detection, nonsense input
(empty strings, emoji, 400 characters) never throwing, the provider fallback, session timing
including pauses and overruns, pattern summaries, phrasing, and a contrast audit that fails
the build if any accent drops below WCAG AA on any surface in either scheme.

The end-to-end tests drive the real exported bundle in jsdom — the same JavaScript that runs
on a phone. `tests/e2e/smoke.mjs` covers the main journey: fresh install → onboarding →
Home → I'm stuck → feeling → task → make it smaller twice → one action → 5-minute session →
pause → finish early → Today → History → switch palette → relaunch with saved data.
`tests/e2e/reset.mjs` covers the overwhelmed path: panic button → each of the three doors →
breathing controls → noticing prompts → writing, sorting, editing and deleting thoughts →
one thought into one tiny step → a one-minute session → every exit route, plus reduced
motion, and assertions that private text never reaches storage.

---

## Privacy

Nothing leaves the device. There is no server, no account, no analytics SDK, no ad SDK, no
crash reporter, no tracking identifier. What you type stays in your phone's local storage,
and **Settings → Privacy → Clear all local data** removes all of it in one step (with a
confirmation, defaulting to keeping your data).

---

## Tone rules

These were constraints, not decoration — every string in `constants/copy.ts` follows them:

- Never shame, guilt, pressure, diagnose, or play therapist.
- No forced breathing, journaling or timers — every activity can be skipped or left.
- No streaks, scores, rankings, comparisons, or "you're falling behind."
- Stopping early is never failure. *"That's okay. You started."*
- Selections are not diagnoses; the app never explains what your feeling "means".
- Nothing auto-starts and nothing auto-continues.

## Deliberately not built

No social feed, leaderboards, streaks, achievements, XP, subscriptions, ads, accounts,
cloud sync, AI chatbot, mood prediction, medical claims, calendar integration, or guilt
notifications. **Sit With Me** is the one placeholder in the app and is labelled as such.
