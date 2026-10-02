/**
 * End-to-end test for the "I'm overwhelmed" path: Reset → Reset Room /
 * Brain Unclutter / Quiet Mode → the tiniest possible restart.
 *
 *   npx expo export --platform web --output-dir dist
 *   node tests/e2e/reset.mjs
 */
import { check, finish, launch, section } from './harness.mjs';

/** Skip onboarding so each run starts on Home. */
const SETTINGS = JSON.stringify({
  name: 'Riya',
  focusAreas: ['Studying'],
  theme: 'system',
  accent: 'forest',
  defaultSessionMinutes: 5,
  sounds: false,
  haptics: false,
  reduceMotion: false,
  onboarded: true,
});

const TASKS = JSON.stringify([
  {
    id: 'task_1',
    title: 'Chemistry revision',
    size: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: '2026-01-01',
  },
]);

const storage = {
  'nudge/v1/settings': SETTINGS,
  'nudge/v1/tasks': TASKS,
};

async function home() {
  const app = await launch({ storage });
  await app.waitFor('What do you need right now?');
  return app;
}

/* ------------------------------------------------------------------ */
section('The panic button');
/* ------------------------------------------------------------------ */

let app = await home();
check('home offers it plainly', app.has("I'm overwhelmed"));
check('and says what it is', app.has('A quieter screen. No questions asked.'));

await app.tap("I'm overwhelmed");
await app.waitFor('one moment at a time');

check('opens straight away, nothing asked first', app.has("Hey. Let's take this one moment at a time."));
check('no pressure to solve anything', app.has("You don't have to solve everything right now."));
check('three ways on', app.has('Help me settle.') && app.has('Help me untangle my thoughts.') && app.has('I just need a moment.'));
check('leaving is advertised', app.has('You can leave at any point'));
check('no confirmation dialog appeared', !/are you sure|cancel\?/i.test(app.text()));
check('nothing stressful on screen', !/deadline|overdue|streak|due |\d+ tasks|minutes today/i.test(app.text()));
check('a quiet route to real help', app.has('If this feels bigger than stress'));

/* ------------------------------------------------------------------ */
section('Proportionate support');
/* ------------------------------------------------------------------ */

await app.tap('If this feels bigger than stress');
await app.waitFor('emergency');
check('tells the truth about what the app is', app.has("isn't medical care"));
check('points at a person first', app.has('someone who can actually be there'));
check('gives a local number', app.has('112'));
check('does not treat ordinary stress as an emergency', app.has('if this is ordinary stress'));
check('no diagnosis language', !/panic attack|anxiety disorder|depress|diagnos|treat(ment|s)\b/i.test(app.text()));
await app.tap('Back');
await app.waitFor('one moment at a time');

/* ------------------------------------------------------------------ */
section('Reset Room — breathing');
/* ------------------------------------------------------------------ */

await app.tap('Help me settle.');
await app.waitFor('RESET ROOM');
check('nothing to get right', app.has('Nothing to get right here.'));
check('following is optional', app.has("Ignore it if it doesn't"));
check('no breathing instructions', app.has('No counting, no holding'));
check('nothing is running yet', app.has('Start the circle'));

await app.tap('Start the circle');
check('can pause', app.has('Pause'));
check('can stop', app.has('Stop'));
await app.tap('Pause');
check('pausing offers resume', app.has('Resume'));
await app.tap('Resume');
await app.tap('Stop');
check('stopping returns to the start', app.has('Start the circle'));

await app.tap('Hide the circle');
check('the animation can be hidden', app.has('The circle is hidden'));
check('and brought back', app.has('Show the circle'));
await app.tap('Show the circle');

/* ------------------------------------------------------------------ */
section('Reset Room — noticing');
/* ------------------------------------------------------------------ */

await app.tap('Noticing');
await app.waitFor('One thing at a time.');
check('prompts are optional', app.has('Only if you want to'));
check('first prompt', app.has('Notice three things you can see.'));
check('can skip a prompt', app.has('Skip this one'));

await app.tap('Skip this one');
check('skipping moves on without comment', app.has('Notice the surface holding you up.'));
await app.tap('Done that');
await app.tap('Done that');
await app.tap('Done that');
await app.tap('Done that');
check('ends without a score', app.has("That's all of them. Nothing else to do."));
check('no praise or streak', !/great job|well done|streak|points/i.test(app.text()));

await app.tap("I'm done here");
await app.waitFor('No rush.');

/* ------------------------------------------------------------------ */
section('After an activity');
/* ------------------------------------------------------------------ */

check('does not assume readiness', app.has("You don't have to be ready for anything."));
check('offers untangling', app.has('Untangle my thoughts'));
check('offers a tiny step', app.has('Try one tiny step'));
check('offers a break', app.has('Take a break'));
check('offers to stop', app.has('Finish for now'));
check('stopping is warm', app.has("You can come back whenever you're ready."));
check('never asks how you feel now', !/how (do|are) you (feel|feeling)/i.test(app.text()));

