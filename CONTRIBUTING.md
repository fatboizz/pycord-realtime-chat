# Contributing to DACS2 Real-Time Platform

Thank you for your interest in contributing to the **DACS2 Real-Time Chat & Video Call Platform**! We welcome bug fixes, documentation improvements, architectural proposals, and new features.

---

## Code of Conduct

Please help us maintain a friendly, welcoming, and inclusive community:
- Treat all team members and contributors with respect.
- Provide constructive feedback and communicate respectfully in issues and pull requests.
- Prioritize code quality, security, and architectural integrity.

---

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/<your-username>/DACS2.git
cd DACS2
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env to set your local MySQL credentials
```

### 5. Import Database Schema
```bash
mysql -u root -p < database/schema.sql
```

### 6. Run the Application
```bash
python run.py
```
Visit `http://localhost:5000` in your browser.

---

## Branching Strategy & Git Workflow

- `main` / `master`: Production-ready, stable codebase.
- `develop`: Integration branch for new features.
- `feature/<name>`: New features or UI components.
- `fix/<name>`: Bug fixes or patches.
- `refactor/<name>`: Code restructuring or performance optimizations.

### Commit Conventions
We recommend following the [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat: add screen sharing in 1-on-1 video call`
- `fix: resolve socket reconnect race condition`
- `docs: update API documentation in README`
- `refactor: split chat socket events into dedicated service`
- `style: format Python files with Black`
- `test: add unit tests for friendship repository`

---

## Code Standards

- **Python**: Follow [PEP 8](https://peps.python.org/pep-0008/). Verify syntax with `python -m compileall app`.
- **JavaScript**: Use modern ES6+ standards, ensure event listeners have null guards for DOM elements.
- **SQL**: Use parameterized queries (`%s`) at all times. Never concatenate user input directly into SQL strings.
- **Security**: Never commit `.env` or any plaintext credentials, tokens, or private keys.

---

## Submitting a Pull Request (PR)

1. Ensure the app starts and smoke tests pass:
   ```bash
   python -c "from app import create_app; app = create_app(); print('Smoke test OK')"
   ```
2. Commit your changes with clear, descriptive commit messages.
3. Push to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request against the `main` branch with a summary of changes and test steps.

