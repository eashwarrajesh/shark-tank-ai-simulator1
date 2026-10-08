import React, { useState } from 'react';
import { getTemplateOptions, getTemplate } from '../utils/templates';

const FIELDS = [
  {
    key: 'startupName',
    label: 'Startup Name',
    type: 'input',
    placeholder: 'e.g. TutorLink, FoodDash, RentEasy',
    required: true,
    weight: 10,
  },
  {
    key: 'oneLiner',
    label: 'One-Line Pitch',
    type: 'input',
    placeholder: 'e.g. Uber for on-demand tutors for college students',
    required: true,
    weight: 15,
  },
  {
    key: 'problem',
    label: 'The Problem',
    type: 'textarea',
    placeholder: 'What specific problem does your startup solve? Who suffers from it?',
    required: true,
    weight: 20,
  },
  {
    key: 'solution',
    label: 'Your Solution',
    type: 'textarea',
    placeholder: 'How does your product or service solve the problem?',
    required: true,
    weight: 20,
  },
  {
    key: 'targetCustomer',
    label: 'Target Customer',
    type: 'input',
    placeholder: 'e.g. College students aged 18–24 in urban areas',
    required: true,
    weight: 15,
  },
  {
    key: 'businessModel',
    label: 'Business Model',
    type: 'input',
    placeholder: 'e.g. 15% commission per tutoring session booked',
    required: true,
    weight: 15,
  },
  {
    key: 'competitiveAdvantage',
    label: 'Competitive Advantage',
    type: 'input',
    placeholder: 'e.g. AI-matched tutors with verified grades, 10-minute response time',
    required: false,
    weight: 5,
  },
];

const getCompleteness = (form) => {
  let score = 0;
  FIELDS.forEach((f) => {
    const val = form[f.key]?.trim() || '';
    if (val.length >= (f.type === 'textarea' ? 20 : 5)) {
      score += f.weight;
    } else if (val.length > 0) {
      score += f.weight * 0.5;
    }
  });
  return Math.min(100, Math.round(score));
};

const getStrengthLabel = (pct) => {
  if (pct >= 85) return { label: 'Strong Pitch', color: '#10b981' };
  if (pct >= 60) return { label: 'Getting There', color: '#f59e0b' };
  if (pct >= 30) return { label: 'Needs More Detail', color: '#ef4444' };
  return { label: 'Just Started', color: '#6b7280' };
};

export default function PitchSetup({ onSubmit, loading }) {
  const [form, setForm] = useState({
    startupName: '',
    oneLiner: '',
    problem: '',
    solution: '',
    targetCustomer: '',
    businessModel: '',
    competitiveAdvantage: '',
  });
  const [errors, setErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const completeness = getCompleteness(form);
  const strength = getStrengthLabel(completeness);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = getTemplate(templateId);
    setForm(template.data);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    FIELDS.filter((f) => f.required).forEach((f) => {
      const val = form[f.key]?.trim() || '';
      if (!val) {
        newErrors[f.key] = `${f.label} is required.`;
      } else if (f.type === 'textarea' && val.length < 10) {
        newErrors[f.key] = `Please add more detail.`;
      } else if (f.type === 'input' && val.length < 3) {
        newErrors[f.key] = `Too short — add more detail.`;
      }
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = document.querySelector('.field-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit(form);
  };

  return (
    <main className="pitch-setup">
      <div className="pitch-setup-inner">
        <header className="pitch-setup-header">
          <div className="badge">ROUND 0 — SETUP</div>
          <h1 className="pitch-setup-title">Build Your Pitch</h1>
          <p className="pitch-setup-sub">
            The more detail you provide, the harder — and more useful — the investor questions will be.
          </p>
          
          {/* Template Selector */}
          <div className="template-selector" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="template-select" className="field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              💡 Quick Start with a Template
            </label>
            <select
              id="template-select"
              className="field-input"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{ maxWidth: '400px' }}
            >
              {getTemplateOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Choose a pre-filled example to test the simulation, or start from scratch
            </p>
          </div>
        </header>

        {/* Completeness bar */}
        <div className="completeness-bar-wrap" aria-label={`Pitch readiness: ${completeness}%`}>
          <div className="completeness-top">
            <span className="completeness-label">Pitch Readiness</span>
            <span className="completeness-pct" style={{ color: strength.color }}>
              {completeness}% — {strength.label}
            </span>
          </div>
          <div className="completeness-track" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="completeness-fill"
              style={{ width: `${completeness}%`, backgroundColor: strength.color }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Startup pitch form">
          <div className="fields-grid">
            {FIELDS.map((field) => (
              <div
                key={field.key}
                className={`field-group ${field.type === 'textarea' ? 'field-full' : ''} ${errors[field.key] ? 'field-has-error' : ''}`}
              >
                <label className="field-label" htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="field-required" aria-label="required"> *</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    className="field-input field-textarea"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    aria-required={field.required}
                    aria-invalid={!!errors[field.key]}
                    aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
                    rows={3}
                  />
                ) : (
                  <input
                    id={field.key}
                    type="text"
                    className="field-input"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    aria-required={field.required}
                    aria-invalid={!!errors[field.key]}
                    aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
                  />
                )}

                {errors[field.key] && (
                  <p id={`${field.key}-error`} className="field-error" role="alert">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="pitch-submit-wrap">
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" aria-hidden="true" />
                  Preparing the sharks...
                </span>
              ) : (
                '🔥 Enter the Tank →'
              )}
            </button>
            <p className="pitch-submit-note">
              Your AI investors are waiting. They will not be gentle.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
