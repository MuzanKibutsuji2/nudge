/**
 * The "make it smaller" engine.
 *
 * Given anything a user types ("Study Physics", "clean my room", "finish the
 * chem lab report") this produces:
 *
 *   suggestions — a handful of concrete first actions to choose from
 *   chain       — a ladder of steps ordered big → tiny, used by
 *                 "make it even smaller"
 *
 * Everything here is pure, synchronous and offline. There is no AI call and no
 * network. The provider seam at the bottom of this file is the one place a
 * smarter generator could be plugged in later without touching any screen.
 *
 * Ranks: 0 = the task as typed, 100 = about as small as a thing can get.
 * "Make it even smaller" simply walks to the next rung with a higher rank.
 */

import type { TaskSize } from '../types/task';

export interface MicroAction {
  id: string;
  text: string;
  rank: number;
}

export type DomainId =
  | 'study'
  | 'homework'
  | 'writing'
  | 'coding'
  | 'reading'
  | 'math'
  | 'cleaning'
  | 'exercise'
  | 'admin'
  | 'creative'
  | 'generic';

export interface MicroActionPlan {
  /** What the user typed, trimmed and de-filtered ("I need to study" → "study"). */
  task: string;
  /** Exactly what the user typed, untouched. Used in headings. */
  rawTask: string;
  domain: DomainId;
  /** A recognised school subject, e.g. "Physics". Undefined for everyday tasks. */
  topic?: string;
  /** Options we offer first, in a natural order (not size order). */
  suggestions: MicroAction[];
  /** Strictly decreasing in size. Powers "make it even smaller". */
  chain: MicroAction[];
  /** Rough guess used for copy + default task size. Never shown as a judgement. */
  size: TaskSize;
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const LEADING_FILLERS =
  /^(i\s+(really\s+)?(need|have|want|ought|got)\s+to|i\s+should|i\s+must|i\s+gotta|let\s+me|help\s+me|time\s+to|please)\s+/i;

const LEADING_ARTICLES = /^(the|a|an|my|some|this|that)\s+/i;

export function normalizeTask(raw: string): string {
  let text = (raw ?? '').replace(/\s+/g, ' ').trim();
  text = text.replace(LEADING_FILLERS, '');
  text = text.replace(/[.!…]+$/, '');
  return text.trim();
}

const TOPICS: { match: RegExp; label: string; stem: boolean }[] = [
  { match: /\bphysics\b/i, label: 'Physics', stem: true },
  { match: /\bchem(istry)?\b/i, label: 'Chemistry', stem: true },
  { match: /\bbio(logy)?\b/i, label: 'Biology', stem: true },
  { match: /\b(maths?|calculus|algebra|geometry|trig(onometry)?)\b/i, label: 'Math', stem: true },
  { match: /\bstat(istic)?s\b/i, label: 'Statistics', stem: true },
  { match: /\bhistory\b/i, label: 'History', stem: false },
  { match: /\bgeography\b/i, label: 'Geography', stem: false },
  { match: /\beconomics?\b/i, label: 'Economics', stem: false },
  { match: /\bpsychology\b/i, label: 'Psychology', stem: false },
  { match: /\bsociology\b/i, label: 'Sociology', stem: false },
  { match: /\bphilosophy\b/i, label: 'Philosophy', stem: false },
  { match: /\b(english|literature)\b/i, label: 'English', stem: false },
  { match: /\bspanish\b/i, label: 'Spanish', stem: false },
  { match: /\bfrench\b/i, label: 'French', stem: false },
  { match: /\bgerman\b/i, label: 'German', stem: false },
  { match: /\b(computer science|comp sci|cs)\b/i, label: 'Computer Science', stem: true },
  { match: /\banatomy\b/i, label: 'Anatomy', stem: true },
  { match: /\baccounting\b/i, label: 'Accounting', stem: false },
  { match: /\b(business|marketing)\b/i, label: 'Business', stem: false },
  { match: /\blaw\b/i, label: 'Law', stem: false },
];

function detectTopic(text: string): { topic?: string; stem: boolean } {
  for (const entry of TOPICS) {
    if (entry.match.test(text)) return { topic: entry.label, stem: entry.stem };
  }
  return { stem: false };
}

const DOMAIN_MATCHERS: { id: DomainId; match: RegExp }[] = [
  {
    id: 'coding',
    match:
      /\b(cod(e|ing)|program(ming)?|debug|bug|function|repo|git|app|website|frontend|backend|api|leetcode|script|compile|deploy|react|python|java(script)?)\b/i,
  },
  {
    id: 'writing',
    match:
      /\b(essay|write|writing|report|paper|draft|article|blog|statement|cover letter|dissertation|thesis|summary|notes? up)\b/i,
  },
  {
    id: 'homework',
    match: /\b(homework|assignment|worksheet|problem set|pset|hand ?in|submit|due|coursework|lab report)\b/i,
  },
  {
    id: 'math',
    match: /\b(maths?|calculus|algebra|geometry|equations?|problem set|integrals?|derivatives?)\b/i,
  },
  {
    id: 'reading',
    match: /\b(read|reading|book|chapter|pages?|article|pdf|novel)\b/i,
  },
  {
    id: 'study',
    match:
      /\b(stud(y|ying)|revis(e|ion)|review|learn|memoris|memoriz|exam|test|quiz|midterm|final|flashcards?|notes|lecture|class)\b/i,
  },
  {
    id: 'cleaning',
    match:
      /\b(clean|tidy|room|bedroom|kitchen|dishes|laundry|desk|wash|vacuum|hoover|bin|rubbish|trash|organi[sz]e|declutter)\b/i,
  },
  {
    id: 'exercise',
    match: /\b(run|running|gym|workout|exercise|walk|stretch|yoga|training|swim|cycle|push ?ups?)\b/i,
  },
  {
    id: 'admin',
    match:
      /\b(email|e-mail|reply|respond|message|text|call|phone|form|apply|application|book|appointment|pay|bill|register|sign up|renew|cancel|admin)\b/i,
  },
  {
    id: 'creative',
    match: /\b(draw|paint|design|music|guitar|piano|practice|practise|edit|video|photo|song|sketch)\b/i,
  },
];

function detectDomain(text: string): DomainId {
  for (const entry of DOMAIN_MATCHERS) {
    if (entry.match.test(text)) return entry.id;
  }
  return 'generic';
}

/* ------------------------------------------------------------------ */
/* Size estimate                                                       */
/* ------------------------------------------------------------------ */

const TINY_HINTS = /\b(open|put|find|grab|one|single|a page|a line|five minutes|two minutes|sip|stand)\b/i;
const BIG_HINTS =
  /\b(everything|all of|whole|entire|revise|prepare|finish|complete|project|exam|midterm|final|dissertation|portfolio|semester)\b/i;

export function estimateSize(raw: string): TaskSize {
  const text = normalizeTask(raw);
  const words = text.split(' ').filter(Boolean).length;
  if (!text) return 'small';
  if (BIG_HINTS.test(text)) return words > 6 ? 'large' : 'medium';
  if (TINY_HINTS.test(text) && words <= 7) return 'tiny';
  if (words <= 2) return 'medium';
  if (words <= 5) return 'medium';
  return 'large';
}

/* ------------------------------------------------------------------ */
/* Domain content                                                      */
/* ------------------------------------------------------------------ */

interface Rung {
  text: string;
  rank: number;
}

interface DomainContext {
  task: string;
  topic?: string;
  stem: boolean;
  /** "textbook" | "notebook" | "book" | "document" ... */
  material: string;
  /** "your Physics textbook" or "your notes" */
  materialPhrase: string;
}

type DomainBuilder = (ctx: DomainContext) => { suggestions: Rung[]; chain: Rung[] };

const BUILDERS: Record<DomainId, DomainBuilder> = {
  study: (ctx) => ({
    suggestions: [
      { text: `Open ${ctx.materialPhrase}`, rank: 70 },
      { text: "Find the chapter you're on", rank: 60 },
      { text: 'Read one page', rank: 40 },
      { text: ctx.stem ? 'Review one formula' : 'Review one definition', rank: 45 },
      { text: ctx.stem ? 'Solve one question' : 'Answer one question', rank: 30 },
    ],
    chain: [
      { text: ctx.topic ? `Look at one chapter of ${ctx.topic}` : 'Look at one chapter', rank: 12 },
      { text: 'Read the first section', rank: 25 },
      { text: 'Read one page', rank: 40 },
      { text: 'Read the first paragraph', rank: 55 },
      { text: `Open ${ctx.materialPhrase}`, rank: 70 },
      { text: `Put your ${ctx.material} on the desk`, rank: 82 },
      { text: "Sit down where you'd work", rank: 90 },
      { text: 'Look at the first page for ten seconds', rank: 96 },
    ],
  }),

  homework: (ctx) => ({
    suggestions: [
      { text: 'Open the assignment', rank: 68 },
      { text: 'Read the first question', rank: 50 },
      { text: 'Write the heading at the top', rank: 80 },
      { text: 'Answer one question', rank: 30 },
      { text: 'Write one sentence of the first answer', rank: 42 },
    ],
    chain: [
      { text: 'Do the first question only', rank: 15 },
      { text: 'Read all the questions once', rank: 30 },
      { text: 'Read the first question', rank: 48 },
      { text: 'Open the assignment', rank: 62 },
      { text: 'Put it on the desk, open', rank: 76 },
      { text: 'Get a pen and paper out', rank: 86 },
      { text: 'Write the date at the top', rank: 92 },
      { text: 'Look at question one for ten seconds', rank: 97 },
    ],
  }),

  writing: () => ({
    suggestions: [
      { text: 'Open the document', rank: 70 },
      { text: 'Write the title at the top', rank: 80 },
      { text: 'Write one messy sentence', rank: 45 },
      { text: 'Write three bullet points of what you want to say', rank: 35 },
      { text: 'Read what you wrote last time', rank: 58 },
    ],
    chain: [
      { text: 'Write one paragraph', rank: 15 },
      { text: 'Write three bullet points', rank: 32 },
      { text: 'Write one messy sentence', rank: 46 },
      { text: 'Write the title at the top', rank: 60 },
      { text: 'Open the document', rank: 72 },
      { text: 'Open your laptop', rank: 84 },
      { text: "Sit down where you'd write", rank: 92 },
      { text: 'Look at the empty page for ten seconds', rank: 97 },
    ],
  }),

  coding: () => ({
    suggestions: [
      { text: 'Open the project', rank: 72 },
      { text: 'Run it once and see where it is', rank: 50 },
      { text: 'Read the last thing you wrote', rank: 60 },
      { text: 'Write one function name', rank: 40 },
      { text: 'Fix one small thing', rank: 30 },
    ],
    chain: [
      { text: 'Finish one small piece of it', rank: 15 },
      { text: 'Write one function', rank: 28 },
      { text: 'Write one line', rank: 42 },
      { text: 'Write a comment for what comes next', rank: 55 },
      { text: 'Open the file you were last in', rank: 68 },
      { text: 'Open the project', rank: 78 },
      { text: 'Open your laptop', rank: 88 },
      { text: 'Look at the code for ten seconds', rank: 95 },
    ],
  }),

  reading: (ctx) => ({
    suggestions: [
      { text: `Open ${ctx.materialPhrase}`, rank: 75 },
      { text: 'Find where you stopped', rank: 65 },
      { text: 'Read one page', rank: 40 },
      { text: 'Read one paragraph', rank: 55 },
      { text: 'Read for two minutes', rank: 30 },
    ],
    chain: [
      { text: 'Read one chapter', rank: 15 },
      { text: 'Read two pages', rank: 30 },
      { text: 'Read one page', rank: 44 },
      { text: 'Read one paragraph', rank: 58 },
      { text: 'Read the first sentence', rank: 70 },
      { text: `Open ${ctx.materialPhrase} to where you stopped`, rank: 80 },
      { text: `Put the ${ctx.material} in your hands`, rank: 90 },
      { text: 'Look at the page for ten seconds', rank: 96 },
    ],
  }),

  math: () => ({
    suggestions: [
      { text: 'Open your notebook to a clean page', rank: 72 },
      { text: 'Copy out one question', rank: 55 },
      { text: 'Solve one question', rank: 30 },
      { text: 'Look at one worked example', rank: 45 },
      { text: 'Draw the diagram for one question', rank: 50 },
    ],
    chain: [
      { text: 'Do three questions', rank: 15 },
      { text: 'Do one question', rank: 30 },
      { text: 'Copy one question into your notebook', rank: 45 },
      { text: 'Look at one worked example', rank: 58 },
      { text: 'Open your notebook to a clean page', rank: 72 },
      { text: 'Put your notebook and a pen on the desk', rank: 84 },
      { text: "Sit down where you'd work", rank: 91 },
      { text: 'Look at the first question for ten seconds', rank: 96 },
    ],
  }),

  cleaning: () => ({
    suggestions: [
      { text: 'Clear one surface', rank: 32 },
      { text: 'Pick up five things', rank: 45 },
      { text: 'Put one thing where it belongs', rank: 65 },
      { text: 'Open a window or the curtains', rank: 72 },
      { text: 'Do two minutes of it', rank: 38 },
    ],
    chain: [
      { text: 'Do one corner of it', rank: 15 },
      { text: 'Clear one surface', rank: 32 },
      { text: 'Pick up five things', rank: 46 },
      { text: 'Pick up one thing', rank: 62 },
      { text: 'Get a bag or a basket', rank: 76 },
      { text: 'Walk into the room', rank: 86 },
      { text: 'Stand up', rank: 94 },
    ],
  }),

  exercise: () => ({
    suggestions: [
      { text: 'Put your shoes on', rank: 78 },
      { text: 'Change into your clothes', rank: 65 },
      { text: 'Stretch for one minute', rank: 50 },
      { text: 'Do five of something', rank: 42 },
      { text: 'Walk to the door', rank: 86 },
    ],
    chain: [
      { text: 'Do ten minutes of it', rank: 15 },
      { text: 'Do five minutes of it', rank: 30 },
      { text: 'Do one set of something', rank: 45 },
      { text: 'Change into your clothes', rank: 60 },
      { text: 'Put your shoes on', rank: 75 },
      { text: 'Put your shoes next to you', rank: 86 },
      { text: 'Stand up', rank: 94 },
    ],
  }),

  admin: () => ({
    suggestions: [
      { text: 'Open it and read it once', rank: 68 },
      { text: 'Find the link or number you need', rank: 74 },
      { text: 'Write one line', rank: 45 },
      { text: 'Write the first sentence', rank: 52 },
      { text: 'Write it roughly, no editing', rank: 30 },
    ],
    chain: [
      { text: 'Finish it and send it', rank: 15 },
      { text: 'Write it roughly, no editing', rank: 30 },
      { text: 'Write one line', rank: 45 },
      { text: 'Write the first word', rank: 58 },
      { text: 'Open it and read it once', rank: 70 },
      { text: 'Open the app or the page', rank: 82 },
      { text: 'Find the link or number you need', rank: 90 },
      { text: 'Look at it for ten seconds', rank: 96 },
    ],
  }),

  creative: () => ({
    suggestions: [
      { text: 'Get your things out', rank: 72 },
      { text: 'Open what you were last working on', rank: 62 },
      { text: 'Make one mark', rank: 48 },
      { text: 'Work on it for two minutes', rank: 35 },
      { text: 'Look at what you made last time', rank: 58 },
    ],
    chain: [
      { text: 'Work on one part of it', rank: 15 },
      { text: 'Work on it for two minutes', rank: 32 },
      { text: 'Make one mark', rank: 48 },
      { text: 'Get everything out and set up', rank: 62 },
      { text: 'Put it in front of you', rank: 76 },
      { text: "Sit down where you'd work", rank: 88 },
      { text: 'Look at it for ten seconds', rank: 96 },
    ],
  }),

  generic: () => ({
    suggestions: [
      { text: 'Do the first tiny part of it', rank: 32 },
      { text: 'Spend two minutes on it', rank: 42 },
      { text: 'Write down what the first step is', rank: 52 },
      { text: 'Get everything you need in one place', rank: 64 },
      { text: 'Put it in front of you', rank: 80 },
    ],
    chain: [
      { text: 'Do one part of it', rank: 15 },
      { text: 'Spend two minutes on it', rank: 32 },
      { text: 'Do the first tiny step', rank: 46 },
      { text: 'Write down what the first step is', rank: 58 },
      { text: 'Get everything you need in one place', rank: 70 },
      { text: 'Put it in front of you', rank: 82 },
      { text: "Sit down where you'd do it", rank: 90 },
      { text: 'Look at it for ten seconds', rank: 96 },
    ],
  }),
};

/* ------------------------------------------------------------------ */
/* Plan building                                                       */
/* ------------------------------------------------------------------ */

function materialFor(domain: DomainId, text: string, topic?: string): { material: string; phrase: string } {
  const notesish = /\b(notes?|notebook|revis|exam|test|quiz|midterm|final|lecture|class)\b/i.test(text);

  switch (domain) {
    case 'study': {
      const material = notesish ? 'notebook' : 'textbook';
      const phrase = topic ? `your ${topic} ${material}` : `your ${material}`;
      return { material, phrase };
    }
    case 'reading': {
      const material = /\b(article|pdf|paper)\b/i.test(text) ? 'article' : 'book';
      return { material, phrase: `the ${material}` };
    }
    case 'math':
      return { material: 'notebook', phrase: 'your notebook' };
    case 'writing':
      return { material: 'document', phrase: 'the document' };
    case 'coding':
      return { material: 'project', phrase: 'the project' };
    case 'homework':
      return { material: 'assignment', phrase: 'the assignment' };
    default:
      return { material: 'thing', phrase: 'it' };
  }
}

function dedupeByText(rungs: Rung[]): Rung[] {
  const seen = new Set<string>();
  const out: Rung[] = [];
  for (const rung of rungs) {
    const key = rung.text.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(rung);
  }
  return out;
}

function toActions(rungs: Rung[], prefix: string): MicroAction[] {
  return rungs.map((rung) => ({
    id: `${prefix}-${rung.rank}`,
    text: rung.text,
    rank: rung.rank,
  }));
}

/**
 * Build the full plan for a typed task. Pure and synchronous.
 */
export function buildPlan(rawTask: string): MicroActionPlan {
  const rawTrimmed = (rawTask ?? '').trim();
  const task = normalizeTask(rawTrimmed) || 'this';
  const { topic, stem } = detectTopic(task);

  // A recognised school subject with no other signal still means "study".
  let domain = detectDomain(task);
  if (domain === 'generic' && topic) domain = 'study';

  const { material, phrase } = materialFor(domain, task, topic);
  const ctx: DomainContext = { task, topic, stem, material, materialPhrase: phrase };

  const built = BUILDERS[domain](ctx);

  const suggestions = toActions(dedupeByText(built.suggestions), 'sg');
  const chain = toActions(
    dedupeByText([...built.chain].sort((a, b) => a.rank - b.rank)),
    'ch'
  );

  return {
    task,
    rawTask: rawTrimmed || task,
    domain,
    topic,
    suggestions,
    chain,
    size: estimateSize(task),
  };
}

/**
 * The next rung down from `rank`. Returns null when we have reached the floor —
 * the UI then says so gently instead of inventing nonsense.
 */
export function smallerThan(plan: MicroActionPlan, rank: number): MicroAction | null {
  const next = plan.chain.find((step) => step.rank > rank);
  return next ?? null;
}

/** Walks the whole ladder from a starting rank. Used for the "getting smaller" trail. */
export function ladderFrom(plan: MicroActionPlan, rank: number): MicroAction[] {
  return plan.chain.filter((step) => step.rank > rank);
}

/** True when there is nothing smaller left in the ladder. */
export function isAtFloor(plan: MicroActionPlan, rank: number): boolean {
  return smallerThan(plan, rank) == null;
}

/** A sensible default when we need one action without asking. */
export function firstStep(plan: MicroActionPlan): MicroAction {
  return (
    plan.suggestions[0] ??
    plan.chain[plan.chain.length - 1] ?? { id: 'fallback', text: 'Put it in front of you', rank: 90 }
  );
}

/* ------------------------------------------------------------------ */
/* Provider seam (future: an AI-backed generator can implement this)   */
/* ------------------------------------------------------------------ */

export interface MicroActionProvider {
  readonly id: string;
  /** May be async; the UI always renders the local plan first. */
  buildPlan(task: string): Promise<MicroActionPlan> | MicroActionPlan;
}

export const localProvider: MicroActionProvider = {
  id: 'local-rules',
  buildPlan: (task: string) => buildPlan(task),
};

let activeProvider: MicroActionProvider = localProvider;

export function setMicroActionProvider(provider: MicroActionProvider): void {
  activeProvider = provider;
}

export function getMicroActionProvider(): MicroActionProvider {
  return activeProvider;
}

export async function planFor(task: string): Promise<MicroActionPlan> {
  try {
    return await activeProvider.buildPlan(task);
  } catch {
    // A remote provider failing must never block someone from starting.
    return buildPlan(task);
  }
}
