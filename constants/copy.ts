/**
 * Every user-facing sentence lives here.
 *
 * Tone rules (read these before adding anything):
 *  - calm, plain, short
 *  - never shame, guilt, pressure, rank or diagnose
 *  - stopping is always allowed
 *  - no streaks, no scores, no "you're falling behind"
 */

export const APP_NAME = 'Nudge';
export const TAGLINE = 'small steps. no pressure.';

export const onboarding = {
  steps: [
    {
      title: 'Hey.',
      body: "You don't have to be productive here.",
      cta: 'Continue',
    },
    {
      title: 'Nudge is here for the moments when starting feels difficult.',
      body: 'No streaks. No scores. Nothing to keep up with.',
      cta: 'That sounds useful',
    },
    {
      title: "What's your name?",
      body: 'Optional. Only used to say hello.',
      cta: 'Continue',
    },
    {
      title: 'What do you usually want help starting?',
      body: 'Pick as many as you like, or none.',
      cta: 'Continue',
    },
    {
      title: "You're ready.",
      body: 'Whenever something feels too big to start, open Nudge.',
      cta: "Let's go",
    },
  ],
  skip: 'Skip',
  howItWorks: 'Show me how it works',
  namePlaceholder: 'Your name',
  privacyNote: 'Everything you write stays on this device.',
};

export const home = {
  question: 'What do you need right now?',
  cards: {
    stuck: { emoji: '🫥', title: "I'm stuck", body: "I don't know how to start." },
    work: { emoji: '📚', title: 'I want to work', body: 'I know what I need to do.' },
    break: { emoji: '⏸', title: 'I need a break', body: 'I need to step away for a moment.' },
  },
  wallEntry: "I'm staring at the wall.",
  howItWorks: 'How it works',
  winsTitle: "Today's small wins",
  winsEmpty: 'Nothing yet today. That’s okay.',
  footer: "You don't have to do everything today.",
  resumeTitle: 'You left a session open',
  resumeBody: 'It’s still here if you want it.',
};

/** The "I'm stuck" cards. These are not diagnoses and are never interpreted. */
export const feelings = [
  { id: 'overwhelmed', emoji: '😵', label: 'Everything feels overwhelming' },
  { id: 'blank', emoji: '🫥', label: 'I feel blank' },
  { id: 'cant-start', emoji: '📚', label: "I want to work, but I can't start" },
  { id: 'exhausted', emoji: '😴', label: "I'm exhausted" },
  { id: 'worried', emoji: '😟', label: "I'm worried about what I need to do" },
  { id: 'unsure', emoji: '🤷', label: "I don't know" },
  { id: 'other', emoji: '•', label: 'Something else' },
] as const;

export type FeelingId = (typeof feelings)[number]['id'];

export const stuck = {
  title: 'Okay.',
  subtitle: "Let's not solve everything at once.",
  question: "What's closest to how you feel?",
  note: 'No wrong answer. This is just for you.',
  wallEntry: "I'm staring at the wall.",
  howItWorks: 'How it works',
};

export const taskPrompt = {
  title: 'What are you trying to do?',
  subtitle: 'Anything is fine. One line is enough.',
  placeholder: 'e.g. Study Physics',
  cta: 'Continue',
  skipTitle: "I don't know yet",
  examples: [
    'Study Physics',
    'Finish my chemistry assignment',
    'Start my coding project',
    'Clean my room',
    "Prepare for tomorrow's test",
  ],
};

export const smaller = {
  title: 'That sounds like a lot.',
  subtitle: "Let's make it smaller.",
  pick: 'Pick whichever feels possible.',
  makeSmaller: 'Make it even smaller',
  floor: "That's about as small as it gets — and it still counts.",
  somethingElse: 'I want something else',
  ladderLabel: 'Getting smaller',
};

export const action = {
  eyebrow: 'Your only job right now:',
  thatsIt: "That's it. Nothing after this.",
  doing: "I'm doing it",
  smaller: 'Make it smaller',
  other: 'I want something else',
  note: 'No timer yet. Just move toward it.',
};

export const focus = {
  pause: 'Pause',
  resume: 'Resume',
  done: "I'm done",
  paused: 'Paused',
  leaveHint: 'You can leave this screen. The time keeps itself.',
};

