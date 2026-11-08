from flask import Blueprint, session, request, jsonify
from app.services import friend_service, chat_service, group_service

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/get_chat_history/<int:friend_id>')
def get_chat_history(friend_id: int):
    """Retrieve full chat history between current user and a friend."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']
    try:
        if not friend_service.are_friends(user_id, friend_id):
            return jsonify({'error': 'Not friends'}), 403

        messages = chat_service.get_direct_chat_history(user_id, friend_id)
        return jsonify(messages)
    except Exception as e:
        print(f"[Chat Error] get_chat_history: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@chat_bp.route('/get_messages/<int:user_id>')
def get_messages(user_id: int):
    """Alias endpoint for retrieving messages."""
    return get_chat_history(user_id)

@chat_bp.route('/send_message', methods=['POST'])
def send_message_api():
    """REST API endpoint for sending a direct message."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    sender_id = session['user_id']
    receiver_id = data.get('receiver_id')
    content = data.get('content', '').strip()

    if not receiver_id or not content:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        if not friend_service.are_friends(sender_id, int(receiver_id)):
            return jsonify({'error': 'Cannot send message to non-friend'}), 403

        message_data = chat_service.save_direct_message(sender_id, int(receiver_id), content)

        # Broadcast via SocketIO if initialized
        try:
            from app import socketio
            for room in (f"user_{sender_id}", f"user_{receiver_id}"):
                socketio.emit('new_message', message_data, room=room)
                socketio.emit('message', message_data, room=room)
                socketio.emit('receive_message', message_data, room=room)
        except Exception as sock_err:
            print(f"[Chat Warning] Socket broadcast failed: {sock_err}")

        return jsonify({'success': True, 'message': message_data})
    except Exception as e:
        print(f"[Chat Error] send_message_api: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@chat_bp.route('/send_group_message', methods=['POST'])
def send_group_message_api():
    """REST API endpoint for sending a group message."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    sender_id = session['user_id']
    group_id = data.get('group_id')
    content = data.get('content', '').strip()

    if not group_id or not content:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        if not group_service.is_group_member(int(group_id), sender_id):
            return jsonify({'error': 'Not a member of this group'}), 403

        message_data = chat_service.save_group_message(int(group_id), sender_id, content)

        try:
            from app import socketio
            members = group_service.get_group_members(int(group_id))
            for member in members:
                member_room = f"user_{member['id']}"
                socketio.emit('new_group_message', message_data, room=member_room)
                socketio.emit('group_message', message_data, room=member_room)
                socketio.emit('receive_group_message', message_data, room=member_room)
        except Exception as sock_err:
            print(f"[Chat Warning] Socket broadcast failed: {sock_err}")

        return jsonify({'success': True, 'message': message_data})
    except Exception as e:
        print(f"[Chat Error] send_group_message_api: {e}")
        return jsonify({'error': 'Internal server error'}), 500

