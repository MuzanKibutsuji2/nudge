import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildPlan,
  estimateSize,
  isAtFloor,
  normalizeTask,
  planFor,
  setMicroActionProvider,
  localProvider,
  smallerThan,
} from '../lib/microActions';

test('normalizeTask strips the way people actually type', () => {
  assert.equal(normalizeTask('  I need to   study physics '), 'study physics');
  assert.equal(normalizeTask('I should finish my essay.'), 'finish my essay');
  assert.equal(normalizeTask('Clean my room!'), 'Clean my room');
  assert.equal(normalizeTask(''), '');
});

test('"Study Physics" produces the expected first actions', () => {
  const plan = buildPlan('Study Physics');
  const texts = plan.suggestions.map((s) => s.text);

  assert.equal(plan.domain, 'study');
  assert.equal(plan.topic, 'Physics');
  assert.ok(texts.includes('Open your Physics textbook'));
  assert.ok(texts.includes("Find the chapter you're on"));
  assert.ok(texts.includes('Read one page'));
  assert.ok(texts.includes('Review one formula'));
  assert.ok(texts.includes('Solve one question'));
});

test('exam phrasing reaches for notes rather than a textbook', () => {
  const plan = buildPlan("Study for tomorrow's physics test");
  assert.equal(plan.topic, 'Physics');
  assert.ok(plan.suggestions.some((s) => s.text === 'Open your Physics notebook'));
});

test('the ladder only ever gets smaller, and ends somewhere physical', () => {
  const plan = buildPlan('Study Physics');
  const ranks = plan.chain.map((step) => step.rank);
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  assert.ok(ranks.length >= 5);

  const walked: string[] = [];
  let rank = -1;
  for (let i = 0; i < 50; i += 1) {
    const next = smallerThan(plan, rank);
    if (!next) break;
    walked.push(next.text);
    rank = next.rank;
  }

  assert.ok(walked.length >= 5, walked.join(' -> '));
  assert.ok(walked.includes('Read one page'));
  assert.ok(walked.includes('Open your Physics textbook'));
  assert.ok(
    walked.indexOf('Read one page') < walked.indexOf('Open your Physics textbook'),
    'opening the book should come after reading a page in the descent'
  );
  assert.ok(walked[walked.length - 1].length > 0);
  assert.ok(isAtFloor(plan, rank));
});

test('pressing "make it even smaller" forever terminates instead of looping', () => {
  const plan = buildPlan('Finish my chemistry assignment');
  let rank = -1;
  let guard = 0;
  while (guard < 200) {
    const next = smallerThan(plan, rank);
    if (!next) break;
    assert.ok(next.rank > rank);
    rank = next.rank;
    guard += 1;
  }
  assert.ok(guard < 200);
  assert.equal(smallerThan(plan, rank), null);
});

test('a suggestion drops into the right place in the ladder', () => {
  const plan = buildPlan('Study Physics');
  const open = plan.suggestions.find((s) => s.text === 'Open your Physics textbook');
  assert.ok(open);
  const next = smallerThan(plan, open!.rank);
  assert.equal(next?.text, 'Put your textbook on the desk');
});

test('domains are recognised from ordinary phrasing', () => {
  const cases: [string, string][] = [
    ['Start my coding project', 'coding'],
    ['Clean my room', 'cleaning'],
    ['Go for a run', 'exercise'],
    ['Reply to that email', 'admin'],
    ['Write my history essay', 'writing'],
    ['Read chapter 4', 'reading'],
    ['Do my calculus problem set', 'homework'],
    ['Practice guitar', 'creative'],
    ['Sort out the thing', 'generic'],
  ];
  for (const [input, domain] of cases) {
    assert.equal(buildPlan(input).domain, domain, `${input} should be ${domain}`);
  }
});

test('every domain offers real options and a floor', () => {
  const inputs = [
    'Study Physics',
    'Finish my chemistry assignment',
    'Write my essay',
    'Fix the login bug',
    'Read chapter 4',
    'Do my calculus problem set',
    'Clean my room',
    'Go for a run',
    'Reply to that email',
    'Practice guitar',
    'Sort out the thing',
  ];
  for (const input of inputs) {
    const plan = buildPlan(input);
    assert.ok(plan.suggestions.length >= 4, input);
    assert.ok(plan.chain.length >= 5, input);
    for (const step of [...plan.suggestions, ...plan.chain]) {
      assert.ok(step.text.trim().length > 0);
      assert.ok(step.text.length < 70, `${step.text} is too long to be a tiny step`);
    }
  }
});

test('nonsense input never throws', () => {
  for (const input of ['', '   ', '🙂', '!!!', 'a'.repeat(400), 'I need to I need to']) {
    const plan = buildPlan(input);
    assert.ok(plan.suggestions.length > 0);
    assert.ok(plan.chain.length > 0);
  }
});

test('size estimates stay sensible', () => {
  assert.equal(estimateSize('Open the textbook'), 'tiny');
  assert.equal(estimateSize('Revise everything for the final exam next week'), 'large');
  assert.equal(estimateSize('Study Physics'), 'medium');
});

test('the provider seam falls back to local rules when a provider fails', async () => {
  setMicroActionProvider({
    id: 'broken',
    buildPlan: () => {
      throw new Error('network down');
    },
  });
  const plan = await planFor('Study Physics');
  assert.ok(plan.suggestions.some((s) => s.text === 'Open your Physics textbook'));
  setMicroActionProvider(localProvider);
});
