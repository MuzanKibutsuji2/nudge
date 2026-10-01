/**
 * Tiny, conservative verb re-phrasing.
 *
 * Used in two places:
 *   - "Today's small wins" reads better in the past tense
 *     ("Open your Physics textbook" → "Opened your Physics textbook")
 *   - History patterns read better as a gerund
 *     ("Open your textbook" → "Opening your textbook")
 *
 * If the first word isn't a verb we recognise, the text is left exactly as the
 * user (or the engine) wrote it. Guessing badly is worse than not guessing.
 */

const PAST: Record<string, string> = {
  open: 'Opened',
  read: 'Read',
  write: 'Wrote',
  put: 'Put',
  find: 'Found',
  review: 'Reviewed',
  solve: 'Solved',
  answer: 'Answered',
  do: 'Did',
  make: 'Made',
  get: 'Got',
  run: 'Ran',
  take: 'Took',
  sit: 'Sat',
  stand: 'Stood',
  walk: 'Walked',
  clean: 'Cleaned',
  tidy: 'Tidied',
  pick: 'Picked',
  clear: 'Cleared',
  spend: 'Spent',
  work: 'Worked',
  change: 'Changed',
  stretch: 'Stretched',
  copy: 'Copied',
  look: 'Looked',
  fix: 'Fixed',
  send: 'Sent',
  reply: 'Replied',
  start: 'Started',
  finish: 'Finished',
  study: 'Studied',
  play: 'Played',
  practice: 'Practised',
  draw: 'Drew',
  check: 'Checked',
  set: 'Set',
  add: 'Added',
  call: 'Called',
  email: 'Emailed',
  print: 'Printed',
  plan: 'Planned',
  list: 'Listed',
  pack: 'Packed',
  wash: 'Washed',
  move: 'Moved',
  try: 'Tried',
};

const IRREGULAR_GERUND: Record<string, string> = {
  put: 'Putting',
  get: 'Getting',
  sit: 'Sitting',
  run: 'Running',
  stand: 'Standing',
  set: 'Setting',
  plan: 'Planning',
  begin: 'Beginning',
};

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function split(text: string): { first: string; rest: string[] } | null {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return null;
  const [first, ...rest] = trimmed.split(' ');
  return { first: first.toLowerCase().replace(/[^a-z]/g, ''), rest };
}

/** "Open your textbook" → "Opened your textbook". Unknown verbs pass through. */
export function toPastTense(text: string): string {
  const parts = split(text);
  if (!parts) return text;
  const past = PAST[parts.first];
  if (!past) return text.trim();
  return [past, ...parts.rest].join(' ');
}

/** "Open your textbook" → "Opening your textbook". Unknown verbs pass through. */
export function toGerund(text: string): string {
  const parts = split(text);
  if (!parts) return text;
  const { first, rest } = parts;
  if (!first) return text.trim();

  let gerund: string;
  if (IRREGULAR_GERUND[first]) gerund = IRREGULAR_GERUND[first];
  else if (first.endsWith('ie')) gerund = `${capitalize(first.slice(0, -2))}ying`;
  else if (first.endsWith('e') && !first.endsWith('ee')) gerund = `${capitalize(first.slice(0, -1))}ing`;
  else gerund = `${capitalize(first)}ing`;

  return [gerund, ...rest].join(' ');
}
