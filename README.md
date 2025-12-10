# Campus Hire Backend (FinalsBackEndCampusHire)

This is the backend repository for the **Campus Hire** recruitment platform. It provides the server-side logic, database management, and APIs required to handle user authentication, job postings, and the recruitment process.

Built with **Python** and **Django**.

## 🚀 Features

- **User Management**: Handles user registration, authentication, and profiles (via `userapp` and `registration`).
- **Recruitment Logic**: Manages job listings, applications, and recruitment workflows (via `job_recruitmentapp`).
- **Media Management**: Support for uploading and serving media files (resumes, profile pictures).
- **Admin Interface**: Built-in Django admin for managing database records.

## 🛠️ Tech Stack

- **Framework**: Django (Python)
- **Database**: SQLite (default for development)
- **Dependencies**: Managed via `requirements.txt`

## 📂 Project Structure

- `job_recruitment/` - Main project configuration (settings, URLs, WSGI).
- `job_recruitmentapp/` - Core application containing logic for job posts and hiring.
- `userapp/` - Application handling user-related models and views.
- `registration/` - Custom registration logic and flows.
- `media/` - Directory for user-uploaded files.
- `manage.py` - Django's command-line utility for administrative tasks.

## 💻 Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Python 3.x](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/installation/)
- [Git](https://git-scm.com/downloads)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/heisenberg1122/FinalsBackEndCampusHire.git](https://github.com/heisenberg1122/FinalsBackEndCampusHire.git)
   cd FinalsBackEndCampusHire
Create a Virtual Environment It is recommended to use a virtual environment to manage dependencies.

Windows:

Bash

python -m venv venv
venv\Scripts\activate
macOS / Linux:

Bash

python3 -m venv venv
source venv/bin/activate
Install Dependencies

Bash

pip install -r requirements.txt
Apply Database Migrations Initialize the database schema.

Bash

python manage.py makemigrations
python manage.py migrate
Create a Superuser (Optional) Access the admin panel by creating an admin account.

Bash

python manage.py createsuperuser
Run the Development Server

Bash

python manage.py runserver
The server will start at http://127.0.0.1:8000/.

🤝 Contributors
heisenberg1122

brad-git03

NicoleAndreaBolus

License
This project is for academic/final project purposes.


---

### 2. Frontend `README.md`
**Where to put this:** Create a file named `README.md` in your **FinalsFrontEndCampusHire** folder and paste this code.

```markdown
# Campus Hire Frontend (FinalsFrontEndCampusHire)

This is the mobile frontend for the **Campus Hire** recruitment platform. It is built using **React Native** (Expo) and is designed to interact with the [Campus Hire Backend](https://github.com/heisenberg1122/FinalsBackEndCampusHire).

## 🚀 Features

- **User Interface**: Mobile-responsive screens for job seekers and recruiters.
- **Authentication**: Login and Registration screens integrated with the backend API.
- **Job Browsing**: Interface to view and apply for job listings.
- **Profile Management**: User profile viewing and editing.

## 🛠️ Tech Stack

- **Framework**: React Native
- **Platform**: Expo (Managed Workflow)
- **Language**: JavaScript
- **Navigation**: React Navigation

## 📂 Project Structure

- `src/` - Contains the main source code (components, screens, services).
- `App.js` - Main entry point of the application.
- `app.json` - Configuration file for Expo.
- `index.js` - App registry entry.

## 📱 Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

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
Configure Backend URL Note: Ensure your backend is running. If testing on a physical device, use your computer's local IP address (e.g., http://192.168.1.5:8000) in your API service files instead of localhost.

Run the Application Start the Expo development server:

Bash

npx expo start
Launch on Device

Physical Device: Scan the QR code shown in the terminal using the Expo Go app.

Emulator: Press a for Android Emulator or i for iOS Simulator in the terminal window.

🤝 Contributors
github.com/heisenberg1122
github.com/brad-git03
github.com/NicoleAndreaBolus

License
This project is for academic/final project purposes.
