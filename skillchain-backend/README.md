# SkillChain Backend

A decentralized-style reputation platform where users earn Skill-Tokens for completing verified tasks.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |

---

## API Reference

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register as freelancer or company |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |

**Register body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "freelancer",
  // For companies only:
  "companyName": "Google",
  "companyLogo": "https://..."
}
```

---

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Auth | Discover tasks (with filters) |
| GET | `/api/tasks/:id` | Auth | Get task + eligibility check |
| GET | `/api/tasks/company/my` | Company | Company's own tasks |
| POST | `/api/tasks` | Company | Post a new task |
| PATCH | `/api/tasks/:id/cancel` | Company | Cancel a task |

**Create Task body:**
```json
{
  "title": "Build a REST API",
  "description": "We need a Node.js REST API for our platform",
  "tokenReward": 150,
  "skillCategory": "Dev",
  "minimumSkillScore": 50,
  "requiredBadges": [],
  "deadline": "2025-12-31",
  "tags": ["node", "express", "api"]
}
```

**Query Filters (GET /api/tasks):**
- `category` — Filter by skill category (Dev, Design, etc.)
- `minReward` / `maxReward` — Token reward range
- `status` — Task status (open, in_review, completed)
- `search` — Full-text search in title/description/tags
- `page` / `limit` — Pagination

---

### Submissions (GitHub-Style Flow)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/submissions` | Freelancer | Submit work to a task |
| GET | `/api/submissions/my` | Freelancer | View own submissions |
| GET | `/api/submissions/task/:taskId` | Company | Review dashboard for a task |
| POST | `/api/submissions/:id/accept` | Company | **Accept** — triggers atomic token transfer + badge mint |
| POST | `/api/submissions/:id/reject` | Company | Reject — may trigger slashing |

**Submit Work body:**
```json
{
  "taskId": "64abc...",
  "submissionUrl": "https://github.com/alice/my-project",
  "note": "Implemented all endpoints with full test coverage."
}
```

**Accept Submission body:**
```json
{
  "reviewNote": "Excellent work, clean code!"
}
```

**On Accept, atomically:**
1. Company loses `tokenReward` tokens in that category
2. Freelancer gains `tokenReward` tokens in that category
3. A verified badge is minted on the freelancer's profile
4. Task marked as `completed`
5. All other pending submissions auto-rejected
6. Transaction logged to ledger

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/leaderboard` | Public | Top freelancers by reputation |
| GET | `/api/users/:id` | Public | View user profile + badges |
| PATCH | `/api/users/me` | Auth | Update own profile |
| GET | `/api/users/:id/transactions` | Auth (self) | Token transaction history |

**Leaderboard query params:**
- `category` — Rank by specific category (Dev, Design, etc.)
- `limit` — Number of results (default: 20)

---

## Token Economy

### Categories
`Dev`, `Design`, `Marketing`, `Writing`, `Data`, `Other`

### Reputation Score
Overall score = sum of all category token balances. Used for task filtering and ranking.

### Slashing Logic
- Every rejection increments `recentRejections`
- At **5 rejections**, a **10% penalty** is applied across all token balances
- Counter resets after slash
- A successful acceptance resets the rejection counter

### Initial Grant
New freelancers receive **10 Other tokens** on registration to get started.

---

## Data Models

### User
- `role`: `freelancer` | `company`
- `tokenBalances[]`: per-category balances
- `reputationScore`: overall weighted sum
- `badges[]`: verified company badges
- `recentRejections`: rejection counter for slashing
- `isSlashed`: whether slash penalty was applied

### Task
- `tokenReward`: tokens paid on completion
- `skillCategory`: which token type is used
- `minimumSkillScore`: reputation gate
- `requiredBadges[]`: badge gate
- `status`: `open` → `completed` | `cancelled`

### Submission
- `submissionUrl`: GitHub repo, Figma, etc.
- `status`: `pending` → `accepted` | `rejected`

### Transaction (Ledger)
- Logs every token movement
- Types: `task_reward`, `task_deduction`, `slash_penalty`, `initial_grant`
- Includes balance snapshots for audit trail