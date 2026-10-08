# Bugfix Requirements Document

## Introduction

The Shark Tank AI application currently includes a mock AI mode that was intended as a development convenience but has become a production liability. The mock mode allows the app to run without a Grok API key and automatically falls back to deterministic mock responses when any API error occurs. This hides real problems from users and prevents proper error diagnosis in production.

This bugfix removes the mock mode entirely, making the application production-ready by requiring real Grok API integration and surfacing errors clearly to users when the API is misconfigured or fails.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the `AI_MODE` environment variable is set to `mock` or not set THEN the system uses mock responses instead of real Grok API calls

1.2 WHEN a Grok API call fails for any reason (missing API key, network error, rate limit, invalid key) THEN the system silently falls back to mock responses without notifying the user

1.3 WHEN the `GROK_API_KEY` is missing or invalid THEN the system still operates normally using mock responses, giving no indication that real AI is not being used

1.4 WHEN the health check endpoint is called THEN the system reports `aiMode: "mock"` and `aiConfigured: true` even when no valid API key exists

1.5 WHEN the server starts with `AI_MODE=mock` or missing API key THEN the system logs "Running in MOCK mode" or warns about fallback but continues operating normally

1.6 WHEN the `grokClient.js` `isFallbackError()` function is called THEN the system returns `true` for all error types, including authentication errors, causing silent fallback instead of error propagation

### Expected Behavior (Correct)

2.1 WHEN any API endpoint requiring AI is called without a valid `GROK_API_KEY` configured THEN the system SHALL return an HTTP 500 error with message "AI service not configured. Please set GROK_API_KEY environment variable."

2.2 WHEN a Grok API call fails due to authentication (401/403) THEN the system SHALL return an HTTP 500 error with message "Invalid Grok API key. Please check your GROK_API_KEY configuration."

2.3 WHEN a Grok API call fails due to rate limiting (429) THEN the system SHALL return an HTTP 429 error with message "AI service rate limit reached. Please try again later."

2.4 WHEN a Grok API call fails due to server errors (5xx) THEN the system SHALL return an HTTP 503 error with message "AI service temporarily unavailable. Please try again."

2.5 WHEN a Grok API call fails due to network errors or timeout THEN the system SHALL return an HTTP 503 error with message "Failed to connect to AI service. Please check your network connection."

2.6 WHEN the health check endpoint is called with a valid API key THEN the system SHALL return `aiConfigured: true`

2.7 WHEN the health check endpoint is called without a valid API key THEN the system SHALL return `aiConfigured: false` and include warning "GROK_API_KEY not configured"

2.8 WHEN the server starts without a valid `GROK_API_KEY` THEN the system SHALL log a warning "WARNING: GROK_API_KEY not configured. AI endpoints will fail until this is set."

2.9 WHEN the `AI_MODE` environment variable is present in configuration files THEN it SHALL be removed from `.env.example` and documentation

2.10 WHEN the `mockService.js` file exists THEN it SHALL be deleted from the codebase

2.11 WHEN the `aiService.js` imports or uses `mockService` THEN those imports and fallback logic SHALL be removed

2.12 WHEN the `grokClient.js` contains fallback error classification THEN it SHALL be removed and errors SHALL propagate normally

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid `GROK_API_KEY` is configured and the Grok API responds successfully THEN the system SHALL CONTINUE TO generate investor questions using real AI

3.2 WHEN a valid `GROK_API_KEY` is configured and the Grok API responds successfully THEN the system SHALL CONTINUE TO evaluate founder answers using real AI

3.3 WHEN a valid `GROK_API_KEY` is configured and the Grok API responds successfully THEN the system SHALL CONTINUE TO generate final verdicts using real AI

3.4 WHEN a valid `GROK_API_KEY` is configured and the Grok API responds successfully THEN the system SHALL CONTINUE TO generate hints using real AI

3.5 WHEN input validation fails (oversized payload, invalid investor key) THEN the system SHALL CONTINUE TO return appropriate validation errors

3.6 WHEN the server is in production mode THEN the system SHALL CONTINUE TO serve the React frontend from the static public directory

3.7 WHEN CORS is configured THEN the system SHALL CONTINUE TO handle cross-origin requests appropriately

3.8 WHEN the `GROK_MODEL`, `AI_TIMEOUT_MS`, and `PORT` environment variables are set THEN the system SHALL CONTINUE TO use those configuration values
