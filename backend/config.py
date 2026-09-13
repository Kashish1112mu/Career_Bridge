import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    # ---------------------------------------------------------------
    # Database
    # ---------------------------------------------------------------
    # CareerBridge is built with MySQL in mind (as listed on the resume),
    # so the default URI below points at a local MySQL instance.
    # Format: mysql+pymysql://<user>:<password>@<host>/<db_name>
    #
    # For zero-setup local testing (e.g. quickly demoing without
    # installing MySQL), you can instead set:
    #   USE_SQLITE=true
    # in your .env file and the app will fall back to a local SQLite
    # file. The SQLAlchemy models/queries are identical either way -
    # that's the whole point of using an ORM.
    if os.getenv("USE_SQLITE", "false").lower() == "true":
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'careerbridge.db')}"
    else:
        DB_USER = os.getenv("DB_USER", "root")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_NAME = os.getenv("DB_NAME", "careerbridge")
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---------------------------------------------------------------
    # JWT
    # ---------------------------------------------------------------
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 8  # 8 hours
