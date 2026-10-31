# CareerBridge

A full-stack campus placement platform connecting students and recruiters
through a centralized job application system — built with **Angular**,
**Flask**, **MySQL**, and **REST APIs**.

Two roles:
- **Students** browse/search jobs and apply, then track application status.
- **Recruiters** post jobs, view applicants, and update application status
  (Applied → Shortlisted → Selected/Rejected).

---

## 1. Project structure

```
career-bridge/
├── backend/                 Flask REST API
│   ├── app.py                All routes
│   ├── models.py              User / Job / Application (SQLAlchemy)
│   ├── config.py              DB + JWT config
│   ├── seed.py                 Creates demo accounts + sample jobs
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                Angular app
│   └── src/app/
│       ├── core/               services, guards, interceptor, models
│       └── components/         login, register, job-list, job-detail,
│                                recruiter-dashboard, my-applications, navbar
│
└── INTERVIEW_GUIDE.md        Talking points mapped to your resume bullets
```

---

## 2. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
```

**Option A — quick demo with SQLite (no MySQL install needed):**
Open `.env` and set `USE_SQLITE=true`.

**Option B — **Option B — MySQL:**
1. Install MySQL (or use XAMPP/WAMP) and create a database:
   ```sql
   CREATE DATABASE careerbridge;
   ```
2. In `.env`, set `USE_SQLITE=false` and fill in `DB_USER` / `DB_PASSWORD`.

Then, either way:

```bash
python3 seed.py     # creates tables + demo accounts + sample jobs
python3 app.py       # runs on http://localhost:5000
```

Demo logins (created by `seed.py`):
- Recruiter: `recruiter@demo.com` / `password123`
- Student: `student@demo.com` / `password123`

## 3. Run the frontend

```bash
cd frontend
npm install
npm start            # runs on http://localhost:4200
```

Open `http://localhost:4200` in your browser. The Angular dev server proxies
nothing special — it just calls `http://localhost:5000/api/...` directly
(CORS is enabled on the Flask side for this).

---

## 4. What each layer does

- **Angular (frontend)** — standalone components (no NgModules, the modern
  Angular style), a `JobService`/`AuthService` for HTTP calls, a functional
  `authInterceptor` that attaches the JWT to every request, and route
  guards (`authGuard`, `recruiterGuard`, `studentGuard`) that redirect
  based on login state and role.
- **Flask (backend)** — a REST API with JWT-based authentication
  (`flask-jwt-extended`), password hashing (`flask-bcrypt`), and
  role-based access control via a custom `role_required` decorator.
- **MySQL (database)** — accessed through SQLAlchemy ORM, so the same
  model/query code works against MySQL or SQLite depending on `.env`.

