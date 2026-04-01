# Gym Tracker

This project implements a gym tracker MVP with:

- `frontend/`: Next.js app
- `backend/`: FastAPI
- `frontend/supabase/migrations/`: Supabase schema + RLS migration

## 1) Supabase setup

1. Create a Supabase project.
2. Run migration `frontend/supabase/migrations/20260331_init.sql`.
3. Get:
   - Project URL
   - anon key
   - service role key
   - JWT secret

## 2) Frontend setup (Vercel / local)

Copy `frontend/.env.example` to `frontend/.env.local` and fill values.

Install and run:

```bash
cd frontend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm run dev
npm install
npm run dev
```

## 3) Backend setup (Railway / local)

Copy `backend/.env.example` to `backend/.env` and fill values.

Install and run:

```bash
cd backend
python -m venv .venv
. /.venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 4) MVP Features

- Supabase auth + profiles
- Workout logging (FastAPI endpoint)
- Routine builder (FastAPI endpoint)
- Body metrics logging + trend chart
- 30-day progress summary endpoint
