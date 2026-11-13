import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from .. import db
from ..models import User, Transaction, Budget, AIChatHistory

ai_bp = Blueprint("ai_assistant", __name__, url_prefix="/api/ai")


def generate_rule_based_advice(user, user_message, total_balance, total_income, total_expenses, category_breakdown, over_budgets):
    """
    Intelligent context-aware financial rule engine when external LLM API keys are not supplied.
    """
    msg = user_message.lower()
    currency = user.currency

    # Budget or Dining out inquiries
    if any(k in msg for k in ["dining", "restaurant", "food", "eat"]):
        dining_cat = next((c for c in category_breakdown if "dining" in c["name"].lower() or "food" in c["name"].lower()), None)
        if dining_cat:
            return (
                f"You have spent {currency}{dining_cat['value']:,.2f} on {dining_cat['name']} to date. "
                f"Preparing meals at home for the next 3-4 days can comfortably preserve an estimated {currency}75-{currency}120 in cash reserves."
            )
        return f"Your overall food and dining spending is currently within normal parameters. Consider designating a weekly restaurant allowance to keep savings consistent."

    # Prediction inquiries
    if any(k in msg for k in ["predict", "forecast", "future", "next month", "upcoming"]):
        projected = total_expenses * 1.08 if total_expenses > 0 else 2850.0
        return (
            f"Based on your recent outflow momentum, next month's projected expenses are estimated at approximately "
            f"{currency}{projected:,.2f}. To maximize your margin, review your recurring active subscriptions."
        )

    # Savings & Investment advice
    if any(k in msg for k in ["save", "saving", "invest", "investment", "emergency"]):
        surplus = max(0, total_income - total_expenses)
        return (
            f"Your current recorded surplus is {currency}{surplus:,.2f}. A great next step is channeling 20% into an "
            f"emergency buffer aiming for 3-6 months of fixed baseline expenses ({currency}{total_expenses * 3:,.2f})."
        )

    # Highest spending category
    if any(k in msg for k in ["highest", "most", "category", "where"]):
        if category_breakdown:
            top = category_breakdown[0]
            pct = round((top["value"] / total_expenses) * 100) if total_expenses > 0 else 0
            return (
                f"Your highest expenditure category is {top['name']} at {currency}{top['value']:,.2f}, "
                f"accounting for {pct}% of your total outflows."
            )

    # Budget warning inquiries
    if any(k in msg for k in ["budget", "limit", "warning", "overspend"]):
        if over_budgets:
            items_str = ", ".join([f"{b.category} ({currency}{b.monthly_limit})" for b in over_budgets])
            return f"You currently have categories near or exceeding their planned allocation: {items_str}. Review these items under the Budgets tab."
        return f"All your monitored budget categories are currently within their designated target caps. Excellent discipline!"

    # Default general financial audit response
    return (
        f"I analyzed your account ledger: Your current cash balance is {currency}{total_balance:,.2f} "
        f"with total income of {currency}{total_income:,.2f} and total expenses of {currency}{total_expenses:,.2f}. "
        f"How can I help you adjust your budget, analyze categories, or plan upcoming savings?"
    )


@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json() or {}
    message_text = data.get("message", "").strip()

    if not message_text:
        return jsonify({"error": "Message cannot be empty."}), 400

    # Save user message to database
    user_msg_record = AIChatHistory(
        user_id=user_id,
        sender="user",
        message=message_text
    )
    db.session.add(user_msg_record)

    # Gather user's actual financial context from database
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

    cat_query = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense"
    ).group_by(Transaction.category).order_by(func.sum(Transaction.amount).desc()).all()

    category_breakdown = [{"name": cat, "value": float(tot)} for cat, tot in cat_query]
    user_budgets = Budget.query.filter_by(user_id=user_id).all()
    over_budgets = [b for b in user_budgets if b.monthly_limit > 0 and (b.monthly_limit * 0.9) < total_expenses]

    # Generate assistant response
    ai_reply = generate_rule_based_advice(
        user=user,
        user_message=message_text,
        total_balance=total_balance,
        total_income=total_income,
        total_expenses=total_expenses,
        category_breakdown=category_breakdown,
        over_budgets=over_budgets
    )

    # Save AI response to database
    assistant_msg_record = AIChatHistory(
        user_id=user_id,
        sender="assistant",
        message=ai_reply
    )
    db.session.add(assistant_msg_record)
    db.session.commit()

    return jsonify({
        "status": "success",
        "user_message": user_msg_record.to_dict(),
        "assistant_message": assistant_msg_record.to_dict()
    }), 200


@ai_bp.route("/history", methods=["GET"])
@jwt_required()
def get_chat_history():
    user_id = int(get_jwt_identity())
    history = AIChatHistory.query.filter_by(user_id=user_id).order_by(AIChatHistory.created_at.asc()).all()
    return jsonify({
        "count": len(history),
        "messages": [m.to_dict() for m in history]
    }), 200


@ai_bp.route("/history", methods=["DELETE"])
@jwt_required()
def clear_chat_history():
    user_id = int(get_jwt_identity())
    AIChatHistory.query.filter_by(user_id=user_id).delete()
    
    # Add fresh welcome greeting
    welcome = AIChatHistory(
        user_id=user_id,
        sender="assistant",
        message="Conversation reset. How can I assist you with your finances today?"
    )
    db.session.add(welcome)
    db.session.commit()

    return jsonify({"message": "Chat history cleared successfully.", "messages": [welcome.to_dict()]}), 200
