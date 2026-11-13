import re
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .. import db, bcrypt
from ..models import User, Account, Transaction, Budget, AIChatHistory

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def seed_user_defaults(user_id):
    """
    Seeds a new user with standard accounts and initial category budgets.
    """
    # Create primary checking account
    checking = Account(
        user_id=user_id,
        account_name="Primary Checking",
        account_type="checking",
        balance=4850.0
    )
    db.session.add(checking)

    # Initial standard category budgets
    now = datetime.utcnow()
    default_budgets = [
        ("Housing", 1500.0, "#059669"),
        ("Groceries", 500.0, "#10b981"),
        ("Dining Out", 300.0, "#f59e0b"),
        ("Transportation", 180.0, "#3b82f6"),
        ("Utilities", 200.0, "#8b5cf6"),
        ("Subscriptions", 100.0, "#ec4899"),
        ("Healthcare", 150.0, "#14b8a6")
    ]
    for cat, limit, color in default_budgets:
        b = Budget(
            user_id=user_id,
            category=cat,
            monthly_limit=limit,
            color=color,
            month=now.month,
            year=now.year
        )
        db.session.add(b)

    # Add initial seed transactions for a realistic start
    today = date.today()
    sample_txs = [
        ("Software Engineering Salary", 4850.0, "income", "Salary", today.replace(day=1), "Monthly base salary deposit"),
        ("Apartment Rent", 1450.0, "expense", "Housing", today.replace(day=2), "Monthly downtown apartment rent"),
        ("Whole Foods Organic Market", 184.5, "expense", "Groceries", today.replace(day=4), "Weekly organic grocery haul"),
        ("Freelance UI Consulting", 850.0, "income", "Freelance", today.replace(day=5), "Dashboard design consulting payout"),
        ("Electric & Water Municipal", 142.3, "expense", "Utilities", today.replace(day=6), "Monthly municipal utility bill"),
        ("Bistro Verde Dining", 78.4, "expense", "Dining Out", today.replace(day=8), "Team dinner celebration"),
        ("Transit Pass Card Recharge", 60.0, "expense", "Transportation", today.replace(day=9), "Monthly subway pass"),
        ("Cloud & Developer Services", 49.99, "expense", "Subscriptions", today.replace(day=10), "AI API and GitHub Pro subscriptions"),
        ("Pharmacy & Wellness", 35.2, "expense", "Healthcare", today.replace(day=11), "Vitamins and healthcare essentials")
    ]
    for title, amount, t_type, cat, tx_date, desc in sample_txs:
        t = Transaction(
            user_id=user_id,
            title=title,
            amount=amount,
            transaction_type=t_type,
            category=cat,
            date=tx_date,
            description=desc
        )
        db.session.add(t)

    # Initial AI welcome message
    welcome_chat = AIChatHistory(
        user_id=user_id,
        sender="assistant",
        message="Hello! I am your AI Financial Assistant. I am connected to your database and can help analyze your income, track spending thresholds, and predict future expenses. How can I assist you today?"
    )
    db.session.add(welcome_chat)
    db.session.commit()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    currency = data.get("currency", "$").strip()
    monthly_budget = float(data.get("monthly_budget", 3800.0))

    if not username or len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters long."}), 400

    if not email or not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({"error": "A user with that email or username already exists."}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_pw,
        currency=currency,
        monthly_budget=monthly_budget
    )
    db.session.add(new_user)
    db.session.commit()

    # Seed default account & sample starter items
    seed_user_defaults(new_user.id)

    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "message": "User registered successfully.",
        "token": access_token,
        "user": new_user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    identifier = data.get("email") or data.get("username") or data.get("identifier") or ""
    identifier = identifier.strip().lower()
    password = data.get("password", "").strip()

    if not identifier or not password:
        return jsonify({"error": "Email/Username and password are required."}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful.",
        "token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/demo-login", methods=["POST"])
def demo_login():
    """
    Instant demo login for reviewers and evaluators.
    """
    demo_email = "alex.morgan@finance.io"
    user = User.query.filter_by(email=demo_email).first()

    if not user:
        hashed_pw = bcrypt.generate_password_hash("demo123").decode("utf-8")
        user = User(
            username="Alex Morgan",
            email=demo_email,
            password_hash=hashed_pw,
            currency="$",
            monthly_budget=3800.0
        )
        db.session.add(user)
        db.session.commit()
        seed_user_defaults(user.id)

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Demo login successful.",
        "token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json() or {}
    if "username" in data and data["username"].strip():
        user.username = data["username"].strip()
    if "currency" in data and data["currency"].strip():
        user.currency = data["currency"].strip()
    if "monthly_budget" in data:
        try:
            user.monthly_budget = float(data["monthly_budget"])
        except ValueError:
            pass

    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully.",
        "user": user.to_dict()
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Successfully logged out."}), 200
