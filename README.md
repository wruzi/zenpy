# ZenPy

ZenPy is a full-stack learning platform for practicing programming concepts in a guided environment. It combines interactive challenges, a community chat, leaderboards, and gamification to help learners stay motivated and improve their coding skills.

## 🚀 Key Features

- **Practice challenges** with auto-graded code evaluation
- **Chat & community** spaces for collaboration and mentoring
- **Leaderboards & gamification** to reward progress and participation
- **User accounts** with login/signup and profile management
- **Admin tools** for managing questions and users

## 📁 Project Structure

- `server/` - Express API routes, authentication, and session handling
- `public/` - Frontend HTML pages (practice, chat, dashboard, etc.)
- `js/` - Client-side JavaScript logic for UI and interactions
- `data/` - JSON storage for questions, users, chat history, and progress
- `css/` - Styling for responsive layout and theming

## 🛠️ Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   node server/server.js
   ```

3. Open a browser and visit:

   - `http://localhost:3000` for the main UI

## ✅ Notes

- The `data/` folder contains JSON files used as lightweight storage. Avoid committing real user data.
- The project is designed for local development and learning; consider swapping to a real database for production.

---

Happy coding! 🧘‍♂️✨
