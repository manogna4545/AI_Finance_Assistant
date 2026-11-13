from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Transaction, Budget

transactions_bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")


@transactions_bp.route("", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())
    query = Transaction.query.filter_by(user_id=user_id)

    # Search filter
    search = request.args.get("search", "").strip()
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Transaction.title.ilike(search_filter)) |
            (Transaction.description.ilike(search_filter)) |
            (Transaction.category.ilike(search_filter))
        )

    # Type filter (income vs expense)
    tx_type = request.args.get("type", "").strip().lower()
    if tx_type in ("income", "expense"):
        query = query.filter_by(transaction_type=tx_type)

    # Category filter
    category = request.args.get("category", "").strip()
    if category and category.lower() != "all":
        query = query.filter(Transaction.category.ilike(category))

    # Date range filters
    start_date = request.args.get("start_date", "").strip()
    end_date = request.args.get("end_date", "").strip()
    if start_date:
        try:
            query = query.filter(Transaction.date >= datetime.strptime(start_date, "%Y-%m-%d").date())
        except ValueError:
            pass
    if end_date:
        try:
            query = query.filter(Transaction.date <= datetime.strptime(end_date, "%Y-%m-%d").date())
        except ValueError:
            pass

    # Order by date descending, then id descending
    transactions = query.order_by(Transaction.date.desc(), Transaction.id.desc()).all()
    return jsonify({
        "count": len(transactions),
        "transactions": [t.to_dict() for t in transactions]
    }), 200


@transactions_bp.route("", methods=["POST"])
@jwt_required()
def add_transaction():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    amount = data.get("amount")
    tx_type = data.get("type") or data.get("transaction_type") or "expense"
    tx_type = tx_type.strip().lower()
    category = data.get("category", "Other").strip()
    date_str = data.get("date", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return jsonify({"error": "Transaction title is required."}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({"error": "A positive numerical amount is required."}), 400

    if tx_type not in ("income", "expense"):
        return jsonify({"error": "Transaction type must be 'income' or 'expense'."}), 400

    try:
        tx_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else date.today()
    except ValueError:
        tx_date = date.today()

    new_tx = Transaction(
        user_id=user_id,
        title=title,
        amount=amount,
        transaction_type=tx_type,
        category=category,
        date=tx_date,
        description=description
    )
    db.session.add(new_tx)
    db.session.commit()

    return jsonify({
        "message": "Transaction recorded successfully.",
        "transaction": new_tx.to_dict()
    }), 201


@transactions_bp.route("/<int:tx_id>", methods=["PUT"])
@jwt_required()
def update_transaction(tx_id):
    user_id = int(get_jwt_identity())
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
    if not tx:
        return jsonify({"error": "Transaction not found."}), 404

    data = request.get_json() or {}
    if "title" in data and data["title"].strip():
        tx.title = data["title"].strip()
    if "amount" in data:
        try:
            amt = float(data["amount"])
            if amt > 0:
                tx.amount = amt
        except ValueError:
            pass
    if "type" in data or "transaction_type" in data:
        t_type = (data.get("type") or data.get("transaction_type")).strip().lower()
        if t_type in ("income", "expense"):
            tx.transaction_type = t_type
    if "category" in data and data["category"].strip():
        tx.category = data["category"].strip()
    if "date" in data and data["date"].strip():
        try:
            tx.date = datetime.strptime(data["date"].strip(), "%Y-%m-%d").date()
        except ValueError:
            pass
    if "description" in data:
        tx.description = data["description"].strip()

    db.session.commit()
    return jsonify({
        "message": "Transaction updated successfully.",
        "transaction": tx.to_dict()
    }), 200


@transactions_bp.route("/<int:tx_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(tx_id):
    user_id = int(get_jwt_identity())
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
    if not tx:
        return jsonify({"error": "Transaction not found."}), 404

    db.session.delete(tx)
    db.session.commit()
    return jsonify({"message": "Transaction deleted successfully."}), 200
