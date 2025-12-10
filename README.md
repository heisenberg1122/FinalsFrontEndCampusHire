# Campus Hire Frontend (FinalsFrontEndCampusHire)

This is the mobile frontend for the **Campus Hire** recruitment platform. It is built using **React Native** (Expo) and serves as the user interface for job seekers and recruiters, connecting to the [Campus Hire Backend](https://github.com/heisenberg1122/FinalsBackEndCampusHire).

## 🚀 Features

- **User Authentication**: Login and Registration screens integrated with the backend API.
- **Job Board**: Browse, search, and filter job listings.
- **Application System**: Users can view job details and submit applications.
- **Profile Management**: View and edit user profiles and upload resume details.
- **Responsive Design**: Optimized for mobile devices (iOS and Android).

## 🛠️ Tech Stack

- **Framework**: React Native
- **Platform**: Expo (Managed Workflow)
- **Language**: JavaScript
- **Navigation**: React Navigation
- **HTTP Client**: Axios / Fetch API (for backend communication)

## 📂 Project Structure

- `src/` - Contains the main source code (screens, components, context, services).
- `assets/` - Images and static resources.
- `App.js` - Main entry point of the application.
- `app.json` - Configuration file for Expo.
- `package.json` - Project dependencies and scripts.

## 📱 Getting Started

Follow these instructions to set up the project on your local machine for development.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app installed on your physical device (iOS/Android).

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/heisenberg1122/FinalsFrontEndCampusHire.git](https://github.com/heisenberg1122/FinalsFrontEndCampusHire.git)
   cd FinalsFrontEndCampusHire
Install Dependencies

Bash

npm install
Configure Backend Connection Note: Ensure your Django backend is running. If you are testing on a physical device, you must update your API base URL in the code to use your computer's local IP address (e.g., http://192.168.x.x:8000) instead of localhost or 127.0.0.1.

Start the Development Server

Bash

npx expo start
Run on Device

Physical Device: Open the Expo Go app and scan the QR code displayed in your terminal.

Emulator: Press a in the terminal to run on Android Emulator, or i for iOS Simulator.

🤝 Contributors
- github.com/heisenberg1122
- github.combrad-git03
- github.com/NicoleAndreaBolus

License
This project is for academic/final project purposes.
