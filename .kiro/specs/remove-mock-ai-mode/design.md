# Remove Mock AI Mode Bugfix Design

## Overview

The Shark Tank AI application currently includes a mock AI mode that was initially intended as a development convenience. However, this mock mode has become a production liability by allowing the application to run without proper Grok API integration and silently falling back to deterministic mock responses when any API error occurs. This masks real issues from users and prevents proper error diagnosis in production environments.

This bugfix removes the mock mode entirely by:
1. Eliminating all mock service code and configuration
2. Removing the AI_MODE environment variable and associated logic
3. Removing silent fallback behavior from error handling
4. Implementing proper error propagation with specific HTTP status codes
5. Requiring valid Grok API key configuration for all AI operations

The fix ensures the application is production-ready by requiring real Grok API integration and surfacing configuration or service errors clearly to users.

## Glossary

- **Bug_Condition (C)**: The condition that triggers buggy behavior - when the system uses mock responses or silently falls back to mock responses instead of using real Grok API or reporting errors
- **Property (P)**: The desired behavior - the system SHALL use only real Grok API calls and SHALL return specific error responses when the API is misconfigured or fails
- **Preservation**: Existing functionality with valid Grok API keys that must remain unchanged - all AI operations must continue to work correctly when properly configured
- **AI_MODE**: Environment variable (currently `mock` or `grok`) that controls whether the system uses mock responses or real API calls
- **mockService.js**: The service module in `server/services/mockService.js` that generates deterministic fallback responses
- **aiService.js**: The main AI service router in `server/services/aiService.js` that currently routes between mock and Grok modes
- **grokClient.js**: The Grok API client in `server/services/grokClient.js` that handles API calls and error classification
- **withFallback()**: Helper function in aiService.js that wraps Grok calls and silently falls back to mock on errors
- **isFallbackError()**: Function in grokClient.js that classifies errors and currently returns true for all error types

## Bug Details

### Bug Condition

The bug manifests when the system operates in mock mode OR when it silently falls back to mock responses on API failures. This occurs through multiple mechanisms: explicit AI_MODE configuration, missing API keys, and the fallback error handler. The system uses mock data instead of real AI or proper error responses, masking configuration issues and service failures from users.

**Formal Specification:**
```
FUNCTION isBugCondition(systemState, apiCall)
  INPUT: systemState containing environment configuration and runtime state
         apiCall indicating an AI service operation is being performed
  OUTPUT: boolean
  
  RETURN (systemState.AI_MODE == "mock" OR systemState.AI_MODE is undefined)
         OR (apiCall.grokCallFailed AND fallbackToMockOccurred)
         OR (systemState.GROK_API_KEY is missing OR invalid)
         AND systemReturnsSuccessWithMockData
END FUNCTION
```

### Examples

**Example 1: Explicit Mock Mode**
- **Condition**: `.env` file has `AI_MODE=mock`
- **Current Behavior**: System logs "Running in MOCK mode" and uses mock responses for all AI calls
- **Expected Behavior**: System should ignore AI_MODE variable and require valid GROK_API_KEY

**Example 2: Missing API Key with Silent Fallback**
- **Condition**: `GROK_API_KEY` is not set or is a placeholder like `your_api_key_here`
- **Current Behavior**: System warns about missing key but continues normally using mock responses
- **Expected Behavior**: System should log warning at startup and return HTTP 500 with error message "AI service not configured" when AI endpoints are called

**Example 3: Authentication Failure with Silent Fallback**
- **Condition**: Grok API returns 401 (invalid API key)
- **Current Behavior**: `isFallbackError()` returns true, system falls back to mock responses, logs "[GROK → FALLBACK]"
- **Expected Behavior**: System should return HTTP 500 with error message "Invalid Grok API key"

**Example 4: Rate Limit with Silent Fallback**
- **Condition**: Grok API returns 429 (rate limit exceeded)
- **Current Behavior**: `isFallbackError()` returns true, system falls back to mock responses
- **Expected Behavior**: System should return HTTP 429 with error message "AI service rate limit reached"

**Example 5: Health Check with Mock Mode**
- **Condition**: Server running with `AI_MODE=mock` and no valid API key
- **Current Behavior**: Health endpoint returns `{ aiConfigured: true, aiMode: "mock" }`
- **Expected Behavior**: Health endpoint should return `{ aiConfigured: false, warning: "GROK_API_KEY not configured" }`

