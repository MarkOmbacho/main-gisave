from flask_cors import CORS
from app import app

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",    # Local development
            "http://localhost:4173",    # Local preview
            "https://main-gisave.vercel.app",  # Production frontend
            "http://main-gisave.vercel.app"    # Non-HTTPS access (optional)
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})