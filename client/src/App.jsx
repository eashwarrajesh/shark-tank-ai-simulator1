import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import PitchSetup from './pages/PitchSetup.jsx';
import InvestorArena from './pages/InvestorArena.jsx';
import FinalVerdict from './pages/FinalVerdict.jsx';
import { startPitch, getFinalVerdict } from './services/api.js';

// App screens
const SCREENS = {
  LANDING: 'landing',
  SETUP: 'setup',
  ARENA: 'arena',
  LOADING_VERDICT: 'loading_verdict',
  VERDICT: 'verdict',
  ERROR: 'error',
};

const VERDICT_LOADING_MSGS = [
  'The sharks are conferring...',
  'Tallying your scores...',
  'Preparing the hard truth...',
  'Writing your rescue plan...',
];

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [pitchData, setPitchData] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [previousScore, setPreviousScore] = useState(null);
  const [error, setError] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);
  const [verdictLoadingMsg, setVerdictLoadingMsg] = useState('');

  // ── Push a history entry whenever we leave the landing page
  // so the browser back button returns to landing instead of leaving the app
  const goToScreen = (newScreen) => {
    if (newScreen !== SCREENS.LANDING) {
      // Push a dummy state so back button has somewhere to go
      window.history.pushState({ screen: newScreen }, '');
    }
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Intercept browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Back button was pressed — always go to landing and reset
      setPitchData(null);
      setQuestions(null);
      setVerdict(null);
      setPreviousScore(null);
      setError('');
      setScreen(SCREENS.LANDING);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleEnterTank = () => {
    goToScreen(SCREENS.SETUP);
  };

  const handlePitchSubmit = async (formData) => {
    setPitchLoading(true);
    setError('');
    try {
      const res = await startPitch(formData);
      setPitchData(res.data.pitchData);
      setQuestions(res.data.questions);
      goToScreen(SCREENS.ARENA);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Something went wrong connecting to the investors. Please check your connection and try again.';
      setError(msg);
      goToScreen(SCREENS.ERROR);
    } finally {
      setPitchLoading(false);
    }
  };

  const handleArenaComplete = async (rounds, dealMeterValue) => {
    goToScreen(SCREENS.LOADING_VERDICT);

    // Rotate loading messages
    let i = 0;
    setVerdictLoadingMsg(VERDICT_LOADING_MSGS[0]);
    const interval = setInterval(() => {
      i = (i + 1) % VERDICT_LOADING_MSGS.length;
      setVerdictLoadingMsg(VERDICT_LOADING_MSGS[i]);
    }, 2000);

    try {
      const res = await getFinalVerdict({ pitchData, rounds });
      const newVerdict = res.data.verdict;
      // Save previous score before overwriting verdict
      if (verdict) setPreviousScore(verdict.overallScore);
      setVerdict(newVerdict);
      goToScreen(SCREENS.VERDICT);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Failed to generate your final verdict. Please try again.';
      setError(msg);
      goToScreen(SCREENS.ERROR);
    } finally {
      clearInterval(interval);
    }
  };

  const handlePitchAgain = () => {
    setPitchData(null);
    setQuestions(null);
    setError('');
    goToScreen(SCREENS.SETUP);
  };

  const handleGoHome = () => {
    setPitchData(null);
    setQuestions(null);
    setVerdict(null);
    setPreviousScore(null);
    setError('');
    setScreen(SCREENS.LANDING);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      {/* Global nav */}
      <nav className="app-nav" aria-label="Main navigation">
        <button
          className="nav-logo"
          onClick={handleGoHome}
          aria-label="Shark Tank AI — go to home"
          type="button"
        >
          🦈 <span>Shark Tank AI</span>
        </button>
        {screen !== SCREENS.LANDING && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleGoHome}
            type="button"
            aria-label="Start over from the beginning"
          >
            ← Start Over
          </button>
        )}
      </nav>

      {/* Screens */}
      {screen === SCREENS.LANDING && (
        <LandingPage onEnter={handleEnterTank} />
      )}

      {screen === SCREENS.SETUP && (
        <PitchSetup onSubmit={handlePitchSubmit} loading={pitchLoading} />
      )}

      {screen === SCREENS.ARENA && pitchData && questions && (
        <InvestorArena
          pitchData={pitchData}
          questions={questions}
          onComplete={handleArenaComplete}
        />
      )}

      {screen === SCREENS.LOADING_VERDICT && (
        <div className="loading-screen" role="status" aria-live="polite" aria-label="Loading final verdict">
          <div className="loading-sharks">
            <span className="loading-shark" aria-hidden="true">🦈</span>
            <span className="loading-shark loading-shark-2" aria-hidden="true">💰</span>
            <span className="loading-shark loading-shark-3" aria-hidden="true">🚀</span>
          </div>
          <h2 className="loading-title">Preparing Your Verdict</h2>
          <p className="loading-msg" aria-live="polite">{verdictLoadingMsg}</p>
          <div className="loading-dots" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      )}

      {screen === SCREENS.VERDICT && verdict && pitchData && (
        <FinalVerdict
          verdict={verdict}
          pitchData={pitchData}
          onPitchAgain={handlePitchAgain}
          previousScore={previousScore}
        />
      )}

      {screen === SCREENS.ERROR && (
        <div className="error-screen" role="alert">
          <div className="error-content">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-msg">{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handlePitchAgain} type="button">
                Try Again
              </button>
              <button className="btn btn-ghost" onClick={handleGoHome} type="button">
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
