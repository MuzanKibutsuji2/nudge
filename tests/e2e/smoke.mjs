/**
 * End-to-end smoke test: the journey a new user actually takes.
 *
 *   npx expo export --platform web --output-dir dist
 *   node tests/e2e/smoke.mjs
 *
 * It drives the real exported app in jsdom — same bundle that runs on a phone,
 * minus the native shell.
 */
import { check, finish, launch, section } from './harness.mjs';

const app = await launch();

/* ------------------------------------------------------------------ */
section('First launch');
/* ------------------------------------------------------------------ */

check('starts in onboarding', app.has('Hey.'));
check('tagline', app.has('small steps. no pressure.'));
check('no pressure framing', app.has("You don't have to be productive here"));

await app.tap('Continue');
check('second step explains the point', app.has('starting feels difficult'));
check('says what it is not', app.has('No streaks. No scores.'));

await app.tap('That sounds useful');
check('asks for a name', app.has("What's your name?"));
check('name is optional', app.has('Optional'));

await app.type('Riya', { placeholder: 'Your name' });
await app.tap('Continue');
check('asks what you want help starting', app.has('help starting'));

await app.tap('Studying');
await app.tap('Homework');
await app.tap('Continue');
check('ends on a calm note', app.has("You're ready."));
check('offers the explainer', app.has('Show me how it works'));

/* ------------------------------------------------------------------ */
section('How it works (from onboarding)');
/* ------------------------------------------------------------------ */

await app.tap('Show me how it works');
await app.waitFor('How Nudge works');
check('explains the loop', app.has('one small loop'));
check('step: make it smaller', app.has('Make it smaller'));
check('step: nothing starts on its own', app.has('Nothing starts until you tap'));
check(
  'clears up what "keep going" does',
  app.has('does not move you on to a different task'),
  app.text().slice(0, 200)
);
check('explains one more tiny thing', app.has('Same task, next step down'));
check('explains breaks', app.has('Coming back is a question, not a deadline'));
check('promises nothing auto-continues', app.has('nothing continues by itself'));
check('promises local only', app.has('Everything stays on this device'));

await app.tap('Got it');
await app.waitFor("You're ready.");
check('returns to onboarding', app.has("You're ready."));

await app.tap("Let's go");
await app.waitFor('What do you need right now?');

/* ------------------------------------------------------------------ */
section('Home');
/* ------------------------------------------------------------------ */

check('greets by name', /Good (morning|afternoon|evening), Riya/.test(app.text()));
check('asks the question', app.has('What do you need right now?'));
check('three doors', app.has("I'm stuck") && app.has('I want to work') && app.has('I need a break'));
check('wall mode entry', app.has('staring at the wall'));
check('wins placeholder', app.has('Nothing yet today'));
check('footer', app.has("You don't have to do everything today."));
check('help is reachable from home', app.has('How it works'));

/* ------------------------------------------------------------------ */
section("I'm stuck → one tiny thing");
/* ------------------------------------------------------------------ */

await app.tap("I'm stuck");
await app.waitFor('how you feel');
check('does not ask you to solve everything', app.has("Let's not solve everything at once"));
check('no wrong answer', app.has('No wrong answer'));
check('offers overwhelmed', app.has('Everything feels overwhelming'));
check('offers an opt-out', app.has("I don't know") && app.has('Something else'));

await app.tap('Everything feels overwhelming');
await app.waitFor('trying to do');
check('asks what you are trying to do', app.has('What are you trying to do?'));
check('one line is enough', app.has('One line is enough'));
check('can skip the question', app.has("I don't know yet"));

await app.type('Study Physics');
await app.tap('Continue');
await app.waitFor('smaller');
check('never calls it too much', app.has('That sounds like a lot'));
check('echoes what you said', app.has('Study Physics'));
check('offers concrete first actions', app.has('Open your Physics textbook'));
check('offers to write your own', app.has('Something else, in my words'));
check('offers to shrink further', app.has('Make it even smaller'));

const beforeShrink = app.text();
await app.tap('Make it even smaller');
check('shrinking adds a smaller rung', app.text() !== beforeShrink && app.has('Getting smaller'));
const afterOne = app.text();
await app.tap('Make it even smaller');
check('can shrink again', app.text() !== afterOne);
check('never pushes back on going smaller', !/too small|at least|minimum/i.test(app.text()));

await app.tap('This one');
await app.waitFor('Your only job right now');
check('one action only', app.has('Your only job right now'));
check('nothing after this', app.has('Nothing after this'));
check('no timer yet', app.has('No timer yet'));
check('can still shrink', app.has('Make it smaller'));
check('can swap it out', app.has('I want something else'));

