# 🚀 AI-Powered Personalized Learning Path Recommender (LearnPath AI)

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **LearnPath AI** is an intelligent, adaptive EdTech SaaS platform designed to generate dynamic, personalized learning roadmaps. It dynamically tailors curriculum modules, skill gap analytics, progress telemetry, and resource recommendations based on each learner's unique career goal, experience level, study schedule, and real-time proficiency.

---

## 🌟 Key Features

### 1. 🎯 Dynamic Domain-Tailored Learning Roadmaps
- Automatically constructs multi-phase curriculum modules matching the user's specific target career objective:
  - **Full Stack Web Development** (HTML5/CSS3, JavaScript ES6+, React 18, Node.js REST APIs, PostgreSQL, Vercel CI/CD)
  - **Data Science & Analytics** (Python Wrangling, Pandas, Seaborn EDA, Scikit-Learn ML Pipelines, PyTorch, Docker APIs)
  - **AI / ML & Prompt Engineering** (NumPy Linear Algebra, Supervised ML, PyTorch Architectures, LangChain RAG Pipelines, Autonomous Agents)
  - **Cybersecurity Analyst** (Networking Protocols, Linux Admin, Wireshark Packet Analysis, Splunk SIEM, Incident Response)
  - **Technical Placement Preparation** (Data Structures & Algorithms, Dynamic Programming, CS Fundamentals, System Design, FAANG Mock Screens)
  - **AI Startup MVP Builder** (Product PRDs, Vector DB Engine, Stripe Monetization, Docker Infrastructure, Product Hunt Launch)
  - **Project & Engineering Leadership** (Agile Scrum, Technical Stakeholder Communication, Cloud System Architecture, Product Strategy)
  - **Junior Coders (Ages 10–16)** (Scratch Block Logic, Python Foundations, Pygame Studio, Web Design)

### 2. 🔐 Multi-User Authentication & Database Persistence
- Full **Sign-Up & Log-In** system powered by a relational **SQLite database (`learnpath.db`)**.
- Features safe, collision-free user ID generation (`user_{name}_{hash}`) and case-insensitive email matching.
- Automatically saves learner profiles, goal selections, ratings, and milestone progress permanently.

### 3. 📝 Mandatory New User Questionnaire Wizard
- First-time users are guided through an interactive **5-step Goal & Skill Setup Wizard** to define their career plan, experience level, weekly schedule, and resource preferences before landing on their dashboard.
- Returning users bypass setup and navigate **directly to their customized Dashboard**.

### 4. ⚡ Adaptive Skill Gap & Readiness Analytics
- Real-time comparison between user skill proficiencies and benchmark industry requirements.
- Computes overall goal readiness percentages, identifies strong vs weak areas, and calculates target gaps to accelerate career transition.

### 5. 🔗 Authentic External Platform Integrations
- Every course, hands-on lab, article, and project links directly to **verified, official learning documentation**:
  - [MDN Web Docs](https://developer.mozilla.org/), [React.dev](https://react.dev/), [Kaggle Learn](https://www.kaggle.com/learn/), [PyTorch Tutorials](https://pytorch.org/tutorials/), [Scikit-Learn Docs](https://scikit-learn.org/), [TryHackMe](https://tryhackme.com/), [GeeksforGeeks](https://www.geeksforgeeks.org/), [LeetCode](https://leetcode.com/), [MIT Scratch](https://scratch.mit.edu/).

### 6. 🔔 Interactive Notifications Hub
- Header notification popover menu with live unread badge counters.
- Delivers milestone alerts (Goal Activation, AI Recommendations, Quiz Unlock, Skill Opportunities) with direct one-click navigation to application sections.

### 7. 🤖 AI Learning Assistant & Adaptive Assessments
- Embedded AI chat mentor with context-aware guidance.
- Interactive milestone quizzes with dynamic scoring and recommendations based on assessment results.

### 8. 🌗 Day/Night Theme Customization
- One-click day (light) and night (dark) mode toggle with responsive UI styling across all devices.

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────┐
│              LearnPath AI Frontend (React 18)           │
│    Vite 5 • Lucide Icons • Dynamic CSS • Responsive UI  │
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON)
┌────────────────────────────▼────────────────────────────┐
│            LearnPath AI Backend (FastAPI + Uvicorn)     │
│   Weighted Recommender • Pydantic v2 • Goal Generator   │
└────────────────────────────┬────────────────────────────┘
                             │ SQLite Connector
┌────────────────────────────▼────────────────────────────┐
│               Relational Database (SQLite3)            │
│   users • user_skills • resources • learning_paths      │
└─────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite 5, Lucide React Icons, Custom Modular CSS
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Database**: Relational SQLite3 (`learnpath.db`) with auto-migration schema checks

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.0 or higher (with npm)
- **Git**: Installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/sahilgautam05/AI-Powered-Personalized-Learning-Path-Recommender.git
cd AI-Powered-Personalized-Learning-Path-Recommender
```

### 2. Backend Setup (FastAPI)
```bash
# Install Python dependencies (FastAPI, Uvicorn, Pydantic, HTTPX)
pip install fastapi uvicorn pydantic httpx

# Start the FastAPI backend server
python backend/main.py
```
> The backend server will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup (React + Vite)
In a new terminal window:
```bash
cd frontend

# Install Node modules
npm install

# Run Vite production build
npm run build

# Or run the development server
npm run dev
```

---

## 📡 API Endpoint Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account with unique ID generation |
| `POST` | `/api/auth/login` | Authenticate user credentials & load profile |
| `POST` | `/api/profile` | Save/update learner profile, skills, & target goal |
| `GET` | `/api/profile/{user_id}` | Fetch profile details by user ID |
| `POST` | `/api/recommendations` | Get weighted AI resource recommendations |
| `POST` | `/api/learning-path` | Generate goal-tailored multi-phase learning path |
| `POST` | `/api/skill-gap` | Calculate skill gap matrix & target readiness |
| `GET` | `/api/notifications` | Fetch user notification items & milestone alerts |
| `GET` | `/api/assessment/{id}` | Fetch quiz questions for a milestone module |
| `POST` | `/api/assessment` | Evaluate quiz responses and adjust learning path |
| `POST` | `/api/chat` | AI Learning Assistant conversational endpoint |
| `GET` | `/api/progress` | Retrieve learner progress & analytics data |

---

## 📁 Repository Structure

```text
AI-Powered-Personalized-Learning-Path-Recommender/
├── backend/
│   ├── main.py              # FastAPI application entry point & CORS
│   ├── database.py          # SQLite schema initialization & seeding
│   ├── models.py            # Pydantic data schemas
│   ├── routes.py            # REST API endpoints & business logic
│   ├── recommender.py       # Multi-attribute recommendation engine
│   └── ai_service.py        # Conversational AI assistant service
├── frontend/
│   ├── dist/                # Production static assets
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, ResourceModal, Cards
│   │   ├── pages/           # Dashboard, Onboarding, Explore, Profile, etc.
│   │   ├── services/        # API fetch abstractions
│   │   ├── App.jsx          # Primary router & state management
│   │   └── main.jsx         # React application entry point
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more details.

---

## 👤 Author

**Sahil Gautam**  
- GitHub: [@sahilgautam05](https://github.com/sahilgautam05)  
- Project Repository: [AI-Powered-Personalized-Learning-Path-Recommender](https://github.com/sahilgautam05/AI-Powered-Personalized-Learning-Path-Recommender.git)
