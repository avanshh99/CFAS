// ============================================================
// server/proxy.ts — Express proxy server for Groq API
// ============================================================

import express from 'express';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from project root .env
// process.cwd() works in both CommonJS and ESM — no __dirname needed
dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for frontend development
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiter: max 20 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/chat', limiter);

const apiKey = process.env.GROQ_API_KEY || '';

// Fallback logic when API key is missing
let groq: Groq | null = null;
if (apiKey && apiKey !== 'YOUR_GROQ_API_KEY_HERE') {
  groq = new Groq({ apiKey });
} else {
  // eslint-disable-next-line no-console
  console.warn('WARNING: GROQ_API_KEY is not configured. Proxy will return fallback simulated responses.');
}

app.post('/api/chat', async (req, res) => {
  const { messages, stream = true } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages array', code: 'INVALID_REQUEST' });
  }

  // Handle case where Groq key is missing (simulate response)
  if (!groq) {
    // eslint-disable-next-line no-console
    console.log('Using simulated fallback response...');
    
    // Extract last user message to give a context-aware mock reply
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    let mockReply = 'Hello! I am EcoSense AI, operating in offline/demo mode. ';

    if (lastUserMsg.toLowerCase().includes('reduce') || lastUserMsg.toLowerCase().includes('what should i do')) {
      mockReply += `Here are 3 recommended actions for you:
1. **Reduce travel emissions**: Switch to Delhi Metro or train for short trips. (Saves ~28 kg CO₂/month)
2. **Optimize home cooling**: Adjust AC to 26°C and clean filters monthly. (Saves ~15 kg CO₂/month)
3. **Food choices**: Shift to a plant-based diet for 3 days a week. (Saves ~18 kg CO₂/month)
These are easy and highly effective in the Indian context!`;
    } else if (lastUserMsg.toLowerCase().includes('compare')) {
      mockReply += `Compared to the national average of 1.8 tonnes per year (India) and the global average of 4.8 tonnes per year, your projected footprint shows room for positive shifts. Try checking the comparison chart on the Dashboard or Insights pages!`;
    } else {
      mockReply += `I received your message: "${lastUserMsg}". To enable full real-world AI suggestions, please add your Groq API key (starts with "gsk_") to your \`.env\` file in the root directory.`;
    }

    if (!stream) {
      return res.json({
        choices: [{ message: { role: 'assistant', content: mockReply } }],
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream mock reply character-by-character or chunk-by-chunk
    const words = mockReply.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = {
        choices: [
          {
            delta: {
              content: words[i] + (i === words.length - 1 ? '' : ' '),
            },
          },
        ],
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    if (!stream) {
      // Non-streaming completions (e.g. for generating insights json)
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.2, // lower temperature for cleaner JSON structures
      });
      return res.json(completion);
    }

    // Streaming completions
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chatCompletionStream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      max_tokens: 400,
      temperature: 0.7,
    });

    for await (const chunk of chatCompletionStream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Groq API Error:', error);
    res.status(500).json({ error: error.message || 'Groq completion error', code: 'GROQ_API_ERROR' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`EcoSense proxy server running on http://localhost:${PORT}`);
});
