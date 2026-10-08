import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const checkHealth = () => api.get('/health');
export const startPitch = (pitchData) => api.post('/start-pitch', pitchData);
export const evaluateAnswer = (payload) => api.post('/evaluate-answer', payload);
export const getFinalVerdict = (payload) => api.post('/final-verdict', payload);
export const getHint = (payload) => api.post('/hint', payload);
export const getDealMeter = (payload) => api.post('/deal-meter', payload);

export default api;
