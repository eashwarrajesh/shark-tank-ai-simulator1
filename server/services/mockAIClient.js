/**
 * mockAIClient.js
 *
 * Expert-grade deterministic AI simulator for Shark Tank AI.
 *
 * Goals:
 * - 20+ questions per investor
 * - Questions selected based on startup context
 * - Adaptive follow-up questions
 * - Answer-quality analysis
 * - Specificity / evidence / numbers / assumptions detection
 * - Dodge / contradiction detection
 * - Expert-level feedback
 * - No fabricated traction or customer evidence
 * - Production-safe: no API keys required
 *
 * NOTE:
 * This is a deterministic mock engine, NOT a real LLM.
 * It is designed for reliable demos and offline/fallback operation.
 */

const crypto = require("crypto");

/* ============================================================
   QUESTION BANK
   ============================================================ */

const QUESTIONS = {
  money: [
    {
      id: "money_revenue_model",
      topic: "revenue",
      question:
        "What is your exact revenue model, and what specific event causes you to get paid?"
    },
    {
      id: "money_unit_economics",
      topic: "unit economics",
      question:
        "Walk me through your unit economics: revenue per transaction, variable cost per transaction, and contribution margin."
    },
    {
      id: "money_break_even",
      topic: "break-even",
      question:
        "How many paying transactions or customers do you need each month to break even?"
    },
    {
      id: "money_pricing",
      topic: "pricing",
      question:
        "Why did you choose this price? What evidence suggests customers will actually pay it?"
    },
    {
      id: "money_bypass",
      topic: "monetization",
      question:
        "What stops users from moving their transaction outside your platform to avoid paying your fee?"
    },
    {
      id: "money_acquisition",
      topic: "customer acquisition",
      question:
        "What do you expect your customer acquisition cost to be, and how will you keep it under control?"
    },
    {
      id: "money_ltv",
      topic: "lifetime value",
      question:
        "What makes a customer valuable over time rather than generating only one transaction?"
    },
    {
      id: "money_costs",
      topic: "cost structure",
      question:
        "What are your three biggest costs during the first year, and which one grows fastest as you scale?"
    },
    {
      id: "money_cashflow",
      topic: "cash flow",
      question:
        "When do you expect the business to become cash-flow positive, and what assumptions drive that estimate?"
    },
    {
      id: "money_projection",
      topic: "forecast",
      question:
        "Give me your projected monthly revenue for month 1, month 6, and month 12, and explain the assumptions behind each."
    },
    {
      id: "money_margin",
      topic: "margin",
      question:
        "What gross margin do you expect, and what could cause that margin to fall?"
    },
    {
      id: "money_scale",
      topic: "scalability",
      question:
        "If your user base grows ten times, which cost or operational problem becomes your biggest financial risk?"
    },
    {
      id: "money_funding",
      topic: "funding",
      question:
        "How much funding are you asking for, exactly, and what milestones will that capital achieve?"
    },
    {
      id: "money_runway",
      topic: "runway",
      question:
        "If you raise the money you are asking for, how many months of runway does it give you?"
    },
    {
      id: "money_investment",
      topic: "capital allocation",
      question:
        "If I invested today, give me the top three things you would spend that money on."
    },
    {
      id: "money_revenue_risk",
      topic: "revenue risk",
      question:
        "What is the single biggest assumption behind your revenue forecast?"
    },
    {
      id: "money_discount",
      topic: "pricing strategy",
      question:
        "If customers refuse your initial price, what is your fallback pricing strategy without destroying your margins?"
    },
    {
      id: "money_market_size",
      topic: "market economics",
      question:
        "How large is the realistic paying market for your product, and how much of it could you reach initially?"
    },
    {
      id: "money_transaction_volume",
      topic: "volume",
      question:
        "What transaction volume do you need every month for this business model to become meaningful?"
    },
    {
      id: "money_competitor_economics",
      topic: "competition",
      question:
        "If a competitor charges less than you, why would a customer still choose your product?"
    },
    {
      id: "money_retention",
      topic: "retention economics",
      question:
        "How does customer retention affect your revenue model, and what would happen financially if retention were lower than expected?"
    },
    {
      id: "money_worst_case",
      topic: "downside",
      question:
        "What is your worst-case financial scenario in the first year, and how would you respond to it?"
    },
    {
      id: "money_monetization_change",
      topic: "monetization",
      question:
        "If your first monetization strategy fails, what is the next credible way you would make money?"
    },
    {
      id: "money_profitability",
      topic: "profitability",
      question:
        "What has to be true for this company to become profitable?"
    }
  ],

  market: [
    {
      id: "market_customer",
      topic: "customer",
      question:
        "Who is your first paying customer? I want a specific customer profile, not a broad demographic."
    },
    {
      id: "market_problem",
      topic: "problem",
      question:
        "How frequently does your target customer experience this problem?"
    },
    {
      id: "market_alternative",
      topic: "alternatives",
      question:
        "What does your target customer use today instead of your product?"
    },
    {
      id: "market_switching",
      topic: "switching",
      question:
        "Why would someone abandon their current solution and switch to yours?"
    },
    {
      id: "market_first10",
      topic: "acquisition",
      question:
        "Walk me through exactly how you will acquire your first ten paying customers."
    },
    {
      id: "market_distribution",
      topic: "distribution",
      question:
        "What is your primary distribution channel, and why do you believe it can scale?"
    },
    {
      id: "market_willingness",
      topic: "willingness to pay",
      question:
        "What evidence do you have that customers are willing to pay rather than simply saying they like the idea?"
    },
    {
      id: "market_market_size",
      topic: "market size",
      question:
        "How did you calculate your addressable market, and what portion is realistically reachable by your startup?"
    },
    {
      id: "market_segment",
      topic: "segmentation",
      question:
        "Which customer segment will you deliberately ignore at the beginning, and why?"
    },
    {
      id: "market_early_adopter",
      topic: "early adopters",
      question:
        "Who is most likely to become your early adopter, and what makes them different from the average customer?"
    },
    {
      id: "market_retention",
      topic: "retention",
      question:
        "What specific reason makes your customer return after the first use?"
    },
    {
      id: "market_frequency",
      topic: "usage",
      question:
        "How often do you expect your ideal customer to use the product?"
    },
    {
      id: "market_competition",
      topic: "competition",
      question:
        "Who is the strongest existing competitor, and what do they do better than you?"
    },
    {
      id: "market_differentiation",
      topic: "differentiation",
      question:
        "What is the one reason a customer should choose you instead of the best existing alternative?"
    },
    {
      id: "market_trust",
      topic: "trust",
      question:
        "Why should a customer trust a new company with this problem instead of an established provider?"
    },
    {
      id: "market_word_of_mouth",
      topic: "growth",
      question:
        "Why would one customer naturally recommend your product to another person?"
    },
    {
      id: "market_churn",
      topic: "churn",
      question:
        "What is the most likely reason a customer would stop using your product?"
    },
    {
      id: "market_expansion",
      topic: "expansion",
      question:
        "Once you dominate your first customer segment, what is the logical next market?"
    },
    {
      id: "market_sales_cycle",
      topic: "sales",
      question:
        "How long do you expect it to take from first contact to a paying customer?"
    },
    {
      id: "market_validation",
      topic: "validation",
      question:
        "What is the strongest piece of evidence you have that this problem is real?"
    },
    {
      id: "market_failure",
      topic: "market risk",
      question:
        "What assumption about your customers could completely invalidate your business model?"
    },
    {
      id: "market_growth",
      topic: "growth",
      question:
        "What is your most realistic path from your first 10 customers to your first 1,000?"
    },
    {
      id: "market_customer_change",
      topic: "behavior",
      question:
        "What customer behavior must change for your product to succeed?"
    },
    {
      id: "market_demand",
      topic: "demand",
      question:
        "Why does this problem need to be solved now rather than two years from now?"
    }
  ],

  product: [
    {
      id: "product_defensibility",
      topic: "defensibility",
      question:
        "What prevents Facebook, Google, or another large competitor from copying your core feature?"
    },
    {
      id: "product_bad_transaction",
      topic: "trust",
      question:
        "If you have one bad transaction on day one, how do you prevent it from destroying trust in your platform?"
    },
    {
      id: "product_team",
      topic: "team",
      question:
        "Why is your team uniquely qualified to build this product?"
    },
    {
      id: "product_retention",
      topic: "retention",
      question:
        "What is the one feature or mechanism that makes users come back every week?"
    },
    {
      id: "product_mvp",
      topic: "MVP",
      question:
        "What is the smallest version of this product that can prove your core assumption?"
    },
    {
      id: "product_failure",
      topic: "failure",
      question:
        "What is the most likely reason your product could fail after launch?"
    },
    {
      id: "product_scalability",
      topic: "scalability",
      question:
        "What breaks first when your user base grows from hundreds to millions?"
    },
    {
      id: "product_quality",
      topic: "quality",
      question:
        "How will you know whether users are actually getting value from the product?"
    },
    {
      id: "product_feedback",
      topic: "feedback",
      question:
        "How will you collect and prioritize customer feedback without allowing a few loud users to control the roadmap?"
    },
    {
      id: "product_security",
      topic: "security",
      question:
        "What is the most important security or privacy risk in your product, and how will you reduce it?"
    },
    {
      id: "product_trust_system",
      topic: "trust",
      question:
        "What mechanisms prevent abuse, fraud, fake accounts, or manipulation on your platform?"
    },
    {
      id: "product_network",
      topic: "network effects",
      question:
        "Does your product become more valuable as more users join? Explain exactly why."
    },
    {
      id: "product_cold_start",
      topic: "network effects",
      question:
        "How will you solve the cold-start problem before you have enough users on both sides of the platform?"
    },
    {
      id: "product_competitor",
      topic: "competition",
      question:
        "Name the strongest product alternative and tell me the feature where you are currently weaker."
    },
    {
      id: "product_build",
      topic: "execution",
      question:
        "What is technically hardest about building this product?"
    },
    {
      id: "product_roadmap",
      topic: "roadmap",
      question:
        "What are the three most important product milestones for the next six months?"
    },
    {
      id: "product_data",
      topic: "data",
      question:
        "What data will make your product better over time?"
    },
    {
      id: "product_bad_user",
      topic: "risk",
      question:
        "How would you handle a user who repeatedly damages the experience for other customers?"
    },
    {
      id: "product_moderation",
      topic: "moderation",
      question:
        "What happens when two users disagree about a transaction or outcome?"
    },
    {
      id: "product_reliability",
      topic: "reliability",
      question:
        "What happens if your service goes down during an important customer transaction?"
    },
    {
      id: "product_adoption",
      topic: "adoption",
      question:
        "What is the biggest barrier preventing someone from trying your product for the first time?"
    },
    {
      id: "product_killer",
      topic: "value",
      question:
        "What is the single capability that makes your product meaningfully better than a collection of existing tools?"
    },
    {
      id: "product_copy",
      topic: "defensibility",
      question:
        "If I gave your competitor your product specification today, what would still be difficult for them to reproduce?"
    },
    {
      id: "product_longterm",
      topic: "vision",
      question:
        "If this succeeds, what does the product become three years from now?"
    }
  ]
};

