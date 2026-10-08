/**
 * huggingfaceClient.js
 * Using OpenAI SDK with Hugging Face API endpoints (compatible interface)
 */

const OpenAI = require('openai');

const MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
const TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '60000', 10);

let _client = null;

const getClient = () => {
  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY.includes('your_')) {
    const err = new Error('HUGGINGFACE_API_KEY is not configured. Please add your Hugging Face API key to the .env file.');
    err.status = 503;
    throw err;
  }
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      baseURL: 'https://api-inference.huggingface.co/v1/',
      timeout: TIMEOUT_MS,
    });
  }
  return _client;
};

/**
 * Call Hugging Face using OpenAI-compatible interface
 */
const callHuggingFace = async (messages, maxTokens = 500, temperature = 0.7) => {
  const client = getClient();

  try {
    console.log(`🤖 Calling Hugging Face via OpenAI SDK (${MODEL})...`);
    
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });
    
    const raw = response.choices[0].message.content;
    console.log('✅ Hugging Face response received');
    
    try {
      // Remove markdown code blocks if present
      let cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Look for JSON in the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No JSON found in response');
    } catch (parseErr) {
      console.error('Failed to parse JSON response:', raw?.slice(0, 300));
      const err = new Error('AI service returned invalid response. Please try again.');
      err.status = 502;
      throw err;
    }
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    const status = err.status || err.statusCode || (err.response && err.response.status);

    // Map API errors to appropriate HTTP status codes
    if (status === 429 || msg.includes('rate limit')) {
      const newErr = new Error('Hugging Face API is rate limited. Please try again in a few moments.');
      newErr.status = 429;
      throw newErr;
    }
    if (status === 402 || status === 403 || msg.includes('credit') || msg.includes('quota') || msg.includes('billing')) {
      const newErr = new Error('Hugging Face requires credits. Purchase at https://huggingface.co/settings/inference-providers (starts at $5).');
      newErr.status = 402;
      throw newErr;
    }
    if (status === 401) {
      const newErr = new Error('Hugging Face API authentication failed. Please check your API key.');
      newErr.status = 503;
      throw newErr;
    }
    if (status >= 500) {
      const newErr = new Error('Hugging Face service is temporarily unavailable. Please try again.');
      newErr.status = 503;
      throw newErr;
    }
    if (msg.includes('timeout') || msg.includes('timed out') || err.code === 'ETIMEDOUT') {
      const newErr = new Error('AI request timed out. The model might be loading. Please try again.');
      newErr.status = 504;
      throw newErr;
    }
    if (msg.includes('model') && msg.includes('loading')) {
      const newErr = new Error('Model is loading (cold start). Please try again in 30-60 seconds.');
      newErr.status = 503;
      throw newErr;
    }

    // Unknown error
    console.error('Hugging Face API error:', err.message);
    const newErr = new Error(err.message || 'AI service error. Please try again.');
    newErr.status = 500;
    throw newErr;
  }
};

module.exports = { callHuggingFace, MODEL };
