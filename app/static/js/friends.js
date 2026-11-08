function loadFriendsList() {
    fetch('/get_friends')
        .then(response => response.json())
        .then(friends => {
            const friendsList = document.getElementById('friendsList');
            friendsList.innerHTML = '';
            
            if (friends.length === 0) {
                friendsList.innerHTML = '<div class="no-friends">Chưa có bạn bè</div>';
                return;
            }
            
            friends.forEach(friend => {
                const div = document.createElement('div');
                div.className = 'user-item';
                div.onclick = () => selectUser(friend.id, friend.username);
                div.innerHTML = `
                    <div class="user-info">
                        <div class="user-avatar">${friend.username[0]}</div>
                        <span>${friend.username}</span>
                    </div>
                `;
                friendsList.appendChild(div);
            });
        });
}

function loadFriendRequests() {
    fetch('/get_friend_requests')
        .then(response => response.json())
        .then(requests => {
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '';
            
            if (requests.length === 0) {
                requestsList.innerHTML = '<div class="no-requests">Không có lời mời kết bạn</div>';
                return;
            }
            
            requests.forEach(request => {
                const div = document.createElement('div');
                div.className = 'friend-request-item';
                div.innerHTML = `
                    <div class="user-info">
                        <div class="user-avatar">${request.username[0]}</div>
                        <span>${request.username}</span>
                    </div>
                    <div class="request-actions">
                        <button onclick="acceptFriendRequest(${request.id})" class="accept-btn">
                            <i class="fas fa-check"></i> Chấp nhận
                        </button>
                        <button onclick="rejectFriendRequest(${request.id})" class="reject-btn">
                            <i class="fas fa-times"></i> Từ chối
                        </button>
                    </div>
                `;
                requestsList.appendChild(div);
            });
            
            updateRequestCount(requests.length);
        });
}

function updateRequestCount(count) {
    const badge = document.getElementById('requestCount');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

function acceptFriendRequest(requestId) {
    fetch(`/accept_friend_request/${requestId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadFriendRequests();
                loadFriendsList();
            }
        });
}

function rejectFriendRequest(requestId) {
    fetch(`/reject_friend_request/${requestId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadFriendRequests();
            }
        });
}

// Tìm kiếm người dùng
const searchUsers = debounce(function(query) {
    if (query.length < 2) {
        document.getElementById('searchResults').style.display = 'none';
        return;
    }

    fetch(`/search_users?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(users => {
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = '';
            resultsDiv.style.display = 'block';

            if (users.length === 0) {
                resultsDiv.innerHTML = '<div class="no-results">Không tìm thấy người dùng</div>';
                return;
            }

            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-item';
                userDiv.innerHTML = `
                    <div class="user-info">
                        <div class="user-avatar">${user.username[0]}</div>
                        <span>${user.username}</span>
                    </div>
                    ${getFriendButton(user)}
                `;
                resultsDiv.appendChild(userDiv);
            });
        });
}, 300);

function getFriendButton(user) {
    switch(user.friendship_status) {
        case 'none':
            return `<button onclick="sendFriendRequest(${user.id})" class="add-friend-btn">
                        <i class="fas fa-user-plus"></i> Kết bạn
                    </button>`;
        case 'pending_sent':
            return `<button disabled class="pending-btn">
                        <i class="fas fa-clock"></i> Đã gửi lời mời
                    </button>`;
        case 'pending_received':
            return `<button disabled class="pending-btn">
                        <i class="fas fa-clock"></i> Chờ xác nhận
                    </button>`;
        case 'accepted':
            return `<button disabled class="friends-btn">
                        <i class="fas fa-user-check"></i> Bạn bè
                    </button>`;
        default:
            return '';
    }
}

function sendFriendRequest(userId) {
    fetch(`/send_friend_request/${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const searchInput = document.querySelector('.search-input');
                searchUsers(searchInput.value);
            }
        });
} 