export const finished = {
  earlyTitle: "That's okay.",
  earlyBody: 'You started.',
  fullTitleTemplate: (minutes: number) =>
    minutes === 5
      ? 'You made it through five minutes.'
      : `You made it through ${minutes} minutes.`,
  fullQuestion: 'What would feel right?',
  options: {
    keepGoing: 'Keep going on this',
    oneMore: 'Do one more tiny thing',
    another: (m: number) => `Another ${m} minutes on this`,
    takeBreak: 'Take a break',
    finishHere: 'Finish here',
    doneForNow: "I'm done for now",
  },
  /** Said plainly, because "keep going" could mean two different things. */
  optionNotes: {
    sameThing: (m: number) => `The same thing you just did, for ${m} more minutes.`,
    oneMore: 'Same task, one step smaller.',
    takeBreak: '5, 10 or 20 minutes. Or no timer at all.',
    finishHere: 'Back home. This is already saved.',
  },
  explain: 'What do these do?',
  loggedNote: 'Saved to today. Only you can see it.',
};

export const wall = {
  lines: ["You're here.", "You don't need to figure everything out right now.", "Let's do one thing."],
  steps: [
    'Put your feet on the floor.',
    'Take one slow breath.',
    'If you have water nearby, take a sip.',
  ],
  stepCta: 'Done',
  skip: 'Skip this one',
  taskQuestion: "What's one thing you need to do?",
  taskPlaceholder: 'e.g. Open my laptop',
  taskCta: 'Continue',
  taskSkip: 'Nothing right now',
  exit: 'Leave wall mode',
  disclaimer:
    'These are just small physical steps, not medical advice or treatment.',
};

export const breakCopy = {
  title: 'Take your break.',
  subtitle: 'Nothing is waiting on you.',
  presets: 'Optional timer',
  noTimer: 'No timer',
  backTitle: 'Ready to come back?',
  yes: 'Yeah',
  notYet: 'Not yet',
  notYetBody: 'Okay. Take the time you need.',
  fiveMore: 'Five more minutes',
  endBreak: 'End break',
};

export const today = {
  title: 'Today',
  didTitle: 'Small things I did',
  mightTitle: 'Things I might do',
  emptyTitle: 'Nothing yet.',
  emptyBody: "That's okay.",
  emptyCta: 'Start one tiny thing',
  carriedOver: 'from earlier',
  addTask: 'Add something',
  mightEmpty: 'Nothing written down. That’s allowed.',
};

export const history = {
  title: 'History',
  subtitle: 'Just what happened. No scores.',
  emptyTitle: 'Nothing here yet.',
  emptyBody: 'Once you start something, it will show up here.',
  patternsTitle: 'What helps you start',
  patternsEmpty: "Keep using Nudge and we'll learn what helps you start.",
  sessionsLabel: (n: number) => `${n} ${n === 1 ? 'session' : 'sessions'}`,
  minutesLabel: (n: number) => `${n} ${n === 1 ? 'minute' : 'minutes'}`,
};

export const settings = {
  title: 'Settings',
  profile: 'Profile',
  name: 'Name',
  namePlaceholder: 'Optional',
  appearance: 'Appearance',
  theme: 'Theme',
  colour: 'Colour',
  colourNote: 'Changes the accent across the whole app.',
  reduceMotion: 'Reduce motion',
  reduceMotionNote: 'Fewer transitions and fades.',
  focus: 'Focus',
  sessionLength: 'Default session length',
  feedback: 'Feedback',
  sounds: 'Sounds',
  haptics: 'Haptics',
  privacy: 'Privacy',
  clearData: 'Clear all local data',
  privacyNote:
    'Nudge works without an account. Your tasks, sessions and notes stay on this device. Nothing is uploaded, and there is no tracking or advertising.',
  about: 'About Nudge',
  help: 'Help',
  howItWorks: 'How Nudge works',
  howItWorksNote: 'The five-minute loop, start to finish.',
  later: 'Later',
  clear: {
    title: 'Clear all local data?',
    body: 'This removes your tasks, sessions, check-ins and settings from this device. It cannot be undone.',
    confirm: 'Yes, clear everything',
    cancel: 'Keep my data',
    doneTitle: 'All clear.',
    doneBody: 'Nudge is back to its first launch.',
  },
};

