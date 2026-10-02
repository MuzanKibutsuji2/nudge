# Nudge on Android

Nudge is an Expo (React Native) app, so the Android project isn't hand-written — it's
**generated** from `app.json` by a command called `prebuild`. That has already been run,
and the result is committed in [`android/`](android/). It is a normal Gradle project:
open it in Android Studio and press Run.

This file is the whole path from a fresh clone to an app on a phone.

| | |
|---|---|
| App name | Nudge |
| Application ID | `app.nudge.mvp` |
| Version | 1.0.0 (versionCode 1) |
| Runs on | Android 7.0 and newer (minSdk 24) |
| Built against | SDK 36 (compile + target) |
| Permissions | `VIBRATE` only, in a release build |

---

## What you need

| Tool | Version | How to get it |
|---|---|---|
| Node.js | 20 or newer | [nodejs.org](https://nodejs.org) — check with `node -v` |
| Android Studio | latest stable | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK | 17+ (21 recommended) | **Already inside Android Studio** — don't install one separately unless you build from the terminal |
| Android SDK Platform 36 | — | SDK Manager, see below |
| Android SDK Build-Tools 36.0.0 | — | SDK Manager |
| Gradle 9.3.1 | — | downloads itself on first sync, nothing to install |

Set aside roughly **8 GB of disk** and **20 minutes** for the first build. Later builds
take seconds.

---

## Step 1 — get the code

```bash
git clone https://github.com/MuzanKibutsuji2/nudge.git
cd nudge
npm install
```

`npm install` is not optional, even though you'll build in Android Studio. The Gradle
build reads `node_modules/` to find the native code for React Native, Expo, AsyncStorage
and the rest. If you skip it, the Gradle sync fails immediately.

---

## Step 2 — the one-minute look (optional, no Android Studio)

If you just want Nudge on your phone right now:

```bash
npm start
```

Install **Expo Go** from the Play Store, scan the QR code with it, and the app loads over
Wi-Fi. Nothing is installed permanently and nothing is signed — it's a preview, not the
app. Use it to check the design while you set up the real build.

---

## Step 3 — Android Studio (the real build)

### 3a. Install the SDK pieces

Open Android Studio → **More Actions ▸ SDK Manager** (or **Settings ▸ Languages & Frameworks
▸ Android SDK**).

- **SDK Platforms** tab → tick **Android 16 (API 36)**.
- **SDK Tools** tab → tick **Android SDK Build-Tools 36**, **Android SDK Platform-Tools**,
  and, if you want an emulator, **Android Emulator**.
- Apply, let it download.

### 3b. Open the right folder

**File ▸ Open** → select the **`android`** folder inside the repo — *not* the repo root.
The repo root is a JavaScript project; Android Studio won't know what to do with it.

Android Studio will say "Gradle sync in progress". The first sync downloads Gradle 9.3.1
and every dependency, so it can take 5–15 minutes. Let it finish before touching anything.

> If it asks about the Gradle JDK, pick the bundled **jbr-21** / "Android Studio default JDK".

### 3c. Pick something to run on

Either:

- **Emulator** — Device Manager ▸ Create Virtual Device ▸ Pixel 7 ▸ system image API 36.
- **Your phone** — Settings ▸ About phone ▸ tap "Build number" seven times, then
  Developer options ▸ **USB debugging** on. Plug it in and accept the prompt.

### 3d. Start Metro, then Run

A *debug* build doesn't contain the JavaScript — it downloads it from a local dev server
while running, so you get instant reloads. In a terminal, in the repo root:

```bash
npm start
```

Leave it running. Now press **Run ▶** in Android Studio.

On a USB phone, if the app opens to a red "could not connect to development server"
screen, run `adb reverse tcp:8081 tcp:8081` and reload — that forwards the dev server to
the phone.

### The terminal shortcut

Everything in 3d is also one command, which builds, installs, launches *and* starts Metro:

```bash
npm run android
```

It needs the Android SDK on your `PATH`, so Android Studio's Run button is the safer first
attempt.

---

## Step 4 — an APK you can send to someone

A *release* build has the JavaScript baked in, so it runs with no laptop, no Wi-Fi, no
Metro — the real thing.

```bash
npm run android:apk
```

The APK lands at:

```
android/app/build/outputs/apk/release/app-release.apk
```

Install it on a connected phone with `adb install -r <that path>`, or just send the file —
the person installing it has to allow "install from unknown sources" once.

> **It's signed with the shared debug key.** That's fine for giving it to friends and
> absolutely not fine for Google Play. Step 5 covers a real key.

In Android Studio the same thing lives under **Build ▸ Generate Signed App Bundle / APK**,
which walks you through making a key at the same time.

---

## Step 5 — publishing to Google Play

Do these in order, before the first upload.

1. **Choose the permanent application ID.** `app.nudge.mvp` is a placeholder and it can
   never be changed once published. Edit `app.json`:

   ```json
   "android": { "package": "com.yourname.nudge" }
   ```

   then `npm run android:regen` to rewrite `android/`.

2. **Make your own upload key** (keep it safe — losing it means you can't update the app):

   ```bash
   keytool -genkey -v -keystore nudge-upload.keystore \
     -alias nudge -keyalg RSA -keysize 2048 -validity 10000
   ```

   Store it **outside the repo**, and put the passwords in your personal
   `~/.gradle/gradle.properties`, never in a committed file.

3. **Build an app bundle** (Play wants `.aab`, not `.apk`):

   ```bash
   npm run android:aab
   ```

   → `android/app/build/outputs/bundle/release/app-release.aab`

4. **Bump `versionCode`** in `app.json` for every upload (1 → 2 → 3…) and regenerate.

5. **Data safety form.** Nudge collects nothing and sends nothing anywhere, so you can
   honestly answer "no data collected". You still need a privacy policy URL; a one-page
   statement saying everything stays on the device is enough.

### Dropping the last two permissions

A release build declares `INTERNET` and `SYSTEM_ALERT_WINDOW`. Nudge never uses either —
they exist so that *debug* builds can reach Metro and draw the dev overlay. To remove them
from the store build, add them to `blockedPermissions` in `app.json`:

```json
"blockedPermissions": [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.INTERNET",
  "android.permission.SYSTEM_ALERT_WINDOW"
]
```

Then `npm run android:regen` and **build a debug build once to confirm it still runs** —
removing `INTERNET` stops Metro from loading if the manifest merge goes the wrong way on
your setup. Keep it only if the debug build survives.

---

## Step 6 — if your laptop can't handle it

Expo can build on their machines instead. No Android Studio, no SDK, no Gradle.

```bash
npm install -g eas-cli
eas login                      # free Expo account
eas build --platform android --profile preview
```

You get a download link to an installable APK in 10–20 minutes. `eas.json` in this repo
already defines `preview` (APK, for sharing) and `production` (AAB, for Play).

---

## Step 7 — when to regenerate `android/`

`android/` is generated. Re-run:

```bash
npm run android:regen
```

after you change app icons, the splash screen, the app name, the package name,
permissions, or anything else under `android` in `app.json` — and after adding a library
with native code. The command **overwrites the folder**, so anything you edited by hand in
there is lost. Put native changes in `app.json` or a config plugin instead, and they'll
survive.

Changing only JavaScript/TypeScript needs no rebuild — save the file and the running app
reloads.

---

## Troubleshooting

| What you see | What to do |
|---|---|
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=/Users/you/Library/Android/sdk` (macOS), `sdk.dir=C\:\\Users\\you\\AppData\\Local\\Android\\Sdk` (Windows), or `sdk.dir=/home/you/Android/Sdk` (Linux). Opening the folder in Android Studio usually writes this for you. |
| `Unsupported class file major version` / Java version errors | Settings ▸ Build, Execution, Deployment ▸ Build Tools ▸ Gradle ▸ **Gradle JDK = jbr-21**. |
| `Could not connect to development server` | `npm start` must be running. On USB: `adb reverse tcp:8081 tcp:8081`. On Wi-Fi: same network, no VPN. |
| `node: command not found` during a Gradle build | Android Studio didn't inherit your `PATH`. On macOS launch it from a terminal with `open -a "Android Studio"`, or add `nodeExecutableAndArgs=/usr/local/bin/node` to `android/gradle.properties`. |
| `NDK not configured` / asks for 27.1.12297006 | SDK Manager ▸ SDK Tools ▸ tick **Show Package Details** ▸ install NDK **27.1.12297006**. |
| Gradle sync fails right after cloning | You skipped `npm install`. Run it in the repo root and sync again. |
| Build worked yesterday, fails today | `npm run android:clean`, then rebuild. |
| Emulator is unusably slow | Use a physical phone, or enable hardware acceleration (Intel HAXM/WHPX on Windows, KVM on Linux). |
| App installs but shows a white screen | Metro probably isn't running, or it's serving a stale bundle: stop it, `npx expo start --clear`. |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | A debug build and a release build of the same app ID can't coexist. `adb uninstall app.nudge.mvp` first. |

---

## Don't commit these

`android/.gitignore` already covers most of it, but to be explicit — keep out of git:

- `android/local.properties` (your machine's SDK path)
- `android/app/build/`, `android/build/`, `android/.gradle/` (build output)
- `*.keystore`, `*.jks`, and anything holding a signing password

The debug keystore at `android/app/debug.keystore` **is** committed on purpose: it's the
public, shared one every Android project uses, and it only signs debug builds.

---

## What was not done here

The Android project was generated and committed, but it has **never been compiled** — the
environment it was generated in has no JDK and no Android SDK, so the first real Gradle
build will be yours. Everything above is the standard, documented path for an Expo project
of this shape; if something in it doesn't match what you see, trust Android Studio and tell
me what it said.
