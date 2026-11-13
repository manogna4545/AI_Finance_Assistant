import os
import logging
from datetime import timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app(config_override=None):
    """
    Application factory pattern for Flask REST API.
    """
    app = Flask(__name__)

    # Allow URLs with or without trailing slashes without redirecting
    app.url_map.strict_slashes = False

    # Logging setup
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )

    # Core configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-change-in-production")
    
    # Token expiration: default 30 days to avoid premature 401 logouts
    jwt_exp_days = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_DAYS", "30"))
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=jwt_exp_days)
    
    # Database URL configuration (Supports PostgreSQL and SQLite)
    db_url = os.getenv("DATABASE_URL", "sqlite:///finance_assistant.db")
    # Fix for SQLAlchemy 1.4+ with postgres:// uri
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if config_override:
        app.config.update(config_override)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Allowed CORS origins
    default_origins = [
        "https://ai-finance-assistant-frontend-plum.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    frontend_env = os.getenv("FRONTEND_URL", "").strip()
    if frontend_env and frontend_env != "*":
        for o in frontend_env.split(","):
            clean_o = o.strip().rstrip("/")
            if clean_o and clean_o not in default_origins:
                default_origins.append(clean_o)

    allowed_headers = [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Pragma",
        "X-Requested-With",
        "Accept",
        "Origin"
    ]
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]

    # Flask-CORS initialization with explicit origin list
    CORS(
        app,
        resources={r"/*": {"origins": default_origins}},
        supports_credentials=True,
        allow_headers=allowed_headers,
        methods=allowed_methods,
        expose_headers=["Content-Type", "Authorization"]
    )

    # Global after_request CORS guarantee for all responses (including 401, 404, 500 and OPTIONS)
    @app.after_request
    def set_cors_headers(response):
        origin = request.headers.get("Origin")
        if origin:
            # Match explicitly allowed origins, Vercel preview URLs, or local development
            is_allowed = (
                origin in default_origins
                or origin.endswith(".vercel.app")
                or "localhost" in origin
                or "127.0.0.1" in origin
            )
            if is_allowed:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = ", ".join(allowed_methods)
                response.headers["Access-Control-Allow-Headers"] = ", ".join(allowed_headers)
        return response

    # JWT Error Handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({"error": "Missing authorization token. Please log in."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({"error": "Invalid token. Please log in again."}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token expired. Please log in again."}), 401

    # Register Route Blueprints
    from .routes.auth import auth_bp
    from .routes.transactions import transactions_bp
    from .routes.budgets import budgets_bp
    from .routes.analytics import analytics_bp
    from .routes.predictions import predictions_bp
    from .routes.ai_assistant import ai_bp
    from .routes.reports import reports_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(budgets_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(reports_bp)

    # Root health-check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "AI Finance Assistant API is live",
            "environment": os.getenv("FLASK_ENV", "development"),
            "database": "connected"
        }), 200

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Requested resource was not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f"Internal server error: {e}")
        return jsonify({"error": "Internal server error. Please try again later."}), 500

    # Create tables automatically within app context
    with app.app_context():
        db.create_all()

    return app