export const howItWorks = {
  title: 'How Nudge works',
  intro: 'The whole app is one small loop. Here it is, start to finish.',
  steps: [
    {
      title: 'Tell Nudge you’re stuck',
      body: 'Home → “I’m stuck”. If even that feels like too much, “I’m staring at the wall” is quieter still.',
    },
    {
      title: 'Say what you’re trying to do',
      body: 'In your own words. “Study Physics”, “clean my room”, “that email I’ve been avoiding”. Vague is fine.',
    },
    {
      title: 'Make it smaller',
      body: 'Nudge turns it into possible first actions. “Make it even smaller” as many times as you like — there is no minimum size, and going smaller is never treated as giving up.',
    },
    {
      title: 'One action, nothing else',
      body: '“Your only job right now” holds a single step. Nothing starts until you tap “I’m doing it”.',
    },
    {
      title: 'Five minutes',
      body: 'A timer, a pause, and “I’m done” — which works from the first second. Leaving early still counts as starting.',
    },
    {
      title: 'Then you decide',
      body: 'When the time is up, nothing happens on its own. Nudge waits for you to pick.',
    },
  ],
  afterTitle: 'What the choices at the end mean',
  afterNote: 'This is the one place people expect something different from what happens.',
  after: [
    {
      label: 'Keep going on this',
      body: 'Stays on the thing you just did and starts the timer again. It does not move you on to a different task.',
    },
    {
      label: 'Do one more tiny thing',
      body: 'Same task, next step down. Nudge suggests a smaller follow-on action.',
    },
    {
      label: 'Take a break',
      body: 'A real break — 5, 10 or 20 minutes, or none. Coming back is a question, not a deadline.',
    },
    {
      label: 'I’m done for now',
      body: 'Back home. What you did is already saved to today.',
    },
  ],
  restTitle: 'The rest of the app',
  rest: [
    { label: 'Today', body: 'Small things you did, and things you might do. Nothing turns red.' },
    { label: 'Start', body: 'Skip the questions: pick something, pick a length, begin.' },
    { label: 'History', body: 'What actually happened, grouped by day. No streaks, no scores.' },
    { label: 'Settings', body: 'Your name, colours, light or dark, session length, and clearing everything.' },
  ],
  promisesTitle: 'Three things that stay true',
  promises: [
    'Nothing starts by itself, and nothing continues by itself.',
    'Stopping early is not failure. Starting was the hard part.',
    'Everything stays on this device.',
  ],
  cta: 'Got it',
};

export const sitWithMe = {
  title: 'Sit With Me',
  badge: 'Coming later',
  body: 'A future way to sit in a focus session with one other person — a friend, a sibling, a classmate.',
  presenceTitle: 'What they would see',
  youLabel: 'YOU',
  friendLabel: 'FRIEND',
  focusing: 'Focusing',
  neverTitle: 'What stays private',
  never: [
    'What you are working on',
    'Your tasks and notes',
    'How you are feeling',
    'Your session history',
  ],
  onlyPresence: 'Only presence. Nothing else.',
  optIn: 'This will always be opt-in. It is off, and there is nothing to turn on yet.',
  notBuilt: 'Not built yet — this screen is a preview of the idea.',
};

export const common = {
  back: 'Back',
  close: 'Close',
  cancel: 'Cancel',
  save: 'Save',
  notNow: 'Not now',
  somethingElse: 'Something else',
  youCanStop: 'You can stop here.',
  oneThing: 'One thing at a time.',
};

export function greeting(date: Date, name?: string): string {
  const hour = date.getHours();
  const part =
    hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Hey.';
  return `${part}, ${trimmed}`;
}

/* ------------------------------------------------------------------ */
/* Reset: the "I'm overwhelmed" path                                   */
/* ------------------------------------------------------------------ */

export const reset = {
  /** The entry point on Home. */
  entry: "I'm overwhelmed",
  entryNote: 'A quieter screen. No questions asked.',

  title: "Hey. Let's take this one moment at a time.",
  subtitle: "You don't have to solve everything right now.",
  options: {
    settle: { title: 'Help me settle.', body: 'Something slow to follow, or just something to notice.' },
    untangle: { title: 'Help me untangle my thoughts.', body: "Get what's crowding your head out of it." },
    moment: { title: 'I just need a moment.', body: 'No exercises. Nothing to do.' },
  },
  leave: 'Leave',
  leaveNote: 'You can leave at any point. Nothing here is saved.',
  supportLink: 'If this feels bigger than stress',
};

export const resetRoom = {
  eyebrow: 'RESET ROOM',
  tabs: { breath: 'Breathing', notice: 'Noticing' },
  done: "I'm done here",

  breath: {
    title: 'Nothing to get right here.',
    subtitle: "Follow the circle if it helps. Ignore it if it doesn't.",
    in: 'in',
    out: 'out',
    start: 'Start the circle',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    hide: 'Hide the circle',
    show: 'Show the circle',
    hidden: 'The circle is hidden. You can still sit here as long as you like.',
    reducedMotion: 'Your device asks for less movement, so the circle stays still.',
    note: 'Breathe however you normally would. No counting, no holding.',
  },

  notice: {
    title: 'One thing at a time.',
    subtitle: 'Only if you want to. You can skip any of these.',
    prompts: [
      'Notice three things you can see.',
      'Notice the surface holding you up.',
      'Listen for one sound around you.',
      'Find something nearby that feels familiar.',
      'Notice the temperature of the air.',
    ],
    next: 'Done that',
    skip: 'Skip this one',
    end: "That's all of them. Nothing else to do.",
    again: 'Start them again',
  },
};

