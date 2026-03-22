# ZenPy

ZenPy is a full-stack coding web app and Python learning platform with gamification, social features, and real-time interaction.

## Live Website

- https://zenpy.games

## Quick Navigation

- [What is ZenPy](#what-is-zenpy)
- [Platform Features](#platform-features)
- [Question Types](#question-types)
- [Analytics Dashboard](#analytics-dashboard)
- [Gamification](#gamification)
- [Shop and Economy](#shop-and-economy)
- [Community and Social](#community-and-social)
- [Themes and UI](#themes-and-ui)
- [Authentication](#authentication)
- [API Highlights](#api-highlights)
- [Project Structure](#project-structure)
- [Contact](#contact)
- [Rules](#rules)

## What is ZenPy

ZenPy is designed for consistent coding growth. It combines a structured Python question journey, measurable performance analytics, progression systems, and social collaboration into one platform.

<details>
<summary><strong>Why ZenPy feels different</strong></summary>

- Learning flow is progression-driven, not random practice only.
- Every solve contributes to XP, level, rank, streak, and economy.
- You can build identity via cosmetics, titles, chat styles, and profile setups.
- Dashboard analytics gives clear signals on speed, quality, and consistency.

</details>

## Platform Features

- 250-question coding journey with phased progression.
- Browser-based coding and validation flow.
- Daily Python quiz with cooldown and reward system.
- Achievement tracking and milestone unlocks.
- Realtime global chat + direct messaging.
- Profile onboarding with avatar and social links.
- Competitive leaderboards by XP, speed, progression, and Zen.

## Question Types

ZenPy includes a broad range of problem styles, from beginner to advanced:

- Basics: print, variables, arithmetic, input/output.
- Data handling: strings, lists, indexing, slicing, conversions.
- Logic and flow: conditional paths and iterative thinking.
- Skill reinforcement: test-case driven objective checks.
- Guided practice: hint-driven and concept-tagged prompts.

<details>
<summary><strong>Question metadata included</strong></summary>

- `difficulty`
- `category` / phase
- `concepts`
- `hints`
- `optimalTime`
- `xpBase`
- `testCases` (visible + hidden where applicable)

</details>

## Analytics Dashboard

The dashboard is built for actionable feedback, not just score display.

- Completion percentage and solved/remaining split.
- Total coding time and average/fastest/slowest solve time.
- First-attempt success quality and retries.
- Solve velocity (questions per day).
- Consistency and pace trend insights.
- Visual charts for speed mix, attempt quality, and progression trend.

<details>
<summary><strong>Advanced insights shown in dashboard</strong></summary>

- Consistency score
- Perfect-attempt rate
- Streak momentum
- Projected completion ETA based on current velocity
- Focus suggestions for speed vs depth balance

</details>

## Gamification

ZenPy rewards consistency and quality through layered progression:

- XP and level system
- Streak and longest streak tracking
- Achievement unlocks (progress + behavior based)
- Competitive ranking and public progression signals
- Daily quiz reward loop

## Shop and Economy

ZenPy runs on an in-app economy powered by Zen coins.

- Earn Zen from engagement and quiz performance.
- Spend Zen in the shop to unlock cosmetics.
- Equip cosmetics across profile, chat, and community cards.
- Unlock premium items via requirement gates (questions, XP, streaks).

<details>
<summary><strong>Shop categories currently supported</strong></summary>

- Name styles
- Effects
- Avatar frames
- Name accessories/titles
- Chat extras and styles
- Profile card cosmetics
- Banner cosmetics

</details>

## Community and Social

ZenPy has a social-first experience for learners and builders:

- Global real-time chat (Socket.IO)
- Direct messages
- Follow/unfollow network
- Community profile discovery
- Shareable identity via equipped cosmetics

## Themes and UI

Theme preference is persisted and available globally across the app.

- dark
- light
- nature
- ocean
- sunset

## Authentication

ZenPy supports multiple auth paths:

- Local login
- OTP-based signup (`request-otp` → `verify-otp`)
- GitHub OAuth (`/auth/github`)

JWT is used for protected API requests.

## API Highlights

### Auth
- `POST /api/auth/signup/request-otp`
- `POST /api/auth/signup/resend-otp`
- `POST /api/auth/signup/verify-otp`
- `POST /api/auth/login`
- `GET /api/me`

### User / Quiz / Progress
- `GET /api/user`
- `GET /api/user/:email`
- `PUT /api/user/profile`
- `POST /api/user/complete-onboarding`
- `GET /api/daily-quiz`
- `POST /api/daily-quiz`

### Questions
- `GET /api/questions`
- `GET /api/question/:id`
- `POST /api/question/:id/submit`
- `GET /api/question/:id/tests`

### Economy / Shop
- `GET /api/shop/items`
- `POST /api/shop/buy`
- `POST /api/shop/equip`

### Social / Leaderboard
- `GET /api/community/users`
- `POST /api/follow`
- `POST /api/unfollow`
- `GET /api/leaderboard/xp`
- `GET /api/leaderboard/speed`
- `GET /api/leaderboard/progression`
- `GET /api/leaderboard/zen`

## Project Structure

- [backend/server](backend/server) — Express backend, auth routes, quiz, economy, community and chat server logic
- [frontend/public](frontend/public) — page entry points (dashboard, profile, practice, chat, community, auth)
- [frontend/js](frontend/js) — frontend modules for dashboard, chat, community, leaderboard, shop, compiler, utils
- [frontend/css](frontend/css) — base styles, themes, responsive styles, animations
- [database/data](database/data) — JSON storage for users, progress, questions, chat, follows, inventory data
- [frontend/assets](frontend/assets) — avatar, image, and shop media assets
- [backend/scripts](backend/scripts) — reset and generation scripts for maintenance and content tooling

## Contact

For collaborations, support, or platform-related queries:

- Website: https://zenpy.games
- Reach out via the platform community channels and profile links.

## Rules

- Use ZenPy for learning and fair coding practice.
- Respect community members in chat and DMs.
- Avoid spam, abuse, automation, and exploit attempts.
- Keep submissions authentic—do not misuse the platform.