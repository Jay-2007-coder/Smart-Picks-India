# 📱 Smart Picks India — Mobile Application (Android)

Welcome to the official mobile application for **Smart Picks India**! This is a dedicated React Native / Expo application built specifically for Android users.

---

## 📲 How to Download / Build the APK File

### Option 1: 1-Click APK Download via PWABuilder (Fastest — 1 Minute)

1. Open **[PWABuilder.com](https://www.pwabuilder.com)** in your browser.
2. Paste your live website URL: `https://smart-picks-india.vercel.app/`
3. Click **Start**.
4. Click **Package for Store** → Choose **Android**.
5. Click **Download APK**. 

> 📱 Transfer the downloaded `.apk` file to your Android phone and tap to install!

---

### Option 2: Build Standalone APK via Expo EAS Cloud (Command Line)

1. Open your terminal in this `mobile-app/` folder:
   ```bash
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Login to Expo EAS:
   ```bash
   npx eas-cli login
   ```

4. Trigger the free cloud APK build:
   ```bash
   npx eas build -p android --profile preview
   ```

> ⚙️ Expo's cloud build servers will compile a standalone `.apk` file and display a direct QR code & download link in your terminal when complete (~3-4 minutes).

---

## 🚀 Running the App Locally

To test the app locally on your phone or Android Studio emulator:

```bash
cd mobile-app
npm install
npx expo start
```

Scan the printed QR code using the **Expo Go** app from the Google Play Store!
