let currentChatId = null;
let currentChatType = null; // 'direct' hoặc 'group'
// Reuse global socket instance if already initialized
var socket = window.socket || (window.socket = io());

// Hàm load tin nhắn
function loadMessages(id, type = 'direct') {
    console.log('Loading messages:', id, type);
    
    const endpoint = type === 'direct' ? `/get_chat_history/${id}` : `/get_group_messages/${id}`;
    
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(messages => {
            console.log('Received messages:', messages);
            const messagesDiv = document.getElementById('messages');
            if (!messagesDiv) {
                console.error('Messages container not found!');
                return;
            }
            
            messagesDiv.innerHTML = '';
            messages.forEach(message => {
                const messageDiv = createMessageElement(message);
                messagesDiv.appendChild(messageDiv);
            });
            
            // Scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        })
        .catch(error => {
            console.error('Error loading messages:', error);
        });
}

// Hàm tạo phần tử tin nhắn
function createMessageElement(message, showHeader = true) {
    const div = document.createElement('div');
    div.className = 'message';
    if (!showHeader) div.classList.add('continuation');
    
    const timestamp = new Date(message.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const isCurrentUser = message.sender_id === currentUserId;
    
    div.innerHTML = showHeader ? `
        <div class="message-avatar">
            <div class="user-avatar" style="background: ${getAvatarColor(message.sender_name)}">
                ${message.sender_name[0]}
            </div>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author" style="color: ${getAvatarColor(message.sender_name)}">
                    ${message.sender_name}
                </span>
                <span class="message-timestamp">${timestamp}</span>
            </div>
            <div class="message-text">${formatMessage(message.content)}</div>
        </div>
    ` : `
        <div class="message-avatar">
            <div class="message-timestamp-hover">${timestamp}</div>
        </div>
        <div class="message-content">
            <div class="message-text">${formatMessage(message.content)}</div>
        </div>
    `;

    return div;
}

// Hàm chọn bạn để chat
function selectFriend(userId, username) {
    console.log('Selecting friend:', userId, username);
    
    // Xóa active class từ tất cả các user
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Thêm active class vào user được chọn
    const selectedUser = document.querySelector(`.user-item[data-user-id="${userId}"]`);
    if (selectedUser) {
        selectedUser.classList.add('active');
    }
    
    // Cập nhật UI
    document.getElementById('selectedUserName').textContent = username;
    document.querySelector('.chat-header-left i').className = 'fas fa-user';
    
    // Hiển thị nút gọi video 1-1
    document.getElementById('videoCallBtn').style.display = 'block';
    // Ẩn nút gọi video nhóm
    document.getElementById('groupVideoCallBtn').style.display = 'none';
    
    // Lưu selected user
    currentChatId = userId;
    currentChatType = 'direct';
    
    // Xóa tin nhắn cũ
    const messagesDiv = document.getElementById('messages');
    if (messagesDiv) {
        messagesDiv.innerHTML = '';
    }
    
    // Load tin nhắn
    loadMessages(userId, 'direct');
}

// Hàm chọn nhóm
function selectGroup(groupId, groupName) {
    currentChatId = groupId;
    currentChatType = 'group';
    
    // Hiển thị tên nhóm
    document.getElementById('selectedUserName').textContent = groupName;
    
    // Ẩn nút gọi video trong chat nhóm
    document.getElementById('videoCallBtn').style.display = 'none';
    
    // Load tin nhắn nhóm
    loadMessages(groupId, 'group');
}

// Hàm gửi tin nhắn
function sendMessage() {
    if (!currentChatId) return;

    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content) return;

    const endpoint = currentChatType === 'direct' ? '/send_message' : '/send_group_message';
    const data = currentChatType === 'direct' 
        ? { receiver_id: currentChatId, content: content }
        : { group_id: currentChatId, content: content };

    console.log('Sending message:', endpoint, data); // Debug log

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Message sent:', data); // Debug log
        if (data.error) {
            throw new Error(data.error);
        }
        input.value = '';
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });
}

// Utility functions
function getAvatarColor(username) {
    // Tạo màu ngẫu nhiên nhưng nhất quán cho mỗi username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
        '#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245',
        '#23A559', '#F26522', '#738ADB', '#EB459E', '#71368A'
    ];
    
    return colors[Math.abs(hash) % colors.length];
}

function formatMessage(content) {
    // Thêm xử lý emoji, links, etc. nếu cần
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

// Socket.io event listeners
socket.on('connect', () => {
    console.log('Connected to WebSocket');
});

socket.on('message', message => {
    if (currentChatType === 'direct' &&
        (message.sender_id === currentChatId || message.receiver_id === currentChatId)) {
        appendMessage(message);
    }
});

socket.on('group_message', message => {
    if (currentChatType === 'group' && message.group_id === currentChatId) {
        appendMessage(message);
    }
});

function appendMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const lastMessage = messagesDiv.lastElementChild;
    const showHeader = !lastMessage || 
        lastMessage.querySelector('.message-author')?.textContent !== message.sender_name;
    
    const messageDiv = createMessageElement(message, showHeader);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event listeners
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Lắng nghe sự kiện click vào người dùng để chọn chat
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', function() {
            const userId = item.getAttribute('data-user-id');
            const username = item.querySelector('.username').textContent;
            selectFriend(userId, username);
        });
    });

    // Nếu có chat được chọn sẵn, load tin nhắn
    const selectedId = currentChatId;
    const type = currentChatType;
    if (selectedId) {
        loadMessages(selectedId, type);
    }
});

// Hàm này có thể được dùng để khởi tạo các modal, cuộc gọi video...
// Các chức năng cụ thể khác của ứng dụng sẽ được xử lý tại đây (video calls, group calls, v.v)
