from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from .. import db
from ..models import Budget, Transaction

budgets_bp = Blueprint("budgets", __name__, url_prefix="/api/budgets")


@budgets_bp.route("", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = int(get_jwt_identity())
    now = datetime.utcnow()
    month = int(request.args.get("month", now.month))
    year = int(request.args.get("year", now.year))

    # Fetch user's budgets for this month/year (or all if general)
    budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()

    # If no budgets set for this month, copy from earlier or fallback to active targets
    if not budgets:
        budgets = Budget.query.filter_by(user_id=user_id).all()

    # Calculate actual expenses per category for this month from database
    spending_per_cat = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total_spent")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        extract("month", Transaction.date) == month,
        extract("year", Transaction.date) == year
    ).group_by(Transaction.category).all()

    spending_map = {cat: float(total) for cat, total in spending_per_cat}

    results = []
    for b in budgets:
        spent = spending_map.get(b.category, 0.0)
        results.append(b.to_dict(current_spent=spent))

    return jsonify({
        "month": month,
        "year": year,
        "budgets": results
    }), 200


@budgets_bp.route("", methods=["POST"])
@jwt_required()
def add_or_update_budget():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    category = data.get("category", "").strip()
    limit = data.get("limit") or data.get("monthly_limit")
    color = data.get("color", "#10b981").strip()
    now = datetime.utcnow()
    month = int(data.get("month", now.month))
    year = int(data.get("year", now.year))

    if not category:
        return jsonify({"error": "Category is required."}), 400

    try:
        limit = float(limit)
        if limit <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({"error": "A positive budget limit is required."}), 400

    # Check if budget for this category & month already exists
    budget = Budget.query.filter_by(
        user_id=user_id,
        category=category,
        month=month,
        year=year
    ).first()

    if budget:
        budget.monthly_limit = limit
        budget.color = color
    else:
        budget = Budget(
            user_id=user_id,
            category=category,
            monthly_limit=limit,
            color=color,
            month=month,
            year=year
        )
        db.session.add(budget)

    db.session.commit()

    # Calculate spent
    spent = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        Transaction.category == category,
        extract("month", Transaction.date) == month,
        extract("year", Transaction.date) == year
    ).scalar() or 0.0

    return jsonify({
        "message": "Budget saved successfully.",
        "budget": budget.to_dict(current_spent=float(spent))
    }), 201


@budgets_bp.route("/<int:budget_id>", methods=["PUT"])
@jwt_required()
def update_budget(budget_id):
    user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({"error": "Budget not found."}), 404

    data = request.get_json() or {}
    if "limit" in data or "monthly_limit" in data:
        try:
            val = float(data.get("limit") or data.get("monthly_limit"))
            if val > 0:
                budget.monthly_limit = val
        except ValueError:
            pass
    if "color" in data:
        budget.color = data["color"].strip()

    db.session.commit()

    # Calculate spent
    spent = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense",
        Transaction.category == budget.category,
        extract("month", Transaction.date) == budget.month,
        extract("year", Transaction.date) == budget.year
    ).scalar() or 0.0

    return jsonify({
        "message": "Budget updated successfully.",
        "budget": budget.to_dict(current_spent=float(spent))
    }), 200


@budgets_bp.route("/<int:budget_id>", methods=["DELETE"])
@jwt_required()
def delete_budget(budget_id):
    user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({"error": "Budget not found."}), 404

    db.session.delete(budget)
    db.session.commit()
    return jsonify({"message": "Budget deleted successfully."}), 200