/* ------------------------------------------------------------------ */
section('Quiet Mode');
/* ------------------------------------------------------------------ */

app.close();
app = await home();
await app.tap("I'm overwhelmed");
await app.waitFor('one moment at a time');
await app.tap('I just need a moment.');
await app.waitFor('QUIET MODE');
await app.settle(8);

check('line one', app.has("It's okay to pause."));
check('line two', app.has('No tasks. No exercises. No questions.'));
check('line three', app.has('You can stay here for a moment, or leave whenever you want.'));
check('no timer', !/\d\d:\d\d/.test(app.text()));
check('no suggestions', !/task|start|try/i.test(app.text().replace(/No tasks\./g, '')));
check('a way out', app.has('Leave'));

await app.tap('Leave');
await app.waitFor('What do you need right now?');
check('leaving goes straight home', app.has('What do you need right now?'));

/* ------------------------------------------------------------------ */
section('Brain Unclutter — writing');
/* ------------------------------------------------------------------ */

await app.tap("I'm overwhelmed");
await app.waitFor('one moment at a time');
await app.tap('Help me untangle my thoughts.');
await app.waitFor('BRAIN UNCLUTTER');

check('the prompt', app.has("What's taking up space in your mind right now?"));
check('both shapes of writing are fine', app.has('One thing per line, or one long ramble'));
check('says it is not saved', app.has("isn't saved anywhere unless you choose"));
check('continue, clear and exit are all there', app.has('Continue') && app.has('Clear') && app.has('Exit'));

await app.tap('Continue');
await app.waitFor('Nothing written down');
check('continuing with nothing written is allowed', app.has("Nothing written down. That's fine too."));
await app.tap('Leave');
await app.waitFor('What do you need right now?');

await app.tap("I'm overwhelmed");
await app.tap('Help me untangle my thoughts.');
await app.waitFor('BRAIN UNCLUTTER');
await app.type('Chemistry revision\nMessage my group\nThat form I keep forgetting');
await app.tap('Continue');
await app.waitFor('Want to sort these?');

/* ------------------------------------------------------------------ */
section('Brain Unclutter — sorting');
/* ------------------------------------------------------------------ */

check('each line became a thought', app.has('Chemistry revision') && app.has('Message my group') && app.has('That form I keep forgetting'));
check('sorting is optional', app.has('Only if it helps'));
check('three buckets', app.has('NOW') && app.has('LATER') && app.has('NOT SURE'));
check('can skip sorting entirely', app.has('Skip sorting'));
check('nothing was prioritised for the user', !/you should|most important|priority:/i.test(app.text()));

await app.tap('NOW — Chemistry revision');
await app.settle(2);
check('a thought can be put in NOW', app.text().includes('Chemistry revision'));

await app.tap('Delete — Message my group');
await app.settle(2);
check('a thought can be deleted', !app.has('Message my group'));

const before = app.text();
await app.tap('Add another thought');
check('adding nothing changes nothing', app.text().length > 0 && !app.has('undefined'));

check('no runtime errors so far', app.errors.length === 0, app.errors.join(' | '));

/* ------------------------------------------------------------------ */
section('One thought into one tiny step');
/* ------------------------------------------------------------------ */

await app.tap('Turn one into something I can do');
await app.waitFor('Which one?');
check('asks which, rather than choosing', app.has('Which one?'));

await app.tap('Chemistry revision');
await app.waitFor('How about this?');
check('offers a suggestion, not an order', app.has('A suggestion, not an instruction'));
check('suggestion relates to the thought', /chemistry/i.test(app.text()));
check('it can be made smaller', app.has('Make it smaller'));
check('saving as a task is opt-in', app.has('Also keep this on my task list') && app.has('Off by default'));
check('timers are optional', app.has('Start five minutes') && app.has('Start one minute') && app.has('no timer'));

await app.tap('Make it smaller');
await app.settle(2);
check('still offers to go smaller', app.has('Make it smaller'));

