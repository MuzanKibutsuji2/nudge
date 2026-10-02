import assert from 'node:assert/strict';
import test from 'node:test';

import { toGerund, toPastTense } from '../lib/phrasing';

test('wins read in the past tense', () => {
  assert.equal(toPastTense('Open your Physics textbook'), 'Opened your Physics textbook');
  assert.equal(toPastTense('Read one page'), 'Read one page');
  assert.equal(toPastTense('Write one sentence'), 'Wrote one sentence');
  assert.equal(toPastTense('Put your textbook on the desk'), 'Put your textbook on the desk');
});

test('patterns read as a gerund', () => {
  assert.equal(toGerund('Open your Physics textbook'), 'Opening your Physics textbook');
  assert.equal(toGerund('Put your textbook on the desk'), 'Putting your textbook on the desk');
  assert.equal(toGerund('Tidy one surface'), 'Tidying one surface');
  assert.equal(toGerund('Sit at your desk'), 'Sitting at your desk');
});

test('unknown verbs and junk are left exactly as written', () => {
  assert.equal(toPastTense('Yeet the assignment'), 'Yeet the assignment');
  assert.equal(toPastTense(''), '');
  assert.equal(toPastTense('   '), '   ');
  assert.equal(toPastTense('🫠'), '🫠');
  assert.equal(toGerund(''), '');
  assert.doesNotThrow(() => toGerund('🫠 📚'));
});
