from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from config import Config
from models import db, bcrypt, User, Job, Application

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
CORS(app)  # allow the Angular dev server (localhost:4200) to call this API


# ---------------------------------------------------------------------
# Small helper: role-based access control
# ---------------------------------------------------------------------
def role_required(role):
    def wrapper(fn):
        from functools import wraps

        @wraps(fn)
        def decorated(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") != role:
                return jsonify({"error": f"{role.capitalize()} access required"}), 403
            return fn(*args, **kwargs)

        return decorated

    return wrapper


# ---------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    required = ["name", "email", "password", "role"]
    if not all(data.get(field) for field in required):
        return jsonify({"error": "name, email, password and role are required"}), 400

    if data["role"] not in ("student", "recruiter"):
        return jsonify({"error": "role must be 'student' or 'recruiter'"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    user = User(
        name=data["name"],
        email=data["email"],
        role=data["role"],
        company_name=data.get("company_name"),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()

    if not user or not user.check_password(data.get("password", "")):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 200


@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify(user.to_dict())


# ---------------------------------------------------------------------
# Job routes
# ---------------------------------------------------------------------
@app.route("/api/jobs", methods=["GET"])
def list_jobs():
    """Public list of jobs, with optional filtering — used by the student view."""
    query = Job.query

    search = request.args.get("search")
    location = request.args.get("location")
    job_type = request.args.get("job_type")

    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(Job.title.ilike(like), Job.company.ilike(like)))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)

    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])


@app.route("/api/jobs/<int:job_id>", methods=["GET"])
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify(job.to_dict())


@app.route("/api/jobs", methods=["POST"])
@jwt_required()
@role_required("recruiter")
def create_job():
    data = request.get_json() or {}
    required = ["title", "company", "description", "location"]
    if not all(data.get(field) for field in required):
        return jsonify({"error": "title, company, description and location are required"}), 400

    job = Job(
        title=data["title"],
        company=data["company"],
        description=data["description"],
        location=data["location"],
        job_type=data.get("job_type", "Full-time"),
        posted_by=int(get_jwt_identity()),
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201


@app.route("/api/jobs/<int:job_id>", methods=["PUT"])
@jwt_required()
@role_required("recruiter")
def update_job(job_id):
    job = Job.query.get_or_404(job_id)
    if job.posted_by != int(get_jwt_identity()):
        return jsonify({"error": "You can only edit jobs you posted"}), 403

    data = request.get_json() or {}
    for field in ("title", "company", "description", "location", "job_type"):
        if field in data:
            setattr(job, field, data[field])

    db.session.commit()
    return jsonify(job.to_dict())


@app.route("/api/jobs/<int:job_id>", methods=["DELETE"])
@jwt_required()
@role_required("recruiter")
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    if job.posted_by != int(get_jwt_identity()):
        return jsonify({"error": "You can only delete jobs you posted"}), 403

    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"})


@app.route("/api/jobs/mine", methods=["GET"])
@jwt_required()
@role_required("recruiter")
def my_jobs():
    """Jobs posted by the logged-in recruiter, with applicant counts — powers the dashboard."""
    jobs = Job.query.filter_by(posted_by=int(get_jwt_identity())).order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict(include_applicant_count=True) for j in jobs])


# ---------------------------------------------------------------------
# Application routes
# ---------------------------------------------------------------------
@app.route("/api/jobs/<int:job_id>/apply", methods=["POST"])
@jwt_required()
@role_required("student")
def apply_to_job(job_id):
    Job.query.get_or_404(job_id)
    student_id = int(get_jwt_identity())

    existing = Application.query.filter_by(job_id=job_id, student_id=student_id).first()
    if existing:
        return jsonify({"error": "You have already applied to this job"}), 409

    application = Application(job_id=job_id, student_id=student_id)
    db.session.add(application)
    db.session.commit()
    return jsonify(application.to_dict()), 201


@app.route("/api/applications/my", methods=["GET"])
@jwt_required()
@role_required("student")
def my_applications():
    student_id = int(get_jwt_identity())
    apps = Application.query.filter_by(student_id=student_id).order_by(Application.applied_at.desc()).all()
    return jsonify([a.to_dict() for a in apps])


@app.route("/api/jobs/<int:job_id>/applicants", methods=["GET"])
@jwt_required()
@role_required("recruiter")
def job_applicants(job_id):
    job = Job.query.get_or_404(job_id)
    if job.posted_by != int(get_jwt_identity()):
        return jsonify({"error": "You can only view applicants for jobs you posted"}), 403

    apps = Application.query.filter_by(job_id=job_id).order_by(Application.applied_at.desc()).all()
    return jsonify([a.to_dict() for a in apps])


@app.route("/api/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
@role_required("recruiter")
def update_application_status(application_id):
    application = Application.query.get_or_404(application_id)
    if application.job.posted_by != int(get_jwt_identity()):
        return jsonify({"error": "You can only update applications for your own job postings"}), 403

    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ("Applied", "Shortlisted", "Rejected", "Selected"):
        return jsonify({"error": "Invalid status"}), 400

    application.status = new_status
    db.session.commit()
    return jsonify(application.to_dict())


# ---------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
