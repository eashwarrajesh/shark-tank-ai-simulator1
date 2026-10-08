const validatePitchData = (data) => {
  const errors = [];
  if (!data.startupName || data.startupName.trim().length < 2) errors.push('Startup name is required.');
  if (!data.oneLiner || data.oneLiner.trim().length < 10) errors.push('One-line pitch is required (min 10 chars).');
  if (!data.problem || data.problem.trim().length < 10) errors.push('Problem description is required.');
  if (!data.solution || data.solution.trim().length < 10) errors.push('Solution description is required.');
  if (!data.targetCustomer || data.targetCustomer.trim().length < 5) errors.push('Target customer is required.');
  if (!data.businessModel || data.businessModel.trim().length < 5) errors.push('Business model is required.');
  // Reject absurdly long inputs (over 5000 chars total)
  const total = Object.values(data).join('').length;
  if (total > 5000) errors.push('Pitch is too long. Please be more concise.');
  return errors;
};

const validateInvestorKey = (key) => {
  return ['market', 'money', 'product'].includes(key);
};

const sanitizePitch = (data) => ({
  startupName: String(data.startupName || '').trim().slice(0, 100),
  oneLiner: String(data.oneLiner || '').trim().slice(0, 200),
  problem: String(data.problem || '').trim().slice(0, 500),
  solution: String(data.solution || '').trim().slice(0, 500),
  targetCustomer: String(data.targetCustomer || '').trim().slice(0, 200),
  businessModel: String(data.businessModel || '').trim().slice(0, 300),
  competitiveAdvantage: String(data.competitiveAdvantage || '').trim().slice(0, 300),
});

module.exports = { validatePitchData, validateInvestorKey, sanitizePitch };
