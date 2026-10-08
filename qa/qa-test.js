/**
 * SHARK TANK AI — End-to-End QA Test Suite
 * Tests the running application at localhost:5173 (frontend) and localhost:5000 (backend)
 * No browser needed — tests HTTP responses, API contracts, security, and validation
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const FRONTEND = 'http://localhost:5173';
const BACKEND  = 'http://localhost:5000';

let passed = 0;
let failed = 0;
const bugs = { critical: [], high: [], medium: [], ui: [], security: [], perf: [], accessibility: [] };
const fixed = [];

// ── Helpers ───────────────────────────────────────────────────────────────────
function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const u = new URL(url);
    opts.hostname = u.hostname;
    opts.port = u.port;
    opts.path = u.pathname;
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function assert(name, condition, failSeverity = 'high', detail = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
    bugs[failSeverity].push(`${name}${detail ? ': ' + detail : ''}`);
  }
}

function section(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

// ── Test data ─────────────────────────────────────────────────────────────────
const VALID_PITCH = {
  startupName: 'CampusCart',
  oneLiner: 'A campus-only marketplace where verified students buy and sell used items',
  problem: 'College students struggle to safely buy and sell used books, electronics and other items within their campus.',
  solution: 'A campus-only marketplace where verified students can buy and sell used items.',
  targetCustomer: 'College students',
  businessModel: 'A small transaction fee on successful sales.',
  competitiveAdvantage: 'Campus-verified accounts with student ID checks',
};

// ─────────────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n🦈 SHARK TANK AI — QA TEST SUITE');
  console.log(`Frontend: ${FRONTEND}`);
  console.log(`Backend:  ${BACKEND}`);
  console.log(`Started:  ${new Date().toISOString()}`);

  // ══════════════════════════════════════════════════════════════════════════
  section('1. BACKEND HEALTH CHECK');
  // ══════════════════════════════════════════════════════════════════════════
  try {
    const h = await get(`${BACKEND}/api/health`);
    assert('Health endpoint returns 200', h.status === 200, 'critical');
    const body = JSON.parse(h.body);
    assert('Health body has status:ok', body.status === 'ok', 'critical');
    assert('AI is configured (OPENAI_API_KEY set)', body.aiConfigured === true, 'critical',
      body.aiConfigured ? '' : 'OPENAI_API_KEY not set — AI will not work');
  } catch (e) {
    assert('Backend is reachable', false, 'critical', `Cannot connect: ${e.message}`);
    console.log('\n⛔ Backend unreachable — skipping API tests');
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('2. FRONTEND HTML LOAD');
  // ══════════════════════════════════════════════════════════════════════════
  let html = '';
  try {
    const f = await get(FRONTEND);
    html = f.body;
    assert('Frontend returns 200', f.status === 200, 'critical');
    assert('HTML contains root div', html.includes('id="root"'), 'critical');
    assert('HTML has correct title', html.includes('Shark Tank AI') || html.includes('shark-tank'), 'medium');
    assert('HTML links main JS bundle', html.includes('.js'), 'critical');
    assert('HTML links CSS', html.includes('.css'), 'medium');
    assert('No API key in HTML', !html.includes('sk-'), 'security', 'API key found in HTML!');
    assert('No OPENAI in HTML', !html.toLowerCase().includes('openai_api_key'), 'security');
  } catch (e) {
    assert('Frontend is reachable', false, 'critical', e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('3. SECURITY — SOURCE CODE SCAN');
  // ══════════════════════════════════════════════════════════════════════════

  // Check no .env in repo
  const envPath = path.join('d:\\university_hackathon', 'server', '.env');
  const gitignorePath = path.join('d:\\university_hackathon', '.gitignore');

  const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  assert('.gitignore exists', fs.existsSync(gitignorePath), 'security');
  assert('.gitignore excludes .env', gitignoreContent.includes('.env'), 'security');
  assert('.gitignore excludes node_modules', gitignoreContent.includes('node_modules'), 'medium');
  assert('.gitignore excludes dist', gitignoreContent.includes('dist'), 'medium');

  // Scan client source for secrets
  const clientSrc = path.join('d:\\university_hackathon', 'client', 'src');
  let apiKeyInFrontend = false;
  let openaiInFrontend = false;
  const scanDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((f) => {
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) { scanDir(fp); return; }
      if (!f.endsWith('.js') && !f.endsWith('.jsx')) return;
      const content = fs.readFileSync(fp, 'utf8');
      if (content.includes('sk-')) apiKeyInFrontend = true;
      if (content.toLowerCase().includes('openai_api_key')) openaiInFrontend = true;
    });
  };
  scanDir(clientSrc);
  assert('No API key in frontend source files', !apiKeyInFrontend, 'security', 'sk- found in client source!');
  assert('No OPENAI_API_KEY in frontend source', !openaiInFrontend, 'security');

  // Check env.example exists
  assert('.env.example exists', fs.existsSync(path.join('d:\\university_hackathon', 'server', '.env.example')), 'medium');

  // ══════════════════════════════════════════════════════════════════════════
  section('4. API VALIDATION — INPUT CHECKS');
  // ══════════════════════════════════════════════════════════════════════════

  // Empty pitch
  const empty = await post(`${BACKEND}/api/start-pitch`, {});
  assert('Rejects empty pitch (400)', empty.status === 400, 'high');
  assert('Empty pitch returns error message', typeof empty.body?.error === 'string', 'high');

  // Missing required fields one by one
  const missingName = await post(`${BACKEND}/api/start-pitch`, { ...VALID_PITCH, startupName: '' });
  assert('Rejects missing startupName', missingName.status === 400, 'high');

  const missingProblem = await post(`${BACKEND}/api/start-pitch`, { ...VALID_PITCH, problem: '' });
  assert('Rejects missing problem', missingProblem.status === 400, 'high');

  const missingModel = await post(`${BACKEND}/api/start-pitch`, { ...VALID_PITCH, businessModel: '' });
  assert('Rejects missing businessModel', missingModel.status === 400, 'high');

  // Invalid investor key
  const badKey = await post(`${BACKEND}/api/evaluate-answer`, {
    investorKey: 'hacker',
    pitchData: VALID_PITCH,
    question: 'How do you make money?',
    answer: 'We charge a fee.',
  });
  assert('Rejects invalid investor key', badKey.status === 400, 'high');

  // Empty answer
  const emptyAnswer = await post(`${BACKEND}/api/evaluate-answer`, {
    investorKey: 'money',
    pitchData: VALID_PITCH,
    question: 'How do you make money?',
    answer: '',
  });
  assert('Rejects empty answer', emptyAnswer.status === 400, 'high');

  // Very long input (potential injection/abuse)
  const longInput = await post(`${BACKEND}/api/start-pitch`, {
    ...VALID_PITCH,
    problem: 'A'.repeat(10000),
  });
  assert('Handles extremely long input gracefully (no 500)', longInput.status !== 500, 'medium',
    longInput.status === 500 ? 'Server crashed on long input' : '');

  // Special characters
  const specialChars = await post(`${BACKEND}/api/start-pitch`, {
    ...VALID_PITCH,
    startupName: '<script>alert("xss")</script>',
    problem: 'Problem with "quotes" and \'apostrophes\' and <tags>',
  });
  assert('Handles special characters without 500', specialChars.status !== 500, 'security',
    specialChars.status === 500 ? 'Server crashed on special chars' : '');

  // XSS check — backend should not echo raw HTML tags in success
  if (specialChars.body && typeof specialChars.body === 'object') {
    const bodyStr = JSON.stringify(specialChars.body);
    assert('Response does not contain unescaped script tags', !bodyStr.includes('<script>'), 'security');
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('5. FULL AI PITCH FLOW (LIVE API CALL)');
  // ══════════════════════════════════════════════════════════════════════════
  console.log('  ⏳ Calling /api/start-pitch with CampusCart pitch...');

  let pitchRes;
  try {
    pitchRes = await post(`${BACKEND}/api/start-pitch`, VALID_PITCH);
    assert('start-pitch returns 200', pitchRes.status === 200, 'critical');
    assert('Response has success:true', pitchRes.body?.success === true, 'critical');
    assert('Response has pitchData', typeof pitchRes.body?.pitchData === 'object', 'critical');
    assert('Response has questions object', typeof pitchRes.body?.questions === 'object', 'critical');

    const q = pitchRes.body?.questions;
    assert('Money shark question exists', typeof q?.money?.question === 'string', 'critical');
    assert('Market shark question exists', typeof q?.market?.question === 'string', 'critical');
    assert('Product shark question exists', typeof q?.product?.question === 'string', 'critical');

    // Questions should mention the startup or be relevant (not generic)
    const allQuestions = [q?.money?.question, q?.market?.question, q?.product?.question].join(' ').toLowerCase();
    const isRelevant = allQuestions.includes('campus') ||
      allQuestions.includes('student') ||
      allQuestions.includes('fee') ||
      allQuestions.includes('sell') ||
      allQuestions.includes('buy') ||
      allQuestions.includes('marketplace');
    assert('Questions are relevant to startup (not generic)', isRelevant, 'high',
      isRelevant ? '' : `Questions: ${allQuestions.slice(0, 200)}`);

    // Questions should be short (under 25 words per rules)
    const moneyWordCount = (q?.money?.question || '').split(' ').length;
    assert('Money shark question is under 35 words', moneyWordCount <= 35, 'medium',
      `Word count: ${moneyWordCount}`);

    console.log(`\n  💰 Victor Cash asks: "${q?.money?.question}"`);
    console.log(`  🦈 Maya Street asks: "${q?.market?.question}"`);
    console.log(`  🚀 Rex Doubt asks: "${q?.product?.question}"`);

  } catch (e) {
    assert('start-pitch API call succeeded', false, 'critical', e.message);
    console.log('  ⛔ Cannot continue AI flow tests');
    pitchRes = null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('6. EVALUATE ANSWER (LIVE AI)');
  // ══════════════════════════════════════════════════════════════════════════

  if (pitchRes?.body?.questions) {
    const moneyQ = pitchRes.body.questions.money?.question;
    const pitchData = pitchRes.body.pitchData;

    console.log('  ⏳ Submitting answer to Victor Cash...');
    const evalRes = await post(`${BACKEND}/api/evaluate-answer`, {
      investorKey: 'money',
      pitchData,
      question: moneyQ,
      answer: 'We charge a 5% transaction fee on every sale. For a ₹1000 item that is ₹50. With 500 transactions per month we make ₹25,000. Our main cost is cloud hosting at ₹3,000 per month.',
    });

    assert('evaluate-answer returns 200', evalRes.status === 200, 'critical');
    assert('Response has evaluation object', typeof evalRes.body?.evaluation === 'object', 'critical');
    const ev = evalRes.body?.evaluation;
    assert('Evaluation has score (0-100)', typeof ev?.score === 'number' && ev.score >= 0 && ev.score <= 100, 'high', `score: ${ev?.score}`);
    assert('Evaluation has reaction', typeof ev?.reaction === 'string' && ev.reaction.length > 5, 'high');
    assert('Evaluation has strength', typeof ev?.strength === 'string', 'medium');
    assert('Evaluation has weakness', typeof ev?.weakness === 'string', 'medium');
    assert('Evaluation has followUpQuestion', typeof ev?.followUpQuestion === 'string', 'medium');
    assert('Score is not always 100 (not fake)', ev?.score !== 100, 'high');
    assert('Score is not always 0 (not broken)', ev?.score !== 0, 'high');

    console.log(`\n  Score: ${ev?.score}/100`);
    console.log(`  Reaction: "${ev?.reaction}"`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('7. DEAL METER ENDPOINT');
  // ══════════════════════════════════════════════════════════════════════════
  const meterRes = await post(`${BACKEND}/api/deal-meter`, {
    investorKey: 'money',
    question: 'How do you make money?',
    answer: 'We take 5% commission on each sale, making ₹25,000/month at 500 transactions.',
  });
  assert('deal-meter returns 200', meterRes.status === 200, 'high');
  assert('deal-meter returns delta', typeof meterRes.body?.delta === 'number', 'high', `delta: ${meterRes.body?.delta}`);
  assert('delta is between -10 and +10', meterRes.body?.delta >= -10 && meterRes.body?.delta <= 10, 'high');
  console.log(`  Deal Meter delta: ${meterRes.body?.delta}`);

  // ══════════════════════════════════════════════════════════════════════════
  section('8. HINT ENDPOINT');
  // ══════════════════════════════════════════════════════════════════════════
  const hintRes = await post(`${BACKEND}/api/hint`, {
    investorKey: 'market',
    pitchData: VALID_PITCH,
    question: 'Who is your first paying customer?',
  });
  assert('hint returns 200', hintRes.status === 200, 'medium');
  assert('hint has hint string', typeof hintRes.body?.hint === 'string' && hintRes.body.hint.length > 10, 'medium');
  console.log(`  Hint: "${hintRes.body?.hint?.slice(0, 80)}..."`);

  // ══════════════════════════════════════════════════════════════════════════
  section('9. FINAL VERDICT (FULL FLOW)');
  // ══════════════════════════════════════════════════════════════════════════

  console.log('  ⏳ Generating final verdict (this may take 10-15 seconds)...');
  const rounds = [
    { investorKey: 'money',   question: 'What is your revenue model?',          answer: '5% transaction fee, ₹25k/month at 500 sales.',            score: 72, strength: 'Clear model', weakness: 'No cost breakdown' },
    { investorKey: 'market',  question: 'Who is your first paying customer?',   answer: 'Engineering students at Pondicherry University who sell laptops and books every semester.', score: 65, strength: 'Specific segment', weakness: 'No acquisition plan' },
    { investorKey: 'product', question: 'Why cannot OLX copy this tomorrow?',   answer: 'OLX is not campus-verified. We require student ID login so buyers trust sellers.',        score: 68, strength: 'Clear differentiator', weakness: 'Easy to copy' },
  ];

  try {
    const verdictRes = await post(`${BACKEND}/api/final-verdict`, {
      pitchData: VALID_PITCH,
      rounds,
    });

    assert('final-verdict returns 200', verdictRes.status === 200, 'critical');
    assert('Response has verdict object', typeof verdictRes.body?.verdict === 'object', 'critical');

    const v = verdictRes.body?.verdict;
    assert('verdict has overallScore', typeof v?.overallScore === 'number', 'critical');
    assert('overallScore is 0-100', v?.overallScore >= 0 && v?.overallScore <= 100, 'high', `score: ${v?.overallScore}`);
    assert('verdict has deal field', typeof v?.deal === 'boolean', 'high');
    assert('verdict has verdict string (INVEST/INTERESTED/PASS)', ['INVEST','INTERESTED','PASS'].includes(v?.verdict), 'high', `verdict: ${v?.verdict}`);
    assert('verdict has fixes array', Array.isArray(v?.fixes), 'high');
    assert('fixes has 3 items', (v?.fixes || []).length === 3, 'medium', `got ${(v?.fixes||[]).length}`);
    assert('verdict has weakest_answer', typeof v?.weakest_answer === 'string', 'medium');
    assert('verdict has better_version', typeof v?.better_version === 'string', 'medium');
    assert('verdict has scorecard', typeof v?.scorecard === 'object', 'medium');
    assert('verdict has investorVerdicts', typeof v?.investorVerdicts === 'object', 'medium');
    assert('verdict has money score (1-10)', typeof v?.money === 'number' && v.money >= 1 && v.money <= 10, 'high');
    assert('verdict has customer score (1-10)', typeof v?.customer === 'number', 'high');
    assert('verdict has risk score (1-10)', typeof v?.risk === 'number', 'high');

    console.log(`\n  Overall: ${v?.overallScore}/100  |  Deal: ${v?.deal}  |  Verdict: ${v?.verdict}`);
    console.log(`  Money: ${v?.money}/10  Customer: ${v?.customer}/10  Risk: ${v?.risk}/10`);
    console.log(`  Fixes: ${(v?.fixes||[]).join(' | ')}`);
    console.log(`  Weakest: "${(v?.weakest_answer||'').slice(0,80)}"`);
    console.log(`  Better:  "${(v?.better_version||'').slice(0,80)}"`);

  } catch (e) {
    assert('final-verdict succeeded', false, 'critical', e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('10. SOURCE FILE STRUCTURE CHECKS');
  // ══════════════════════════════════════════════════════════════════════════
  const required = [
    ['client/src/App.jsx',                      'App entry point'],
    ['client/src/main.jsx',                     'React main'],
    ['client/src/index.css',                    'Global CSS'],
    ['client/src/pages/LandingPage.jsx',        'Landing page'],
    ['client/src/pages/PitchSetup.jsx',         'Pitch form'],
    ['client/src/pages/InvestorArena.jsx',      'Investor arena'],
    ['client/src/pages/FinalVerdict.jsx',       'Final verdict'],
    ['client/src/services/api.js',              'API service'],
    ['server/server.js',                        'Express server'],
    ['server/routes/pitch.js',                  'API routes'],
    ['server/controllers/pitchController.js',   'Controllers'],
    ['server/services/aiService.js',            'AI service'],
    ['server/utils/validate.js',                'Validation'],
    ['server/tests/api.test.js',                'Backend tests'],
    ['Dockerfile',                              'Docker/Cloud Run'],
    ['.gitignore',                              'gitignore'],
    ['README.md',                               'README'],
  ];
  required.forEach(([f, label]) => {
    const exists = fs.existsSync(path.join('d:\\university_hackathon', f));
    assert(`${label} exists (${f})`, exists, exists ? 'medium' : 'high');
  });

  // ══════════════════════════════════════════════════════════════════════════
  section('11. CODE CONTENT CHECKS');
  // ══════════════════════════════════════════════════════════════════════════

  // InvestorArena — correct personas
  const arenaCode = fs.readFileSync('d:\\university_hackathon\\client\\src\\pages\\InvestorArena.jsx', 'utf8');
  assert('Arena has Victor Cash', arenaCode.includes('Victor Cash'), 'high');
  assert('Arena has Maya Street', arenaCode.includes('Maya Street'), 'high');
  assert('Arena has Rex Doubt', arenaCode.includes('Rex Doubt'), 'high');
  assert('Arena has DealMeter component', arenaCode.includes('DealMeter'), 'high');
  assert('Arena has TypingText component', arenaCode.includes('TypingText'), 'medium');
  assert('Arena imports getDealMeter', arenaCode.includes('getDealMeter'), 'high');

  // FinalVerdict — deal/no-deal
  const verdictCode = fs.readFileSync('d:\\university_hackathon\\client\\src\\pages\\FinalVerdict.jsx', 'utf8');
  assert('FinalVerdict has deal hero', verdictCode.includes('deal-hero'), 'high');
  assert('FinalVerdict has before/after', verdictCode.includes('ba-before'), 'high');
  assert('FinalVerdict has ScoreComparison', verdictCode.includes('ScoreComparison'), 'medium');
  assert('FinalVerdict has fixes display', verdictCode.includes('fixes'), 'high');

  // PitchSetup — demo mode
  const setupCode = fs.readFileSync('d:\\university_hackathon\\client\\src\\pages\\PitchSetup.jsx', 'utf8');
  assert('PitchSetup has Demo Mode button', setupCode.includes('Demo Mode'), 'medium');
  assert('PitchSetup has DEMO_PITCH constant', setupCode.includes('DEMO_PITCH'), 'medium');
  assert('PitchSetup has completeness bar', setupCode.includes('completeness'), 'medium');

  // LandingPage — new tagline
  const landingCode = fs.readFileSync('d:\\university_hackathon\\client\\src\\pages\\LandingPage.jsx', 'utf8');
  assert('Landing has new tagline', landingCode.includes('Friends are too polite'), 'medium');

  // API service — all endpoints
  const apiCode = fs.readFileSync('d:\\university_hackathon\\client\\src\\services\\api.js', 'utf8');
  assert('API service has getDealMeter', apiCode.includes('getDealMeter'), 'high');
  assert('API service has getFinalVerdict', apiCode.includes('getFinalVerdict'), 'high');
  assert('API service has getHint', apiCode.includes('getHint'), 'high');
  assert('API key NOT in api.js', !apiCode.includes('sk-'), 'security');

  // aiService — new personas + deal meter
  const aiCode = fs.readFileSync('d:\\university_hackathon\\server\\services\\aiService.js', 'utf8');
  assert('aiService has Victor Cash', aiCode.includes('Victor Cash'), 'high');
  assert('aiService has Maya Street', aiCode.includes('Maya Street'), 'high');
  assert('aiService has Rex Doubt', aiCode.includes('Rex Doubt'), 'high');
  assert('aiService has SHARK_RULES', aiCode.includes('SHARK_RULES'), 'high');
  assert('aiService exports getDealMeterDelta', aiCode.includes('getDealMeterDelta'), 'high');
  assert('aiService exports INVESTOR_ORDER', aiCode.includes('INVESTOR_ORDER'), 'medium');

  // CSS — new additions
  const cssCode = fs.readFileSync('d:\\university_hackathon\\client\\src\\index.css', 'utf8');
  assert('CSS has deal-meter styles', cssCode.includes('.deal-meter'), 'medium');
  assert('CSS has typing-cursor', cssCode.includes('typing-cursor'), 'medium');
  assert('CSS has before-after', cssCode.includes('.before-after'), 'medium');
  assert('CSS has score-comparison', cssCode.includes('.score-comparison'), 'medium');

  // ══════════════════════════════════════════════════════════════════════════
  section('12. ACCESSIBILITY CHECKS (CODE SCAN)');
  // ══════════════════════════════════════════════════════════════════════════
  assert('Arena has aria-label on progress', arenaCode.includes('aria-label'), 'accessibility');
  assert('Arena has role=progressbar on bars', arenaCode.includes('role="progressbar"'), 'accessibility');
  assert('Setup has aria-required on inputs', setupCode.includes('aria-required'), 'accessibility');
  assert('Setup has aria-invalid', setupCode.includes('aria-invalid'), 'accessibility');
  assert('FinalVerdict has aria-label on score', verdictCode.includes('aria-label'), 'accessibility');
  assert('CSS has focus-visible styles', cssCode.includes('focus-visible'), 'accessibility');

  // ══════════════════════════════════════════════════════════════════════════
  section('13. BUILD VERIFICATION');
  // ══════════════════════════════════════════════════════════════════════════
  const distExists = fs.existsSync('d:\\university_hackathon\\client\\dist\\index.html');
  assert('Production build exists (dist/index.html)', distExists, 'high');
  if (distExists) {
    const distHtml = fs.readFileSync('d:\\university_hackathon\\client\\dist\\index.html', 'utf8');
    assert('Built HTML has no API key', !distHtml.includes('sk-'), 'security');
    assert('Built HTML has no OPENAI_API_KEY', !distHtml.toLowerCase().includes('openai_api_key'), 'security');

    // Check built JS for secrets
    const assetsDir = 'd:\\university_hackathon\\client\\dist\\assets';
    let builtJsHasKey = false;
    if (fs.existsSync(assetsDir)) {
      fs.readdirSync(assetsDir).filter(f => f.endsWith('.js')).forEach(f => {
        const content = fs.readFileSync(path.join(assetsDir, f), 'utf8');
        if (content.includes('sk-proj') || content.includes('sk-None')) builtJsHasKey = true;
      });
    }
    assert('Built JS has no API key', !builtJsHasKey, 'security');
  }

  // ══════════════════════════════════════════════════════════════════════════
  section('14. DOCKERFILE & DEPLOYMENT');
  // ══════════════════════════════════════════════════════════════════════════
  const dockerCode = fs.readFileSync('d:\\university_hackathon\\Dockerfile', 'utf8');
  assert('Dockerfile uses PORT env var', dockerCode.includes('PORT'), 'high');
  assert('Dockerfile exposes 8080', dockerCode.includes('8080'), 'high');
  assert('Dockerfile has health check', dockerCode.includes('HEALTHCHECK'), 'medium');
  assert('Dockerfile uses multi-stage build', dockerCode.includes('AS client-builder'), 'medium');
  assert('Dockerfile copies built frontend', dockerCode.includes('client/dist'), 'high');

  // ══════════════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ══════════════════════════════════════════════════════════════════════════
  const total = passed + failed;
  const prodReady = bugs.critical.length === 0 && bugs.security.length === 0;
  const hackReady = bugs.critical.length === 0;

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           SHARK TANK AI — QA REPORT                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nApplication URL:`);
  console.log(`  Frontend: ${FRONTEND}`);
  console.log(`  Backend:  ${BACKEND}`);

  console.log(`\nFUNCTIONAL TESTS`);
  console.log(`  Total:  ${total}`);
  console.log(`  Passed: ${passed}  ✅`);
  console.log(`  Failed: ${failed}  ${failed > 0 ? '❌' : '✅'}`);

  const printBugs = (label, arr) => {
    if (arr.length === 0) { console.log(`\n${label}: None ✅`); return; }
    console.log(`\n${label}:`);
    arr.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
  };

  printBugs('CRITICAL BUGS', bugs.critical);
  printBugs('HIGH PRIORITY', bugs.high);
  printBugs('MEDIUM PRIORITY', bugs.medium);
  printBugs('SECURITY ISSUES', bugs.security);
  printBugs('ACCESSIBILITY ISSUES', bugs.accessibility);
  printBugs('PERFORMANCE ISSUES', bugs.perf);
  printBugs('UI/UX ISSUES', bugs.ui);

  console.log(`\nBUGS FIXED DURING THIS QA:`);
  if (fixed.length === 0) console.log('  (none auto-fixed — see remaining issues above)');
  fixed.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`PRODUCTION READINESS: ${prodReady ? '✅ READY' : '❌ NOT READY — fix critical/security issues first'}`);
  console.log(`HACKATHON READINESS:  ${hackReady ? '✅ READY' : '❌ NOT READY — fix critical bugs first'}`);
  console.log('─'.repeat(60));
}

runTests().catch((e) => {
  console.error('\n💥 QA runner crashed:', e.message);
  process.exit(1);
});
