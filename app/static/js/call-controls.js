// Biến toàn cục để theo dõi trạng thái cuộc gọi
let isInCall = false;

// Xử lý kết thúc cuộc gọi
function handleEndCall() {
    console.log('Handling end call');
    console.log('isGroupCall:', isGroupCall);
    console.log('currentCallUser:', currentCallUser);
    console.log('currentGroupId:', currentGroupId);

    // Dừng tất cả các tracks của localStream
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped track:', track.kind);
        });
    }

    // Đóng peer connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        console.log('Closed peer connection');
    }

    // Đóng group call connections
    if (groupCallMembers) {
        groupCallMembers.forEach((pc, userId) => {
            pc.close();
            console.log('Closed group peer connection for user:', userId);
        });
        groupCallMembers.clear();
    }

    // Gửi tín hiệu kết thúc cuộc gọi
    if (isGroupCall && currentGroupId) {
        socket.emit('leave_group_call', {
            group_id: currentGroupId,
            username: document.getElementById('current-username').value
        });
        console.log('Emitted leave_group_call signal');
    } else if (currentCallUser) {
        socket.emit('end_call', {
            user_id: currentCallUser
        });
        console.log('Emitted end_call signal');
    }

    // Reset video elements
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;

    // Đóng các modal
    document.getElementById('callModal').style.display = 'none';
    document.getElementById('incomingCallModal').style.display = 'none';

    // Reset các biến trạng thái
    isInCall = false;
    isGroupCall = false;
    currentCallUser = null;
    localStream = null;

    console.log('Call ended successfully');
}

// Cập nhật trạng thái cuộc gọi
function updateCallStatus(inCall) {
    isInCall = inCall;
    const endCallBtn = document.getElementById('endCallBtn');
    if (endCallBtn) {
        endCallBtn.disabled = !inCall;
    }
}

// Khởi tạo các controls
document.addEventListener('DOMContentLoaded', function() {
    // Thêm event listener cho nút kết thúc
    const endCallBtn = document.getElementById('endCallBtn');
    if (endCallBtn) {
        endCallBtn.onclick = handleEndCall;
        console.log('Added click handler to end call button');
    }
});

// Export các hàm để các module khác có thể sử dụng
window.handleEndCall = handleEndCall;
window.updateCallStatus = updateCallStatus; 