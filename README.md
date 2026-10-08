# 🦈 Shark Tank AI

> **Pitch it. Defend it. Earn the investment.**

An AI-powered investor simulation that puts your startup idea in front of three tough investors — and tells you the hard truth.

---

## The Problem

Everyone thinks their startup idea is great. Friends are too polite. Real investors are too hard to reach. Nobody tells you what's actually wrong with your pitch — until you're in the room and it's too late.

## The Solution

Shark Tank AI simulates a real investor pitch. Three AI investors challenge your market, business model, and product from different angles. You defend your idea, they score your answers, and at the end you get a verdict, a hard truth, and a 3-step rescue plan.

---

## Features

- **3 Distinct Investor Personas** — Market Shark, Money Shark, Product Shark
- **Live Pitch Simulation** — questions generated from your actual startup details
- **Per-Round Scoring** — each answer scored 0–100 with strengths and weaknesses
- **Hint System** — guides thinking without giving away the answer
- **Final Investment Verdict** — INVEST / INTERESTED / PASS based on actual performance
- **The Hard Truth** — the single biggest weakness in your pitch
- **3-Step Pitch Rescue Plan** — specific, actionable improvements
- **Pitch Scorecard** — 7 dimensions scored visually
- **Copy Investor Report** — shareable text summary of the full verdict

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Axios |
| Backend | Node.js, Express |
| AI | Grok API (grok-3-mini) |
| Deployment | Google Cloud Run |
| Styling | Custom CSS (no UI library) |

---

## Architecture

```
React (Vite)
    ↓  /api/*  (proxy in dev, same origin in prod)
Express Server
    ↓
OpenAI API
    ↓
Structured JSON responses
    ↓
React UI
```

In production, Express serves the React build statically from `./public`.

---

## Local Setup

### 🚀 Quick Start (Mock Mode - No API Key Needed!)

**Perfect for demos, testing, and hackathons**

```bash
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend
cd client && npm install && npm run dev

# Open http://localhost:5173
```

**That's it!** The app runs in mock mode by default with realistic AI responses.

📖 **[Read QUICK_START.md](./QUICK_START.md)** for a 2-minute setup guide  
📋 **[Read TEMPLATE_USAGE.md](./TEMPLATE_USAGE.md)** for template examples  
🎯 **[Read CHEAT_SHEET.md](./CHEAT_SHEET.md)** for answer tips

---

### 🔌 Running with Real AI (Optional)

Only needed if you want to use a real AI API instead of mock mode.

#### Prerequisites
- Node.js 18+
- Hugging Face API key (free tier available)

#### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/shark-tank-ai.git
cd shark-tank-ai

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

#### 2. Configure for real AI

```bash
cd server
cp .env.example .env
# Edit .env:
# - Set AI_MODE=huggingface
# - Add your HUGGINGFACE_API_KEY
```

#### 3. Run locally (two terminals)

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Open `http://localhost:5173`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AI_MODE` | No | Set to `mock` for demo mode (default), `huggingface` for real AI |
| `HUGGINGFACE_API_KEY` | Only if AI_MODE=huggingface | Your Hugging Face API key from https://huggingface.co/settings/tokens |
| `HUGGINGFACE_MODEL` | No | Model to use (default: `meta-llama/Llama-3.1-8B-Instruct`) |
| `PORT` | No | Server port (default: `5000`, Cloud Run uses `8080`) |
| `CLIENT_URL` | No | Frontend URL for CORS (default: `http://localhost:5173`) |
| `NODE_ENV` | No | Set to `production` in Cloud Run |
| `AI_TIMEOUT_MS` | No | API request timeout (default: `30000` ms) |

### Mock Mode (Default)
Mock mode provides realistic investor questions and scoring without any API calls. Perfect for:
- ✅ Demos and hackathons
- ✅ Testing and development
- ✅ Offline environments
- ✅ Production deployments (works everywhere!)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/start-pitch` | Start a pitch session, get 3 investor questions |
| POST | `/api/evaluate-answer` | Evaluate one founder answer |
| POST | `/api/hint` | Get a hint for a question |
| POST | `/api/final-verdict` | Generate the full final verdict |

---

## Testing

```bash
cd server
npm test
```

Tests cover: input validation, investor key validation, input sanitization, and AI response structure validation.

---

## Cloud Run Deployment

### Build and deploy in one command

```bash
# From the project root
gcloud run deploy shark-tank-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GROK_API_KEY=your_key_here,NODE_ENV=production \
  --memory 512Mi \
  --timeout 120
```

### Or build Docker image manually

```bash
# Build
docker build -t shark-tank-ai .

# Test locally
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=your_key \
  -e NODE_ENV=production \
  shark-tank-ai

# Push to Artifact Registry and deploy
docker tag shark-tank-ai gcr.io/YOUR_PROJECT/shark-tank-ai
docker push gcr.io/YOUR_PROJECT/shark-tank-ai
gcloud run deploy shark-tank-ai \
  --image gcr.io/YOUR_PROJECT/shark-tank-ai \
  --region us-central1 \
  --allow-unauthenticated
```

### Production build (for manual deployment)

```bash
# Build React frontend
cd client && npm run build

# Copy build to server's public folder
cp -r client/dist server/public

# Start server
cd server && NODE_ENV=production npm start
```

---

## Security Notes

- API keys are never exposed in frontend code
- All user inputs are validated and sanitized server-side
- Input length is capped to prevent prompt injection
- AI responses are validated before being sent to the client
- `.env` files are gitignored

---

## GitHub Repo Requirements (Hackathon)

- ✅ Public repository
- ✅ One branch only
- ✅ Under 10 MB (node_modules and dist excluded via .gitignore)
- ✅ Link ends in `.git`

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 2-minute setup guide
- **[TEMPLATE_USAGE.md](./TEMPLATE_USAGE.md)** - Detailed template guide with examples
- **[PITCH_TEMPLATE.md](./PITCH_TEMPLATE.md)** - Full pitch templates and answer examples
- **[CHEAT_SHEET.md](./CHEAT_SHEET.md)** - Quick reference for strong answers

## 🎯 Pre-filled Templates

The app includes 4 ready-to-test startup templates:
1. **TutorLink** - EdTech on-demand tutoring platform
2. **FoodDash** - Hyperlocal food delivery from home chefs
3. **RentEasy** - Digital rent payments with credit building
4. **StudyPod** - All-in-one study planner with AI scheduling

Select any template from the dropdown to auto-fill the pitch form with realistic data.

## Future Improvements

- Follow-up question rounds (adaptive multi-turn)
- Pitch history with localStorage
- Side-by-side pitch comparison
- Export as PDF report
- Share verdict as public link
- Voice input for answers

---

*Built for the PromptWars × The Prompt Arena Hackathon — Pondicherry University, 8 October 2026*
