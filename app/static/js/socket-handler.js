// Khởi tạo socket connection
const socket = io({
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

// Socket connection handlers
socket.on('connect', () => {
    console.log('Socket connected');
    
    // Đăng ký người dùng khi kết nối thành công
    const currentUserId = document.getElementById('current-user-id').value;
    socket.emit('register_user', { user_id: currentUserId });
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

// Message handlers
socket.on('receive_message', (data) => {
    console.log('Received private message:', data);
    if (window.appendMessage) {
        window.appendMessage(data);
    }
});

socket.on('receive_group_message', (data) => {
    console.log('Received group message:', data);
    if (window.appendGroupMessage) {
        window.appendGroupMessage(data);
    }
});

// Room handlers
function joinPrivateRoom(receiverId) {
    if (receiverId) {
        console.log('Joining private room with:', receiverId);
        socket.emit('join', { receiver_id: receiverId });
    }
}

function joinGroupRoom(groupId) {
    if (groupId) {
        console.log('Joining group room:', groupId);
        socket.emit('join_group', { group_id: groupId });
    }
}

function leavePrivateRoom(receiverId) {
    if (receiverId) {
        console.log('Leaving private room with:', receiverId);
        socket.emit('leave', { receiver_id: receiverId });
    }
}

function leaveGroupRoom(groupId) {
    if (groupId) {
        console.log('Leaving group room:', groupId);
        socket.emit('leave_group', { group_id: groupId });
    }
}

// Export functions
window.socket = socket;
window.joinPrivateRoom = joinPrivateRoom;
window.joinGroupRoom = joinGroupRoom;
window.leavePrivateRoom = leavePrivateRoom;
window.leaveGroupRoom = leaveGroupRoom;