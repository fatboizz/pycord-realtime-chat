function switchTab(tab) {
    // Cập nhật trạng thái active của các tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Ẩn tất cả các container
    document.getElementById('friendsList').style.display = 'none';
    document.getElementById('groupsList').style.display = 'none';
    document.getElementById('requestsList').style.display = 'none';

    // Hiển thị container tương ứng và tải dữ liệu
    switch(tab) {
        case 'friends':
            document.getElementById('friendsList').style.display = 'block';
            loadFriendsList();
            break;
        case 'groups':
            document.getElementById('groupsList').style.display = 'block';
            loadGroups();
            break;
        case 'requests':
            document.getElementById('requestsList').style.display = 'block';
            loadFriendRequests();
            break;
    }
}

// Tự động chọn tab friends khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Đặt tab friends là active mặc định
    const friendsTab = document.querySelector('.tab[onclick="switchTab(\'friends\')"]');
    if (friendsTab) {
        friendsTab.classList.add('active');
    }
    
    // Hiển thị danh sách bạn bè mặc định
    document.getElementById('friendsList').style.display = 'block';
    document.getElementById('groupsList').style.display = 'none';
    document.getElementById('requestsList').style.display = 'none';
    
    // Tải dữ liệu ban đầu
    loadFriendsList();
    loadFriendRequests(); // Tải số lượng lời mời kết bạn
}); 