export const quietMode = {
  eyebrow: 'QUIET MODE',
  lines: [
    "It's okay to pause.",
    'No tasks. No exercises. No questions.',
    'You can stay here for a moment, or leave whenever you want.',
  ],
  leave: 'Leave',
  done: "I'm ready",
};

export const resetAfter = {
  title: 'No rush.',
  subtitle: "You don't have to be ready for anything.",
  stepTitle: 'That was a step.',
  stepSubtitle: 'Whatever happens next is up to you.',
  options: {
    untangle: 'Untangle my thoughts',
    tiny: 'Try one tiny step',
    continueStep: 'Continue',
    smaller: 'Make the next step smaller',
    takeBreak: 'Take a break',
    finish: 'Finish for now',
  },
  notes: {
    untangle: "Write down what's crowding your head.",
    tiny: 'Something small, chosen by you.',
    continueStep: 'Stay on the same thing a little longer.',
    smaller: 'Same thing, one step down.',
    takeBreak: '5, 10 or 20 minutes. Or no timer at all.',
    finish: "That's okay. You can come back whenever you're ready.",
  },
};

export const unclutter = {
  eyebrow: 'BRAIN UNCLUTTER',
  title: "What's taking up space in your mind right now?",
  subtitle: 'One thing per line, or one long ramble. Both are fine.',
  placeholder: 'Whatever is in there…',
  privacy: "This stays on this screen. It isn't saved anywhere unless you choose to keep something.",
  continue: 'Continue',
  clear: 'Clear',
  exit: 'Exit',
  cleared: 'Cleared.',

  sort: {
    title: 'Want to sort these?',
    subtitle: 'Only if it helps. Leaving them as they are is fine.',
    counts: {
      now: 'NOW',
      later: 'LATER',
      unsure: 'NOT SURE',
      none: 'Unsorted',
    },
    hints: {
      now: 'Something you think needs attention soon.',
      later: 'Something that can wait.',
      unsure: "Something you don't have to decide right now.",
    },
    edit: 'Edit',
    save: 'Save',
    remove: 'Delete',
    add: 'Add another thought',
    addPlaceholder: 'One more thing…',
    skip: 'Skip sorting',
    act: 'Turn one into something I can do',
    pick: 'Which one?',
    cancelPick: 'Never mind',
    done: "I'm done here",
    empty: "Nothing written down. That's fine too.",
  },
};

export const restart = {
  title: 'Would you like to make the next step smaller?',
  subtitle: 'Only if you want to. None of this is expected of you.',
  options: {
    start: 'Help me start something small.',
    takeBreak: "I'd rather take a break.",
    done: "I'm done for now.",
  },
  finishNote: "That's okay. You can come back whenever you're ready.",
};

export const tinyStep = {
  pickTitle: 'What would you be starting?',
  pickSubtitle: 'Pick one, or write something. Neither is a commitment.',
  yourTasks: 'Already on your list',
  somethingElse: 'Something else',
  placeholder: 'e.g. Chemistry revision',
  continue: 'Continue',

  actionTitle: 'How about this?',
  actionNote: 'A suggestion, not an instruction. Change it to whatever actually fits.',
  label: 'Your tiny step',
  smaller: 'Make it smaller',
  floor: "That's about as small as it gets — and it still counts.",
  saveTask: 'Also keep this on my task list',
  saveTaskNote: 'Off by default. Nothing is saved unless you ask.',
  startOne: 'Start one minute',
  startFive: 'Start five minutes',
  noTimer: "I'll just do it — no timer",
  skip: 'Skip this',
  back: 'Pick something else',
};

export const support = {
  link: 'If this feels bigger than stress',
  title: "If something feels seriously wrong, don't sit with it alone.",
  body: "Nudge is a small tool for starting things. It isn't medical care, it can't tell how you are, and it can't help in an emergency.",
  unwell:
    'If you feel seriously unwell, or you might be in danger, please tell someone who can actually be there — a friend, a family member, someone at home, a doctor.',
  emergency:
    'For urgent help, your local emergency number works: 112 in India and across the EU, 999 in the UK, 911 in the US and Canada.',
  ordinary:
    "And if this is ordinary stress — the usual kind — that's okay too. Nothing here says you have to use any of it.",
  back: 'Back',
};
