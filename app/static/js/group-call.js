let groupCallPeers = {};
let localGroupStream = null;
let groupCallActive = false;
let currentGroupCallId = null;

function startGroupVideoCall() {
    if (!currentGroupId) return;
    
    console.log('Starting group video call for group:', currentGroupId);
    
    // Emit event để bắt đầu cuộc gọi nhóm
    socket.emit('start_group_call', {
        group_id: currentGroupId
    });
    
    // Hiển thị modal cuộc gọi nhóm
    const groupVideoCallModal = document.getElementById('groupVideoCallModal');
    if (groupVideoCallModal) {
        groupVideoCallModal.style.display = 'block';
    }
    
    // Khởi tạo media stream
    initializeGroupCallMedia();
}

function initializeGroupCallMedia() {
    // Kiểm tra hỗ trợ getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ Video Call');
        return;
    }

    navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
    })
    .then(stream => {
        console.log('Got local stream:', stream);
        localGroupStream = stream;
        
        // Hiển thị video local
        const localVideo = document.getElementById('localGroupVideo');
        if (localVideo) {
            localVideo.srcObject = stream;
        }
        
        // Khởi tạo kết nối với các peer hiện tại
        socket.emit('join_group_call', {
            group_id: currentGroupId,
            username: currentUsername
        });
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Không thể truy cập camera hoặc microphone: ' + error.message);
    });
}

// Xử lý khi nhận được thông báo có cuộc gọi nhóm đến
socket.on('incoming_group_call', (data) => {
    console.log('Received incoming group call:', data);
    const groupCallModal = document.getElementById('incomingGroupCallModal');
    if (groupCallModal) {
        // Hiển thị modal
        groupCallModal.style.display = 'block';
        
        // Cập nhật tên người gọi
        const callerName = document.getElementById('groupCallerName');
        if (callerName) {
            callerName.textContent = `${data.callerName} đang gọi...`;
        }
        
        // Lưu thông tin cuộc gọi
        currentGroupCallId = data.group_id;
    }
});

function acceptGroupCall() {
    const modal = document.getElementById('incomingGroupCallModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Hiển thị modal video call
    document.getElementById('groupVideoCallModal').style.display = 'block';
    
    // Khởi tạo media
    initializeGroupCallMedia();
}

function rejectGroupCall() {
    const modal = document.getElementById('incomingGroupCallModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    socket.emit('reject_group_call', {
        group_id: currentGroupCallId
    });
    
    currentGroupCallId = null;
}

// Cập nhật hàm handleNewGroupParticipant
function handleNewGroupParticipant(participant) {
    if (!localGroupStream) {
        console.error('Local stream not initialized');
        return;
    }

    const peer = new SimplePeer({
        initiator: true,
        stream: localGroupStream,
        trickle: false
    });

    peer.on('signal', signal => {
        socket.emit('group_call_signal', {
            group_id: currentGroupCallId,
            signal: signal,
            to: participant.userId
        });
    });

    peer.on('stream', stream => {
        console.log('Received stream from peer:', participant.userId);
        addVideoStream(participant.userId, participant.username, stream);
    });

    peer.on('error', err => {
        console.error('Peer error:', err);
    });

    groupCallPeers[participant.userId] = peer;
}

function addVideoStream(userId, username, stream) {
    const videoGrid = document.getElementById('groupVideoGrid');
    
    // Kiểm tra xem video đã tồn tại chưa
    const existingVideo = document.getElementById(`group-video-${userId}`);
    if (existingVideo) {
        existingVideo.srcObject = stream;
        return;
    }
    
    // Tạo các elements mới
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-wrapper';
    
    const video = document.createElement('video');
    video.id = `group-video-${userId}`;
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;
    
    const nameLabel = document.createElement('div');
    nameLabel.className = 'video-label';
    nameLabel.textContent = username;
    
    videoWrapper.appendChild(video);
    videoWrapper.appendChild(nameLabel);
    videoGrid.appendChild(videoWrapper);
}

function leaveGroupCall() {
    if (currentGroupCallId) {
        socket.emit('leave_group_call', {
            group_id: currentGroupCallId
        });

        // Cleanup
        if (localGroupStream) {
            localGroupStream.getTracks().forEach(track => track.stop());
        }

        Object.values(groupCallPeers).forEach(peer => {
            peer.destroy();
        });

        groupCallPeers = {};
        localGroupStream = null;
        groupCallActive = false;
        currentGroupCallId = null;

        // Reset UI
        document.getElementById('groupVideoGrid').innerHTML = '';
        document.getElementById('groupVideoCallModal').style.display = 'none';
    }
}

// Socket event listeners
socket.on('user_joined_group_call', data => {
    console.log('User joined group call:', data);
    handleNewGroupParticipant(data);
});

socket.on('user_left_group_call', data => {
    if (groupCallPeers[data.userId]) {
        groupCallPeers[data.userId].destroy();
        delete groupCallPeers[data.userId];
        
        const videoElement = document.getElementById(`group-video-${data.userId}`);
        if (videoElement) {
            videoElement.parentElement.remove();
        }
    }
});

socket.on('group_call_signal', data => {
    if (data.to === myPeerId && groupCallPeers[data.from]) {
        groupCallPeers[data.from].signal(data.signal);
    }
});