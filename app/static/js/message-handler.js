// Biến toàn cục để theo dõi người nhận và nhóm hiện tại
let currentReceiverId = null;
let currentGroupId = null;

// Hàm gửi tin nhắn
function sendMessage(event) {
    if (event) {
        event.preventDefault();
    }

    const messageInput = document.getElementById('message');
    const content = messageInput.value.trim();
    
    console.log('Attempting to send message:', {
        content,
        currentReceiverId,
        currentGroupId
    });
    
    if (!content) {
        console.log('Empty message, not sending');
        return;
    }

    if (!currentReceiverId && !currentGroupId) {
        console.log('No receiver selected');
        alert('Vui lòng chọn người nhận hoặc nhóm để gửi tin nhắn');
        return;
    }

    try {
        if (currentReceiverId) {
            console.log('Sending private message to:', currentReceiverId);
            // Gửi tin nhắn cá nhân
            socket.emit('send_message', {
                receiver_id: currentReceiverId,
                content: content
            });
        } else if (currentGroupId) {
            console.log('Sending group message to:', currentGroupId);
            // Gửi tin nhắn nhóm
            socket.emit('send_group_message', {
                group_id: currentGroupId,
                content: content
            });
        }

        // Hiển thị tin nhắn ngay lập tức cho người gửi
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            <strong>Bạn</strong>: 
            ${content}
            <small>${new Date().toLocaleTimeString()}</small>
        `;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Xóa nội dung input sau khi gửi
        messageInput.value = '';
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
}

// Khởi tạo các event listeners khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing message handlers');

    // Lắng nghe sự kiện nhấn Enter trong input
    const messageInput = document.getElementById('message');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Lắng nghe sự kiện click nút gửi
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
        console.log('Send button handler attached');
    }

    // Lắng nghe tin nhắn đến
    socket.on('receive_message', function(data) {
        console.log('Received message:', data);
        if (currentReceiverId === data.sender_id) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message received';
            messageDiv.innerHTML = `
                <strong>${data.sender_name}</strong>: 
                ${data.content}
                <small>${new Date(data.created_at).toLocaleTimeString()}</small>
            `;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });

    // Lắng nghe tin nhắn nhóm
    socket.on('receive_group_message', function(data) {
        console.log('Received group message:', data);
        if (currentGroupId === data.group_id && data.sender_id !== currentUserId) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message received';
            messageDiv.innerHTML = `
                <strong>${data.sender_name}</strong>: 
                ${data.content}
                <small>${new Date(data.created_at).toLocaleTimeString()}</small>
            `;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });
});

// Export các hàm và biến cần thiết
window.sendMessage = sendMessage;
window.currentReceiverId = currentReceiverId;
window.currentGroupId = currentGroupId; 