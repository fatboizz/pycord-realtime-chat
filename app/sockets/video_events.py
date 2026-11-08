from flask import session
from flask_socketio import emit, join_room, leave_room
from app.services import auth_service, group_service

# In-memory store for active group video calls
active_group_calls = {}

def register_video_events(socketio):
    """Register all Socket.IO WebRTC signaling event handlers."""

    # --------------------------------------------------------------------------
    # 1-on-1 Video Calling Events
    # --------------------------------------------------------------------------
    @socketio.on('video-call-offer')
    def handle_call_offer(data):
        caller_id = session.get('user_id') or data.get('callerId')
        receiver_id = data.get('receiverId')
        if not caller_id or not receiver_id:
            return

        try:
            caller = auth_service.get_user_by_id(caller_id)
            caller_name = caller['username'] if caller else 'Someone'

            emit('video-call-offer', {
                'offer': data.get('offer'),
                'callerId': caller_id,
                'callerName': caller_name
            }, room=f'user_{receiver_id}')
        except Exception as e:
            print(f"[Socket Error] handle_call_offer: {e}")

    @socketio.on('video-call-answer')
    def handle_call_answer(data):
        try:
            caller_id = data.get('callerId')
            if caller_id:
                emit('video-call-answer', {
                    'answer': data.get('answer')
                }, room=f'user_{caller_id}')
        except Exception as e:
            print(f"[Socket Error] handle_call_answer: {e}")

    @socketio.on('ice-candidate')
    def handle_ice_candidate(data):
        try:
            receiver_id = data.get('receiverId')
            if receiver_id:
                emit('ice-candidate', {
                    'candidate': data.get('candidate')
                }, room=f'user_{receiver_id}')
        except Exception as e:
            print(f"[Socket Error] handle_ice_candidate: {e}")

    @socketio.on('end-call')
    def handle_end_call_dash(data):
        try:
            receiver_id = data.get('receiverId')
            if receiver_id:
                emit('call-ended', room=f'user_{receiver_id}')
        except Exception as e:
            print(f"[Socket Error] handle_end_call_dash: {e}")

    @socketio.on('end_call')
    def handle_end_call_underscore(data):
        try:
            room = data.get('room')
            receiver_id = data.get('receiverId') or data.get('user_id')
            if room:
                emit('call_ended', {'room': room}, room=room)
                emit('call-ended', {'room': room}, room=room)
            elif receiver_id:
                emit('call-ended', room=f'user_{receiver_id}')
                emit('call_ended', room=f'user_{receiver_id}')
        except Exception as e:
            print(f"[Socket Error] handle_end_call_underscore: {e}")

    @socketio.on('video-call-rejected')
    def handle_call_rejected(data):
        try:
            caller_id = data.get('callerId')
            if caller_id:
                emit('call-rejected', room=f'user_{caller_id}')
        except Exception as e:
            print(f"[Socket Error] handle_call_rejected: {e}")

    # --------------------------------------------------------------------------
    # Group Video Calling Events
    # --------------------------------------------------------------------------
    @socketio.on('start_group_call')
    def handle_start_group_call(data):
        group_id = data.get('group_id')
        caller_id = session.get('user_id') or data.get('caller_id')
        if not group_id or not caller_id:
            return

        try:
            caller = auth_service.get_user_by_id(caller_id)
            caller_name = caller['username'] if caller else 'Someone'

            members = group_service.get_group_members(group_id)
            room = f'group_call_{group_id}'
            join_room(room)

            # Notify all other group members of incoming group call
            for member in members:
                if member['id'] != caller_id:
                    emit('incoming_group_call', {
                        'group_id': group_id,
                        'caller_id': caller_id,
                        'callerName': caller_name,
                        'room': room
                    }, room=f"user_{member['id']}")

        except Exception as e:
            print(f"[Socket Error] handle_start_group_call: {e}")

    @socketio.on('join_group_call')
    def handle_join_group_call(data):
        group_id = data.get('group_id')
        user_id = session.get('user_id') or data.get('userId')
        username = data.get('username')

        if not group_id:
            return

        if group_id not in active_group_calls:
            active_group_calls[group_id] = {
                'participants': {},
                'room': f'group_call_{group_id}'
            }

        room = active_group_calls[group_id]['room']
        join_room(room)

        active_group_calls[group_id]['participants'][user_id] = {
            'username': username,
            'peerId': data.get('peerId')
        }

        emit('user_joined_group_call', {
            'userId': user_id,
            'username': username,
            'peerId': data.get('peerId'),
            'participants': active_group_calls[group_id]['participants']
        }, room=room)

    @socketio.on('leave_group_call')
    def handle_leave_group_call(data):
        group_id = data.get('group_id')
        user_id = session.get('user_id') or data.get('userId')

        if group_id in active_group_calls:
            room = active_group_calls[group_id]['room']
            if user_id in active_group_calls[group_id]['participants']:
                del active_group_calls[group_id]['participants'][user_id]

            if not active_group_calls[group_id]['participants']:
                del active_group_calls[group_id]

            leave_room(room)
            emit('user_left_group_call', {'userId': user_id}, room=room)

    @socketio.on('group_call_signal')
    def handle_group_call_signal(data):
        group_id = data.get('group_id')
        if group_id in active_group_calls:
            room = active_group_calls[group_id]['room']
            emit('group_call_signal', {
                'signal': data.get('signal'),
                'from': session.get('user_id') or data.get('from'),
                'to': data.get('to')
            }, room=room)

