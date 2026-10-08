# 🚀 Quick Start Guide - Mock Mode & Templates

This guide shows you how to run the Shark Tank AI simulator in **mock mode** for instant testing and demos without needing any API keys.

---

## ✅ **Mock Mode is Already Active!**

Your `.env` file is configured for mock mode:

```env
AI_MODE=mock
```

This means:
- ✅ **No API keys required**
- ✅ **Works offline**
- ✅ **Perfect for demos and hackathons**
- ✅ **Realistic investor questions and scoring**
- ✅ **Fast responses (< 1 second)**

---

## 🎯 **How to Run**

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```

Backend will start on **http://localhost:5000**

### 2. Start the Frontend (New Terminal)

```bash
cd client
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**

### 3. Open in Browser

Navigate to **http://localhost:5173**

---

## 📋 **Using Pre-filled Templates**

When you open the app, you'll see a **template dropdown** at the top of the pitch form:

### Available Templates:

1. **TutorLink (EdTech)** - On-demand tutoring platform
2. **FoodDash (Food Delivery)** - Hyperlocal home chef marketplace
3. **RentEasy (PropTech)** - Digital rent payments with credit building
4. **StudyPod (EdTech SaaS)** - All-in-one study planner for students
5. **Start from Scratch** - Empty form for your own idea

### To Use a Template:

1. Select a template from the dropdown
2. The form auto-fills with realistic startup data
3. Click "🔥 Enter the Tank →"
4. Answer investor questions (use the hint button if stuck)
5. Get your final verdict and pitch rescue plan

---

## 💡 **Mock Mode Features**

### What Works:
- ✅ 3 distinct investor personas (Money, Market, Product Shark)
- ✅ Dynamic question generation (12 unique questions in the bank)
- ✅ Smart answer scoring (detects numbers, specifics, length)
- ✅ Per-round evaluation with strengths/weaknesses
- ✅ Deal meter tracking (-30 to +30)
- ✅ Final verdict with investment decision
- ✅ Weakest answer analysis
- ✅ 3-step pitch rescue plan
- ✅ Hint system

### How It Works:
Mock responses are **deterministic** based on:
- Startup name (hash used as seed)
- Investor type (money, market, product)
- Answer quality (presence of numbers, specifics, length)

**Same startup + same investor = same question every time**  
This makes it perfect for testing and demos!

---

## 🎭 **Understanding Answer Scoring**

The mock AI scores your answers based on:

### ✅ What Increases Your Score:
- **Numbers**: Revenue figures, timelines, customer counts
- **Length**: Detailed answers (100+ characters) score higher
- **Keywords**: "because", "specifically", "for example"
- **Specifics**: Named examples, concrete plans

### ❌ What Decreases Your Score:
- Vague claims ("huge market", "everyone needs this")
- Short answers (< 80 characters)
- No numbers or evidence
- Generic responses

### Score Breakdown:
- **Base Score**: 40 points
- **+15**: Has numbers (revenue, users, costs)
- **+15**: Answer length > 100 characters
- **+15**: Contains "because", "specifically", "for example"
- **+5-20**: Bonus based on startup seed

**Total Range**: 40-95 points per answer

---

## 📊 **Example Test Flow**

### Test Case 1: Strong Answer

**Template**: TutorLink  
**Investor**: Money Shark  
**Question**: "What is your exact revenue model, and how much do you need to sell per month to break even?"

**Strong Answer** (will score ~80+):
```
We earn 15% commission per tutoring session. Average session is ₹500/hour, 
so we make ₹75 per session. Our monthly costs are ₹50,000 (marketing + tech + ops). 
To break even, we need 667 sessions per month, or 22 per day. Based on our pilot 
with 50 students, each books 2 sessions/week. So we need 170 active students 
to break even, which we plan to reach in month 3 through targeted college marketing.
```

### Test Case 2: Weak Answer

