from datetime import datetime
from . import db


class User(db.Model):
    """
    User model for authentication and personal settings.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    currency = db.Column(db.String(10), default="$", nullable=False)
    monthly_budget = db.Column(db.Float, default=3800.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    accounts = db.relationship("Account", backref="user", lazy=True, cascade="all, delete-orphan")
    transactions = db.relationship("Transaction", backref="user", lazy=True, cascade="all, delete-orphan")
    budgets = db.relationship("Budget", backref="user", lazy=True, cascade="all, delete-orphan")
    savings_goals = db.relationship("SavingsGoal", backref="user", lazy=True, cascade="all, delete-orphan")
    ai_chats = db.relationship("AIChatHistory", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "currency": self.currency,
            "monthly_budget": self.monthly_budget,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Account(db.Model):
    """
    Financial accounts (e.g., Primary Checking, High-Yield Savings, Cash Wallet).
    """
    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_name = db.Column(db.String(100), nullable=False)
    account_type = db.Column(db.String(50), default="checking", nullable=False)
    balance = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_name": self.account_name,
            "account_type": self.account_type,
            "balance": self.balance,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Transaction(db.Model):
    """
    Transaction records for tracking user income and expenses.
    """
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    category = db.Column(db.String(50), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    is_recurring = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_id": self.account_id,
            "title": self.title,
            "amount": self.amount,
            "transaction_type": self.transaction_type,
            "category": self.category,
            "date": self.date.isoformat() if self.date else None,
            "description": self.description,
            "is_recurring": self.is_recurring,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Budget(db.Model):
    """
    Category budgets for tracking monthly target caps.
    """
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False)
    monthly_limit = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(20), default="#10b981")
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, current_spent=0.0):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category": self.category,
            "monthly_limit": self.monthly_limit,
            "spent": round(current_spent, 2),
            "color": self.color,
            "month": self.month,
            "year": self.year,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class SavingsGoal(db.Model):
    """
    User savings goals (e.g. Emergency Fund, House Down Payment).
    """
    __tablename__ = "savings_goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0, nullable=False)
    target_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        progress = round((self.current_amount / self.target_amount) * 100, 1) if self.target_amount > 0 else 0
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "target_amount": self.target_amount,
            "current_amount": self.current_amount,
            "progress_pct": progress,
            "target_date": self.target_date.isoformat() if self.target_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class AIChatHistory(db.Model):
    """
    Persistent AI Assistant conversation records.
    """
    __tablename__ = "ai_chat_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "sender": self.sender,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
