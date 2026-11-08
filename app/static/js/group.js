let currentGroupId = null;

function loadGroups() {
    console.log('Loading groups...'); // Debug log
    fetch('/get_user_groups')
        .then(response => response.json())
        .then(groups => {
            console.log('Received groups:', groups); // Debug log
            const groupsList = document.getElementById('groupsList');
            groupsList.innerHTML = '';

            groups.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'channel-item';
                groupDiv.onclick = () => selectGroup(group.id, group.name);
                
                groupDiv.innerHTML = `
                    <div class="channel-hash">
                        <i class="fas fa-hashtag"></i>
                    </div>
                    <div class="channel-name">${group.name}</div>
                    <div class="channel-info">
                        <span class="member-count">${group.member_count || 0}</span>
                    </div>
                `;
                
                groupsList.appendChild(groupDiv);
            });
        })
        .catch(error => {
            console.error('Error loading groups:', error);
        });
}

function selectGroup(groupId, groupName) {
    console.log('Selecting group:', groupId, groupName);
    
    // Xóa active class từ tất cả các kênh
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Thêm active class vào kênh được chọn
    event.currentTarget.classList.add('active');
    
    // Cập nhật UI
    document.getElementById('selectedUserName').textContent = groupName;
    document.querySelector('.chat-header-left i').className = 'fas fa-hashtag';
    
    // Ẩn nút gọi video 1-1
    document.getElementById('videoCallBtn').style.display = 'none';
    // Hiển thị nút gọi video nhóm
    document.getElementById('groupVideoCallBtn').style.display = 'block';
    
    // Lưu groupId hiện tại
    currentGroupId = groupId;
    
    // Hiển thị container chat nhóm
    document.getElementById('messages').innerHTML = ''; // Xóa tin nhắn cũ
    
    // Load tin nhắn của nhóm
    fetch(`/get_group_messages/${groupId}`)
        .then(response => response.json())
        .then(messages => {
            console.log('Received group messages:', messages);
            const messagesDiv = document.getElementById('messages');
            messages.forEach(message => {
                const messageDiv = createMessageElement(message, message.sender_id === currentUserId);
                messagesDiv.appendChild(messageDiv);
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        })
        .catch(error => {
            console.error('Error loading group messages:', error);
        });
}

function createMessageElement(message, isSent) {
    const div = document.createElement('div');
    div.className = `message ${isSent ? 'sent' : 'received'}`;
    
    // Tạo div cho thông tin người gửi
    const senderInfo = document.createElement('div');
    senderInfo.className = 'sender-info';
    senderInfo.textContent = message.sender_name;
    
    // Tạo div cho nội dung tin nhắn
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.content;
    
    // Tạo div cho thời gian
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date(message.created_at).toLocaleTimeString();
    
    // Thêm các phần tử vào message div
    div.appendChild(senderInfo);
    div.appendChild(content);
    div.appendChild(time);
    
    return div;
}

function loadGroupMessages(groupId) {
    fetch(`/get_group_messages/${groupId}`)
        .then(response => response.json())
        .then(messages => {
            const messagesDiv = document.getElementById('groupMessages');
            messagesDiv.innerHTML = '';
            messages.forEach(message => {
                const messageDiv = createGroupMessageElement(message);
                messagesDiv.appendChild(messageDiv);
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
}

function createGroupMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.sender_id == currentUserId ? 'sent' : 'received'}`;
    div.innerHTML = `
        <strong>${message.sender_name}</strong>
        <p>${message.content}</p>
        <small>${new Date(message.created_at).toLocaleTimeString()}</small>
    `;
    return div;
}

function sendGroupMessage() {
    if (!currentGroupId) return;
    
    const input = document.getElementById('groupMessageInput');
    const message = input.value.trim();
    
    if (message) {
        socket.emit('send_group_message', {
            group_id: currentGroupId,
            message: message
        });
        input.value = '';
    }
}

function showCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    if (modal) {
        modal.style.display = 'block';
        // Reset form
        document.getElementById('groupName').value = '';
        const checkboxes = document.querySelectorAll('.member-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
}

function closeCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function createGroup() {
    console.log('Creating group...'); // Debug log

    const groupName = document.getElementById('groupName').value.trim();
    const checkboxes = document.querySelectorAll('.member-checkbox:checked');
    const selectedMembers = Array.from(checkboxes).map(cb => parseInt(cb.value));

    console.log('Group Name:', groupName); // Debug log
    console.log('Selected Members:', selectedMembers); // Debug log

    if (!groupName) {
        alert('Vui lòng nhập tên nhóm');
        return;
    }

    if (selectedMembers.length === 0) {
        alert('Vui lòng chọn ít nhất một thành viên');
        return;
    }

    const data = {
        name: groupName,
        members: selectedMembers
    };

    console.log('Sending request with data:', data); // Debug log

    fetch('/create_group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response status:', response.status); // Debug log
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data); // Debug log
        if (data.error) {
            throw new Error(data.error);
        }
        closeCreateGroupModal();
        loadGroups(); // Reload danh sách nhóm
        alert('Tạo nhóm thành công!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi khi tạo nhóm: ' + error.message);
    });
}

function loadGroupMembers(groupId) {
    fetch(`/get_group_members/${groupId}`)
        .then(response => response.json())
        .then(members => {
            const membersDiv = document.getElementById('groupMembers');
            membersDiv.innerHTML = '';
            members.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                memberDiv.innerHTML = `
                    <div class="member-avatar">${member.username[0]}</div>
                    <div class="member-info">
                        <div class="username">${member.username}</div>
                        <div class="email">${member.email}</div>
                    </div>
                `;
                membersDiv.appendChild(memberDiv);
            });
            document.getElementById('groupMemberCount').textContent = `${members.length} thành viên`;
        });
}

function showGroupMembers() {
    document.getElementById('groupMembersSidebar').classList.add('active');
}

function hideGroupMembers() {
    document.getElementById('groupMembersSidebar').classList.remove('active');
}

function switchTab(tabName) {
    // Ẩn tất cả tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Xóa active class từ tất cả tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    document.getElementById(`${tabName}Tab`).style.display = 'block';
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Ẩn các container chat
    document.getElementById('chatContainer').style.display = 'none';
    document.getElementById('groupChatContainer').style.display = 'none';
    
    if (tabName === 'groups') {
        loadGroups();
    }
}

// Load groups when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
});

// Gửi tin nhắn khi nhấn Enter trong group chat (nếu có input riêng)
const groupMsgInput = document.getElementById('groupMessageInput');
if (groupMsgInput) {
    groupMsgInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendGroupMessage();
        }
    });
}

// Thêm event listener cho nút đóng modal khi click bên ngoài
window.onclick = function(event) {
    const modal = document.getElementById('createGroupModal');
    if (event.target === modal) {
        closeCreateGroupModal();
    }
}

// Thêm hàm để bắt đầu cuộc gọi video nhóm
function startGroupVideoCall() {
    if (!currentGroupId) return;
    
    // Hiển thị modal cuộc gọi nhóm
    document.getElementById('groupVideoCallModal').style.display = 'block';
    
    // Khởi tạo cuộc gọi nhóm
    initializeGroupCall(currentGroupId);
}
