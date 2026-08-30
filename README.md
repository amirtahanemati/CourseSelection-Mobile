<div align="center">

# 📅 Course Selection

**A mobile app for building and visualizing your weekly university course schedule**

Built with Expo · React Native · TypeScript

[![Expo](https://img.shields.io/badge/Expo-~54-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://github.com/pmndrs/zustand)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-informational)]()

[Live Web Demo](https://course-selection-rho.vercel.app/) · [Report a Bug](https://github.com/amirtahanemati/CourseSelection-Mobile/issues) · [Request a Feature](https://github.com/amirtahanemati/CourseSelection-Mobile/issues)

</div>

---

## 📖 About the Project

**Course Selection** is a mobile (and web) app that helps students enter their courses for the term, visualize their weekly class schedule in a clean timetable view, automatically catch scheduling conflicts between classes, and export the final schedule as an image or PDF to share. The app's UI is fully in Persian with right-to-left (RTL) support.

The project is built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/), and runs on Android, iOS, and the web (via React Native Web).

## ✨ Features

- ➕ **Course management** — add, edit, and delete courses with full details: course code, name, professor, and number of units
- 🕒 **Multiple sessions** — define several class sessions per course, each with a day of the week and start/end time
- ⚠️ **Automatic conflict detection** — warns you when a new or edited session overlaps with an existing course
- 📝 **Exam info** — optionally record the exam date and time for each course
- 🗓️ **Visual weekly timeline** — a colorful, graphical view of the week's schedule, similar to a university registration timetable
- 🖼️ **Image export** — capture a high-quality PNG snapshot of the weekly schedule for quick sharing
- 📄 **PDF export** — generate a printable PDF of the weekly schedule
- 💾 **Backup / restore** — export and import all courses as a JSON file
- 🌗 **Dark / light theme** — theme is toggleable and persisted automatically
- 📴 **Offline-first** — all data is stored locally on the device with AsyncStorage; no internet connection required
- 🌍 **Full RTL support** — Persian UI with right-to-left layout throughout
- 📱💻 **Cross-platform** — runs on Android, iOS, and the web from a single codebase

## 🧱 Tech Stack

| Area                   | Technology                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Framework              | [Expo](https://expo.dev) `~54` + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)                  |
| Language               | [React Native](https://reactnative.dev) `0.81` / [React](https://react.dev) `19` + [TypeScript](https://www.typescriptlang.org/) |
| State management       | [Zustand](https://github.com/pmndrs/zustand) with the `persist` middleware                                                       |
| Local storage          | `@react-native-async-storage/async-storage`                                                                                      |
| Styling                | NativeWind / Tailwind CSS                                                                                                        |
| Icons                  | `lucide-react-native`, `@expo/vector-icons`                                                                                      |
| Image export           | `react-native-view-shot`                                                                                                         |
| PDF export & sharing   | `expo-print`, `expo-sharing`                                                                                                     |
| File import/export     | `expo-document-picker`, `expo-file-system`                                                                                       |
| Link-share compression | `lz-string`                                                                                                                      |
| Notifications          | `react-native-toast-message`                                                                                                     |
| Navigation             | `@react-navigation/native`, `@react-navigation/bottom-tabs`                                                                      |

## 📂 Project Structure

```
CourseSelection-Mobile/
├── app/                        # Screens and routes (Expo Router)
│   ├── _layout.tsx             # Global layout and providers
│   └── index.tsx                # Main app screen
├── components/
│   ├── course/
│   │   ├── MobileTimeline.tsx       # Weekly timeline view on mobile
│   │   └── ExportTimelineGrid.tsx   # Grid used for image/PDF export
│   ├── form/
│   │   └── CourseForm.tsx           # Add/edit course form
│   ├── layout/
│   │   ├── Topbar.tsx
│   │   └── Footer.tsx
│   └── ui/                          # Shared UI components
│       ├── BottomSheet.tsx
│       ├── ConfirmModal.tsx
│       ├── DatePickerModal.tsx / TimePickerModal.tsx / DayPickerModal.tsx
│       ├── ExportModal.tsx          # Export/import modal (JSON, PDF, image)
│       ├── WelcomeModal.tsx / CreditsModal.tsx
│       └── ThemeToggle.tsx
├── store/
│   └── useCourseStore.ts       # Zustand store (courses, theme, selection)
├── types/
│   └── index.ts                 # Course and Session types
├── utils/
│   └── helpers.ts               # Helper functions (time, conflicts, color, export filenames)
├── assets/                      # Fonts and images
├── app.json                     # Expo configuration
└── package.json
```

## 🗂️ Data Model

```ts
interface Session {
  day: string; // Day of the week
  start: string; // Start time, e.g. "08:00"
  end: string; // End time, e.g. "09:30"
}

interface Course {
  id: number;
  code: string; // Course code
  name: string; // Course name
  professor: string; // Professor's name
  units: number; // Number of units
  exam_date: string | null; // Exam date (optional)
  exam_time: string | null; // Exam time (optional)
  sessions: Session[]; // Class sessions
}
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (bundled with Node)
- For mobile testing: the [Expo Go](https://expo.dev/go) app, or an Android/iOS simulator

### Installation

```bash
# Clone the repository
git clone https://github.com/amirtahanemati/CourseSelection-Mobile.git
cd CourseSelection-Mobile

# Install dependencies
npm install
```

### Running the app

```bash
# Start the Expo development server
npx expo start

# Or run directly on a specific platform
npm run android   # run on Android
npm run ios       # run on iOS
npm run web       # run in the browser
```

After running `npx expo start`, you can test the app by scanning the QR code with Expo Go, or by running it on an Android/iOS simulator.

### Linting

```bash
npm run lint
```

## 🖥️ Web Version

This project also runs in the browser via React Native Web. You can try the deployed web version here:

🔗 **[course-selection-rho.vercel.app](https://course-selection-rho.vercel.app/)**

## 🤝 Developers

|                      |                                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reza Mohamadnia**  | [GitHub](https://github.com/ItsReZNuM) · [LinkedIn](https://www.linkedin.com/in/reza-mohamadnia-73728834b/) · [Instagram](https://www.instagram.com/itsreznum/) · [Telegram](https://t.me/ItsReZNuM) |
| **Amir Taha Nemati** | [GitHub](https://github.com/amirtahanemati) · [LinkedIn](https://www.linkedin.com/in/amirtahanemati) · [Instagram](https://instagram.com/amirtahanemati) · [Telegram](https://t.me/nematidev)        |

If you find this project useful, please consider giving it a ⭐!

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
