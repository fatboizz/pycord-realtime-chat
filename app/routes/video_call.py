from flask import Blueprint, jsonify, session

video_call_bp = Blueprint('video_call', __name__)

@video_call_bp.route('/video_call/ice_servers')
def get_ice_servers():
    """Retrieve STUN/TURN server configuration for WebRTC."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    ice_servers = [
        {'urls': 'stun:stun.l.google.com:19302'},
        {'urls': 'stun:stun1.l.google.com:19302'},
    ]
    return jsonify({'iceServers': ice_servers})

