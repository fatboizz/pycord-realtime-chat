from flask import Blueprint, jsonify, session, request
from app.services import group_service, chat_service

group_bp = Blueprint('group', __name__)

@group_bp.route('/get_user_groups')
def get_user_groups():
    """Retrieve all groups the current user belongs to."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        groups = group_service.get_user_groups(session['user_id'])
        return jsonify(groups)
    except Exception as e:
        print(f"[Group Error] get_user_groups: {e}")
        return jsonify({'error': 'Failed to get groups'}), 500

@group_bp.route('/create_group', methods=['POST'])
def create_group():
    """Create a new group with specified members."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    group_name = data.get('name', '').strip()
    member_ids = data.get('members', [])

    if not group_name:
        return jsonify({'error': 'Group name is required'}), 400

    try:
        member_ids = [int(mid) for mid in member_ids]
        group_info = group_service.create_group(group_name, session['user_id'], member_ids)

        return jsonify({
            'success': True,
            'message': 'Group created successfully',
            'group': group_info
        })
    except Exception as e:
        print(f"[Group Error] create_group: {e}")
        return jsonify({'error': f'Failed to create group: {str(e)}'}), 500

@group_bp.route('/get_group_messages/<int:group_id>')
def get_group_messages(group_id: int):
    """Retrieve all messages for a specific group."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        if not group_service.is_group_member(group_id, session['user_id']):
            return jsonify({'error': 'Not a member of this group'}), 403

        messages = chat_service.get_group_messages(group_id)
        return jsonify(messages)
    except Exception as e:
        print(f"[Group Error] get_group_messages: {e}")
        return jsonify({'error': 'Failed to get group messages'}), 500

@group_bp.route('/get_group_members/<int:group_id>')
def get_group_members(group_id: int):
    """Retrieve the member list for a specific group."""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        if not group_service.is_group_member(group_id, session['user_id']):
            return jsonify({'error': 'Not a member of this group'}), 403

        members = group_service.get_group_members(group_id)
        return jsonify(members)
    except Exception as e:
        print(f"[Group Error] get_group_members: {e}")
        return jsonify({'error': 'Failed to get members'}), 500