**Weak Answer** (will score ~45):
```
We make money through commissions on each session. Once we scale up, 
we'll definitely be profitable because the education market is huge.
```

---

## 🔄 **Switching to Real AI**

When you're ready to use a real AI API:

### Option 1: Hugging Face (Free Tier Available)

1. Get API key: https://huggingface.co/settings/tokens
2. Update `.env`:
```env
AI_MODE=huggingface
HUGGINGFACE_API_KEY=your_actual_key_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct
AI_TIMEOUT_MS=30000
```
3. Restart the server

### Option 2: OpenAI / Grok

1. Get API key from OpenAI or X.AI
2. Update `.env`:
```env
AI_MODE=openai
OPENAI_API_KEY=your_actual_key_here
```
3. Restart the server

---

## 🧪 **Testing Checklist**

Use this checklist to verify everything works:

- [ ] Server starts without errors
- [ ] Frontend loads on http://localhost:5173
- [ ] Template dropdown appears and loads data
- [ ] Can select TutorLink template
- [ ] Form auto-fills with pitch data
- [ ] Can submit pitch and see loading state
- [ ] Three investor cards appear
- [ ] Question text animates on screen
- [ ] Can type an answer
- [ ] Hint button shows a hint
- [ ] Submit answer shows loading spinner
- [ ] Evaluation appears with score bar
- [ ] Can proceed to next investor
- [ ] Deal meter updates after each round
- [ ] Final verdict shows after 3 rounds
- [ ] Can copy verdict text

---

## 🐛 **Common Issues**

### Issue: "Cannot GET /api/start-pitch"
**Solution**: Backend is not running. Start it with `cd server && npm run dev`

### Issue: Template dropdown not showing
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: "CORS error"
**Solution**: Check that CLIENT_URL in `.env` matches your frontend URL (usually http://localhost:5173)

### Issue: Slow responses in mock mode
**Solution**: Mock mode should be < 1 second. Check if AI_MODE is actually set to "mock" in `.env`

### Issue: Template doesn't auto-fill
**Solution**: Check browser console for errors. Verify `templates.js` exists in `client/src/utils/`

---

## 📁 **File Reference**

```
university_hackathon/
├── PITCH_TEMPLATE.md          # Full template guide (detailed)
├── TEMPLATE_USAGE.md          # This file (quick start)
├── server/
│   ├── .env                   # AI_MODE=mock (already configured!)
│   ├── .env.example           # Template for new setups
│   └── services/
│       └── mockAIClient.js    # Mock AI logic (no edits needed)
└── client/
    └── src/
        ├── utils/
        │   └── templates.js   # Template data + utility functions
        └── pages/
            └── PitchSetup.jsx # Form with template dropdown
```

---

## 🎯 **Demo Script**

For a quick 3-minute demo:

1. **Start servers** (both backend and frontend)
2. **Select "TutorLink" template** from dropdown
3. **Click "Enter the Tank"** (all fields auto-filled)
4. **Round 1 - Money Shark**: Use hint, then answer with specific numbers
5. **Round 2 - Market Shark**: Type a quick answer with customer names
6. **Round 3 - Product Shark**: Explain competitive advantage
7. **Review final verdict**: Show deal meter, scores, and rescue plan
8. **Copy verdict text**: Demonstrate the share feature

**Time**: ~3-5 minutes per run

---

## 🚀 **Next Steps**

1. **Try all 4 templates** to see different investor questions
2. **Experiment with answer quality** - see how scores change
3. **Test hint system** for each investor
4. **Review PITCH_TEMPLATE.md** for detailed scoring guide
5. **Switch to real AI** when ready for deployment

---

## 💬 **Need Help?**

- Check `PITCH_TEMPLATE.md` for detailed examples
- Review `mockAIClient.js` to understand scoring logic
- Check browser console for JavaScript errors
- Check server logs for backend errors

---

**Happy Testing! 🦈**

*Remember: Mock mode is production-ready for demos and hackathons. It's not just for testing!*
