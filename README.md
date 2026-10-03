IT23543096  

# FitFlow 2.0 – IT3060 Lab Exercise 06 app

React Native (Expo SDK 57) app that implements the redesigned FitFlow from the case study.
It runs **in the browser** and **in Android Studio** from one codebase.

## Features (from the case study)
- Quick 3-step onboarding (the redesign targets the 68 % post-onboarding drop-off)
- AI **Daily Flow** card on Home: adaptive plan, "Why this plan?" explanation, Adjust time / intensity / focus, "Not today – show another" (user control over AI)
- **Workout builder** with drag-and-drop (⠿ handle) plus ↑ ↓ buttons, workout player with timer
- **Private circles** (invite codes), feed, cheers, challenges, report / block
- **Camera nutrition logging** (big camera button; photo picker on web; confirm / edit result; manual search; offline)
- **Progress dashboard** with streaks, milestones and celebration animation
- **Settings & privacy**: AI personalisation switch, analytics, sharing switches, export my data, delete account & data, privacy-policy link, health / AI disclaimers
- Offline-first (data kept on device with AsyncStorage), light / dark mode, accessibility labels and 48 px touch targets

> Honest note: the Daily Flow engine (`src/ai/dailyFlow.ts`) and food recognition (`src/ai/foodRecognizer.ts`)
> are lightweight on-device stand-ins so the app runs everywhere. Circles/posts are local demo data.
> The case study's TensorFlow Lite / ML Kit models and Firebase backend are the next step: keep the function
> signatures and swap the bodies.

Demo tip: on web, a photo whose file name contains a food word (e.g. `rice_and_curry.jpg`) is recognised as that food; other photos get generic suggestions.

## Requirements
- Node.js 20 or newer (tested with 22) and npm
- For Android: Android Studio (latest), Android SDK Platform 36, JDK 17 (Android Studio's bundled JDK is fine), an emulator or USB-debugging phone

## 1. Run in the browser
```bash
npm install
npm run web            # dev server, opens http://localhost:8081
# or a static build:
npm run build:web      # outputs ./dist  (host it anywhere, or: npm run serve:web)
```
Camera button on web opens a file picker (browsers do not give Expo's picker a live camera).

## 2. Run in Android Studio
```bash
npm install
```
**Option A (simplest)** – one command builds, installs on the emulator / phone and starts Metro:
```bash
npm run android:debug
```
**Option B (Android Studio)**
1. Start Metro in a terminal: `npx expo start`
2. Android Studio → **Open** → select the `android/` folder → wait for Gradle sync
3. Pick an emulator / device → press **Run ▶**
(Debug builds load the JavaScript from Metro, so keep step 1 running. Emulator reaches your PC at 10.0.2.2.)

If Android Studio asks for the SDK path, create `android/local.properties` with `sdk.dir=/path/to/Android/Sdk`.

## 3. Release build (Lab 06 Activity 1)
Create an upload keystore once (keep it out of Git):
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore fitflow-upload.keystore -alias fitflow-upload -keyalg RSA -keysize 4096 -validity 10000
```
Add to `~/.gradle/gradle.properties`:
```
FITFLOW_UPLOAD_STORE_FILE=/secure/path/fitflow-upload.keystore
FITFLOW_UPLOAD_KEY_ALIAS=fitflow-upload
FITFLOW_UPLOAD_STORE_PASSWORD=********
FITFLOW_UPLOAD_KEY_PASSWORD=********
```
Then:
```bash
npm run android:release:aab    # android/app/build/outputs/bundle/release/app-release.aab  (Play Console)
npm run android:release:apk    # android/app/build/outputs/apk/release/app-release.apk
```
Release builds have R8 minification, resource shrinking and Hermes enabled (`android/gradle.properties`).
Without the keystore properties the release build falls back to the debug key so it still builds locally – do not upload that to Play.

Version numbers live in `app.json` (`version` 2.0.0, `android.versionCode` 20, `ios.buildNumber` 20). Bump `versionCode` in BOTH `app.json` and `android/app/build.gradle` before each Play upload.

> Do not run `expo prebuild` again for Android unless you want to regenerate `android/`: it overwrites the signing and R8 settings in `android/app/build.gradle`.

## 4. iOS (needs a Mac)
```bash
npx expo prebuild --platform ios
cd ios && pod install && open FitFlow.xcworkspace
```

## Privacy policy page
`docs/privacy.html` is a ready page. Publish it with GitHub Pages (Settings → Pages → /docs) and put the URL in `src/config.ts`.

## Project layout
```
App.tsx                   tabs + onboarding gate
src/screens/              Home, Workouts, Community, Nutrition, Me, Onboarding
src/ai/                   dailyFlow.ts (recommender), foodRecognizer.ts
src/components/           UI kit, DragList, WorkoutPlayer
src/store.tsx             persisted app state + streak / milestone helpers
src/data/                 exercises, foods, seed circles & challenges
android/                  generated Android Studio project (release signing + R8 configured)
docs/privacy.html         privacy policy
```
