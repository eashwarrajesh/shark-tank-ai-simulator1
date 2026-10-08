import React from 'react';

const investors = [
  {
    emoji: '💰',
    name: 'Victor Cash',
    title: 'The Money Shark',
    focus: 'Revenue • Costs • Profit',
    desc: 'Calm, loves numbers. Will ask exactly how you make money and when you break even.',
    color: '#f59e0b',
  },
  {
    emoji: '🦈',
    name: 'Maya Street',
    title: 'The Customer Shark',
    focus: 'Customers • Switching • Acquisition',
    desc: 'Friendly voice, very direct. Will ask you to name one real person who will pay.',
    color: '#3b82f6',
  },
  {
    emoji: '🚀',
    name: 'Rex Doubt',
    title: 'The Doubter Shark',
    focus: 'Risk • Competition • Team',
    desc: 'Dry humor, hard to impress. Will ask why Google cannot just copy your idea tomorrow.',
    color: '#8b5cf6',
  },
];

const steps = ['PITCH', 'DEFEND', 'GET THE TRUTH', 'IMPROVE'];

export default function LandingPage({ onEnter }) {
  return (
    <main className="landing">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="badge" aria-label="AI Investor Simulation">
          <span className="badge-dot" aria-hidden="true" />
          AI INVESTOR SIMULATION
        </div>

        <h1 id="hero-heading" className="hero-heading">
          Friends are too polite.
          <br />
          <span className="hero-heading-accent">Sharks are not.</span>
        </h1>

        <p className="hero-desc">
          Pitch your startup to three AI investors who will challenge your money,
          customers, and risks — the way real investors do.
        </p>

        <button
          className="btn btn-primary btn-lg"
          onClick={onEnter}
          aria-label="Enter the Tank and start your pitch"
        >
          Enter the Tank →
        </button>

        <p className="hero-meta">
          3 Investors&nbsp;&nbsp;•&nbsp;&nbsp;3 Perspectives&nbsp;&nbsp;•&nbsp;&nbsp;1 Final Verdict
        </p>
      </section>

      {/* Flow steps */}
      <section className="flow-section" aria-label="How it works">
        <div className="flow-steps" role="list">
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flow-step" role="listitem">
                <span className="flow-num" aria-hidden="true">{i + 1}</span>
                <span className="flow-label">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="flow-arrow" aria-hidden="true">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Investor cards */}
      <section className="investors-section" aria-labelledby="investors-heading">
        <h2 id="investors-heading" className="section-title">Meet Your Panel</h2>
        <p className="section-sub">Three sharks. Three blind spots. Zero mercy.</p>

        <div className="investors-grid">
          {investors.map((inv) => (
            <article
              key={inv.name}
              className="investor-card"
              style={{ '--card-accent': inv.color }}
              aria-label={`${inv.name}: ${inv.focus}`}
            >
              <div className="investor-emoji" aria-hidden="true">{inv.emoji}</div>
              <h3 className="investor-name">{inv.name}</h3>
              <p className="investor-title" style={{ color: inv.color }}>{inv.title}</p>
              <p className="investor-focus">{inv.focus}</p>
              <p className="investor-desc">{inv.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="cta-bottom" aria-label="Call to action">
        <h2 className="cta-heading">Ready to face the panel?</h2>
        <p className="cta-sub">Most founders never get honest feedback. You're about to.</p>
        <button
          className="btn btn-primary btn-lg"
          onClick={onEnter}
          aria-label="Start your pitch now"
        >
          🔥 Start Your Pitch
        </button>
      </section>
    </main>
  );
}
