<div align="center">
  
  # 🚀 Smart Campaign Manager
  
  **An advanced, AI-powered outreach automation platform designed for modern training institutes and businesses.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT_4o_mini-412991?style=for-the-badge&logo=openai)](https://openai.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

  *Automate your lead generation, craft hyper-personalized messages, and close more deals in seconds.*

</div>

<br />

## ✨ Features

- 🚀 **Bulk AI Generation:** Upload a CSV of contacts and instantly generate hundreds of highly personalized outreach messages using OpenAI's `gpt-4o-mini`.
- 📊 **Intelligent Dashboard:** A beautifully designed, gamified analytics dashboard to track your outreach success, campaign statuses, and API costs.
- 🎨 **Multi-Theme Support:** Toggle seamlessly between Light and Dark mode for an optimal viewing experience.
- 🌍 **Multi-Channel & Multi-Language:** Generate messages perfectly tailored for **Email, LinkedIn, or WhatsApp**, in languages including English, Hindi, and Marathi.
- 🛡️ **Robust Authentication:** Secure JWT-based authentication backed by Supabase.
- 🐳 **One-Click Deployment:** Fully containerized with Docker for effortless hosting on AWS, Render, or any VPS.

---

## 🏗️ Architecture Stack

### Frontend (User Interface)
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 & Shadcn UI
- **Icons:** Lucide React
- **State Management:** React Context API

### Backend (API & AI)
- **Framework:** Python FastAPI (High-performance async API)
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** OpenAI API

---

## 🚀 Getting Started (Local Development)

Want to run this project on your own computer? Follow these steps:

### 1. Prerequisites
- **Node.js** (v20 or higher)
- **Python** (v3.11 or higher)
- A **Supabase** account (Free tier)
- An **OpenAI** API Key

### 2. Clone the Repository
```bash
git clone https://github.com/PrathameshBhagwat/smart-campaign-manager.git
cd smart-campaign-manager
```

### 3. Setup the Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create your virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Copy the environment file and add your keys:
   ```bash
   cp .env.example .env
   # Open .env and add your SUPABASE_URL, SUPABASE_SERVICE_KEY, and OPENAI_API_KEY
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The API will be running at `http://localhost:8000`*

### 4. Setup the Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Configure your environment variables:
   Create a `.env.local` file and add:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The application will be running at `http://localhost:3000`*

---

## 🐳 Docker Deployment (Production)

To deploy this platform live to a server (like AWS EC2), you don't need to install Python or Node.js. Just use Docker!

1. Clone the repository on your server.
2. Create a `.env` file in the **root** folder containing all your keys:
   ```env
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   OPENAI_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Run the master Docker command:
   ```bash
   sudo docker compose up -d --build
   ```
*Docker will automatically build the standalone Next.js image, set up the FastAPI server, and bind them together!*

---

## 📖 How to Use the Platform (Workflow)

1. **Log In:** Use your secure Supabase credentials to access the dashboard.
2. **Create a Campaign:** Go to the Campaigns tab and click "New Campaign". Give it a name and select your target industry.
3. **Upload Contacts:** Upload a standard `.csv` file containing your leads (must include columns like Name, Company, Role, etc.).
4. **Generate Messages:** Select your uploaded contacts and click "Bulk Generate". Choose your desired tone, language, and platform (e.g., Professional, Hindi, LinkedIn).
5. **Review & Send:** Watch the AI craft unique messages for every single lead. Review the outputs and copy them directly to your clipboard!

---

<div align="center">
  <b>Built with ❤️ by Prathamesh Bhagwat</b>
</div>
