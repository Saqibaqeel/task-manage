# TaskFlow

TaskFlow is a task-management app built with React Native and Expo. Create and organize tasks, track their status and priority, and import or export tasks as CSV files.

## Features

- Create and manage tasks with categories, priorities, statuses, and dates.
- Search, filter, and sort tasks.
- Import tasks from a CSV file and export tasks to CSV.
- Choose between light and dark themes.

## Prerequisites

- Node.js and npm.
- For Android: Android Studio with the Android SDK and an emulator, or a connected Android device.
- For iOS: macOS with Xcode and an iOS simulator or connected device.

## Setup

From the project directory, install the dependencies:

```sh
npm install
```

## Run the app

Start the Expo development server:

 npx expo run:android

Use the Expo CLI prompts to open the app in an available development build or emulator.

You can also start a platform directly:

```sh
npm run android
npm run ios
npm run web
```

`npm run ios` requires macOS and Xcode. The Android and iOS commands build and run the native app; the web command starts the web version.

## Project structure

- `App.js` — app providers and root navigation.
- `src/features/` — onboarding and dashboard screens, including task creation, CSV import, and export.
- `src/components/` — reusable UI components.
- `src/services/` — task and storage services.
- `assets/` — app images and icons.

## Expo

This project uses Expo SDK 57. See the [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/).
