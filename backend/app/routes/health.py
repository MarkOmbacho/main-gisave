from flask import jsonify, request
from app import app

@app.route('/health')
def health_check():
    # Get the origin of the request
    origin = request.headers.get('Origin', 'Unknown')
    
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'environment': app.config['FLASK_ENV'],
        'client_origin': origin,
        'cors_enabled': True,
        'database_connected': True,  # This will be dynamic once DB health check is implemented
        'api_base_url': request.url_root
    }), 200