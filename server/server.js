require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const pitchRoutes = require('./routes/pitch');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? '*' : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));

// Handle payload too large gracefully
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Input is too long. Please shorten your pitch and try again.' });
  }
  next(err);
});

// Serve static React build in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Routes
app.use('/api', pitchRoutes);

app.get('/api/health', (req, res) => {
  const apiKeyConfigured = !!process.env.HUGGINGFACE_API_KEY && !process.env.HUGGINGFACE_API_KEY.includes('your_');
  res.json({
    status: 'ok',
    message: 'Shark Tank AI server is running',
    timestamp: new Date().toISOString(),
    aiProvider: 'Mock AI (Demo Mode)',
    mode: 'mock',
    aiConfigured: true,
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve React app for all non-API routes in production
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error. Please try again.',
  });
});

app.listen(PORT, () => {
  console.log(`?? Shark Tank AI server running on port ${PORT}`);
  console.log(`?? Health check: http://localhost:${PORT}/api/health`);
  
  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY.includes('your_')) {
    console.error('? ERROR: HUGGINGFACE_API_KEY is not configured!');
    console.error('   Add your Hugging Face API key to server/.env');
    console.error('   Get your key at: https://huggingface.co/settings/tokens');
  } else {
    console.log('? Hugging Face API key configured');
    console.log(`?? Model: ${process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.1-8B-Instruct'}`);
  }
});