/* ------------------------------------------------------------------ */
section('Five minutes');
/* ------------------------------------------------------------------ */

await app.tap("I'm doing it");
await app.waitFor(() => /0[45]:\d\d/.test(app.text()), { label: 'the timer' });
check('timer started at five minutes', /0[45]:\d\d/.test(app.text()), app.text().slice(0, 140));
check('says it keeps itself', app.has('The time keeps itself'));
check('pause is offered', app.has('Pause'));
check('can stop at any moment', app.has("I'm done"));

await app.tap('Pause');
check('pause acknowledged', app.has('PAUSED') && app.has('Resume'));
await app.tap('Resume');
check('resumes', app.has('FOCUSING'));

await app.tap("I'm done");
await app.waitFor("That's okay.");

/* ------------------------------------------------------------------ */
section('Stopping early is not failure');
/* ------------------------------------------------------------------ */

check('kind heading', app.has("That's okay."));
check('credits starting', app.has('You started.'));
check('no shame words', !/fail|lazy|excuse|behind/i.test(app.text()));
check('keep going is explicit about staying on the same thing', app.has('Keep going on this'));
check(
  'and spells it out underneath',
  app.has('The same thing you just did, for 5 more minutes.'),
  app.text().slice(-400)
);
check('one more tiny thing is explained', app.has('Same task, one step smaller'));
check('break is explained', app.has('5, 10 or 20 minutes'));
check('explainer is one tap away', app.has('What do these do?'));

await app.tap('What do these do?');
await app.waitFor('How Nudge works');
check('opens the same instructions', app.has('What the choices at the end mean'));
await app.tap('Got it');
await app.waitFor("That's okay.");

await app.tap("I'm done for now");
await app.waitFor('What do you need right now?');

/* ------------------------------------------------------------------ */
section('It was recorded, calmly');
/* ------------------------------------------------------------------ */

check('home shows the win', /Opened|Put|Found|Read|Reviewed/.test(app.text()));

await app.tap('Today');
await app.waitFor('Small things I did');
check('today lists what happened', app.has('Small things I did'));
check('past tense reads naturally', /Opened|Put|Found|Read|Reviewed/.test(app.text()));

await app.tap('History');
await app.waitFor('History');
check('history has the day', app.has('Today'));
check('no streaks anywhere', !/streak/i.test(app.text()));
check('no scores anywhere', !/score\b/i.test(app.text().replace(/No scores\./gi, '')));

/* ------------------------------------------------------------------ */
section('Colour palettes');
/* ------------------------------------------------------------------ */

await app.tap('Settings');
await app.waitFor('Appearance');
check('colour section exists', app.has('Colour'));
check('says what it does', app.has('Changes the accent across the whole app'));
for (const name of ['Forest', 'Blush', 'Lavender', 'Ocean', 'Clay', 'Ink']) {
  check(`offers ${name}`, app.has(name));
}
check('pink is one of them', app.has('Blush'));
check('how it works is in settings too', app.has('How Nudge works'));

check('starts on forest', app.colorsInUse().includes('rgb(46, 107, 94)'));

await app.tap('Blush');
await app.settle(4);
check('switching to pink repaints settings', app.colorsInUse().includes('rgb(165, 52, 100)'));

const saved = app.storage();
const settingsKey = Object.keys(saved).find((key) => key.includes('settings'));
check('choice is saved', !!settingsKey && saved[settingsKey].includes('"accent":"blush"'));

await app.tap('Lavender');
await app.settle(4);
check('can change its mind', app.colorsInUse().includes('rgb(106, 79, 179)'));

await app.tap('Blush');
await app.settle(4);

await app.tap('Home');
await app.waitFor('What do you need right now?');
check('the whole app follows the choice', app.colorsInUse().includes('rgb(165, 52, 100)'));
check('nothing is left in the old colour', !app.colorsInUse().includes('rgb(46, 107, 94)'));

/* ------------------------------------------------------------------ */
section('Relaunch keeps everything');
/* ------------------------------------------------------------------ */

const storage = app.storage();
app.close();

const relaunched = await launch({ storage });
await relaunched.waitFor('What do you need right now?');
check('skips onboarding', !relaunched.has('Hey.') || relaunched.has('What do you need right now?'));
check('remembers the name', relaunched.has('Riya'));
check('remembers the win', /Opened|Put|Found|Read|Reviewed/.test(relaunched.text()));
check('remembers pink', relaunched.colorsInUse().includes('rgb(165, 52, 100)'));
check('no runtime errors', relaunched.errors.length === 0, relaunched.errors.join(' | '));

check('no runtime errors in the main run', app.errors.length === 0, app.errors.join(' | '));

finish();
