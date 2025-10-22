from flask_cors import CORS
from app import app

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:8080",  # Local development
            "https://main-gisave.vercel.app",  # Production frontend
            "https://gisave.vercel.app"  # Alternative production domain
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})