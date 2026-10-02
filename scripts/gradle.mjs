/**
 * Runs the Gradle wrapper inside android/ with the right command for the
 * current OS, so the npm scripts work the same on Windows, macOS and Linux.
 *
 *   npm run android:apk    -> assembleRelease
 *   npm run android:aab    -> bundleRelease
 *   npm run android:clean  -> clean
 *
 * Building needs a JDK and the Android SDK. Android Studio ships both; this
 * script points you there instead of failing with a wall of Gradle output.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = path.join(ROOT, 'android');
const isWindows = process.platform === 'win32';

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(path.join(ANDROID, 'gradlew'))) {
  fail(
    'No android/ folder yet. Generate it first:\n\n' +
      '  npm install\n' +
      '  npm run android:regen'
  );
}

const hasJava =
  !!process.env.JAVA_HOME ||
  spawnSync(isWindows ? 'where' : 'which', ['java'], { stdio: 'ignore' }).status === 0;

if (!hasJava) {
  fail(
    'No Java found, so Gradle cannot run.\n\n' +
      'Easiest fix: open the android/ folder in Android Studio and build from there —\n' +
      'it bundles its own JDK. Or point JAVA_HOME at Android Studio\'s runtime:\n\n' +
      '  macOS   export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"\n' +
      '  Linux   export JAVA_HOME="$HOME/android-studio/jbr"\n' +
      '  Windows setx JAVA_HOME "C:\\Program Files\\Android\\Android Studio\\jbr"\n\n' +
      'See ANDROID.md for the full walkthrough.'
  );
}

const sdkConfigured =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  fs.existsSync(path.join(ANDROID, 'local.properties'));

if (!sdkConfigured) {
  console.warn(
    '\nHeads up: no ANDROID_HOME and no android/local.properties.\n' +
      'If Gradle says "SDK location not found", see the troubleshooting table in ANDROID.md.\n'
  );
}

const args = process.argv.slice(2);
if (args.length === 0) fail('Nothing to run. Try: node scripts/gradle.mjs assembleRelease');

console.log(`\ngradlew ${args.join(' ')}  (in android/)\n`);

const result = spawnSync(isWindows ? 'gradlew.bat' : './gradlew', args, {
  cwd: ANDROID,
  stdio: 'inherit',
  shell: isWindows,
});

if (result.status === 0) {
  const outputs = [
    ['APK', 'app/build/outputs/apk/release/app-release.apk'],
    ['APK', 'app/build/outputs/apk/debug/app-debug.apk'],
    ['AAB', 'app/build/outputs/bundle/release/app-release.aab'],
  ];
  for (const [label, relative] of outputs) {
    const full = path.join(ANDROID, relative);
    if (!fs.existsSync(full)) continue;
    const mb = (fs.statSync(full).size / 1024 / 1024).toFixed(1);
    console.log(`\n${label} ready (${mb} MB):\n  ${full}`);
  }
}

process.exit(result.status ?? 1);
