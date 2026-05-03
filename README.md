# 🏥 Campus SmartCare

Campus SmartCare is an AI-based smart campus healthcare assistant built for a university environment.

It provides a centralized system for students, doctors, and administrators to manage healthcare interactions including symptom checks, appointments, emergency alerts, and medical records.

---

## 🚀 Features

* 👤 User authentication (Student, Doctor, Admin)
* 🩺 AI-assisted symptom triage
* 📅 Appointment booking & queue management
* 🚨 Emergency alert system
* 📁 Medical record management
* 🧑‍⚕️ Staff/admin dashboards
* 🔐 Secure authentication (JWT + bcrypt)
* 🧠 Input validation with Zod
* 🔒 Encrypted sensitive health data

---

## 🧱 Tech Stack

### Frontend

* React
* Vite
* TypeScript

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### Dev Tools

* Docker (PostgreSQL container)
* Git & GitHub

---

## 📁 Project Structure

```
Campus SmartCare/
├── frontend/        # React + Vite frontend
├── backend/         # Express API, Prisma schema, AI engine
├── docs/            # Documentation and notes
├── docker-compose.yml
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have installed:

* Node.js
* npm
* Docker Desktop
* Git

---

## 🔧 Environment Setup

Copy the example file:

```
cp .env.example .env
```

Then configure your environment variables.

Example:

```
DATABASE_URL="postgresql://smartcare:smartcare@localhost:5432/smartcare?schema=public"

JWT_ACCESS_SECRET="dev-access-secret"
JWT_REFRESH_SECRET="dev-refresh-secret"

ENCRYPTION_KEY="12345678901234567890123456789012"
```

⚠️ Do NOT commit your `.env` file.

---

## 🛠️ Getting Started

### 1. Clone the repository

```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd Campus SmartCare
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Start PostgreSQL (Docker)

```
docker compose up -d
```

---

### 4. Setup database (Prisma)

```
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

---

### 5. Start Backend

```
npm run dev:backend
```

Backend runs at:

```
http://localhost:4000
```

Health check:

```
http://localhost:4000/api/health
```

---

### 6. Start Frontend

Open a new terminal:

```
npm run dev:frontend
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔑 Default Accounts (Seeded)

```
admin@campussmartcare.edu
doctor1@campussmartcare.edu
doctor2@campussmartcare.edu
```

Passwords are set via `.env`.

---

## 🧪 Useful Commands

```
npm run dev:frontend
npm run dev:backend
npm run build
npm test

npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

---

## 🤝 Collaboration Guide

### 1. Pull latest changes

```
git pull origin main
```

### 2. Create a new branch

```
git checkout -b feature/your-feature-name
```

### 3. Make changes and commit

```
git add .
git commit -m "Add your feature"
```

### 4. Push branch

```
git push origin feature/your-feature-name
```

### 5. Open a Pull Request on GitHub

---

## ⚠️ Notes for Contributors

* Do NOT commit `.env`
* Always run migrations after modifying `schema.prisma`
* Restart backend after env changes
* Ensure Docker is running before backend
* Frontend and backend must run in separate terminals

---

## 📌 Current Status

* ✅ Frontend working
* ✅ Backend API working
* ✅ PostgreSQL + Docker working
* ✅ Prisma migrations working
* ✅ Authentication working

---

## 🚀 Future Improvements

* Advanced AI diagnosis system
* Real-time notifications
* Appointment reminders
* Analytics dashboard for admins
* Mobile version
* Deployment (Vercel + Railway)

---

## 👨‍💻 Author

**Abdulhameed Shuaibu**

AI/ML Training Data Specialist | Full Stack Developer

---

## 📜 License

This project is for educational and demonstration purposes.
