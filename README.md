# DareU

DareU is a personal-growth mobile-web app built around small daily challenges ("dares"). *"Sometimes it's the small decisions that change everything."*

New users answer a motivation survey and pick up to 3 growth topics (e.g. Public Speaking, Fitness, Relationships, Confidence, Time Management). An AI planner on the backend then generates short, personalized daily challenges tailored to the user's chosen topics, motivation style (intrinsic / extrinsic / social / competitive / task-discipline), and current difficulty level. Completing challenges earns points and levels, which evolve the user's avatar through growth stages (egg → chick → bird → eagle → butterfly). The app also includes an AI chat companion and an experimental "Life Calendar" that visualizes weeks/months of life lived vs. remaining.

## Tech Stack

**Frontend**
- React 19 + Vite 7
- React Router 7 (client-side routing)
- `@react-oauth/google` for Google Sign-In
- `lucide-react` for icons
- Plain per-page/per-component CSS (no CSS framework)
- No global state library — state lives in local component state, `localStorage`, and `fetch` calls to the backend

**Backend** (`server/`, ESM Node.js)
- Express 5
- MongoDB (official `mongodb` driver, no ORM) — collections: `challenges`, `challenge_runs`, `completed_challenges`, `user_profiles`
- OpenAI SDK for the AI challenge planner (model configurable via `OPENAI_MODEL`, with fallback/offline modes)
- Hugging Face Inference API called directly from the frontend for the chat page

## Routing

### Frontend routes (`src/App.jsx`)

| Path | Page | Description |
|---|---|---|
| `/` | `WelcomePage` | Landing screen |
| `/login` | `Login` | Google OAuth sign-in + manual signup |
| `/survey` | `Survey` | Multi-step motivation & topic questionnaire |
| `/home` | `HomePage` | Post-survey summary and Life Calendar widget |
| `/challenges` | `Challenges` | AI-generated daily challenges, grouped by topic |
| `/progress` | Progress placeholder | Progress overview |
| `/profile` | `MinimalProfilePage` | Points, level, avatar, and goals |
| `/chat` | `ChatPage` | AI chat companion |
| `*` | — | Redirects to `/` |

The bottom navigation bar is shown only on `/home`, `/profile`, `/challenges`, and `/chat`.

### Backend API (`server/index.js`, default port `5050`)

| Route | Description |
|---|---|
| `GET /health`, `GET /health/db` | Health checks |
| `GET /api/challenges` | Fetch challenges filtered by topic/difficulty |
| `POST /agent/plan` | Generate and persist a set of challenge proposals for a user |
| `POST /agent/decision` | Accept or reject a proposed challenge run |
| `POST /agent/complete` | Score a completed challenge and update the user's points/level |
| `GET /runs/today`, `GET /runs/history` | Today's active runs / past run history (also mounted under `/present`) |
| `POST /profile/upsert`, `GET /profile/get` | Create/update and fetch a user profile |

## Architecture

```
DareU/
├── src/
│   ├── main.jsx          # App entry point, wraps App in GoogleOAuthProvider
│   ├── App.jsx            # Router setup and layout (bottom nav visibility)
│   ├── pages/              # One component per route, with page-specific styles
│   ├── components/         # Shared UI (BottomNav, Goals, StatusBar)
│   ├── hooks/               # Reusable hooks (e.g. agent data fetching)
│   └── assets/               # Images and static assets
│
└── server/
    ├── index.js              # Express app and route mounting
    ├── routes/                # agent, profile, presentation(runs) route handlers
    ├── agents/                 # planner.js (challenge selection logic), llm.js (OpenAI integration)
    ├── tools/                   # Scoring, progression, and history helpers
    ├── database/                 # MongoDB connection singleton
    └── scripts/                   # Database seeding scripts
```

The frontend and backend are two independently run Node applications. The frontend calls the backend over plain `fetch` requests using a configurable API base URL (`VITE_API_BASE`), with CORS enabled on the server. Running `npm run dev` from the project root starts both the Vite dev server and the Express API concurrently.

## Getting Started

```bash
# install frontend dependencies
npm install

# install backend dependencies
cd server && npm install && cd ..

# run frontend and backend together
npm run dev
```

Configure environment variables before running:
- **Frontend** (`.env` at project root): `VITE_API_BASE`, `VITE_GOOGLE_CLIENT_ID`, `VITE_HF_TOKEN`
- **Backend** (`server/.env`): `MONGODB_URI`, `DB_NAME`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `PORT`

Other scripts:
- `npm run client` — run only the frontend (Vite dev server)
- `npm run server` — run only the backend
- `npm run build` — production build of the frontend
- `npm run preview` — preview the production build locally
