let currentCallUser = null;
let localStream;
let peerConnection;

// Khởi tạo cuộc gọi cá nhân
async function startCall() {
    if (!currentReceiverId) return;
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        document.getElementById('localVideo').srcObject = localStream;
        document.getElementById('callModal').style.display = 'block';
        document.getElementById('callStatus').textContent = 'Đang gọi...';
        
        updateCallStatus(true);
        
        createPeerConnection();
        
        socket.emit('start_call', {
            receiver_id: currentReceiverId,
            caller_name: '{{ user.username }}'
        });
        
    } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Không thể truy cập camera hoặc microphone');
        updateCallStatus(false);
    }
}

// Xử lý cuộc gọi đến
socket.on('incoming_call', async data => {
    currentCallUser = data.caller_id;
    document.getElementById('callerName').textContent = `${data.caller_name} đang gọi...`;
    document.getElementById('incomingCallModal').style.display = 'block';
    
    try {
        await ringtone.play();
    } catch (err) {
        console.error('Không thể phát âm thanh:', err);
    }
});

// Chấp nhận cuộc gọi
async function acceptCall() {
    ringtone.pause();
    ringtone.currentTime = 0;
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        document.getElementById('localVideo').srcObject = localStream;
        document.getElementById('incomingCallModal').style.display = 'none';
        document.getElementById('callModal').style.display = 'block';
        
        createPeerConnection();
        
        socket.emit('accept_call', {
            caller_id: currentCallUser,
            receiver_name: '{{ user.username }}'
        });
        
    } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Không thể truy cập camera hoặc microphone');
    }
}

// Từ chối cuộc gọi
function rejectCall() {
    ringtone.pause();
    ringtone.currentTime = 0;
    
    socket.emit('reject_call', {
        caller_id: currentCallUser
    });
    document.getElementById('incomingCallModal').style.display = 'none';
    currentCallUser = null;
}

// Kết thúc cuộc gọi
function endIndividualCall() {
    console.log('Ending individual call...');
    if (currentCallUser) {
        socket.emit('end_call', {
            user_id: currentCallUser
        });
    }
    closeIndividualCall();
}

// Đóng cuộc gọi
function closeIndividualCall() {
    console.log('Closing individual call...');
    const ringtone = document.getElementById('ringtone');
    ringtone.pause();
    ringtone.currentTime = 0;
    
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped track:', track.kind);
        });
    }
    
    if (peerConnection) {
        peerConnection.close();
        console.log('Closed peer connection');
    }
    
    document.getElementById('callModal').style.display = 'none';
    document.getElementById('incomingCallModal').style.display = 'none';
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
    
    currentCallUser = null;
    localStream = null;
    peerConnection = null;
    
    console.log('Individual call closed');
    
    updateCallStatus(false);
}

// Tạo kết nối peer
function createPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });
    
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('webrtc_signal', {
                user_id: currentCallUser,
                signal: {
                    type: 'ice-candidate',
                    candidate: event.candidate
                }
            });
        }
    };
    
    peerConnection.ontrack = event => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
}

// Socket listeners cho cuộc gọi cá nhân
socket.on('call_accepted', async data => {
    document.getElementById('callStatus').textContent = 'Đã kết nối';
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    socket.emit('webrtc_signal', {
        user_id: data.receiver_id,
        signal: {
            type: 'offer',
            sdp: offer
        }
    });
});

socket.on('call_rejected', () => {
    alert('Cuộc gọi đã bị từ chối');
    closeIndividualCall();
});

socket.on('call_ended', () => {
    closeIndividualCall();
});

socket.on('webrtc_signal', async data => {
    const signal = data.signal;
    
    if (signal.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('webrtc_signal', {
            user_id: data.from,
            signal: {
                type: 'answer',
                sdp: answer
            }
        });
    } 
    else if (signal.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } 
    else if (signal.type === 'ice-candidate') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
}); 