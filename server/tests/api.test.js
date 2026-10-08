const assert = require('assert');
const { validatePitchData, validateInvestorKey, sanitizePitch } = require('../utils/validate');

// --- validatePitchData ---
const validPitch = {
  startupName: 'TutorLink',
  oneLiner: 'Uber for on-demand college tutors',
  problem: 'Students struggle to find affordable last-minute tutors before exams.',
  solution: 'A platform connecting verified student tutors with learners in under 10 minutes.',
  targetCustomer: 'College students aged 18–24',
  businessModel: '15% commission per session booked',
  competitiveAdvantage: 'AI-matched tutors with verified grades',
};

// Should pass with valid data
const errors1 = validatePitchData(validPitch);
assert.strictEqual(errors1.length, 0, 'Valid pitch should return no errors');

// Should fail with missing required fields
const errors2 = validatePitchData({});
assert.ok(errors2.length >= 5, 'Empty pitch should return at least 5 errors');

// Should fail with too-short fields
const errors3 = validatePitchData({ ...validPitch, startupName: 'X', oneLiner: 'Short' });
assert.ok(errors3.length >= 2, 'Short fields should fail validation');

// --- validateInvestorKey ---
assert.strictEqual(validateInvestorKey('market'), true, 'market is valid');
assert.strictEqual(validateInvestorKey('money'), true, 'money is valid');
assert.strictEqual(validateInvestorKey('product'), true, 'product is valid');
assert.strictEqual(validateInvestorKey('unknown'), false, 'unknown is invalid');
assert.strictEqual(validateInvestorKey(''), false, 'empty string is invalid');
assert.strictEqual(validateInvestorKey(null), false, 'null is invalid');

// --- sanitizePitch ---
const dirty = {
  startupName: '  TutorLink  ',
  oneLiner: 'A'.repeat(300),
  problem: 'Some problem',
  solution: 'Some solution',
  targetCustomer: 'Students',
  businessModel: 'Commission',
  competitiveAdvantage: undefined,
};
const clean = sanitizePitch(dirty);
assert.strictEqual(clean.startupName, 'TutorLink', 'Should trim whitespace');
assert.strictEqual(clean.oneLiner.length, 200, 'Should truncate oneLiner to 200 chars');
assert.strictEqual(clean.competitiveAdvantage, '', 'Should handle undefined as empty string');

// --- AI response structure validation ---
const validateVerdictStructure = (v) => {
  return (
    typeof v.overallScore === 'number' &&
    ['INVEST', 'INTERESTED', 'PASS'].includes(v.verdict) &&
    Array.isArray(v.whyInvestorsMightSayYes) &&
    Array.isArray(v.rescuePlan) &&
    typeof v.hardestTruth === 'string' &&
    typeof v.scorecard === 'object'
  );
};

const goodVerdict = {
  overallScore: 72,
  verdict: 'INTERESTED',
  investorVerdicts: { market: { verdict: 'Interested', reason: 'Needs proof' } },
  scorecard: { problemClarity: 80, marketPotential: 70 },
  hardestTruth: 'No clear differentiation from existing solutions.',
  whyInvestorsMightSayYes: ['Clear problem', 'Simple model'],
  rescuePlan: ['Step 1', 'Step 2', 'Step 3'],
  strengthsSummary: 'Strong problem-solution fit.',
  weaknessesSummary: 'Weak competitive moat.',
};
assert.strictEqual(validateVerdictStructure(goodVerdict), true, 'Good verdict should pass structure check');

const badVerdict = { overallScore: 'high', verdict: 'MAYBE' };
assert.strictEqual(validateVerdictStructure(badVerdict), false, 'Bad verdict should fail structure check');

console.log('✅ All tests passed.');
