"""
Application Entrypoint for DACS2 Real-Time Platform.
Enables backward-compatible execution via 'python app.py'.
"""
import os
from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = app.config.get('DEBUG', True)
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=debug
    )
