import io
import csv
from datetime import datetime
from flask import Blueprint, jsonify, Response, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from .. import db
from ..models import User, Transaction

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("/monthly", methods=["GET"])
@jwt_required()
def get_monthly_report():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    now = datetime.utcnow()

    # Aggregate financial metrics
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
    net_surplus = total_income - total_expenses
    savings_rate = round(((total_income - total_expenses) / total_income) * 100) if total_income > 0 else 0

    # Category breakdown
    cat_query = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "expense"
    ).group_by(Transaction.category).all()

    category_breakdown = [
        {
            "name": cat,
            "value": round(float(tot), 2),
            "percentage": round((float(tot) / total_expenses * 100), 1) if total_expenses > 0 else 0.0
        }
        for cat, tot in cat_query
    ]

    return jsonify({
        "statement_date": now.strftime("%B %d, %Y"),
        "client_name": user.username,
        "email": user.email,
        "currency": user.currency,
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_surplus": round(net_surplus, 2),
        "savings_rate": savings_rate,
        "categories": category_breakdown
    }), 200


@reports_bp.route("/export-csv", methods=["GET"])
@jwt_required()
def export_csv():
    user_id = int(get_jwt_identity())
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Type", "Category", "Amount", "Date", "Description"])

    for t in transactions:
        writer.writerow([
            t.id,
            t.title,
            t.transaction_type,
            t.category,
            t.amount,
            t.date.isoformat() if t.date else "",
            t.description or ""
        ])

    output.seek(0)
    filename = f"financial_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
