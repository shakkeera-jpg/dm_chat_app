# Relay Direct Messaging Prototype

A real-time one-to-one messaging prototype built with Django REST Framework, Django Channels, PostgreSQL, JWT authentication, and a dependency-free browser frontend.

## Features

- Register and login using securely hashed Django passwords and JWT access tokens
- Persistent PostgreSQL message history
- Live private messages, typing state, toast notifications, and unread badges over WebSockets
- Messages are marked read when a user opens a conversation

## Run locally

Use two terminals from this repository.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env and enter the name and password for your existing PostgreSQL database.
python manage.py migrate
python manage.py runserver
```

In a second terminal, install and run the React frontend:

```powershell
cd frontend
npm install
npm run dev
```

Vite prints the browser URL (normally `http://127.0.0.1:5173`). Open it in two browser windows, register two separate users, and message between them.

## API

- `POST /api/auth/register` - `{ "username", "password" }`
- `POST /api/auth/login` - `{ "username", "password" }`
- `GET /api/users` - authenticated user list and unread counts
- `GET /api/messages/:otherUserId` - conversation history
- `PATCH /api/messages/:otherUserId/read` - mark incoming conversation messages read
- `ws://127.0.0.1:8000/ws/chat/?token=<JWT>` - `send_private_message`, `typing_status`, and `set_active_chat` events

## Notes

The configured in-memory Channels layer is ideal for this local machine test. For multi-process or deployed use, replace it with a Redis channel layer.