/* ============================================================
   INVESTOR CONFIGURATION
   ============================================================ */

const INVESTORS = {
  money: {
    name: "Victor Cash",
    label: "Money Shark"
  },

  market: {
    name: "Maya Street",
    label: "Customer Shark"
  },

  product: {
    name: "Rex Doubt",
    label: "Product & Risk Shark"
  }
};

/* ============================================================
   UTILITIES
   ============================================================ */

function hash(str) {
  let h = 0;

  for (let i = 0; i < String(str).length; i++) {
    h = (h << 5) - h + String(str).charCodeAt(i);
    h |= 0;
  }

  return Math.abs(h);
}

function normalize(text) {
  return String(text || "")
    .replace(/[^\w\s₹$%.,!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStartupName(text) {
  const match = String(text || "").match(
    /(?:Name|Startup Name)\s*:\s*([^\n]+)/i
  );

  return match ? match[1].trim() : "Startup";
}

function wordCount(text) {
  return normalize(text).split(/\s+/).filter(Boolean).length;
}

function containsAny(text, words) {
  const lower = normalize(text).toLowerCase();

  return words.some(word => lower.includes(word.toLowerCase()));
}

function hasNumber(text) {
  return /\b\d+(?:\.\d+)?\s*(?:%|percent|₹|\$|usd|inr|k|m|million|thousand|users?|customers?|transactions?|months?|days?)?\b/i.test(
    text
  );
}

function hasMoney(text) {
  return /(?:₹|\$|usd|inr|\b\d+\s*(?:rs|rupees|dollars))/i.test(text);
}

function hasPercentage(text) {
  return /\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*percent/i.test(text);
}

function hasNamedEntity(text) {
  /*
   * We do NOT claim the name is real.
   * We only detect whether the founder supplied
   * a concrete name-like phrase.
   */
  return /\b(?:at|with|from|for)\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?\b/.test(
    text
  );
}

function hasEvidence(text) {
  return containsAny(text, [
    "tested",
    "pilot",
    "survey",
    "interview",
    "interviews",
    "experiment",
    "trial",
    "users said",
    "customers said",
    "feedback",
    "waitlist",
    "signed",
    "preorder",
    "revenue",
    "transaction",
    "usage",
    "retention",
    "conversion",
    "data",
    "analytics",
    "prototype"
  ]);
}

function hasTimeframe(text) {
  return containsAny(text, [
    "week",
    "weeks",
    "month",
    "months",
    "year",
    "years",
    "day",
    "days",
    "today",
    "tomorrow",
    "quarter"
  ]);
}

function hasCauseAndEffect(text) {
  return containsAny(text, [
    "because",
    "therefore",
    "which means",
    "so that",
    "as a result",
    "leads to",
    "results in",
    "allows us",
    "helps us"
  ]);
}

function isTooShort(text) {
  return wordCount(text) < 12;
}

function isVeryLong(text) {
  return wordCount(text) > 180;
}

function looksLikeDodge(text) {
  const lower = normalize(text).toLowerCase();

  const dodgePatterns = [
    "we believe",
    "we think",
    "hopefully",
    "eventually",
    "we will figure",
    "not sure",
    "i don't know",
    "hard to say",
    "it depends",
    "we haven't decided",
    "we are still figuring",
    "trust me"
  ];

  return dodgePatterns.some(pattern => lower.includes(pattern));
}

/* ============================================================
   INVESTOR DETECTION
   ============================================================ */

function detectInvestor(messages) {
  const all = messages
    .map(m => `${m.role}: ${m.content}`)
    .join("\n")
    .toLowerCase();

  if (
    all.includes("maya street") ||
    all.includes("customer shark") ||
    all.includes("market shark") ||
    all.includes("customer")
  ) {
    return "market";
  }

  if (
    all.includes("rex doubt") ||
    all.includes("product shark") ||
    all.includes("risk shark") ||
    all.includes("risk")
  ) {
    return "product";
  }

  return "money";
}

/* ============================================================
   QUESTION SELECTION
   ============================================================ */

function extractAskedQuestion(text) {
  const match = String(text || "").match(
    /(?:CURRENT QUESTION|QUESTION|ASKED QUESTION)\s*:\s*"([^"]+)"/i
  );

  return match ? match[1] : "";
}

function chooseQuestion(investorKey, startupName, historyText = "") {
  const bank = QUESTIONS[investorKey];

  const used = [];

  for (const item of bank) {
    if (
      historyText.toLowerCase().includes(item.question.toLowerCase()) ||
      historyText.toLowerCase().includes(item.id.toLowerCase())
    ) {
      used.push(item.id);
    }
  }

  const available = bank.filter(q => !used.includes(q.id));

  const pool = available.length ? available : bank;

  const index = hash(
    `${startupName}:${investorKey}:${historyText.slice(-1000)}`
  ) % pool.length;

  return pool[index];
}

/* ============================================================
   TOPIC DETECTION
   ============================================================ */

function detectAnswerTopics(answer) {
  const topics = [];

  if (hasNumber(answer)) topics.push("numbers");
  if (hasMoney(answer)) topics.push("money");
  if (hasPercentage(answer)) topics.push("percentage");
  if (hasEvidence(answer)) topics.push("evidence");
  if (hasTimeframe(answer)) topics.push("timeframe");
  if (hasCauseAndEffect(answer)) topics.push("reasoning");
  if (hasNamedEntity(answer)) topics.push("specificity");

  if (
    containsAny(answer, [
      "customer",
      "user",
      "student",
      "buyer",
      "seller",
      "market"
    ])
  ) {
    topics.push("customer");
  }

  if (
    containsAny(answer, [
      "competitor",
      "facebook",
      "google",
      "instagram",
      "existing",
      "alternative"
    ])
  ) {
    topics.push("competition");
  }

  if (
    containsAny(answer, [
      "trust",
      "rating",
      "verification",
      "verified",
      "security",
      "fraud",
      "dispute",
      "refund"
    ])
  ) {
    topics.push("trust");
  }

  if (
    containsAny(answer, [
      "retention",
      "weekly",
      "return",
      "habit",
      "repeat",
      "recurring"
    ])
  ) {
    topics.push("retention");
  }

  return [...new Set(topics)];
}

/* ============================================================
   ANSWER ANALYSIS
   ============================================================ */

function analyzeAnswer(answer, question, investorKey) {
  const text = normalize(answer);

  const analysis = {
    wordCount: wordCount(text),
    hasNumbers: hasNumber(text),
    hasMoney: hasMoney(text),
    hasPercentage: hasPercentage(text),
    hasEvidence: hasEvidence(text),
    hasTimeframe: hasTimeframe(text),
    hasReasoning: hasCauseAndEffect(text),
    hasSpecificity: hasNamedEntity(text),
    isDodge: looksLikeDodge(text),
    tooShort: isTooShort(text),
    tooLong: isVeryLong(text),
    topics: detectAnswerTopics(text)
  };

  let score = 35;

  /*
   * Specificity
   */
  if (analysis.hasNumbers) score += 12;
  if (analysis.hasEvidence) score += 14;
  if (analysis.hasTimeframe) score += 7;
  if (analysis.hasReasoning) score += 8;
  if (analysis.hasSpecificity) score += 6;

  /*
   * Reasonable answer length
   */
  if (analysis.wordCount >= 25 && analysis.wordCount <= 120) {
    score += 8;
  }

  /*
   * Weakness penalties
   */
  if (analysis.tooShort) score -= 12;
  if (analysis.tooLong) score -= 5;
  if (analysis.isDodge) score -= 15;

  /*
   * Investor-specific requirements
   */
  if (investorKey === "money") {
    if (!analysis.hasNumbers) score -= 10;
    if (!analysis.hasMoney && !analysis.hasPercentage) score -= 5;
  }

  if (investorKey === "market") {
    if (!analysis.hasEvidence) score -= 8;
    if (!analysis.hasCustomer) {
      // handled by topic check below
    }
  }

  if (investorKey === "product") {
    if (
      !containsAny(text, [
        "process",
        "system",
        "feature",
        "verification",
        "technology",
        "network",
        "workflow",
        "security",
        "rating",
        "community"
      ])
    ) {
      score -= 5;
    }
  }

  score = Math.max(15, Math.min(95, score));

  return {
    ...analysis,
    score
  };
}

/* ============================================================
   EXPERT FEEDBACK
   ============================================================ */

function buildFeedback(answer, question, investorKey, analysis) {
  const feedback = {
    strength: "",
    weakness: "",
    reaction: "",
    recommendation: ""
  };

  if (analysis.isDodge) {
    feedback.reaction =
      "You are avoiding the core question. I need a measurable commitment, evidence, or a clearly stated assumption.";

    feedback.weakness =
      "The answer relies on intention rather than evidence. You described what you plan to do, but did not prove why it will work.";

    feedback.recommendation =
      "Replace the promise with one concrete metric, assumption, or piece of validation.";
  } else if (analysis.score >= 80) {
    feedback.reaction =
      "That is a substantially stronger founder answer. You gave me enough detail to evaluate the underlying assumption.";

    feedback.strength =
      "The answer is specific, logically connected to the business model, and contains evidence or measurable assumptions.";

    feedback.weakness =
      "The remaining gap is validation: the assumption should eventually be supported by real customer or operating data.";

    feedback.recommendation =
      "Now defend the assumption with actual evidence and explain what happens if the assumption is wrong.";
  } else if (analysis.score >= 65) {
    feedback.reaction =
      "Reasonable answer, but I still see an assumption that has not been fully proven.";

    feedback.strength =
      "You addressed the core issue and provided useful business reasoning.";

    feedback.weakness =
      "The answer needs more measurable evidence. I can understand your logic, but I cannot yet verify the claim.";

    feedback.recommendation =
      "Give me one number, one concrete example, or one validation result that supports the claim.";
  } else {
    feedback.reaction =
      "That answer is not strong enough yet. You are giving me a direction, not proof.";

    feedback.strength =
      "You understand the general problem, but the answer needs substantially more precision.";

    feedback.weakness =
      "The response lacks concrete evidence, measurable assumptions, or a clearly defined mechanism.";

    feedback.recommendation =
      "Answer the exact question first. Then support the answer with a number, example, timeframe, or validation result.";
  }

  return feedback;
}

/* ============================================================
   ADAPTIVE FOLLOW-UP
   ============================================================ */

function generateFollowUp(
  investorKey,
  question,
  answer,
  analysis,
  startupName
) {
  const lower = normalize(answer).toLowerCase();

  /*
   * If founder gave no numbers, force numbers.
   */
  if (!analysis.hasNumbers && investorKey === "money") {
    return {
      question:
        "You still have not given me a number. What is the single most important financial metric behind that claim, and what value are you targeting?",
      reason: "The founder did not provide a measurable financial assumption."
    };
  }

  /*
   * If founder gave numbers but no evidence, challenge them.
   */
  if (analysis.hasNumbers && !analysis.hasEvidence) {
    return {
      question:
        "You gave me a number, but where did it come from? What experiment, customer conversation, pilot, benchmark, or other evidence supports that assumption?",
      reason: "The answer contains numbers without validation."
    };
  }

  /*
   * If founder uses vague belief language.
   */
  if (analysis.isDodge) {
    return {
      question:
        "You are telling me what you believe will happen. What observation or measurable result would prove that belief is correct?",
      reason: "The answer relies on an unvalidated assumption."
    };
  }

  /*
   * Money-specific follow-ups.
   */
  if (investorKey === "money") {
    if (containsAny(lower, ["revenue", "price", "pricing", "commission"])) {
      return {
        question:
          "If your current pricing assumption is wrong by 30%, what happens to your break-even point and cash flow?",
        reason: "The founder discussed monetization but did not stress-test the assumption."
      };
    }

    if (containsAny(lower, ["customer", "user", "transaction"])) {
      return {
        question:
          "What monthly customer or transaction volume is required for this model to become financially sustainable?",
        reason: "The answer needs a volume-based economic constraint."
      };
    }

    return {
      question:
        "Which financial assumption in your business model is most likely to be wrong, and how would you detect that early?",
      reason: "The next test should challenge financial risk rather than repeat the previous question."
    };
  }

  /*
   * Market-specific follow-ups.
   */
  if (investorKey === "market") {
    if (
      containsAny(lower, [
        "student",
        "customer",
        "user",
        "buyer",
        "market"
      ])
    ) {
      return {
        question:
          "What evidence shows that this customer will actually change their current behavior rather than simply say your product is useful?",
        reason: "The founder described a customer but needs behavioral validation."
      };
    }

    if (containsAny(lower, ["competitor", "alternative", "existing"])) {
      return {
        question:
          "What specific advantage is strong enough to make a customer switch from that existing alternative?",
        reason: "The founder discussed alternatives but has not established switching motivation."
      };
    }

    return {
      question:
        "What is the strongest real-world evidence that your target customer experiences this problem frequently enough to pay for a solution?",
      reason: "The next test focuses on problem validation."
    };
  }

  /*
   * Product/risk-specific follow-ups.
   */
  if (investorKey === "product") {
    if (
      containsAny(lower, [
        "trust",
        "verification",
        "security",
        "rating",
        "fraud",
        "dispute"
      ])
    ) {
      return {
        question:
          "Walk me through the exact user-facing process when something goes wrong. Who acts first, what happens next, and how is the affected user protected?",
        reason: "The founder mentioned trust mechanisms but needs an operational process."
      };
    }

    if (
      containsAny(lower, [
        "feature",
        "weekly",
        "retention",
        "return",
        "community"
      ])
    ) {
      return {
        question:
          "What measurable user behavior would prove that this feature actually creates recurring usage?",
        reason: "The founder described a product mechanism but did not define proof of retention."
      };
    }

    if (containsAny(lower, ["competitor", "facebook", "google", "copy"])) {
      return {
        question:
          "Assume a large competitor copies your visible features tomorrow. What remains difficult for them to reproduce?",
        reason: "The answer needs a defensibility test."
      };
    }

    return {
      question:
        "What is the most dangerous failure mode in your product, and what specific mechanism limits its impact?",
      reason: "The next test focuses on product risk."
    };
  }

  return {
    question:
      "What evidence would convince you that your current assumption is wrong?",
    reason: "The founder should identify a falsifiable assumption."
  };
}

/* ============================================================
   DEAL METER
   ============================================================ */

function getDealMeterDelta(answer, investorKey) {
  const analysis = analyzeAnswer(answer, "", investorKey);

  if (analysis.score >= 85) return 7;
  if (analysis.score >= 75) return 5;
  if (analysis.score >= 65) return 3;
  if (analysis.score >= 50) return 0;
  if (analysis.score >= 35) return -3;

  return -6;
}

/* ============================================================
   HINTS
   ============================================================ */

function generateHint(investorKey) {
  const hints = {
    money:
      "Give me a measurable financial assumption: price, revenue per transaction, cost, volume, margin, or break-even point.",
    market:
      "Move from a customer category to observable behavior: who has the problem, what they use today, and what evidence shows they will switch.",
    product:
      "Describe the actual mechanism. Explain how the product handles trust, retention, competition, failure, or scale rather than simply saying it will."
  };

  return hints[investorKey];
}

/* ============================================================
   FINAL REPORT
   ============================================================ */

function extractRounds(userMsg) {
  const rounds = [];

  const regex =
    /ROUND\s*(\d+)[\s\S]*?QUESTION:\s*"([^"]+)"[\s\S]*?FOUNDER ANSWER:\s*"([^"]+)"[\s\S]*?PER-ROUND SCORE:\s*(\d+)/gi;

  let match;

  while ((match = regex.exec(userMsg)) !== null) {
    rounds.push({
      round: Number(match[1]),
      question: match[2],
      answer: match[3],
      score: Number(match[4])
    });
  }

  return rounds;
}

function generateBetterVersion(question, answer, investorKey) {
  const analysis = analyzeAnswer(answer, question, investorKey);

  if (analysis.isDodge) {
    return (
      `A stronger answer would directly answer the question first, then support it with evidence. ` +
      `For example: "Our current assumption is [specific claim]. ` +
      `We are measuring it using [specific metric], and our current target is [specific number]. ` +
      `If the metric misses that target, we will change [specific action]."`
    );
  }

  if (!analysis.hasNumbers && investorKey === "money") {
    return (
      `A stronger answer should include the actual financial assumption: ` +
      `"Our current model assumes [price] per [transaction/customer], ` +
      `with approximately [cost] in variable cost, so we need about [volume] ` +
      `transactions/customers per month to reach break-even."`
    );
  }

  if (!analysis.hasEvidence) {
    return (
      `A stronger answer should separate the assumption from the proof: ` +
      `"Our current hypothesis is [claim]. We are validating it through [experiment/customer interviews/pilot], ` +
      `and the success threshold is [measurable result]."`
    );
  }

  return (
    `A stronger version should keep your original answer but make the evidence explicit: ` +
    `"Our answer is [core claim]. The evidence is [real evidence]. ` +
    `The metric we are tracking is [metric], and our next milestone is [measurable target]."`
  );
}

function generateFinalReport(userMsg, startupName) {
  const rounds = extractRounds(userMsg);

  if (!rounds.length) {
    return {
      score: 50,
      money: 5,
      customer: 5,
      risk: 5,
      weakest_question: "",
      weakest_answer: "",
      weakness_reason:
        "Not enough round data was available to produce a reliable investor report.",
      better_version:
        "Complete the investor questioning session before generating the final report.",
      fixes: [
        "Validate your core customer assumption with measurable evidence.",
        "Define your unit economics and break-even assumptions.",
        "Identify and test your strongest product or competitive advantage."
      ],
      deal: false,
      offer: ""
    };
  }

  const investorScores = {
    money: [],
    market: [],
    product: []
  };

  for (const round of rounds) {
    const question = round.question.toLowerCase();

    if (
      containsAny(question, [
        "revenue",
        "price",
        "cost",
        "cash",
        "funding",
        "break even",
        "margin",
        "financial",
        "money",
        "transaction volume"
      ])
    ) {
      investorScores.money.push(round.score);
    } else if (
      containsAny(question, [
        "customer",
        "market",
        "switch",
        "paying",
        "acquire",
        "competitor",
        "alternative",
        "demand"
      ])
    ) {
      investorScores.market.push(round.score);
    } else {
      investorScores.product.push(round.score);
    }
  }

  function avg(arr) {
    if (!arr.length) return 5;

    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  const money = Math.max(1, Math.min(10, Math.round(avg(investorScores.money) / 10)));
  const customer = Math.max(
    1,
    Math.min(10, Math.round(avg(investorScores.market) / 10))
  );
  const risk = Math.max(
    1,
    Math.min(10, Math.round(avg(investorScores.product) / 10))
  );

  const overall = Math.round(((money + customer + risk) / 30) * 100);

  const weakest = rounds.reduce(
    (lowest, current) =>
      current.score < lowest.score ? current : lowest,
    rounds[0]
  );

  const weakestInvestor =
    weakest.question.toLowerCase().includes("revenue") ||
    weakest.question.toLowerCase().includes("price") ||
    weakest.question.toLowerCase().includes("cost")
      ? "money"
      : weakest.question.toLowerCase().includes("customer") ||
        weakest.question.toLowerCase().includes("market") ||
        weakest.question.toLowerCase().includes("switch")
      ? "market"
      : "product";

  const weakestAnalysis = analyzeAnswer(
    weakest.answer,
    weakest.question,
    weakestInvestor
  );

  const betterVersion = generateBetterVersion(
    weakest.question,
    weakest.answer,
    weakestInvestor
  );

  const fixes = [];

  if (!weakestAnalysis.hasNumbers) {
    fixes.push(
      "Add measurable assumptions to your weakest answer: define the relevant number, target, timeframe, and how you will validate it."
    );
  }

  if (!weakestAnalysis.hasEvidence) {
    fixes.push(
      "Replace unsupported claims with evidence from customer interviews, pilots, experiments, usage data, or another clearly identified validation method."
    );
  }

  if (!weakestAnalysis.hasReasoning) {
    fixes.push(
      "Explain the causal mechanism: state what you will do, why it should work, and which measurable result would prove it."
    );
  }

  if (fixes.length < 3) {
    fixes.push(
      "Identify the single assumption most likely to invalidate the business and define an early test for it."
    );
  }

  const finalFixes = [...new Set(fixes)].slice(0, 3);

  const deal =
    overall >= 70 &&
    money >= 7 &&
    customer >= 7 &&
    risk >= 7;

  return {
    score: overall,
    money,
    customer,
    risk,

    weakest_question: weakest.question,
    weakest_answer: weakest.answer.slice(0, 500),

    weakness_reason:
      weakestAnalysis.score < 50
        ? "The weakest answer did not provide enough concrete evidence, measurable assumptions, or direct reasoning to support the claim."
        : "The weakest answer addressed the question but still lacked enough evidence or measurable detail to make the claim investor-ready.",

    better_version: betterVersion,

    fixes: finalFixes,

    deal,

    offer: deal
      ? `Victor Cash is willing to discuss an investment structure for ${startupName}, subject to validation of the assumptions presented during the session.`
      : ""
  };
}

/* ============================================================
   MAIN MOCK AI FUNCTION
   ============================================================ */

async function callMockAI(messages, maxTokens = 700, temperature = 0.4) {
  /*
   * Keep realistic API latency so frontend loading states
   * are exercised during testing.
   */
  await new Promise(resolve =>
    setTimeout(resolve, 250 + Math.floor(Math.random() * 250))
  );

  const combined = messages
    .map(m => `${m.role}: ${m.content}`)
    .join("\n");

  const userMsg =
    messages.find(m => m.role === "user")?.content || "";

  const investorKey = detectInvestor(messages);
  const startupName = extractStartupName(combined);

  /* ========================================================
     FINAL REPORT
     ======================================================== */

  if (
    userMsg.includes("INVESTOR SESSION TRANSCRIPT") ||
    userMsg.includes("Copy that answer") ||
    userMsg.includes("FINAL INVESTOR REPORT")
  ) {
    return generateFinalReport(userMsg, startupName);
  }

  /* ========================================================
     QUESTION GENERATION
     ======================================================== */

  if (
    /Ask ONE question|Attack the weakest part|generate.*question|ask.*question/i.test(
      userMsg
    )
  ) {
    const question = chooseQuestion(
      investorKey,
      startupName,
      combined
    );

    return {
      question: question.question,
      questionId: question.id,
      topic: question.topic,
      investor: INVESTORS[investorKey].name,
      context:
        `This question tests the startup's ${question.topic} assumption from the ${INVESTORS[investorKey].label}.`
    };
  }

  /* ========================================================
     ANSWER EVALUATION
     ======================================================== */

  if (
    /Score this answer|The founder answered|evaluate.*answer|evaluate.*founder/i.test(
      userMsg
    )
  ) {
    const answerMatch =
      userMsg.match(/(?:founder answered|answer):\s*"([\s\S]*?)"/i);

    const answer =
      answerMatch?.[1] ||
      userMsg
        .split(/founder answered\s*:/i)[1]
        ?.replace(/^["']|["']$/g, "")
        .trim() ||
      "";

    const question =
      extractAskedQuestion(userMsg) ||
      "Explain your answer with concrete evidence.";

    const analysis = analyzeAnswer(
      answer,
      question,
      investorKey
    );

    const feedback = buildFeedback(
      answer,
      question,
      investorKey,
      analysis
    );

    const followUp = generateFollowUp(
      investorKey,
      question,
      answer,
      analysis,
      startupName
    );

    return {
      score: analysis.score,

      reaction: feedback.reaction,

      strength: feedback.strength,

      weakness: feedback.weakness,

      recommendation: feedback.recommendation,

      followUpQuestion: followUp.question,

      followUpReason: followUp.reason,

      analysis: {
        answerLength: analysis.wordCount,
        hasNumbers: analysis.hasNumbers,
        hasEvidence: analysis.hasEvidence,
        hasTimeframe: analysis.hasTimeframe,
        hasReasoning: analysis.hasReasoning,
        isDodge: analysis.isDodge,
        topicsDetected: analysis.topics
      }
    };
  }

  /* ========================================================
     DEAL METER
     ======================================================== */

  if (
    /more or less interested|deal meter|interest/i.test(userMsg)
  ) {
    const answerMatch =
      userMsg.match(/answer:\s*"([\s\S]*?)"/i);

    const answer = answerMatch?.[1] || "";

    return {
      delta: getDealMeterDelta(answer, investorKey)
    };
  }

  /* ========================================================
     HINT
     ======================================================== */

  if (
    /helpful hint|guide the founder|give.*hint/i.test(userMsg)
  ) {
    return {
      hint: generateHint(investorKey)
    };
  }

  /* ========================================================
     FALLBACK
     ======================================================== */

  return {
    message:
      "Mock investor engine is active. Provide a question-generation, answer-evaluation, hint, deal-meter, or final-report request."
  };
}

module.exports = {
  callMockAI
};