**Edge Case: Valid API Key with Proper Functionality**
- **Condition**: Valid `GROK_API_KEY` is configured and Grok API responds successfully
- **Expected Behavior**: All AI operations continue to work correctly (MUST be preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All AI operations (generate questions, evaluate answers, calculate deal meter deltas, generate verdicts, generate hints) must continue to work exactly as before when a valid GROK_API_KEY is configured and the Grok API responds successfully
- Input validation for AI endpoints must continue to reject oversized payloads and invalid investor keys
- Server configuration using `GROK_MODEL`, `AI_TIMEOUT_MS`, and `PORT` environment variables must continue to be respected
- CORS handling and static file serving for the React frontend must remain unchanged
- The investor personas (Victor Cash, Maya Street, Rex Doubt) and their prompts must remain unchanged
- JSON response schemas for all AI endpoints must remain unchanged

**Scope:**
All inputs and operations that involve valid Grok API configuration and successful API responses should be completely unaffected by this fix. This includes:
- Valid API key configuration at startup
- Successful Grok API calls for all AI operations
- Environment variable configuration for model, timeout, and port
- Health checks with valid configuration
- Frontend-backend communication
- Request/response formats and data structures

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Dual-Mode Architecture**: The system was designed with two modes (mock/grok) to facilitate development, but this architecture remained in production code. The `AI_MODE` environment variable and associated branching logic in `aiService.js` creates a code path that completely bypasses real API integration.

2. **Overly Permissive Fallback Logic**: The `isFallbackError()` function in `grokClient.js` returns `true` for ALL error types, including authentication errors (401/403). The comment "// default: always fall back to keep the demo alive" reveals the function was designed to prioritize availability over correctness. This prevents proper error propagation.

3. **Silent Error Handling**: The `withFallback()` helper function in `aiService.js` catches all errors and silently returns mock data with only a console warning. There is no mechanism to surface errors to the API caller, so the frontend and end users never know when real AI is unavailable.

4. **Permissive Startup Validation**: The server startup code in `server.js` checks for API key presence but continues operation regardless. The health check endpoint reports `aiConfigured: true` even when `AI_MODE=mock` and no valid key exists, giving false confidence about system readiness.

## Correctness Properties

Property 1: Bug Condition - Require Real API Integration

_For any_ system state where mock mode is configured (AI_MODE=mock or undefined) OR where a Grok API call fails (missing/invalid key, rate limit, network error), the fixed system SHALL NOT use mock responses. Instead, it SHALL return appropriate HTTP error responses (500 for configuration issues, 429 for rate limits, 503 for service unavailability) with specific error messages that guide users to resolve the issue.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12**

Property 2: Preservation - Valid API Key Functionality

_For any_ system state where a valid GROK_API_KEY is configured and the Grok API responds successfully, the fixed system SHALL produce exactly the same AI-generated results (questions, evaluations, verdicts, hints) as the original system running in grok mode, preserving all existing functionality for properly configured deployments.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `server/services/mockService.js`

**Action**: DELETE this entire file
- Remove all mock response generation functions
- Remove question templates, reaction banks, and mock logic
- This eliminates the fallback option completely

**File 2**: `server/services/aiService.js`

**Function**: All AI service functions

**Specific Changes**:
1. **Remove Mock Import**: Delete line 8: `const mock = require('./mockService');`

2. **Remove AI_MODE Logic**: Delete lines 10-12:
   - `const AI_MODE = (process.env.AI_MODE || 'mock').toLowerCase();`
   - `const isGrok = AI_MODE === 'grok';`
   - Console log about AI mode

3. **Remove withFallback Helper**: Delete lines 76-90 (entire `withFallback` function)

4. **Replace All AI Functions**: Rewrite `generateInvestorQuestion`, `evaluateAnswer`, `getDealMeterDelta`, `generateFinalVerdict`, and `generateHint` to:
   - Call `callGrok` directly (not through withFallback)
   - Add try-catch blocks that properly classify and rethrow errors
   - Map Grok errors to appropriate HTTP errors with descriptive messages

5. **Add Error Classification Helper**: Create new function `mapGrokErrorToHttp(err)` that:
   - Returns `{ status: 500, message: "Invalid Grok API key..." }` for 401/403
   - Returns `{ status: 429, message: "AI service rate limit reached..." }` for 429
   - Returns `{ status: 503, message: "AI service temporarily unavailable..." }` for 5xx
   - Returns `{ status: 503, message: "Failed to connect to AI service..." }` for network/timeout
   - Returns `{ status: 500, message: "AI service not configured..." }` for missing API key

**File 3**: `server/services/grokClient.js`

**Function**: `isFallbackError` and error handling

**Specific Changes**:
1. **Remove isFallbackError Function**: Delete lines 27-48 (entire function)

2. **Simplify Error Handling in callGrok**: Modify the try-catch block (lines 54-70) to:
   - Remove `isFallback` logic
   - Let errors propagate naturally with their original status codes
   - Keep timeout and API client configuration

3. **Improve Error Context**: Ensure thrown errors include:
   - Original status code (err.status or err.statusCode)
   - Error message from Grok API
   - Error code for network issues (ETIMEDOUT, ECONNREFUSED, etc.)

**File 4**: `server/server.js`

**Function**: Startup logging and health check

**Specific Changes**:
1. **Update Startup Logging** (lines 70-78):
   - Remove AI_MODE checking logic
   - Replace with simple validation: if `GROK_API_KEY` is missing or contains "your_", log: "⚠️  WARNING: GROK_API_KEY not configured. AI endpoints will fail until this is set."
   - Otherwise log: "✅ Grok API key configured"

2. **Update Health Check** (lines 36-44):
   - Remove `AI_MODE` from response
   - Change logic: `const aiConfigured = !!process.env.GROK_API_KEY && !process.env.GROK_API_KEY.includes('your_');`
   - If not configured, include: `warning: "GROK_API_KEY not configured"`
   - Response shape: `{ status: 'ok', aiConfigured: true/false, warning?: string }`

**File 5**: `server/.env.example`

**Action**: Remove AI_MODE configuration

**Specific Changes**:
1. Delete the entire "AI Mode" section (lines 7-10)
2. Update comment above GROK_API_KEY to indicate it's REQUIRED for production
3. Keep GROK_MODEL and AI_TIMEOUT_MS as optional configuration

**File 6**: `server/.env`

**Action**: Remove AI_MODE from active configuration

**Specific Changes**:
1. Delete line 4: `AI_MODE=mock`
2. Ensure GROK_API_KEY is present (already set in current file)

**File 7**: `server/controllers/pitchController.js`

**Function**: All controller functions

**Specific Changes**:
1. **Add Error Response Handling**: Wrap all `aiService` calls in try-catch blocks
2. **Map Service Errors to HTTP Responses**: When catching errors from aiService:
   - If error has `status` and `message`, use those: `res.status(error.status).json({ error: error.message })`
   - Otherwise, default to 500: `res.status(500).json({ error: "Internal server error" })`
3. Ensure errors propagate to the client with appropriate status codes

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, demonstrate the bug by observing mock responses and silent fallbacks on the unfixed code, then verify the fix correctly requires real API integration and properly propagates errors. The third phase confirms that valid API key functionality is completely preserved.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the system uses mock responses and silently falls back when it should error. If we observe different behavior, we will need to re-hypothesize.

**Test Plan**: Configure the system in various defective states (mock mode, missing API key, invalid API key) and call AI endpoints. Observe that the system returns successful responses with mock data instead of errors. Run these tests on the UNFIXED code to document the problematic behavior.

**Test Cases**:
1. **Mock Mode Test**: Set `AI_MODE=mock`, call `/api/pitch/question` endpoint → will succeed with mock question (should fail)
2. **Missing API Key Test**: Remove `GROK_API_KEY` from .env, call `/api/pitch/evaluate` endpoint → will succeed with mock evaluation (should fail with 500)
3. **Invalid API Key Test**: Set `GROK_API_KEY=invalid_key_xxx`, call `/api/pitch/question` endpoint → will succeed with mock question after fallback (should fail with 500)
4. **Health Check Mock Mode Test**: Set `AI_MODE=mock`, call `/api/health` → returns `aiConfigured: true` (should return `aiConfigured: false`)
5. **Startup Log Test**: Start server with no API key → logs warning but continues (correct log, but should also fail API calls)

**Expected Counterexamples**:
- All AI endpoints return HTTP 200 with mock data when they should return error responses
- Health check reports system is configured when it actually isn't
- Console shows "[MOCK]" or "[GROK → FALLBACK]" log messages
- Possible causes: AI_MODE branching, withFallback silent error handling, isFallbackError always returns true

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (mock mode or API failures), the fixed system produces error responses instead of mock data.

**Pseudocode:**
```
FOR ALL systemState WHERE isBugCondition(systemState, apiCall) DO
  response := callAIEndpoint_fixed(systemState, apiCall)
  ASSERT response.statusCode IN [429, 500, 503]
  ASSERT response.body contains descriptive error message
  ASSERT response.body does NOT contain mock data structure
END FOR
```

**Concrete Test Cases**:
1. Missing API Key → HTTP 500, message: "AI service not configured"
2. Invalid API Key (401 from Grok) → HTTP 500, message: "Invalid Grok API key"
3. Rate Limit (429 from Grok) → HTTP 429, message: "AI service rate limit reached"
4. Server Error (503 from Grok) → HTTP 503, message: "AI service temporarily unavailable"
5. Network Timeout → HTTP 503, message: "Failed to connect to AI service"
6. Health Check without Key → `{ aiConfigured: false, warning: "..." }`

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (valid API key with successful responses), the fixed system produces the same results as the original system in grok mode.

**Pseudocode:**
```
FOR ALL systemState WHERE NOT isBugCondition(systemState, apiCall) DO
  ASSERT aiService_original_grokMode(systemState, apiCall) = aiService_fixed(systemState, apiCall)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (different pitch data, questions, answers)
- It catches edge cases that manual unit tests might miss (unusual characters, long inputs, empty fields)
- It provides strong guarantees that AI behavior is unchanged for all valid API scenarios

**Test Plan**: First, capture baseline behavior from the UNFIXED code running in grok mode with a valid API key. Record the types of responses, JSON schemas, and value ranges. Then write property-based tests that verify the fixed code produces equivalent responses across many randomly generated inputs.

**Test Cases**:
1. **Question Generation Preservation**: Observe that valid API calls to generateInvestorQuestion return well-formed questions on unfixed code, then verify fixed code returns questions with same schema and quality across 100+ random pitch data inputs
2. **Answer Evaluation Preservation**: Observe that evaluateAnswer returns scores and feedback on unfixed code, then verify fixed code preserves score ranges (0-100), reaction formats, and JSON structure across varied answer inputs
3. **Deal Meter Preservation**: Observe that getDealMeterDelta returns integers from -10 to 10 on unfixed code, then verify fixed code maintains same range and calculation logic
4. **Final Verdict Preservation**: Observe that generateFinalVerdict produces complete verdicts with investor scores, fixes, and offers on unfixed code, then verify fixed code produces equivalent verdicts across different round histories
5. **Hint Generation Preservation**: Observe that generateHint returns contextual hints on unfixed code, then verify fixed code maintains hint quality and format

### Unit Tests

- Test error classification logic: each error type (401, 429, 5xx, timeout, network) maps to correct HTTP status and message
- Test that `callGrok` is called directly without fallback wrapper
- Test that missing API key throws error with "not configured" message
- Test health check reports `aiConfigured: false` when key is missing/invalid
- Test startup logging outputs warning when key is not configured

### Property-Based Tests

**Fix Checking (Buggy Input Domain)**:
- Generate random error scenarios (missing keys, invalid keys, various HTTP error codes) → verify all produce appropriate error responses, never mock data
- Generate random pitch data with misconfigured API → verify all AI endpoints return errors consistently

**Preservation Checking (Valid Input Domain)**:
- Generate random valid pitch data (startup names, one-liners, problems, solutions with varied lengths and characters) → verify question generation produces well-formed questions with valid JSON schema
- Generate random question-answer pairs → verify evaluation produces scores in 0-100 range with required feedback fields
- Generate random round histories (different numbers of rounds, varying scores) → verify final verdicts maintain investor score logic and offer generation rules
- Generate random investor-question combinations → verify hint generation maintains format and context appropriateness

### Integration Tests

- **Full Pitch Flow with Valid Key**: Start server with valid `GROK_API_KEY`, submit complete pitch through all three investor rounds, verify all AI responses are generated correctly and match expected schemas
- **Error Propagation Test**: Start server with invalid API key, attempt pitch flow, verify frontend receives appropriate error responses at each step
- **Configuration Switch Test**: Stop server, change API key from valid to invalid, restart, verify behavior switches from success to error responses
- **Health Check Integration**: Test that frontend can use health check endpoint to detect configuration issues before attempting pitch

