# Changelog

All notable changes to the **DACS2 Real-Time Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-08

### Added
- **Application Factory Pattern**: Implemented `create_app()` architecture with blueprint modularity.
- **Service & Repository Layer**: Separated business logic into dedicated services (`auth_service`, `chat_service`, `friend_service`, `group_service`).
- **Dedicated Socket.IO Layer**: Decoupled WebSocket events into `app/sockets/chat_events.py` and `app/sockets/video_events.py`.
- **Database Schema & Migrations**: Created `database/schema.sql` with full table DDL, foreign key constraints (`ON DELETE CASCADE`), indexes, and sample seed data.
- **REST & Socket Compatibility**: Added dual HTTP POST and Socket.IO event handlers for direct and group messaging.
- **Add Friend Modal**: Added user search and friend request management UI directly in `index.html`.
- **Environment Management**: Added `python-dotenv` support with comprehensive `.env.example`.
- **Open Source Standards**:
  - Full `.gitignore` covering Python, environments, OS, IDEs, and secrets.
  - `.editorconfig` for cross-editor formatting consistency.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`).
  - GitHub Issue Templates for Bug Reports and Feature Requests.
  - `LICENSE` (MIT) and `CONTRIBUTING.md`.

### Changed
- **Directory Structure**: Restructured into industry-standard `app/` package layout (`app/routes`, `app/services`, `app/sockets`, `app/utils`, `app/static`, `app/templates`).
- **Database Query Helper**: Consolidated duplicate `execute_query` functions into unified `app/database.py` with automatic connection management and transaction rollback.
- **Entry Points**: Added `run.py` and `wsgi.py` for standard local and production execution while preserving backward compatibility in `app.py`.

### Fixed
- **Friend Blueprint Registration**: Fixed missing `friend` blueprint registration in application factory.
- **Group Video Call Sockets**: Fixed uncalled `init_group_video_call_socket` initialization.
- **Duplicate Socket.IO Definition**: Resolved overwritten `init_socketio` function in `routes/chat.py`.
- **Frontend Socket Collision**: Fixed syntax error caused by duplicate `const socket = io()` declarations across JS files.
- **DOM Event Listener Crash**: Added null safety checks for DOM elements in `group.js` and `friend.js`.
- **Security Vulnerability**: Removed hardcoded credentials and secret keys from source code.

