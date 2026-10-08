import React, { useState, useEffect, useRef } from 'react';
import { evaluateAnswer, getHint, getDealMeter } from '../services/api.js';

// Must match server INVESTORS keys
const INVESTOR_CONFIG = {
  money: {
    emoji: '💰',
    name: 'Victor Cash',
    title: 'The Money Shark',
    focus: 'REVENUE • COSTS • PROFIT',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
  market: {
    emoji: '🦈',
    name: 'Maya Street',
    title: 'The Customer Shark',
    focus: 'CUSTOMERS • SWITCHING • ACQUISITION',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
  },
  product: {
    emoji: '🚀',
    name: 'Rex Doubt',
    title: 'The Doubter Shark',
    focus: 'RISK • COMPETITION • TEAM',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.25)',
  },
};

const ORDER = ['money', 'market', 'product'];

const LOADING_MESSAGES = [
  'Reviewing your answer...',
  'Running the numbers...',
  'Checking your assumptions...',
  'Consulting the sharks...',
];

// ─── Animated typing text ─────────────────────────────────────────────────────
function TypingText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span>{displayed}<span className="typing-cursor" aria-hidden="true">|</span></span>;
}

// ─── Deal Meter ───────────────────────────────────────────────────────────────
function DealMeter({ value }) {
  // value: -30 to +30 (accumulated across 3 rounds of max ±10)
  const clamped = Math.max(-30, Math.min(30, value));
  const pct = ((clamped + 30) / 60) * 100; // 0–100%
  const getColor = () => {
    if (clamped > 10) return '#10b981';
    if (clamped > 0) return '#f59e0b';
    if (clamped > -10) return '#f97316';
    return '#ef4444';
  };
  const getLabel = () => {
    if (clamped > 15) return 'Very Interested 🔥';
    if (clamped > 5) return 'Warming Up';
    if (clamped > -5) return 'On The Fence';
    if (clamped > -15) return 'Sceptical';
    return 'Walking Away ❌';
  };

  return (
    <div className="deal-meter" aria-label={`Deal meter: ${getLabel()}`}>
      <div className="deal-meter-header">
        <span className="deal-meter-title">DEAL METER</span>
        <span className="deal-meter-label" style={{ color: getColor() }}>{getLabel()}</span>
      </div>
      <div className="deal-meter-track">
        <div className="deal-meter-center-line" aria-hidden="true" />
        <div
          className="deal-meter-fill"
          style={{
            width: `${Math.abs(pct - 50)}%`,
            left: clamped >= 0 ? '50%' : `${pct}%`,
            backgroundColor: getColor(),
            transition: 'width 0.7s ease, left 0.7s ease, background-color 0.5s ease',
          }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={-30}
          aria-valuemax={30}
        />
      </div>
      <div className="deal-meter-labels" aria-hidden="true">
        <span>No Deal</span>
        <span>Deal</span>
      </div>
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score]);
  const getColor = () => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };
  return (
    <div className="score-bar-wrap" aria-label={`Score: ${score} out of 100`}>
      <div className="score-bar-track" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div className="score-bar-fill" style={{ width: `${width}%`, backgroundColor: color || getColor(), transition: 'width 0.8s ease' }} />
      </div>
      <span className="score-bar-num" style={{ color: color || getColor() }}>{score}/100</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InvestorArena({ pitchData, questions, onComplete }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [completedRounds, setCompletedRounds] = useState([]);
  const [phase, setPhase] = useState('question'); // 'question' | 'evaluation'
  const [dealMeterValue, setDealMeterValue] = useState(0);
  const [meterLoading, setMeterLoading] = useState(false);
  const answerRef = useRef(null);
  const evalRef = useRef(null);

  const currentKey = ORDER[roundIndex];
  const currentInvestor = INVESTOR_CONFIG[currentKey];
  const currentQuestion = questions[currentKey]?.question || '';
  const totalRounds = ORDER.length;

  // Rotate loading messages while submitting
  useEffect(() => {
    if (!submitting) return;
    let i = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [submitting]);

  // Scroll to evaluation after load
  useEffect(() => {
    if (evaluation && evalRef.current) {
      evalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [evaluation]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please type your answer before submitting.');
      answerRef.current?.focus();
      return;
    }
    if (answer.trim().length < 10) {
      setError('Give a more complete answer — the sharks are watching.');
      return;
    }
    setError('');
    setSubmitting(true);
    setEvaluation(null);
    setHint(null);

    try {
      // Evaluate answer + update deal meter in parallel
      const [evalRes] = await Promise.all([
        evaluateAnswer({
          investorKey: currentKey,
          pitchData,
          question: currentQuestion,
          answer: answer.trim(),
        }),
      ]);
      setEvaluation(evalRes.data.evaluation);
      setPhase('evaluation');

      // Deal meter update (non-blocking, best-effort)
      setMeterLoading(true);
      getDealMeter({ investorKey: currentKey, question: currentQuestion, answer: answer.trim() })
        .then((mRes) => {
          const delta = mRes.data.delta || 0;
          setDealMeterValue((prev) => Math.max(-30, Math.min(30, prev + delta)));
        })
        .catch(() => {}) // never crash the UI
        .finally(() => setMeterLoading(false));

    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to evaluate your answer. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    setHintLoading(true);
    setHint(null);
    try {
      const res = await getHint({ investorKey: currentKey, pitchData, question: currentQuestion });
      setHint(res.data.hint);
    } catch {
      setHint('Think about a specific number, name, or example that proves your point.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleNextRound = () => {
    const round = {
      investorKey: currentKey,
      question: currentQuestion,
      answer: answer.trim(),
      score: evaluation.score,
      strength: evaluation.strength,
      weakness: evaluation.weakness,
      reaction: evaluation.reaction,
    };
    const newCompleted = [...completedRounds, round];
    setCompletedRounds(newCompleted);

    if (roundIndex < totalRounds - 1) {
      setRoundIndex((i) => i + 1);
      setAnswer('');
      setEvaluation(null);
      setHint(null);
      setPhase('question');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(newCompleted, dealMeterValue);
    }
  };

  return (
    <main className="arena">
      {/* Progress header */}
      <header className="arena-header">
        <div className="arena-progress" role="navigation" aria-label="Investor rounds progress">
          {ORDER.map((key, i) => {
            const inv = INVESTOR_CONFIG[key];
            const done = i < roundIndex;
            const active = i === roundIndex;
            return (
              <div
                key={key}
                className={`progress-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                aria-label={`${inv.name}: ${done ? 'completed' : active ? 'current' : 'upcoming'}`}
              >
                <div className="progress-dot" style={active || done ? { backgroundColor: inv.color } : {}}>
                  {done ? '✓' : inv.emoji}
                </div>
                <span className="progress-name">{inv.name}</span>
              </div>
            );
          })}
        </div>
        <div className="arena-round-label" aria-live="polite">
          Round {roundIndex + 1} of {totalRounds}
        </div>
      </header>

      {/* Deal Meter */}
      <DealMeter value={dealMeterValue} />

      {/* Investor card */}
      <section
        className="investor-stage"
        style={{ '--inv-color': currentInvestor.color, '--inv-bg': currentInvestor.bg, '--inv-border': currentInvestor.border }}
        aria-label={`Current investor: ${currentInvestor.name}`}
      >
        <div className="investor-badge">
          <div className="investor-avatar" style={{ background: currentInvestor.bg, borderColor: currentInvestor.border }} aria-hidden="true">
            {currentInvestor.emoji}
          </div>
          <div>
            <h2 className="investor-stage-name">{currentInvestor.name}</h2>
            <p className="investor-stage-title" style={{ color: currentInvestor.color }}>{currentInvestor.title}</p>
            <p className="investor-stage-focus">{currentInvestor.focus}</p>
          </div>
        </div>

        <blockquote className="investor-question" aria-live="polite">
          {phase === 'question'
            ? <TypingText text={`"${currentQuestion}"`} />
            : `"${currentQuestion}"`}
        </blockquote>
      </section>

      {/* Answer section */}
      {phase === 'question' && (
        <section className="answer-section" aria-label="Your answer">
          <label className="answer-label" htmlFor="founder-answer">Your Answer</label>
          <textarea
            id="founder-answer"
            ref={answerRef}
            className="answer-textarea"
            placeholder="Answer as if you're sitting across the table. Be specific — give numbers, names, examples..."
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setError(''); }}
            rows={5}
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'answer-error' : 'answer-hint-text'}
            disabled={submitting}
          />
          <p id="answer-hint-text" className="answer-meta">
            Tip: Numbers and names score higher than vague claims.
          </p>

          {error && <p id="answer-error" className="field-error" role="alert">{error}</p>}

          <div className="answer-actions">
            <button className="btn btn-ghost" onClick={handleGetHint} disabled={hintLoading || submitting} type="button">
              {hintLoading ? <><span className="spinner sm" aria-hidden="true" /> Getting hint...</> : '💡 Need a Hint?'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitAnswer}
              disabled={submitting || !answer.trim()}
              aria-busy={submitting}
              type="button"
            >
              {submitting
                ? <span className="btn-loading"><span className="spinner" aria-hidden="true" />{loadingMsg}</span>
                : 'Submit Answer →'}
            </button>
          </div>

          {hint && (
            <div className="hint-box" role="note" aria-label="Hint">
              <span className="hint-icon" aria-hidden="true">💡</span>
              <p className="hint-text">{hint}</p>
            </div>
          )}
        </section>
      )}

      {/* Evaluation result */}
      {phase === 'evaluation' && evaluation && (
        <section ref={evalRef} className="evaluation-section" aria-label="Investor evaluation" aria-live="polite">
          <div className="eval-reaction-card" style={{ borderColor: currentInvestor.border, background: currentInvestor.bg }}>
            <div className="eval-investor-mini">
              <span aria-hidden="true">{currentInvestor.emoji}</span>
              <strong>{currentInvestor.name} says:</strong>
            </div>
            <p className="eval-reaction">"{evaluation.reaction}"</p>
          </div>

          <div className="eval-score-card">
            <h3 className="eval-score-title">Answer Score</h3>
            <ScoreBar score={evaluation.score} color={currentInvestor.color} />
          </div>

          <div className="eval-details-grid">
            <div className="eval-detail">
              <div className="eval-detail-icon" aria-hidden="true">✅</div>
              <div>
                <h4 className="eval-detail-title">What Worked</h4>
                <p className="eval-detail-text">{evaluation.strength}</p>
              </div>
            </div>
            <div className="eval-detail">
              <div className="eval-detail-icon" aria-hidden="true">⚠️</div>
              <div>
                <h4 className="eval-detail-title">What Was Missing</h4>
                <p className="eval-detail-text">{evaluation.weakness}</p>
              </div>
            </div>
          </div>

          {evaluation.followUpQuestion && (
            <div className="eval-followup" role="note">
              <p className="eval-followup-label"><span aria-hidden="true">🎯</span> Follow-up to consider:</p>
              <p className="eval-followup-q">"{evaluation.followUpQuestion}"</p>
            </div>
          )}

          <div className="eval-next-wrap">
            <button className="btn btn-primary btn-lg" onClick={handleNextRound} type="button">
              {roundIndex < totalRounds - 1
                ? `Next: ${INVESTOR_CONFIG[ORDER[roundIndex + 1]].name} →`
                : '🏁 Get Final Verdict →'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
