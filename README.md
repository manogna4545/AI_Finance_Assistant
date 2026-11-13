# AI Finance Assistant 📊💡

A full-stack, responsive, and secure personal finance management web application featuring automated expense tracking, category budgeting, machine learning spending predictions, and an interactive AI financial advisor.

---

## 🌟 Key Features

1. **Executive Dashboard:** Live cashflow metrics (Total Balance, Income, Expenses, Savings Rate), monthly income vs. expense bar charts, category donut breakdown, recent ledger entries, and budget progress.
2. **Transaction Management:** Full CRUD (Create, Read, Update, Delete) with real-time category filtering, title/note searching, and type filtering (Income / Expense).
3. **Monthly Budgets & Alerts:** Set category spending caps with dynamic progress indicators and automated risk/overspending alerts.
4. **Performance Analytics:** Multi-month net savings growth trends, horizontal category volume distribution, and percentage share tables.
5. **Machine Learning Predictions:** Future 90-day expense forecasting computed using Scikit-Learn linear regression and velocity modeling from actual database transaction history.
6. **AI Financial Assistant:** Context-aware chatbot that evaluates your actual database ledger, cashflow ratios, and spending thresholds (supports external LLM API key or built-in intelligent rule engine).
7. **Official Reports & Export:** Executive financial summary statement with one-click Print-to-PDF and CSV spreadsheet export.
8. **Secure Authentication & Multi-User Isolation:** Bcrypt password hashing, stateless JWT authorization, profile preferences, and one-click instant evaluation demo access.
9. **Fully Responsive Light-Green Fintech UI:** Optimized for desktop monitors, laptops, tablets, iPhones, and Android devices without horizontal overflow.

---

## 🛠️ Technology Stack

- **Frontend:** React.js 19, Vite, React Router DOM, Recharts, Lucide React, Custom Responsive CSS Design System.
- **Backend:** Python 3.14, Flask REST API, Flask-SQLAlchemy, Flask-Bcrypt, Flask-JWT-Extended, Flask-CORS, Scikit-Learn, Pandas, NumPy, Gunicorn.
- **Database:** SQLite (local zero-config development) and PostgreSQL with `psycopg` (production).
- **Deployment:** Vercel (Frontend SPA) + Render / Supabase (Backend Web Service & Hosted PostgreSQL).

---

## 🚀 Local Development Quickstart

### Prerequisites
- **Python 3.10+** (Tested with Python 3.14.6)
- **Node.js 18+** and **npm**

---

### Step 1: Start the Flask Backend

1. Open PowerShell and navigate to the backend folder:
   ```powershell
   cd C:\AI_Finance_Assistant\backend
   ```

2. Activate the Python virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. Ensure your local `.env` file exists:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Run automated test suite to verify all 10 endpoints:
   ```powershell
   python test_api.py
   ```

5. Start the Flask server:
   ```powershell
   python run.py
   ```
   *The backend REST API will be running at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

---

### Step 2: Start the React Frontend

1. Open a **second** PowerShell terminal and navigate to the frontend folder:
   ```powershell
   cd C:\AI_Finance_Assistant\frontend
   ```

2. Start the Vite development server:
   ```powershell
   npm run dev
   ```

3. Open your browser (Google Chrome, Edge, Safari, Firefox) and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`):
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `FLASK_ENV` | Environment mode | `development` or `production` |
| `FLASK_DEBUG` | Enable debug logs | `True` (dev) / `False` (prod) |
| `SECRET_KEY` | Flask session secret | Random 64-character string |
| `JWT_SECRET_KEY` | JWT signing secret | Random 64-character string |
| `DATABASE_URL` | SQLAlchemy database URI | `sqlite:///finance_assistant.db` (Local) or `postgresql+psycopg://...` (Prod) |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:5173` or `https://your-app.vercel.app` |
| `AI_API_KEY` | Optional external LLM API key | `gemini_or_openai_key` (optional) |

### Frontend (`frontend/.env`):
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the Flask REST API | `http://localhost:5000/api` |

---

## 🌐 Production Deployment Guide

### 1. Database (Supabase or Render PostgreSQL)
1. Create a free PostgreSQL instance on [Supabase](https://supabase.com) or [Render](https://render.com).
2. Copy the Connection URI (e.g., `postgresql+psycopg://user:password@host:5432/dbname`).

### 2. Backend (Render)
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a **New Web Service**:
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app`
3. Add Environment Variables on Render:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string.
   - `SECRET_KEY`: Strong random secret.
   - `JWT_SECRET_KEY`: Strong random secret.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://my-finance-app.vercel.app`).
4. Click **Deploy**. Render will deploy your Flask backend and assign a public HTTPS URL (e.g., `https://ai-finance-backend.onrender.com`).

### 3. Frontend (Vercel)
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://ai-finance-backend.onrender.com/api` (your deployed Render API URL).
4. Deploy! Vercel will build the React SPA and provide a public HTTPS URL accessible from any phone or computer worldwide.
