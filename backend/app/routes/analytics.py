from datetime import datetime, date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from .. import db
from ..models import User, Transaction, Budget

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_summary():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year

    # Total income & total expense all time or current month
    income_sum = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "income"
    ).scalar() or 0.0

    expense_sum = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense"
    ).scalar() or 0.0

    total_income = float(income_sum)
    total_expenses = float(expense_sum)
    total_balance = total_income - total_expenses
    savings_rate = round(((total_income - total_expenses) / total_income) * 100) if total_income > 0 else 0

    # Category breakdown for expenses
    cat_query = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense"
    ).group_by(Transaction.category).all()

    category_expenses = [
        {"name": cat, "value": round(float(total), 2)}
        for cat, total in cat_query
    ]

    # Trailing 6 months cashflow trends
    monthly_trends = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i in range(5, -1, -1):
        target_date = now - timedelta(days=i * 30)
        m = target_date.month
        y = target_date.year
        label = month_names[m - 1]

        m_inc = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "income",
            extract("month", Transaction.date) == m,
            extract("year", Transaction.date) == y
        ).scalar() or 0.0

        m_exp = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            extract("month", Transaction.date) == m,
            extract("year", Transaction.date) == y
        ).scalar() or 0.0

        monthly_trends.append({
            "month": label,
            "income": round(float(m_inc), 2),
            "expenses": round(float(m_exp), 2),
            "savings": round(float(m_inc) - float(m_exp), 2)
        })

    # Recent 5 transactions
    recent = Transaction.query.filter_by(user_id=user_id).order_by(
        Transaction.date.desc(), Transaction.id.desc()
    ).limit(5).all()

    # Budget progress
    monthly_budget_cap = user.monthly_budget or 3800.0
    budget_progress_pct = round((total_expenses / monthly_budget_cap) * 100) if monthly_budget_cap > 0 else 0

    # Generate personalized dynamic insight
    top_cat = sorted(category_expenses, key=lambda x: x["value"], reverse=True)
    top_cat_name = top_cat[0]["name"] if top_cat else "General"
    top_cat_amount = top_cat[0]["value"] if top_cat else 0.0

    insight_text = (
        f"You have saved {savingsRate if 'savingsRate' in locals() else savings_rate}% of your recorded income. "
        f"Your highest expenditure category is {top_cat_name} at {user.currency}{top_cat_amount:,.2f}. "
        f"Keeping discretionary spending in check this week will safeguard your target surplus."
    )

    return jsonify({
        "user": user.to_dict(),
        "total_balance": round(total_balance, 2),
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "savings_rate": savings_rate,
        "monthly_budget": monthly_budget_cap,
        "budget_progress": min(budget_progress_pct, 100),
        "category_expenses": category_expenses,
        "monthly_trends": monthly_trends,
        "recent_transactions": [t.to_dict() for t in recent],
        "insight": insight_text
    }), 200
