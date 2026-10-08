const aiService = require('../services/aiService');
const { validatePitchData, validateInvestorKey, sanitizePitch } = require('../utils/validate');

const handleAiError = (err, res, fallbackMsg) => {
  console.error(fallbackMsg, err.message);
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || fallbackMsg });
};

// POST /api/start-pitch
const startPitch = async (req, res) => {
  try {
    console.log('📥 Received start-pitch request');
    const errors = validatePitchData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    const pitchData = sanitizePitch(req.body);
    console.log(`✅ Validated pitch for: ${pitchData.startupName}`);

    // Generate all 3 questions in parallel
    console.log('🤖 Generating investor questions...');
    const [moneyQ, marketQ, productQ] = await Promise.all([
      aiService.generateInvestorQuestion('money',   pitchData),
      aiService.generateInvestorQuestion('market',  pitchData),
      aiService.generateInvestorQuestion('product', pitchData),
    ]);
    console.log('✅ Generated all 3 questions');

    res.json({
      success: true,
      pitchData,
      questions: { money: moneyQ, market: marketQ, product: productQ },
      investors: aiService.INVESTORS,
    });
  } catch (err) {
    handleAiError(err, res, 'Failed to start your pitch session. Please try again.');
  }
};

// POST /api/evaluate-answer
const evaluateAnswer = async (req, res) => {
  try {
    const { investorKey, pitchData, question, answer } = req.body;

    if (!validateInvestorKey(investorKey)) {
      return res.status(400).json({ error: 'Invalid investor key.' });
    }
    if (!question || String(question).trim().length < 5) {
      return res.status(400).json({ error: 'Question is required.' });
    }
    if (!answer || String(answer).trim().length < 3) {
      return res.status(400).json({ error: 'Please provide an answer before submitting.' });
    }
    const errors = validatePitchData(pitchData || {});
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Invalid pitch data.', details: errors });
    }

    const evaluation = await aiService.evaluateAnswer(
      investorKey,
      sanitizePitch(pitchData),
      String(question).trim().slice(0, 500),
      String(answer).trim().slice(0, 1000)
    );

    res.json({ success: true, evaluation });
  } catch (err) {
    handleAiError(err, res, 'Failed to evaluate your answer. Please try again.');
  }
};

// POST /api/final-verdict
const finalVerdict = async (req, res) => {
  try {
    const { pitchData, rounds } = req.body;

    if (!Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({ error: 'Rounds data is required.' });
    }
    const errors = validatePitchData(pitchData || {});
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Invalid pitch data.', details: errors });
    }

    const sanitizedRounds = rounds.map((r) => ({
      investorKey: String(r.investorKey || '').trim(),
      question:    String(r.question   || '').trim().slice(0, 500),
      answer:      String(r.answer     || '').trim().slice(0, 1000),
      score:       Number(r.score) || 0,
      strength:    String(r.strength   || '').trim().slice(0, 300),
      weakness:    String(r.weakness   || '').trim().slice(0, 300),
    }));

    const verdict = await aiService.generateFinalVerdict(sanitizePitch(pitchData), sanitizedRounds);
    res.json({ success: true, verdict });
  } catch (err) {
    handleAiError(err, res, 'Failed to generate your final verdict. Please try again.');
  }
};

// POST /api/hint
const getHint = async (req, res) => {
  try {
    const { investorKey, pitchData, question } = req.body;

    if (!validateInvestorKey(investorKey)) {
      return res.status(400).json({ error: 'Invalid investor key.' });
    }
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const hint = await aiService.generateHint(
      investorKey,
      sanitizePitch(pitchData || {}),
      String(question).trim()
    );
    res.json({ success: true, hint: hint.hint });
  } catch (err) {
    handleAiError(err, res, 'Failed to generate hint. Please try again.');
  }
};

// POST /api/deal-meter  (non-critical — never crashes the session)
const dealMeter = async (req, res) => {
  try {
    const { investorKey, question, answer } = req.body;
    if (!validateInvestorKey(investorKey) || !question || !answer) {
      return res.json({ success: true, delta: 0 });
    }
    const delta = await aiService.getDealMeterDelta(
      investorKey,
      String(question).trim().slice(0, 500),
      String(answer).trim().slice(0, 1000)
    );
    res.json({ success: true, delta });
  } catch (err) {
    // Never let deal meter crash the session
    res.json({ success: true, delta: 0 });
  }
};

module.exports = { startPitch, evaluateAnswer, finalVerdict, getHint, dealMeter };
