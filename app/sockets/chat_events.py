from flask import session
from flask_socketio import emit, join_room, leave_room
from app.services import friend_service, chat_service, group_service

def register_chat_events(socketio):
    """Register all Socket.IO real-time chat event handlers."""

    @socketio.on('connect')
    def handle_connect():
        if 'user_id' in session:
            join_room(f"user_{session['user_id']}")

    @socketio.on('join')
    def handle_join(data=None):
        if 'user_id' in session:
            join_room(f"user_{session['user_id']}")
        elif isinstance(data, dict) and data.get('user_id'):
            join_room(f"user_{data['user_id']}")

    @socketio.on('register_user')
    def handle_register_user(data):
        user_id = data.get('user_id') or session.get('user_id')
        if user_id:
            join_room(f"user_{user_id}")

    @socketio.on('send_message')
    def handle_send_message(data):
        sender_id = session.get('user_id') or data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content') or data.get('message')

        if not sender_id or not receiver_id or not content:
            return

        try:
            # Verify friendship exists
            if not friend_service.are_friends(sender_id, receiver_id):
                return

            message_data = chat_service.save_direct_message(sender_id, receiver_id, content)

            # Broadcast to both sender and receiver rooms
            for room in (f"user_{sender_id}", f"user_{receiver_id}"):
                emit('new_message', message_data, room=room)
                emit('message', message_data, room=room)
                emit('receive_message', message_data, room=room)

        except Exception as e:
            print(f"[Socket Error] handle_send_message: {e}")

    @socketio.on('send_group_message')
    def handle_group_message(data):
        sender_id = session.get('user_id') or data.get('sender_id')
        group_id = data.get('group_id')
        content = data.get('content') or data.get('message')

        if not sender_id or not group_id or not content:
            return

        try:
            # Verify user is a member of the group
            if not group_service.is_group_member(group_id, sender_id):
                return

            message_data = chat_service.save_group_message(group_id, sender_id, content)
            members = group_service.get_group_members(group_id)

            # Broadcast to all member rooms
            for member in members:
                member_room = f"user_{member['id']}"
                emit('new_group_message', message_data, room=member_room)
                emit('group_message', message_data, room=member_room)
                emit('receive_group_message', message_data, room=member_room)

        except Exception as e:
            print(f"[Socket Error] handle_group_message: {e}")

