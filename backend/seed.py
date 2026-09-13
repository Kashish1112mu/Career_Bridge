"""
Populates the database with a couple of demo accounts and jobs so the
app looks alive the moment you open it — handy right before an
interview demo. Run with:  python seed.py
"""
from app import app
from models import db, User, Job, Application

with app.app_context():
    db.create_all()

    if User.query.filter_by(email="recruiter@demo.com").first():
        print("Demo data already exists — skipping seed.")
    else:
        recruiter = User(
            name="Ananya Sharma",
            email="recruiter@demo.com",
            role="recruiter",
            company_name="Nexora Tech",
        )
        recruiter.set_password("password123")

        student = User(
            name="Kashish Rochlani",
            email="student@demo.com",
            role="student",
        )
        student.set_password("password123")

        db.session.add_all([recruiter, student])
        db.session.commit()

        job1 = Job(
            title="Software Development Intern",
            company="Nexora Tech",
            description="Work with our backend team on REST APIs using Flask and MySQL. Great for final-year students.",
            location="Bengaluru (Remote)",
            job_type="Internship",
            posted_by=recruiter.id,
        )
        job2 = Job(
            title="Frontend Developer (Angular)",
            company="Nexora Tech",
            description="Build and maintain customer-facing dashboards using Angular and REST APIs.",
            location="Pune",
            job_type="Full-time",
            posted_by=recruiter.id,
        )
        db.session.add_all([job1, job2])
        db.session.commit()

        application = Application(job_id=job1.id, student_id=student.id)
        db.session.add(application)
        db.session.commit()

        print("Seeded demo data:")
        print("  Recruiter login -> recruiter@demo.com / password123")
        print("  Student login   -> student@demo.com / password123")
