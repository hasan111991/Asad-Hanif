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

  // Server-side validation guard for voluntary citizen network registration
  app.post('/api/citizen/validate-registration', (req, res) => {
    const payload = (req.body || {}) as Record<string, unknown>;
    const forbiddenFields = ['cnic', 'nic', 'nationalId', 'homeAddress', 'streetAddress', 'familyMembers', 'password'];
    for (const key of forbiddenFields) {
      if (key in payload && payload[key]) {
        return res.status(400).json({
          valid: false,
          error: `Prohibited sensitive field "${key}" must never be collected or stored.`
        });
      }
    }

    const fullName = String(payload.fullName || '').trim();
    const rawPhone = String(payload.phone || '').replace(/[\s\-()]/g, '');
    const cityLocality = String(payload.cityLocality || '').trim();
    const email = String(payload.email || '').trim();

    if (fullName.length < 2 || fullName.length > 120) {
      return res.status(400).json({ valid: false, error: 'Full name must be between 2 and 120 characters.' });
    }
    if (cityLocality.length < 2 || cityLocality.length > 160) {
      return res.status(400).json({ valid: false, error: 'City or locality must be specified.' });
    }

    let phoneE164 = rawPhone;
    if (/^03\d{9}$/.test(rawPhone)) {
      phoneE164 = `+92${rawPhone.slice(1)}`;
    } else if (/^923\d{9}$/.test(rawPhone)) {
      phoneE164 = `+${rawPhone}`;
    } else if (!/^\+[1-9]\d{7,14}$/.test(rawPhone)) {
      return res.status(400).json({
        valid: false,
        error: 'Enter a valid Pakistani mobile number (e.g. 0300-1234567) or international E.164 number.'
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ valid: false, error: 'Invalid email address format.' });
    }

    if (payload.nonPoliticalStatementAccepted !== true || payload.privacyPolicyAccepted !== true) {
      return res.status(400).json({
        valid: false,
        error: 'Explicit voluntary civic privacy & non-political consent acknowledgement is required.'
      });
    }

    return res.json({ valid: true, phoneE164 });
  });

  // Consent-verified multi-channel communication dispatch (WhatsApp Business API, SMS Gateway, Email, In-App)
  app.post('/api/citizen/communications/dispatch', async (req, res) => {
    try {
      const body = (req.body || {}) as {
        channel?: 'WhatsApp' | 'SMS' | 'Email' | 'In-App';
        consentCategory?: string;
        subject?: string;
        messageBody?: string;
        recipients?: {
          uid: string;
          name: string;
          phoneE164?: string;
          email?: string;
          consentVerified?: boolean;
          channelOptIn?: boolean;
          unsubscribedAll?: boolean;
        }[];
      };

      const channel = body.channel;
      const messageBody = String(body.messageBody || '').trim();
      const subject = String(body.subject || 'Chichawatni City Update').trim();
      const recipients = Array.isArray(body.recipients) ? body.recipients : [];

      if (!channel || !['WhatsApp', 'SMS', 'Email', 'In-App'].includes(channel)) {
        return res.status(400).json({ error: 'Invalid communication channel.' });
      }
      if (!messageBody) {
        return res.status(400).json({ error: 'Message content cannot be empty.' });
      }
      if (recipients.length === 0) {
        return res.status(400).json({ error: 'No eligible recipients provided.' });
      }

      const waToken = process.env.WHATSAPP_CLOUD_TOKEN;
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const smsGatewayUrl = process.env.SMS_GATEWAY_URL;
      const smsApiKey = process.env.SMS_GATEWAY_API_KEY;
      const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL;

      const results: {
        uid: string;
        deliveryStatus: 'Sent' | 'Delivered' | 'Failed' | 'Skipped - No Consent' | 'Simulated - Gateway Pending';
        failedReason?: string;
      }[] = [];

      for (const r of recipients) {
        // Strict server-side consent & unsubscribe gate: never send without explicit opt-in
        if (r.unsubscribedAll || !r.consentVerified || !r.channelOptIn) {
          results.push({
            uid: r.uid,
            deliveryStatus: 'Skipped - No Consent',
            failedReason: 'Missing category consent, channel opt-in, or user unsubscribed.'
          });
          continue;
        }

        if (channel === 'In-App') {
          results.push({ uid: r.uid, deliveryStatus: 'Delivered' });
          continue;
        }

        if (channel === 'WhatsApp') {
          if (waToken && waPhoneId && r.phoneE164) {
            try {
              const resp = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${waToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: r.phoneE164.replace(/^\+/, ''),
                  type: 'text',
                  text: { body: `${subject}\n\n${messageBody}` }
                })
              });
              if (resp.ok) {
                results.push({ uid: r.uid, deliveryStatus: 'Sent' });
              } else {
                const errText = await resp.text();
                results.push({ uid: r.uid, deliveryStatus: 'Failed', failedReason: errText.slice(0, 200) });
              }
            } catch (e: unknown) {
              results.push({
                uid: r.uid,
                deliveryStatus: 'Failed',
                failedReason: e instanceof Error ? e.message : 'WhatsApp API error'
              });
            }
          } else {
            results.push({
              uid: r.uid,
              deliveryStatus: 'Simulated - Gateway Pending',
              failedReason: 'WhatsApp Business Cloud API credentials not yet configured in environment.'
            });
          }
          continue;
        }

        if (channel === 'SMS') {
          if (smsGatewayUrl && r.phoneE164) {
            try {
              const resp = await fetch(smsGatewayUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(smsApiKey ? { Authorization: `Bearer ${smsApiKey}` } : {})
                },
                body: JSON.stringify({ to: r.phoneE164, message: messageBody })
              });
              if (resp.ok) {
                results.push({ uid: r.uid, deliveryStatus: 'Sent' });
              } else {
                results.push({ uid: r.uid, deliveryStatus: 'Failed', failedReason: `HTTP ${resp.status}` });
              }
            } catch (e: unknown) {
              results.push({
                uid: r.uid,
                deliveryStatus: 'Failed',
                failedReason: e instanceof Error ? e.message : 'SMS gateway error'
              });
            }
          } else {
            results.push({
              uid: r.uid,
              deliveryStatus: 'Simulated - Gateway Pending',
              failedReason: 'SMS gateway endpoint not yet configured in environment.'
            });
          }
          continue;
        }

        if (channel === 'Email') {
          if (emailWebhookUrl && r.email) {
            try {
              const resp = await fetch(emailWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: r.email, subject, text: messageBody })
              });
              if (resp.ok) {
                results.push({ uid: r.uid, deliveryStatus: 'Sent' });
              } else {
                results.push({ uid: r.uid, deliveryStatus: 'Failed', failedReason: `HTTP ${resp.status}` });
              }
            } catch (e: unknown) {
              results.push({
                uid: r.uid,
                deliveryStatus: 'Failed',
                failedReason: e instanceof Error ? e.message : 'Email gateway error'
              });
            }
          } else if (!r.email) {
            results.push({
              uid: r.uid,
              deliveryStatus: 'Failed',
              failedReason: 'Citizen profile has no email address on file.'
            });
          } else {
            results.push({
              uid: r.uid,
              deliveryStatus: 'Simulated - Gateway Pending',
              failedReason: 'Email dispatch webhook not yet configured in environment.'
            });
          }
        }
      }

      return res.json({
        ok: true,
        processed: results.length,
        results
      });
    } catch (err: unknown) {
      return res.status(500).json({
        error: err instanceof Error ? err.message : 'Communication dispatch failed.'
      });
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
