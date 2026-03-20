# 🧘‍♂️ ZenPy

> **⚠️ Status: Under Active Development**
>
> *ZenPy is currently in its early stages of development and is not yet available for public deployment. Features, architectures, and design concepts are actively evolving.*

---

## 🌟 About ZenPy

ZenPy is a comprehensive, full-stack learning platform designed to make practicing programming concepts engaging, interactive, and socially rewarding. Moving away from dry, text-based tutorials, ZenPy brings a modern, gamified approach to coding education. 

We believe that learning to code is a journey of continuous practice and community support. By combining interactive coding challenges, live community chat, dynamic leaderboards, and an integrated rewards system, ZenPy creates an ecosystem where learners can stay motivated and progressively improve their coding skills in a guided environment.

---

## 🚀 How ZenPy Helps Learners

### 1. Hands-On Practice with Immediate Feedback
Learners can tackle curated coding challenges ranging from basic syntax to advanced algorithms. With an integrated auto-grading system and built-in compiler support, students write code directly in the browser and receive instant feedback. 

### 2. Gamified Learning Experience
To keep motivation high, ZenPy incorporates deep gamification:
- **XP & Levels:** Every completed challenge awards Experience Points (XP) geared towards leveling up.
- **In-Game Economy & Shop:** Learners can spend earned points in the virtual shop to unlock custom avatars, themes, and profile badges.
- **Leaderboards:** Friendly competition is nurtured through dynamic leaderboards, encouraging users to practice consistently to climb the ranks.

### 3. Community Collaboration and Mentorship
Coding shouldn't be a solitary activity. ZenPy includes:
- **Community Chat:** A live, global space to ask questions, share snippets, and discuss concepts.
- **Direct Messaging:** One-on-one channels for personalized mentoring or pairing with peers.
- **Profile Tracking:** Users can view each other's progress, building a sense of camaraderie.

### 4. Structured Curriculum Paths
Questions are categorized into logical phases (e.g., "Phase 0: Basics"). This ensures learners are never overwhelmed, building a solid foundation before advancing to complex problems.

---

## ❓ Frequently Asked Questions (FAQs)

### Q: Who is ZenPy for?
**A:** ZenPy is designed for anyone looking to learn or practice programming in a structured and engaging way. Whether you are a complete beginner writing your first `print()` statement or an intermediate coder looking to refine your logic, the platform provides challenges scaled to your level.

### Q: Do I need any prior coding experience to get started?
**A:** None at all! The platform features carefully crafted "Phase 0" challenges that walk you through the absolute basics. With helpful hints and descriptive problem statements, you can learn directly by doing.

### Q: How does the XP and Leveling system work?
**A:** Every challenge has a designated base XP reward and an "optimal time" limit. By successfully solving the challenge (ensuring your code compiles and passes test cases), you earn XP. Gather enough XP, and your profile levels up, unlocking access to new shop items and community standing!

### Q: Are there tools for teachers or mentors?
**A:** Yes. ZenPy comes with dedicated Admin tools for managing question banks, reviewing user progress, and ensuring the community remains a safe, productive space via ban checks and moderation logs.

### Q: Can I contribute or clone the project?
**A:** As mentioned above, ZenPy is currently undergoing active, private-phase development. Community contributions and public deployment guidelines will be formally introduced once the core architecture reaches a stable release milestone.

---

*Thank you for your interest in ZenPy! We're excited to build a platform that turns the daunting task of learning to code into an enjoyable, rewarding adventure.*

---

## 🆕 Recent Updates (Mar 20, 2026)

- **Onboarding modal + Terms enforcement:** New dashboard visitors now encounter a modal that blocks interaction until they pick a username, upload an avatar, and accept the Terms & Conditions, with the full policy reachable at `/terms` and via the sidebar link.
- **Onboarding state APIs:** The auth/user routes now track `profileSetupCompleted`/`termsAccepted`, and a dedicated `/api/user/complete-onboarding` endpoint lets the modal finish the flow after verifying the avatar upload and checkbox state.
- **Database tooling:** Added `scripts/resetDatabase.js` (plus helpers) so data stores (users, progress, chat, bans, activity logs) can be reset locally without touching Git-tracked files, keeping the repo clean.
- **Login/signup guards:** The auth cards now call `/api/user` before redirecting, ensuring the GitHub sign-in view remains visible until the token truly validates and preventing premature dashboard loads.
- **New static content & assets:** Terms, Rules, Docs, and Banned pages were introduced alongside the avatar/shop media, new banner/card simulation runtimes, and refreshed dashboard/shop UI to showcase today’s feature set.
