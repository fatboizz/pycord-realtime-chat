from flask import Blueprint, jsonify, session, request
from app.services import friend_service

friend_bp = Blueprint('friend', __name__)

@friend_bp.route('/get_friends')
def get_friends():
    """Retrieve all friends for the currently logged-in user."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        friends = friend_service.get_friends_for_user(session['user_id'])
        return jsonify(friends)
    except Exception as e:
        print(f"[Friend Error] get_friends: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@friend_bp.route('/search_users', methods=['POST'])
def search_users():
    """Search for users by username or email with friendship status."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    search_term = data.get('search_term', '').strip()
    if not search_term:
        return jsonify([])

    try:
        users = friend_service.search_users(session['user_id'], search_term)
        return jsonify(users)
    except Exception as e:
        print(f"[Friend Error] search_users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@friend_bp.route('/send_friend_request', methods=['POST'])
def send_friend_request():
    """Send a new friend request."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    friend_id = data.get('friend_id')
    if not friend_id:
        return jsonify({'error': 'Friend ID is required'}), 400

    try:
        friend_id = int(friend_id)
        if friend_id == session['user_id']:
            return jsonify({'error': 'Cannot add yourself as a friend'}), 400

        existing = friend_service.get_existing_friendship(session['user_id'], friend_id)
        if existing:
            return jsonify({'error': 'Friend request already exists or you are already friends'}), 400

        friend_service.send_friend_request(session['user_id'], friend_id)
        return jsonify({'message': 'Friend request sent successfully'})
    except Exception as e:
        print(f"[Friend Error] send_friend_request: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@friend_bp.route('/handle_friend_request', methods=['POST'])
def handle_friend_request():
    """Accept or reject an incoming friend request."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    friend_id = data.get('friend_id')
    action = data.get('action')  # 'accept' or 'reject'

    if not friend_id or action not in ('accept', 'reject'):
        return jsonify({'error': 'Missing or invalid required fields'}), 400

    try:
        friend_id = int(friend_id)
        friend_service.handle_friend_request(friend_id, session['user_id'], action)
        return jsonify({'message': f'Friend request {action}ed successfully'})
    except Exception as e:
        print(f"[Friend Error] handle_friend_request: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@friend_bp.route('/get_friend_requests')
def get_friend_requests():
    """Retrieve all pending friend requests for the current user."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        requests = friend_service.get_pending_friend_requests(session['user_id'])
        return jsonify(requests)
    except Exception as e:
        print(f"[Friend Error] get_friend_requests: {e}")
        return jsonify({'error': 'Internal server error'}), 500

