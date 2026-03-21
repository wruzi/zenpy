# ZenPy

ZenPy is a full-stack Python practice platform with gamification, social learning, and real-time chat.

## Status

This project is actively evolving. APIs, UI behavior, and data contracts may change.

## Core Features

- Guided Python question flow (250+ questions across multiple phases)
- Client-side execution workflow (Pyodide-oriented validation model)
- XP/level progression, Zen currency, achievements, streaks
- Shop system with equippable cosmetics (name styles, frames, cards, banners, chat styles)
- Auto-discovered premium GIF banners from assets
- Community pages, follow/unfollow, profile modal, direct messages
- Global real-time chat via Socket.IO
- OTP-based signup + local auth + GitHub OAuth
- Onboarding flow with username/social setup
- Theme system with persisted preference (dark/light/nature/ocean/sunset)

## Tech Stack

- Backend: Node.js, Express, Socket.IO
- Auth/Security: JWT, Passport (GitHub), bcrypt
- Data store: JSON files in [data](data)
- Frontend: HTML/CSS/Vanilla JS
- Email OTP: Resend

## Project Structure

- [server](server): Express server, route modules, chat socket server
- [public](public): HTML pages
- [js](js): frontend logic per page + shared utilities
- [css](css): global/theme/animation styling
- [data](data): JSON datastore (users, progress, chat, follows, etc.)
- [assets](assets): avatars, shop media, images
- [scripts](scripts): reset + question generation + validation tooling

## Prerequisites

- Node.js 18+
- npm 9+
- GitHub OAuth app credentials (optional, for GitHub login)
- Resend API key + verified sender (optional, for OTP email flow)

## Local Setup

1) Install dependencies

```bash
npm install
```

2) Create environment file

Create `.env` in repo root with (as needed):

```env
PORT=3000
JWT_SECRET=change_me
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@your-domain.com
```

Notes:
- `RESEND_FROM_EMAIL` must be a verified sender/domain in your Resend account.
- OTP signup requires `RESEND_API_KEY` + `RESEND_FROM_EMAIL`.

3) Run

```bash
npm run dev
```

or

```bash
npm start
```

App URL: `http://localhost:3000`

## NPM Scripts

- `npm start` → run server via [server/server.js](server/server.js)
- `npm run dev` → run with nodemon for local development

## Utility Scripts

- Reset user/testing data:

```bash
node scripts/resetDatabase.js
```

Clears:
- [data/users.json](data/users.json)
- [data/progress.json](data/progress.json)
- [data/global_chat_messages.json](data/global_chat_messages.json)
- [data/direct_messages.json](data/direct_messages.json)
- [data/follows.json](data/follows.json)
- [data/activity_log.json](data/activity_log.json)
- [data/banned.json](data/banned.json)

- Generate base questions:

```bash
node scripts/generateQuestions.js
```

- Extend question bank:

```bash
node scripts/generateExtendedQuestions.js
```

- Validate questions with Pyodide harness:

```bash
node scripts/validatePyodideQuestions.mjs
```

## Authentication Model

ZenPy supports:
- Local auth (`/api/auth/login`)
- OTP signup flow (`request-otp` → `verify-otp`)
- GitHub OAuth (`/auth/github`)

On successful auth, JWT is used for protected API access (`Authorization: Bearer <token>`).

## API Overview

### Auth

- `POST /api/auth/signup/request-otp`
- `POST /api/auth/signup/resend-otp`
- `POST /api/auth/signup/verify-otp`
- `POST /api/auth/login`
- `GET /api/me`

### User, Onboarding, Quiz

- `GET /api/user`
- `GET /api/user/:email`
- `PUT /api/user`
- `PUT /api/user/profile`
- `POST /api/user/complete-onboarding`
- `GET /api/user/progress/:email`
- `GET /api/daily-quiz`
- `POST /api/daily-quiz`

### Questions

- `GET /api/questions`
- `GET /api/question/:id`
- `POST /api/question/:id/submit`
- `GET /api/question/:id/tests`

### Shop / Economy

- `GET /api/shop/items`
- `POST /api/shop/buy`
- `POST /api/shop/equip`
- `POST /api/user/add-zen`

### Community / Social

- `GET /api/community/users`
- `GET /api/community/user/:email`
- `POST /api/follow`
- `POST /api/unfollow`
- `GET /api/followers/:email`
- `GET /api/following/:email`

### Direct Messages

- `GET /api/dm/conversations`
- `GET /api/dm/:email`
- `POST /api/dm/send`
- `GET /api/dm/unread`

### Leaderboard

- `GET /api/leaderboard/progression`
- `GET /api/leaderboard/speed`
- `GET /api/leaderboard/xp`
- `GET /api/leaderboard/zen`

### Moderation / Admin

- `POST /api/ban`
- `GET /api/check-ban`
- `GET /api/users`
- `GET /api/admin/stats`
- `POST /api/admin/unban`

### Upload

- `POST /api/upload/avatar`
	- Allowed avatar types: PNG, GIF, WEBP
	- Max file size: 2MB

## Socket.IO Events (Global Chat)

Client emits:
- `authenticate`
- `send_message`
- `typing`
- `report_message`

Server emits:
- `chat_history`
- `new_message`
- `online_count`
- `auth_success`
- `auth_error`
- `user_typing`
- `report_received`
- `system_message`

## Data Model Notes

The app persists state in JSON files under [data](data). Server bootstrapping ensures missing files are created.

Important files:
- [data/users.json](data/users.json): account profile, inventory, achievements, social links
- [data/progress.json](data/progress.json): per-user question progress and times
- [data/questions.json](data/questions.json): question bank and tests
- [data/shop_items.json](data/shop_items.json): base shop catalog
- [data/global_chat_messages.json](data/global_chat_messages.json): global chat history
- [data/direct_messages.json](data/direct_messages.json): DM history
- [data/follows.json](data/follows.json): follow graph

## Media and Theme Notes

- Default avatar is SVG-based: [assets/avatars/default-avatar.svg](assets/avatars/default-avatar.svg)
- Existing JPEG assets have been removed from repo usage path
- Theme preference persists in localStorage key `zenpy_theme`
- Available themes: dark, light, nature, ocean, sunset

## Troubleshooting

- Login works but app redirects unexpectedly:
	- Check `JWT_SECRET` consistency and token storage in browser localStorage.

- OTP mail not sending:
	- Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
	- Ensure sender domain is verified in Resend.

- No users/data after reset:
	- This is expected after running `node scripts/resetDatabase.js`.

- GIF banners not appearing:
	- Confirm files are under `assets/shop` with `.gif` extension.
	- Auto-generated items are derived at runtime by server startup helpers.

## Security / Production Notes

- Replace fallback JWT secret for production.
- Session cookie is currently `secure: false`; set secure cookies + HTTPS in production.
- JSON file storage is suitable for development/testing; migrate to a database for production scale.

## License

MIT
