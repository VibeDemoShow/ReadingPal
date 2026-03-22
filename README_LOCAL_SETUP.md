# ReadingPal: Local Setup Tutorial

This guide will walk you through how to run your new AI-powered reading app locally on your computer and test it on your devices.

## 1. Prerequisites

You already have the necessary tools installed! 
- **Node.js**: Installed (v24.14.0)
- **Code Editor**: VS Code (currently open)

## 2. Start the Development Server

1. Open a terminal in VS Code (Terminal > New Terminal)
2. Make sure you are in the project folder:
   ```bash
   cd c:\Users\mingl\Dropbox\Xin\projects\reading
   ```
3. **Important for Windows**: Since Node.js was just installed, your current terminal probably doesn't know about it yet. You need to close the terminal pane in VS Code (click the trash can icon) and open a brand new one (Terminal > New Terminal) so it loads the new `PATH`.
4. Start the Expo development server:
   ```bash
   npx expo start
   ```

You will see a QR code appear in your terminal. This is the **Metro Bundler**.

---

## 3. How to View the App

You have three options for testing the app:

### Option A: Test in your Web Browser (Easiest)
While the Metro Bundler is running in your terminal, simply press **`w`** on your keyboard. 
This will compile the app for the web and open it automatically in your default browser at `http://localhost:8081`. 

> [!TIP]
> Use your browser's "Developer Tools" (F12) and toggle the "Device Toolbar" to see how the app looks on different phone screen sizes!

### Option B: Test on your Physical Phone (Recommended)
1. Download the **Expo Go** app on your personal phone:
   - **iOS**: Download from the App Store
   - **Android**: Download from the Google Play Store
2. Make sure your phone and your computer are on the **same Wi-Fi network**.
3. Scan the QR code in your terminal:
   - **iOS**: Open your default Camera app and point it at the QR code. Tap the "Open in Expo Go" notification.
   - **Android**: Open the Expo Go app and tap "Scan QR Code".

### Option C: Test on a Virtual Emulator
If you have Android Studio or Xcode installed:
- Press **`a`** in the terminal to open the Android Emulator
- Press **`i`** in the terminal to open the iOS Simulator

---

## 4. Setting up AI Story Generation (Gemini)

Currently, the app uses beautiful "mock stories" so you can test the UI immediately without an API key. To enable real AI story generation:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open `lib/ai.ts` in your code editor
3. Find line 20: 
   ```typescript
   let GEMINI_API_KEY = '';
   ```
4. Paste your key between the quotes:
   ```typescript
   let GEMINI_API_KEY = 'AIzaSyYourRealKeyHere...';
   ```
5. Save the file. The app will automatically reload and the "Read a New Story!" button will now generate real stories!

> [!CAUTION]  
> Never commit your real API key to GitHub. In a production app, the key would be stored securely in a `.env` file or on a backend server.

---

## Troubleshooting

- **`npx` is not recognized (Windows)**: You must close your current terminal (click the trash can icon) and open a new one (Terminal > New Terminal). If it *still* doesn't work, close VS Code entirely and reopen it. Or to fix instantly in your current window, run: `$env:Path += ";C:\Program Files\nodejs"`
- **QR Code isn't scanning?** Make sure your phone and PC are on the exact same Wi-Fi network. Sometimes VPNs or firewalls block the connection.
- **Port in use?** If it says port 8081 is in use, you can run `npx expo start --port 8082`.
- **App crashed?** Press `r` in the terminal to reload the app, or `shift+R` to clear the cache and reload.
