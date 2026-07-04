<div align="center">
  
  # Smart Campaign Manager
  
  **A platform for managing outreach campaigns and generating personalized messages.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Groq](https://img.shields.io/badge/Groq-Llama_3-F55036?style=for-the-badge)](https://groq.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

</div>

<br />

## 📖 Overview

Smart Campaign Manager is an outreach automation tool designed to help businesses manage their contact lists and generate customized messages efficiently. By utilizing **Groq AI** (specifically Llama 3 models), the platform processes bulk contact data to generate highly relevant messages for various platforms like Email, LinkedIn, and WhatsApp without manual typing.

---

## ✨ Core Features

- **Bulk Message Generation:** Upload contact lists via CSV files and generate personalized messages in bulk using Groq AI.
- **Multi-Platform Support:** Format messages specifically for Email, LinkedIn, or WhatsApp based on the campaign requirements.
- **Multi-Language Output:** Support for generating messages in English, Hindi, and Marathi to reach diverse demographics.
- **Analytics Dashboard:** Monitor campaign status, track the number of messages generated, and view platform usage statistics.
- **Theme Support:** Clean, functional UI with Light and Dark mode options.
- **Secure Authentication:** User login and session management handled via Supabase.

---

## 🎯 Use Cases

The Smart Campaign Manager is built for scenarios requiring high-volume, personalized communication:

1. **Training Institutes & Education:**
   - Following up with students who have inquired about specific courses.
   - Sending personalized orientation or placement drive details to hundreds of candidates at once.
2. **Sales & Lead Generation:**
   - Sending tailored LinkedIn connection requests based on a lead's job title and company.
   - Crafting cold outreach emails that reference the recipient's specific industry.
3. **HR & Recruitment:**
   - Reaching out to potential candidates on LinkedIn with customized messages referencing their current role.
   - Managing recruitment drives by organizing candidates into different campaigns.
4. **Event Management:**
   - Sending structured WhatsApp invitations and follow-ups to attendees based on their RSVP status.

---

## 🏗️ Technical Architecture

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 & Shadcn UI
- **State Management:** React Context API

### Backend
- **Framework:** Python FastAPI
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** Groq API (High-speed inference for bulk generation)

---

## 🚀 Local Setup Instructions

### 1. Prerequisites
- Node.js (v20+)
- Python (v3.11+)
- Supabase Account
- Groq API Key

### 2. Clone the Repository
```bash
git clone https://github.com/PrathameshBhagwat/smart-campaign-manager.git
cd smart-campaign-manager
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```
Copy `.env.example` to `.env` and configure:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GROQ_API_KEY=your_groq_api_key
```
Start the server: `uvicorn app.main:app --reload` (Runs on port 8000)

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```
Create `.env.local` and configure:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Start the client: `npm run dev` (Runs on port 3000)

---

## 🐳 Docker Production Deployment

For deploying to a VPS (like AWS EC2), the repository includes Docker configuration.

1. Clone the repository on your server.
2. Create a `.env` file in the project root:
   ```env
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   GROQ_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Run Docker Compose:
   ```bash
   sudo docker compose up -d --build
   ```

---

<div align="center">
  <b>Built with ❤️ by Prathamesh Bhagwat</b>
</div>
