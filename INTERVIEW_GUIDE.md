# CareerBridge — Interview Guide

This maps every resume bullet to the actual code, and gives you simple,
confident explanations for the Angular parts specifically.

---

## 1. Resume bullet → where it lives in the code

**"Built a full-stack campus placement platform connecting students and
recruiters through a centralized job application system."**
- `backend/models.py` — one shared `Job` table and `Application` table
  that both roles read/write, which *is* the "centralized system": a
  recruiter's job posting immediately becomes visible to every student,
  and every application a student submits immediately shows up on the
  recruiter's dashboard.

**"Implemented user authentication and job application management using
Angular, Flask, and MySQL."**
- Authentication: `backend/app.py` (`/api/auth/register`, `/api/auth/login`)
  issues a JWT; `frontend/src/app/core/auth.service.ts` stores it and
  `auth.interceptor.ts` attaches it to every request automatically.
- Job application management: `POST /api/jobs/<id>/apply`,
  `GET /api/applications/my`, `GET /api/jobs/<id>/applicants`, and
  `PUT /api/applications/<id>/status` — the full apply → review →
  shortlist/reject/select lifecycle.

**"Developed REST APIs for user authentication, job listings, and
application workflows."**
- All endpoints in `backend/app.py` follow REST conventions: resources
  as nouns (`/jobs`, `/applications`), HTTP verbs for actions (GET list,
  POST create, PUT update, DELETE remove), and JSON in/out.

---

## 2. The 60-second pitch (say this if asked "walk me through a project")

> "CareerBridge is a placement platform with two roles — students and
> recruiters. Recruiters post jobs and manage applicants; students browse,
> filter, and apply, then track their application status. It's a Flask
> REST API on the backend with MySQL for storage, and an Angular frontend
> that talks to it over JWT-authenticated HTTP calls. I built it to
> practice the full loop — auth, role-based permissions, and CRUD — the
> same pattern that shows up in most real placement/HR systems."

---

## 3. Angular, explained simply (the part you wanted easier to talk about)

Angular can sound intimidating because of the vocabulary. Here's the
whole app in five ideas — that's genuinely all there is to it:

1. **Components = pages.** Each screen (login, job list, dashboard...) is
   one `.ts` file with a class (the logic) and a `template` (the HTML).
   `job-list.component.ts` is the "browse jobs" page; that's it.

2. **Services = the code that talks to the backend.** `job.service.ts`
   and `auth.service.ts` are just classes with methods like `getJobs()`
   or `login()` that call the Flask API with Angular's `HttpClient` and
   return the response. Components call these services instead of
   making HTTP calls themselves — so the "how do I talk to the backend"
   logic lives in one place.

3. **Routing = which component shows for which URL.** `app.routes.ts` is
   a simple list: `/jobs` → `JobListComponent`, `/dashboard` →
   `RecruiterDashboardComponent`, etc. It's the same idea as Flask
   `@app.route()`, just on the frontend.

4. **The interceptor = "attach my login token automatically."**
   `auth.interceptor.ts` is one small function that runs before every
   HTTP request and adds `Authorization: Bearer <token>` if the user is
   logged in. Without it, you'd have to remember to add that header in
   every single service method — this way you write it once.

5. **Guards = "don't let people onto pages they shouldn't see."**
   `auth.guard.ts` checks "is anyone logged in?" before letting the
   router load a page, and `recruiterGuard` / `studentGuard` add "...and
   are they the right role?" If not, it redirects them — e.g. a student
   trying to open `/dashboard` gets bounced back to `/jobs`.

**If asked "why Angular and not React":** a fair, honest answer is that
Angular is what's commonly used in enterprise/campus-hiring stacks, and
it comes with routing, HTTP, and forms built in rather than requiring you
to pick separate libraries — good for learning a complete, opinionated
framework end-to-end.

**If asked "why standalone components instead of NgModules":** standalone
components (the approach used here) are the current recommended Angular
style — each component declares its own imports directly, so there's no
separate `AppModule` file to keep in sync. Simpler to reason about,
especially for a project this size.

---

## 4. Likely follow-up questions (with short answers)

**"How does a student apply to a job, end to end?"**
> Student clicks "Apply" → `JobDetailComponent.apply()` calls
> `jobService.applyToJob(id)` → interceptor attaches the JWT →
> Flask's `/api/jobs/<id>/apply` route checks the token, reads the
> student's ID out of it, and inserts a new row in the `applications`
> table (unless they've already applied — there's a unique constraint on
> `job_id + student_id` to prevent duplicates).

**"How do you know a recruiter can only see their own applicants?"**
> Every job-editing/applicant-viewing route in `app.py` checks
> `job.posted_by == current_user_id` before returning data, and returns
> a 403 if it doesn't match. So even if a recruiter guesses another
> recruiter's job ID, the API blocks it — the frontend guard is just a UX
> nicety, the backend check is what's actually enforcing security.

**"How is the password stored?"**
> Never in plain text — `flask-bcrypt` hashes it before saving
> (`user.set_password()` in `models.py`), and login compares the hash,
> not the raw password.

**"Why JWT instead of sessions?"**
> JWT is stateless — the token itself carries the user's ID and role, so
> the Flask API doesn't need to keep server-side session storage. That
> also makes it a natural fit for a separate frontend/backend setup like
> this one, where Angular and Flask run on different ports/origins.

**"What would you add if you kept working on it?"**
> Reasonable, honest answers: pagination for the job list, email
> notifications when application status changes, resume file uploads,
> and a proper production deployment (Gunicorn + a real MySQL server
> instead of the dev server).

---

## 5. Demo script (2 minutes, in order)

1. Start backend (`python3 app.py`) and frontend (`npm start`).
2. Open `/register`, sign up as a recruiter → land on empty dashboard.
3. Click "+ Post a Job", fill the form, submit → job appears in the list.
4. Log out, register as a student → browse jobs, use the search/location
   filters, open a job, click "Apply Now".
5. Log back in as the recruiter → open the dashboard → "View Applicants"
   on that job → change the applicant's status to "Shortlisted".
6. Log back in as the student → "My Applications" → status now shows
   "Shortlisted" — proving the whole loop is connected end-to-end.

(Or skip steps 2-3 and just use the seeded demo accounts —
`recruiter@demo.com` / `student@demo.com`, both password `password123`.)
