"""
Comprehensive API test suite for AI Finance Assistant backend.
"""
import json
from app import create_app, db
from app.models import User, Transaction, Budget, AIChatHistory


def run_tests():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    client = app.test_client()

    with app.app_context():
        db.create_all()

    print("\n--- 1. Testing Health Check ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("[PASS] /api/health passed")

    print("\n--- 2. Testing User Registration ---")
    reg_payload = {
        "username": "Sarah Connor",
        "email": "sarah@resistance.org",
        "password": "secretpassword123",
        "currency": "$",
        "monthly_budget": 4000.0
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Register failed: {res.data}"
    reg_data = json.loads(res.data)
    token = reg_data["token"]
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] /api/auth/register passed")

    print("\n--- 3. Testing User Login ---")
    login_payload = {
        "email": "sarah@resistance.org",
        "password": "secretpassword123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.data}"
    print("[PASS] /api/auth/login passed")

    print("\n--- 4. Testing Demo Login ---")
    res = client.post("/api/auth/demo-login")
    assert res.status_code == 200, f"Demo login failed: {res.data}"
    demo_token = json.loads(res.data)["token"]
    demo_headers = {"Authorization": f"Bearer {demo_token}"}
    print("[PASS] /api/auth/demo-login passed")

    print("\n--- 5. Testing Transactions CRUD ---")
    # Get initial transactions
    res = client.get("/api/transactions", headers=headers)
    assert res.status_code == 200
    initial_count = json.loads(res.data)["count"]
    print(f"  Initial seeded transactions count: {initial_count}")

    # Add transaction
    new_tx = {
        "title": "Supermarket Groceries",
        "amount": 95.50,
        "type": "expense",
        "category": "Groceries",
        "date": "2026-11-12",
        "description": "Weekly essentials"
    }
    res = client.post("/api/transactions", headers=headers, json=new_tx)
    assert res.status_code == 201
    created_tx = json.loads(res.data)["transaction"]
    tx_id = created_tx["id"]
    print(f"[PASS] Added transaction id: {tx_id}")

    # Edit transaction
    res = client.put(f"/api/transactions/{tx_id}", headers=headers, json={"amount": 105.00})
    assert res.status_code == 200
    assert json.loads(res.data)["transaction"]["amount"] == 105.00
    print("[PASS] Edited transaction")

    # Delete transaction
    res = client.delete(f"/api/transactions/{tx_id}", headers=headers)
    assert res.status_code == 200
    print("[PASS] Deleted transaction")

    print("\n--- 6. Testing Budgets ---")
    res = client.get("/api/budgets", headers=headers)
    assert res.status_code == 200
    print(f"[PASS] /api/budgets passed with {len(json.loads(res.data)['budgets'])} categories")

    res = client.post("/api/budgets", headers=headers, json={"category": "Fitness", "limit": 120.0, "color": "#10b981"})
    assert res.status_code == 201
    print("[PASS] Created new budget category")

    print("\n--- 7. Testing Analytics Dashboard ---")
    res = client.get("/api/analytics/dashboard", headers=headers)
    assert res.status_code == 200
    dash_data = json.loads(res.data)
    assert "total_balance" in dash_data
    assert "monthly_trends" in dash_data
    print(f"[PASS] /api/analytics/dashboard passed (Balance: ${dash_data['total_balance']})")

    print("\n--- 8. Testing Predictions ---")
    res = client.get("/api/predictions", headers=headers)
    assert res.status_code == 200
    pred_data = json.loads(res.data)
    assert len(pred_data["forecast"]) > 0
    print(f"[PASS] /api/predictions passed with algorithm: {pred_data['algorithm']}")

    print("\n--- 9. Testing AI Assistant ---")
    chat_payload = {"message": "How is my dining spending?"}
    res = client.post("/api/ai/chat", headers=headers, json=chat_payload)
    assert res.status_code == 200
    chat_data = json.loads(res.data)
    print(f"[PASS] /api/ai/chat responded: {chat_data['assistant_message']['message'][:60]}...")

    res = client.get("/api/ai/history", headers=headers)
    assert res.status_code == 200
    print(f"[PASS] /api/ai/history passed ({json.loads(res.data)['count']} messages)")

    print("\n--- 10. Testing Reports & CSV ---")
    res = client.get("/api/reports/monthly", headers=headers)
    assert res.status_code == 200
    print("[PASS] /api/reports/monthly passed")

    res = client.get("/api/reports/export-csv", headers=headers)
    assert res.status_code == 200
    assert "text/csv" in res.content_type
    print("[PASS] /api/reports/export-csv passed")

    print("\n--- 11. Testing Login with 'identifier' field ---")
    id_login_payload = {
        "identifier": "sarah@resistance.org",
        "password": "secretpassword123"
    }
    res = client.post("/api/auth/login", json=id_login_payload)
    assert res.status_code == 200, f"Identifier login failed: {res.data}"
    print("[PASS] Login with 'identifier' passed")

    print("\n--- 12. Testing CORS Preflight (OPTIONS) with Cache-Control ---")
    res = client.open(
        "/api/transactions",
        method="OPTIONS",
        headers={
            "Origin": "https://ai-finance-assistant-frontend-plum.vercel.app",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization, cache-control, content-type"
        }
    )
    assert res.status_code in (200, 204), f"Preflight failed: {res.status_code}"
    origin_header = res.headers.get("Access-Control-Allow-Origin")
    assert origin_header == "https://ai-finance-assistant-frontend-plum.vercel.app", f"Wrong origin header: {origin_header}"
    allow_headers = res.headers.get("Access-Control-Allow-Headers", "").lower()
    assert "cache-control" in allow_headers, f"Cache-Control not allowed in: {allow_headers}"
    print("[PASS] CORS preflight OPTIONS with Cache-Control passed")

    print("\n--- 13. Testing Trailing Slash Route Resolution ---")
    # GET /api/transactions/ without redirect
    res = client.get("/api/transactions/", headers=headers)
    assert res.status_code == 200, f"Expected 200 for trailing slash, got {res.status_code}"
    print("[PASS] Trailing slash resolved with 200 OK (no redirect)")

    print("\n--- 14. Testing Field Parity in Transactions and Budgets ---")
    res = client.get("/api/transactions", headers=headers)
    tx_list = json.loads(res.data)["transactions"]
    if tx_list:
        sample = tx_list[0]
        assert "type" in sample and "transaction_type" in sample, f"Missing type parity: {sample}"
        assert sample["type"] == sample["transaction_type"]
    res = client.get("/api/budgets", headers=headers)
    b_list = json.loads(res.data)["budgets"]
    if b_list:
        b_sample = b_list[0]
        assert "limit" in b_sample and "monthly_limit" in b_sample, f"Missing budget limit parity: {b_sample}"
    print("[PASS] Field parity verified for type/transaction_type and limit/monthly_limit")

    print("\n==========================================")
    print(" ALL 14 TEST SUITES PASSED WITH 0 ERRORS! ")
    print("==========================================\n")


if __name__ == "__main__":
    run_tests()