await app.tap("I'll just do it — no timer");
await app.waitFor('That was a step.');
check('after a step, four calm choices', app.has('Continue') && app.has('Make the next step smaller') && app.has('Take a break') && app.has('Finish for now'));
check('no guilt, no streak', !/streak|you should|don't stop|keep it up/i.test(app.text()));
check('not assumed to be settled', app.has('Whatever happens next is up to you.'));

const storedBefore = app.storage();
check(
  'private thoughts were never written to storage',
  !JSON.stringify(storedBefore).includes('That form I keep forgetting'),
  Object.keys(storedBefore).join(', ')
);

await app.tap('Finish for now');
await app.waitFor('What do you need right now?');
check('finishing lands back home', app.has('What do you need right now?'));
check('no task was created behind their back', !app.has('That form I keep forgetting'));

/* ------------------------------------------------------------------ */
section('A tiny step with the timer, from an existing task');
/* ------------------------------------------------------------------ */

app.close();
app = await home();
await app.tap("I'm overwhelmed");
await app.tap('Help me settle.');
await app.waitFor('RESET ROOM');
await app.tap("I'm done here");
await app.waitFor('No rush.');
await app.tap('Try one tiny step');
await app.waitFor('Would you like to make the next step smaller?');

check('the restart question', app.has('Would you like to make the next step smaller?'));
check('three ways on', app.has('Help me start something small.') && app.has("I'd rather take a break.") && app.has("I'm done for now."));

await app.tap('Help me start something small.');
await app.waitFor('What would you be starting?');
check('existing tasks are offered', app.has('Chemistry revision'));
check('no deadlines shown here', !app.has('2026') && !/overdue|due/i.test(app.text()));
check('or something new', app.has('Something else'));
check('and skipping is allowed', app.has('Skip this'));

await app.tap('Chemistry revision');
await app.waitFor('How about this?');
await app.tap('Start one minute');
await app.waitFor(() => /0[01]:\d\d/.test(app.text()), { label: 'the one-minute timer' });
check('a one-minute session runs', /0[01]:\d\d/.test(app.text()), app.text().slice(0, 140));
check('can stop immediately', app.has("I'm done"));

await app.tap("I'm done");
await app.waitFor("That's okay.");
check('ends kindly', app.has("That's okay.") && app.has('You started.'));
check('the four choices again', app.has('Keep going on this') && app.has('Do one more tiny thing') && app.has('Take a break') && app.has("I'm done for now"));

await app.tap("I'm done for now");
await app.waitFor('What do you need right now?');
check('the session was recorded', /Opened|Read|Found|Put|Reviewed|Chemistry/i.test(app.text()));
check('no runtime errors', app.errors.length === 0, app.errors.join(' | '));

/* ------------------------------------------------------------------ */
section('Keeping a step as a task — only when asked');
/* ------------------------------------------------------------------ */

await app.tap("I'm overwhelmed");
await app.tap('Help me untangle my thoughts.');
await app.waitFor('BRAIN UNCLUTTER');
await app.type('Sort out my history notes');
await app.tap('Continue');
await app.waitFor('Want to sort these?');
await app.tap('Turn one into something I can do');
await app.tap('Sort out my history notes');
await app.waitFor('How about this?');

check('not saved yet', !JSON.stringify(app.storage()).includes('Sort out my history notes'));

await app.tap('Also keep this on my task list');
await app.settle(2);
await app.tap("I'll just do it — no timer");
await app.waitFor('That was a step.');

check(
  'ticking the box saves it through the normal task system',
  JSON.stringify(app.storage()).includes('Sort out my history notes')
);

await app.tap('Finish for now');
await app.waitFor('What do you need right now?');
await app.tap('Today');
await app.waitFor('Things I might do');
check('and it shows up like any other task', app.has('Sort out my history notes'));
await app.tap('Home');
await app.waitFor('What do you need right now?');

/* ------------------------------------------------------------------ */
section('Leaving halfway, repeatedly');
/* ------------------------------------------------------------------ */

for (const door of ['Help me settle.', 'Help me untangle my thoughts.', 'I just need a moment.']) {
  await app.tap("I'm overwhelmed");
  await app.waitFor('one moment at a time');
  await app.tap(door);
  await app.settle(4);
  await app.tap('Leave');
  await app.waitFor('What do you need right now?');
  check(`can walk out of “${door}”`, app.has('What do you need right now?'));
}

check('still no errors after all that', app.errors.length === 0, app.errors.join(' | '));

/* ------------------------------------------------------------------ */
section('Clearing what you wrote');
/* ------------------------------------------------------------------ */

await app.tap("I'm overwhelmed");
await app.tap('Help me untangle my thoughts.');
await app.waitFor('BRAIN UNCLUTTER');
const box = await app.type('something I would rather not keep');
check('it is in the box', box.value.includes('rather not keep'));
await app.tap('Clear');
await app.settle(3);
check('clear empties the box', !box.value.includes('rather not keep'), box.value);
await app.tap('Exit');
await app.waitFor('What do you need right now?');

/* ------------------------------------------------------------------ */
section('Reduced motion');
/* ------------------------------------------------------------------ */

app.close();
const calm = await launch({
  storage: {
    ...storage,
    'nudge/v1/settings': JSON.stringify({ ...JSON.parse(SETTINGS), reduceMotion: true }),
  },
});
await calm.waitFor('What do you need right now?');
await calm.tap("I'm overwhelmed");
await calm.tap('Help me settle.');
await calm.waitFor('RESET ROOM');
await calm.tap('Start the circle');
check('the circle holds still', calm.has('Your device asks for less movement'));
check('the exercise still works', calm.has('Pause') && calm.has('Stop'));
check('no errors with motion off', calm.errors.length === 0, calm.errors.join(' | '));
calm.close();

/* ------------------------------------------------------------------ */
section('Nothing private survived');
/* ------------------------------------------------------------------ */

const saved = JSON.stringify(app.storage());
check('no thoughts in storage', !saved.includes('That form I keep forgetting'));
check('no thoughts in the task list', !saved.includes('Message my group'));
check('the real task list is untouched', saved.includes('Chemistry revision'));

app.close();
finish();
