function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) return;

    fetch('/search_users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_term: searchTerm })
    })
    .then(response => response.json())
    .then(users => {
        const resultsDiv = document.getElementById('searchResults');
        resultsDiv.innerHTML = '';
        
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'search-result-item';
            
            let actionButton = '';
            if (!user.friendship_status) {
                actionButton = `<button onclick="sendFriendRequest(${user.id})">Kết bạn</button>`;
            } else if (user.friendship_status === 'pending') {
                if (user.request_type === 'received') {
                    actionButton = `
                        <button onclick="handleFriendRequest(${user.id}, 'accept')">Chấp nhận</button>
                        <button onclick="handleFriendRequest(${user.id}, 'reject')">Từ chối</button>
                    `;
                } else {
                    actionButton = '<span>Đã gửi lời mời</span>';
                }
            } else if (user.friendship_status === 'accepted') {
                actionButton = '<span>Đã là bạn bè</span>';
            }
            
            userDiv.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${user.username[0]}</div>
                    <div>
                        <div class="username">${user.username}</div>
                        <div class="email">${user.email}</div>
                    </div>
                </div>
                <div class="action-buttons">
                    ${actionButton}
                </div>
            `;
            
            resultsDiv.appendChild(userDiv);
        });
    });
}

function sendFriendRequest(friendId) {
    fetch('/send_friend_request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_id: friendId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Đã gửi lời mời kết bạn');
            searchUsers(); // Refresh search results
        }
    });
}

function handleFriendRequest(friendId, action) {
    fetch('/handle_friend_request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            friend_id: friendId,
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            loadFriendRequests();
            searchUsers(); // Refresh search results
        }
    });
}

function loadFriendRequests() {
    const requestsDiv = document.getElementById('friendRequests');
    if (!requestsDiv) return;

    fetch('/get_friend_requests')
        .then(response => response.json())
        .then(requests => {
            requestsDiv.innerHTML = '';
            
            if (!requests || requests.length === 0) {
                requestsDiv.innerHTML = '<p class="empty-requests">Không có lời mời kết bạn nào</p>';
                return;
            }

            requests.forEach(request => {
                const requestDiv = document.createElement('div');
                requestDiv.className = 'friend-request-item';
                requestDiv.innerHTML = `
                    <div class="user-info">
                        <div class="user-avatar">${request.username[0]}</div>
                        <div>
                            <div class="username">${request.username}</div>
                            <div class="email">${request.email}</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button onclick="handleFriendRequest(${request.user_id}, 'accept')" class="accept-btn">Chấp nhận</button>
                        <button onclick="handleFriendRequest(${request.user_id}, 'reject')" class="reject-btn">Từ chối</button>
                    </div>
                `;
                requestsDiv.appendChild(requestDiv);
            });
        })
        .catch(err => console.error('Error loading friend requests:', err));
}

// Load friend requests when page loads
document.addEventListener('DOMContentLoaded', loadFriendRequests);

// Search when Enter key is pressed
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
} 