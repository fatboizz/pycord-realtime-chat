from flask import Flask
from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt
from app.config import get_config

socketio = SocketIO()
bcrypt = Bcrypt()

def create_app(config_class=None):
    """
    Application Factory creating and configuring the Flask application instance.
    """
    if config_class is None:
        config_class = get_config()

    app = Flask(
        __name__,
        static_folder='static',
        template_folder='templates'
    )
    app.config.from_object(config_class)

    # Initialize Flask extensions
    bcrypt.init_app(app)
    socketio.init_app(
        app,
        cors_allowed_origins=app.config.get('SOCKETIO_CORS_ALLOWED_ORIGINS', '*'),
        async_mode=None
    )

    # Register Route Blueprints
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.chat import chat_bp
    from app.routes.friend import friend_bp
    from app.routes.group import group_bp
    from app.routes.video_call import video_call_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(friend_bp)
    app.register_blueprint(group_bp)
    app.register_blueprint(video_call_bp)

    # Register Socket.IO Event Handlers
    from app.sockets.chat_events import register_chat_events
    from app.sockets.video_events import register_video_events

    register_chat_events(socketio)
    register_video_events(socketio)

    return app

