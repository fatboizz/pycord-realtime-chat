"""
Primary Application Runner for DACS2 Real-Time Platform.
Usage:
    python run.py
"""
import os
from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = app.config.get('DEBUG', True)
    print(f"[*] Starting DACS2 Real-Time Platform on http://localhost:{port} (Debug: {debug})")
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=debug
    )

