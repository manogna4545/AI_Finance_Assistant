import os
from app import create_app, db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        # Ensure database tables exist
        db.create_all()

    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

    print(f"Starting AI Finance Assistant backend on port {port} (Debug: {debug})...")
    app.run(host="0.0.0.0", port=port, debug=debug)
