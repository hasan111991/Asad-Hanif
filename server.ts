import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'PP-203 & Chichawatni City Management API',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  app.post('/api/city-assistant', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server environment.',
          fallbackRequired: true
        });
      }

      const body = req.body as {
        question?: string;
        userRole?: string;
        contextSummary?: unknown;
      };

      const question = (body.question || '').trim();
      if (!question) {
        return res.status(400).json({ error: 'Please provide an analytical question.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = [
        'You are the Chichawatni City Planning & Development Assistant for authorized administrators (PP-203 / Tehsil Chichawatni, 2027-2030 Master Plan).',
        'STRICT VERIFICATION & ANTI-FABRICATION RULES:',
        '1. Base EVERY factual statement exclusively on the JSON records provided in the GROUNDED_FIRESTORE_CONTEXT.',
        '2. Cite exact record IDs (e.g., [ID: cp-2027-01], [ID: rd-01], [ID: cmp-203]) and dates whenever referencing projects, roads, budgets, complaints, facilities, or surveys.',
        '3. Clearly distinguish between: (a) Verified/Approved/Completed facts, (b) Proposed/Pending/Requested plans, and (c) Missing or insufficient data.',
        '4. NEVER invent PKR costs, budgets, approvals, dates, completion percentages, GPS coordinates, or statistics not present in GROUNDED_FIRESTORE_CONTEXT.',
        '5. Explicitly note that AI cannot independently approve projects, authorize funds, or alter official municipal records.',
        '6. If the provided context has 0 matching records or insufficient information to answer part of the question, state that clearly and instruct the administrator which module needs verified data entry.'
      ].join('\n');

      const userPrompt = [
        `Administrator Role: ${body.userRole || 'Authorized Admin'}`,
        `Question: ${question}`,
        '',
        'GROUNDED_FIRESTORE_CONTEXT (JSON):',
        JSON.stringify(body.contextSummary || {}, null, 2)
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction
        }
      });

      const answer = response.text || 'No response generated from Gemini.';
      return res.json({
        answer,
        model: 'gemini-4-hydrogen',
        generatedAt: new Date().toISOString()
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query Gemini API.';
      console.error('City Assistant server error:', msg);
      return res.status(500).json({ error: msg });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PP-203 & Chichawatni City Management server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
