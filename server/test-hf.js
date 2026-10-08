require('dotenv').config();
const { HfInference } = require('@huggingface/inference');
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

console.log('Testing FREE Hugging Face Inference API...');

// Use a model that works on the free tier
hf.textGeneration({
  model: 'google/flan-t5-large',
  inputs: 'Answer in JSON format. What is 2 plus 2?',
  parameters: {
    max_new_tokens: 100,
    temperature: 0.7
  }
}).then(r => {
  console.log('SUCCESS!');
  console.log('Response:', r.generated_text);
}).catch(e => {
  console.error('ERROR:', e.message);
});
