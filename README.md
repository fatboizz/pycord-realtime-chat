# 💬 DACS2 - Real-Time Chat & Video Call Platform

[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/framework-Flask%203.1.0-green.svg)](https://flask.palletsprojects.com/)
[![WebSocket](https://img.shields.io/badge/realtime-Socket.IO-black.svg)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/p2p-WebRTC-orange.svg)](https://webrtc.org/)
[![Database](https://img.shields.io/badge/database-MySQL%208.0%2B-blue.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI Pipeline](https://img.shields.io/badge/build-passing-brightgreen.svg)](.github/workflows/ci.yml)

> A modern, high-performance, real-time messaging and video conferencing web application inspired by Discord. Built with Python Flask, Flask-SocketIO, WebRTC peer-to-peer signaling, and MySQL.

---

## 🌟 Key Features

- 🔐 **User Authentication**: Secure user registration, login, and session management with Bcrypt password hashing.
- 💬 **Direct Messaging (1-on-1 Chat)**: Instant real-time messaging with live typing indicator, timestamp formatting, and persistent chat history.
- 👥 **Group Channels & Multi-user Chat**: Dynamic group creation, member management, and instant group broadcast messaging.
- 🤝 **Friendship & User Discovery**: Search users by username or email, send/accept/reject friend requests, and inspect friend statuses.
- 📹 **1-on-1 P2P Video Calling**: High-definition, low-latency audio/video calling using native browser WebRTC with STUN fallback servers.
- 🎥 **Multi-User Group Video Calls**: Real-time multi-peer video room signaling with microphone toggle, camera mute, and screen-sharing controls.
- 🛡️ **Clean Architecture**: Production-grade Application Factory pattern, dedicated Service/Repository layers, decoupled Socket.IO event handlers, and environment-driven configurations.

---

## 🏗️ Project Architecture

```
DACS2/
├── .github/                       # GitHub Actions CI & Issue Templates
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── ci.yml                 # Automated testing & linting pipeline
├── app/                           # Core Application Package (Application Factory)
│   ├── __init__.py                # create_app() factory, extension & blueprint registration
│   ├── config.py                  # Environment-driven configuration (Dev, Prod, Test)
│   ├── database.py                # Database connection pooling & query helper
│   ├── routes/                    # Blueprint HTTP route controllers
│   │   ├── __init__.py
│   │   ├── auth.py                # Authentication endpoints (/auth/login, /auth/register)
│   │   ├── chat.py                # Chat history & messaging REST endpoints
│   │   ├── friend.py              # Friend search & request endpoints
│   │   ├── group.py               # Group management & member endpoints
│   │   ├── main.py                # Dashboard & index view
│   │   └── video_call.py          # Video calling utilities & ICE config
│   ├── services/                  # Business logic & repository layer
│   │   ├── __init__.py
│   │   ├── auth_service.py        # User queries & creation logic
│   │   ├── chat_service.py        # Message persistence & retrieval
│   │   ├── friend_service.py      # Friendship & request logic
│   │   └── group_service.py       # Group creation & membership logic
│   ├── sockets/                   # WebSocket event listeners (Flask-SocketIO)
│   │   ├── __init__.py
│   │   ├── chat_events.py         # Direct & group chat events
│   │   └── video_events.py        # 1-1 & group WebRTC signaling
│   ├── static/                    # Frontend client assets
│   │   ├── css/
│   │   │   └── style.css          # Discord-inspired dark theme UI stylesheet
│   │   └── js/
│   │       ├── chat.js            # Message handling & UI interaction
│   │       ├── friend.js          # User search & friend request actions
│   │       ├── group.js           # Group creation & channel switching
│   │       ├── group-call.js      # Multi-peer WebRTC video room signaling
│   │       └── videocall.js       # 1-on-1 WebRTC video call signaling
│   ├── templates/                 # Jinja2 HTML templates
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   └── index.html             # Main single-page application dashboard
│   └── utils/                     # Shared helpers & validation utilities
│       ├── __init__.py
│       ├── helpers.py             # Sanitization & timestamp formatters
│       └── validators.py          # Input, email & password validation
├── database/
│   └── schema.sql                 # Complete MySQL schema DDL & initial seed data
├── .editorconfig                  # Code formatting standard across editors
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules for Python, OS, & secrets
├── app.py                         # Backward-compatible runner (python app.py)
├── CHANGELOG.md                   # Version release notes (v1.0.0)
├── CONTRIBUTING.md                # Open source contribution guide
├── LICENSE                        # MIT License
├── README.md                      # Project documentation
├── requirements.txt               # Production Python dependencies
├── requirements-dev.txt           # Development & testing dependencies
├── run.py                         # Primary application runner (python run.py)
└── wsgi.py                        # WSGI entrypoint for production servers (Gunicorn)
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Python**: Version `3.10`, `3.11`, or `3.12+`
- **MySQL / MariaDB**: Version `8.0+` (or MariaDB `10.5+`)
- **Git**: For version control
- **Modern Web Browser**: Chrome, Firefox, Edge, or Safari with WebRTC support

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/DACS2.git
cd DACS2
```

### 2. Set Up Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt):
.\venv\Scripts\activate.bat

# Linux / macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and set your MySQL database password and secret key:
```env
FLASK_APP=run.py
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000

SECRET_KEY=super_secure_random_key_here

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dacs

SOCKETIO_CORS_ALLOWED_ORIGINS=*
```

### 5. Initialize the MySQL Database
Import the database schema and sample seed data:
```bash
mysql -u root -p < database/schema.sql
```
*(Default sample accounts: `alice`, `bob`, `charlie` with password `123456`)*

### 6. Run the Application
```bash
python run.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📡 API & WebSocket Reference

### HTTP REST Endpoints

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET` | `/` | Main dashboard view | ✅ |
| `GET`, `POST` | `/auth/login` | User login | ❌ |
| `GET`, `POST` | `/auth/register` | User registration | ❌ |
| `GET` | `/auth/logout` | User logout | ✅ |
| `GET` | `/get_chat_history/<friend_id>` | Chronological chat history with friend | ✅ |
| `POST` | `/send_message` | Send direct message (REST fallback) | ✅ |
| `POST` | `/send_group_message` | Send group message (REST fallback) | ✅ |
| `GET` | `/get_friends` | List all accepted friends | ✅ |
| `POST` | `/search_users` | Search users by username or email | ✅ |
| `POST` | `/send_friend_request` | Send friend request | ✅ |
| `POST` | `/handle_friend_request` | Accept or reject friend request | ✅ |
| `GET` | `/get_friend_requests` | List received pending friend requests | ✅ |
| `GET` | `/get_user_groups` | List all groups current user belongs to | ✅ |
| `POST` | `/create_group` | Create new group with member IDs | ✅ |
| `GET` | `/get_group_messages/<group_id>` | Chronological messages for group | ✅ |
| `GET` | `/get_group_members/<group_id>` | List members of specific group | ✅ |
| `GET` | `/video_call/ice_servers` | Retrieve WebRTC STUN/TURN configuration | ✅ |

### WebSocket Events (Socket.IO)

| Event Name | Direction | Payload | Description |
|:-----------|:---------:|:--------|:------------|
| `connect` | Client ➡️ Server | - | Joins user-specific room (`user_<id>`) |
| `send_message` | Client ➡️ Server | `{receiver_id, content}` | Sends 1-on-1 chat message |
| `new_message` | Server ➡️ Client | `{sender_id, receiver_id, content, ...}` | Broadcasts direct message to participants |
| `send_group_message` | Client ➡️ Server | `{group_id, content}` | Sends message in group |
| `new_group_message` | Server ➡️ Client | `{group_id, sender_id, content, ...}` | Broadcasts message to all group members |
| `video-call-offer` | Bidirectional | `{offer, receiverId, callerId, ...}` | WebRTC SDP offer signaling |
| `video-call-answer` | Bidirectional | `{answer, callerId}` | WebRTC SDP answer signaling |
| `ice-candidate` | Bidirectional | `{candidate, receiverId}` | WebRTC ICE candidate exchange |
| `end-call` | Client ➡️ Server | `{receiverId}` | Hang up 1-1 video call |
| `start_group_call` | Client ➡️ Server | `{group_id}` | Broadcast incoming group call notice |
| `join_group_call` | Client ➡️ Server | `{group_id, username, peerId}` | Join group call room |
| `group_call_signal` | Bidirectional | `{signal, to, from}` | Multi-peer WebRTC mesh signaling |
| `leave_group_call` | Client ➡️ Server | `{group_id}` | Leave group video room |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, Flask 3.1, Flask-SocketIO 5.4, Flask-Bcrypt 1.0, Werkzeug 3.1
- **Database**: MySQL 8.0 / MariaDB, `mysql-connector-python`
- **Real-Time & Media**: Socket.IO, WebRTC (PeerConnection, STUN Google)
- **Frontend**: HTML5, CSS3 (Modern Flexbox/Grid), Vanilla JavaScript (ES6+), FontAwesome 6

---

## 🧪 Verification & Smoke Testing

To test the codebase syntax and initialization:
```bash
# Verify Python syntax across all modules
python -m compileall app app.py run.py wsgi.py

# Test application factory creation
python -c "from app import create_app; app = create_app(); print('App factory OK')"
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute this software for educational and commercial purposes.

