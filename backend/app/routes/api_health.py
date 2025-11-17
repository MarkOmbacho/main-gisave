from flask import jsonify
from app import app

@app.route('/api/health')
def api_health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'GISAVE API',
        'version': '1.0.0',
        'endpoints': {
            'blogs': '/blogs/',
            'mentors': '/mentors/list',
            'programs': '/programs/',
            'auth': '/auth/check'
        }
    }), 200

@app.route('/api/status')
def api_status():
    return jsonify({
        'status': 'ok',
        'message': 'GISAVE API is running',
        'timestamp': '2025-11-07'
    }), 200