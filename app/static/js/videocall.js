let localStream;
let peerConnection;
let currentCallId = null;
let isCallActive = false;
let incomingCallOffer = null;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// UI Helper Functions
function showVideoCallModal() {
    const modal = document.getElementById('videoCallModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Video call modal not found');
    }
}

function hideVideoCallModal() {
    const modal = document.getElementById('videoCallModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showIncomingCallModal(callerName) {
    const modal = document.getElementById('incomingCallModal');
    const callerNameElement = document.getElementById('callerName');
    if (modal && callerNameElement) {
        callerNameElement.textContent = `${callerName} is calling...`;
        modal.style.display = 'block';
    }
}

function hideIncomingCallModal() {
    const modal = document.getElementById('incomingCallModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Kiểm tra và yêu cầu quyền truy cập media
async function checkMediaPermissions() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support video calls');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('Media permission error:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            alert('Please allow access to camera and microphone to make video calls.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            alert('No camera or microphone found. Please connect a device.');
        } else {
            alert('Error accessing media devices: ' + error.message);
        }
        return false;
    }
}

async function initiateVideoCall() {
    if (!currentChatId) {
        alert('Please select a user to call');
        return;
    }

    const hasPermissions = await checkMediaPermissions();
    if (!hasPermissions) {
        return;
    }

    try {
        console.log('Starting video call...');
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
        }
        
        showVideoCallModal();

        peerConnection = new RTCPeerConnection(configuration);
        
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    receiverId: currentChatId
                });
            }
        };
        
        peerConnection.ontrack = event => {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = event.streams[0];
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            if (peerConnection.iceConnectionState === 'disconnected') {
                alert('Call disconnected');
                endVideoCall();
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.emit('video-call-offer', {
            offer: offer,
            receiverId: currentChatId
        });

        isCallActive = true;
        
    } catch (error) {
        console.error('Error in video call:', error);
        if (error.name === 'NotAllowedError') {
            alert('Please allow access to camera and microphone');
        } else {
            alert('Error starting video call: ' + error.message);
        }
        endVideoCall();
    }
}

// Handle incoming call
function handleIncomingCall(data) {
    const { callerId, callerName, offer } = data;
    currentCallId = callerId;
    incomingCallOffer = offer;
    showIncomingCallModal(callerName);
}

// Handle call answer
async function handleCallAnswer(data) {
    try {
        const { answer } = data;
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    } catch (error) {
        console.error('Error handling call answer:', error);
    }
}

// Handle ICE candidate
async function handleIceCandidate(data) {
    try {
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
    }
}

// Handle call ended
function handleCallEnded() {
    alert('Call ended by remote user');
    endVideoCall();
}

// Handle call rejected
function handleCallRejected() {
    alert('Call rejected by remote user');
    endVideoCall();
}

function endVideoCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
            console.log(`Stopped ${track.kind} track`);
        });
    }
    
    if (peerConnection) {
        peerConnection.close();
        console.log('Closed peer connection');
    }
    
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;
    
    hideVideoCallModal();
    hideIncomingCallModal();
    
    socket.emit('end-call', {
        receiverId: currentCallId || currentChatId
    });
    
    isCallActive = false;
    currentCallId = null;
    localStream = null;
    peerConnection = null;
}

function toggleMic() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const micBtn = document.querySelector('.mic-btn');
            if (micBtn) {
                micBtn.classList.toggle('muted');
                micBtn.innerHTML = audioTrack.enabled ? 
                    '<i class="fas fa-microphone"></i>' : 
                    '<i class="fas fa-microphone-slash"></i>';
            }
        }
    }
}

function toggleCamera() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const cameraBtn = document.querySelector('.camera-btn');
            if (cameraBtn) {
                cameraBtn.classList.toggle('disabled');
                cameraBtn.innerHTML = videoTrack.enabled ? 
                    '<i class="fas fa-video"></i>' : 
                    '<i class="fas fa-video-slash"></i>';
            }
        }
    }
}

// Socket event listeners
socket.on('video-call-offer', handleIncomingCall);
socket.on('video-call-answer', handleCallAnswer);
socket.on('ice-candidate', handleIceCandidate);
socket.on('call-ended', handleCallEnded);
socket.on('call-rejected', handleCallRejected);

// Thêm hàm acceptCall
async function acceptCall() {
    if (!incomingCallOffer) {
        console.error('No incoming call offer found');
        return;
    }

    try {
        console.log('Accepting call...');
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
        }

        hideIncomingCallModal();
        showVideoCallModal();

        peerConnection = new RTCPeerConnection(configuration);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    receiverId: currentCallId
                });
            }
        };

        peerConnection.ontrack = event => {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = event.streams[0];
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            if (peerConnection.iceConnectionState === 'disconnected') {
                alert('Call disconnected');
                endVideoCall();
            }
        };

        // Thiết lập remote description từ offer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
        
        // Tạo answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Gửi answer đến người gọi
        socket.emit('video-call-answer', {
            answer: answer,
            callerId: currentCallId
        });

        isCallActive = true;
        console.log('Call accepted successfully');

    } catch (error) {
        console.error('Error accepting call:', error);
        if (error.name === 'NotAllowedError') {
            alert('Please allow access to camera and microphone');
        } else {
            alert('Error accepting call: ' + error.message);
        }
        rejectCall();
    }
}

// Thêm hàm rejectCall
function rejectCall() {
    if (currentCallId) {
        socket.emit('video-call-rejected', {
            callerId: currentCallId
        });
        hideIncomingCallModal();
        currentCallId = null;
        incomingCallOffer = null;
    }
}

// Khi người dùng chủ động kết thúc cuộc gọi
function endCall() {
    if (roomId) {
        socket.emit('end_call', { room: roomId });
        handleCallEnded();
    }
}

// Xử lý khi nhận được thông báo cuộc gọi kết thúc
socket.on('call_ended', (data) => {
    handleCallEnded();
});

function handleCallEnded() {
    // Dọn dẹp các kết nối
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    // Dừng các stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }

    // Reset UI
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
    
    // Ẩn giao diện video call
    document.getElementById('video-call-div').style.display = 'none';
    
    // Reset các biến trạng thái
    roomId = null;
    isInCall = false;
}