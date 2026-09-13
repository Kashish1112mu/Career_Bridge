from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    """
    A single table holds both students and recruiters, distinguished by
    `role`. This keeps auth simple (one login endpoint, one JWT scheme)
    while still letting each role see a different dashboard on the
    frontend based on the role claim stored in the token.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'recruiter'
    company_name = db.Column(db.String(150), nullable=True)  # only used by recruiters
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    jobs_posted = db.relationship("Job", backref="recruiter", lazy=True)
    applications = db.relationship("Application", backref="student", lazy=True)

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "company_name": self.company_name,
        }


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(120), nullable=False)
    job_type = db.Column(db.String(50), default="Full-time")  # Full-time / Internship
    posted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    applications = db.relationship(
        "Application", backref="job", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self, include_applicant_count=False):
        data = {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "description": self.description,
            "location": self.location,
            "job_type": self.job_type,
            "posted_by": self.posted_by,
            "created_at": self.created_at.isoformat(),
        }
        if include_applicant_count:
            data["applicant_count"] = len(self.applications)
        return data


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), default="Applied")  # Applied / Shortlisted / Rejected / Selected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("job_id", "student_id", name="uq_job_student"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "student_id": self.student_id,
            "status": self.status,
            "applied_at": self.applied_at.isoformat(),
            "student_name": self.student.name,
            "student_email": self.student.email,
            "job_title": self.job.title,
        }
