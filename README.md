# Relay - Real-Time Direct Messaging

Relay is a full-stack, one-to-one messaging prototype built for the Associate Backend Developer machine test. It provides JWT authentication, PostgreSQL persistence, real-time private messages, unread badges, toast notifications, and typing indicators.

## Tech stack

- Backend: Python, Django, Django REST Framework, Django Channels, Daphne
- Database: PostgreSQL
- Authentication: JWT using `djangorestframework-simplejwt`
- Frontend: React, Vite, React Router, Tailwind CSS
- Real-time communication: WebSockets via Django Channels

## Features

- Register and log in with securely hashed passwords
- Duplicate username and email validation
- Persistent one-to-one message history in PostgreSQL
- Live private messages without page refresh
- Typing indicator for the active conversation
- Live unread badges and toast notifications for unselected conversations
- iOS-inspired responsive interface styled with Tailwind CSS utilities
- WhatsApp-style notification banner showing the sender and message preview
- Mark incoming messages as read when a conversation is opened
- User list ordered by latest conversation activity
- New users appear in connected clients automatically
- Online/offline presence indicators
- Automatic access-token renewal using the refresh token

## Prerequisites

Install these before running the project:

- Python 3.10 or later
- Node.js 20 or later with npm
- PostgreSQL 14 or later

Create an empty PostgreSQL database, for example `dm_chat`.

## Project structure

```text
dm-chat-app/
├── backend/
│   ├── accounts/       # User model, registration, login
│   ├── chat/           # Messages, REST API, WebSocket consumer
│   ├── config/         # Django/ASGI configuration
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/        # REST client
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth and chat state
│   │   ├── hooks/      # WebSocket hook
│   │   ├── pages/      # Auth and chat pages
│   │   └── routes/     # Client routes
│   └── package.json
├── .env.example
└── README.md
```

## Environment configuration

### Backend

From `backend/`, copy the example file:

```powershell
Copy-Item .env.example .env
```

Set the PostgreSQL values in `backend/.env`:

```env
DJANGO_SECRET_KEY=replace-with-a-long-random-value
DEBUG=True
DB_ENGINE=django.db.backends.postgresql
DB_NAME=dm_chat
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=127.0.0.1
DB_PORT=5432
BACKEND_PORT=8000
SOCKET_PORT=8000
CHANNEL_LAYER_BACKEND=inmemory
REDIS_URL=redis://127.0.0.1:6379/0
```

`SOCKET_PORT` is also `8000` because Django Channels serves REST API and WebSocket traffic through the same ASGI/Daphne server.

For this machine task, keep `CHANNEL_LAYER_BACKEND=inmemory`; it needs no Redis installation. For a multi-worker deployment, install Redis and change it to `redis`, so Channels can share WebSocket groups across server processes.

### Frontend

From `frontend/`, copy the example file:

```powershell
Copy-Item .env.example .env
```

The default frontend configuration is:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_WS_BASE_URL=ws://127.0.0.1:8000/ws/chat/
VITE_PORT=5173
```

### Frontend styling

The UI is styled with **Tailwind CSS v4** through the Vite plugin. Component styles are kept close to their JSX as Tailwind utility classes, making each component self-contained and responsive without a separate large stylesheet.

`frontend/src/index.css` is intentionally small: it imports Tailwind and contains only global defaults and the toast animation. The previous `styles.css` file is no longer used.

## Run locally

Use two terminals from the project root.

### Terminal 1 - Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

The backend runs at `http://127.0.0.1:8000`.

### Terminal 2 - Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173` in your browser.

If PowerShell blocks `npm`, use `npm.cmd run dev` instead.

## Test real-time messaging

1. Keep the backend and frontend servers running.
2. Open the frontend in one normal browser window and one Incognito/private window. Separate sessions are required because normal tabs share browser storage.
3. Register two different accounts.
4. Send a message from User A to User B.
5. With User B viewing a different conversation, confirm that User B receives an unread badge and an iOS/WhatsApp-style toast showing User A's name with a message preview.
6. Open User A's conversation as User B. The badge should reset and the conversation history should be visible.
7. Type a message to verify the typing indicator.

## REST API

All endpoints except registration/login require this header:

```text
Authorization: Bearer <access-token>
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user. Body: `username`, `email`, `password`. |
| POST | `/api/auth/login` | Log in and receive JWT access/refresh tokens. |
| POST | `/api/auth/refresh` | Exchange a valid refresh token for a new access token. |
| GET | `/api/users` | List other users with unread message counts. |
| GET | `/api/messages/:otherUserId` | Get chronological one-to-one history. |
| PATCH | `/api/messages/:otherUserId/read` | Mark incoming messages from that user as read. |

## WebSocket

Connect with a JWT access token:

```text
ws://127.0.0.1:8000/ws/chat/?token=<access-token>
```

Client events:

```json
{ "type": "set_active_chat", "other_user_id": 2 }
{ "type": "send_private_message", "recipient_id": 2, "text_content": "Hello" }
{ "type": "typing_status", "recipient_id": 2, "is_typing": true }
```

Server events include `private_message`, `message_sent`, `new_message_notification`, `typing_status`, `user_registered`, and `error`.

## Database migrations and tests

Run migrations after any model change:

```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

Run the automated backend tests:

```powershell
python manage.py test
```

## Submission checklist

- [ ] Confirm the real-time test steps above in two separate browser sessions.
- [ ] Run `python manage.py test`.
- [ ] Ensure `.env`, `venv`, `node_modules`, and local database files are not committed.
- [ ] Commit the project from the `dm-chat-app` root.
- [ ] Push to a private GitHub repository or create a clean ZIP of the root project.
