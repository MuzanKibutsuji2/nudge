import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

import {
  addThought,
  captureThoughts,
  clearUnclutter,
  editThought,
  getUnclutter,
  groupThoughts,
  removeThought,
  setBucket,
  splitThoughts,
  subscribeUnclutter,
} from '../lib/unclutter';

beforeEach(() => clearUnclutter());

test('one thought per line, junk ignored', () => {
  assert.deepEqual(splitThoughts('Chem lab report\nMessage back\n\n  Laundry  '), [
    'Chem lab report',
    'Message back',
    'Laundry',
  ]);
  assert.deepEqual(splitThoughts('- one\n* two\n• three\n— four'), ['one', 'two', 'three', 'four']);
});

test('a single ramble stays one thought', () => {
  const raw = 'everything is due at once and I have not started any of it honestly';
  assert.deepEqual(splitThoughts(raw), [raw]);
});

test('nothing written is not an error', () => {
  assert.deepEqual(splitThoughts(''), []);
  assert.deepEqual(splitThoughts('   \n\n  '), []);
  // @ts-expect-error — defensive: callers can pass undefined
  assert.deepEqual(splitThoughts(undefined), []);
  assert.deepEqual(captureThoughts(''), []);
  assert.equal(getUnclutter().thoughts.length, 0);
});

test('thoughts start uncategorised and can be moved, edited and deleted', () => {
  const [first, second] = captureThoughts('Physics revision\nCall home');
  assert.equal(first.bucket, 'none');

  setBucket(first.id, 'now');
  assert.equal(getUnclutter().thoughts[0].bucket, 'now');

  setBucket(first.id, 'later');
  assert.equal(getUnclutter().thoughts[0].bucket, 'later');

  // tapping the same bucket again un-sets it: leaving things unsorted is allowed
  setBucket(first.id, 'later');
  assert.equal(getUnclutter().thoughts[0].bucket, 'none');

  editThought(second.id, '  Call home tonight  ');
  assert.equal(getUnclutter().thoughts[1].text, 'Call home tonight');

  removeThought(first.id);
  assert.equal(getUnclutter().thoughts.length, 1);
});

test('editing a thought to nothing removes it instead of leaving a blank', () => {
  const [only] = captureThoughts('Something');
  editThought(only.id, '   ');
  assert.equal(getUnclutter().thoughts.length, 0);
});

test('re-capturing keeps the sorting already done', () => {
  const [a] = captureThoughts('Essay\nLaundry');
  setBucket(a.id, 'now');
  const again = captureThoughts('Essay\nLaundry\nEmail');
  assert.equal(again[0].bucket, 'now');
  assert.equal(again[2].bucket, 'none');
});

test('adding one by hand, and ignoring blanks', () => {
  captureThoughts('First');
  assert.equal(addThought('Second')?.text, 'Second');
  assert.equal(addThought('   '), null);
  assert.equal(getUnclutter().thoughts.length, 2);
});

test('clearing really clears', () => {
  captureThoughts('a\nb\nc');
  clearUnclutter();
  assert.deepEqual(getUnclutter(), { raw: '', thoughts: [] });
});

test('subscribers are notified and can unsubscribe', () => {
  let calls = 0;
  const unsubscribe = subscribeUnclutter(() => {
    calls += 1;
  });
  captureThoughts('x');
  assert.ok(calls > 0);
  const seen = calls;
  unsubscribe();
  captureThoughts('y');
  assert.equal(calls, seen);
});

test('grouping keeps NOW, LATER, NOT SURE and unsorted separate', () => {
  const [a, b, c] = captureThoughts('one\ntwo\nthree');
  setBucket(a.id, 'now');
  setBucket(b.id, 'later');
  setBucket(c.id, 'unsure');
  addThought('four');

  const grouped = groupThoughts(getUnclutter().thoughts);
  assert.deepEqual(
    Object.fromEntries(Object.entries(grouped).map(([key, list]) => [key, list.length])),
    { now: 1, later: 1, unsure: 1, none: 1 }
  );
});

test('nothing here ever reaches storage', () => {
  // The module imports nothing but react; if that ever changes, this fails.
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  const source = fs.readFileSync(
    path.join(__dirname, '..', '..', 'lib', 'unclutter.ts'),
    'utf8'
  );
  const code = source
    .split('\n')
    .filter((line) => !/^\s*(\*|\/\*|\/\/)/.test(line))
    .join('\n');
  assert.ok(!/AsyncStorage|localStorage|persist/i.test(code), 'unclutter must stay in memory');
});
