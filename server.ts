import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { evaluateTransactionRisk } from './functions/riskEngine';
import { generateLlmRiskExplanation, maskPhoneNumber, maskName, sanitizeUserText } from './functions/llmExplain';
import { analyzeScamMessage } from './functions/scamChecker';
import { categorizeTransaction } from './functions/categorizer';
import { generateSeedData } from './functions/seedData';
import { generateFairPayoutOrderAi, generateEarlyWarningAi } from './functions/somitiAi';
import { analyzeSellerTrustAi } from './functions/trustPayAi';
import { generateLiquidityForecastAi } from './functions/liquidityAi';
import { generateBundleRecommendationAi } from './functions/bundleOptimizerAi';
import { normalizeDialectWithGemini } from './functions/dialectVoiceAi';
import { parseMandateInstructionWithGemini } from './functions/mandateParserAi';
import { auditPayslipWithGemini } from './functions/payslipAuditorAi';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// In-memory persistent state initialized with rich seed data
let seedStorage = generateSeedData();

// Shared Gemini SDK client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Upay Safe API', timestamp: new Date().toISOString() });
});

// 2. Initial seed data fetch
app.get('/api/seed', (req, res) => {
  res.json(seedStorage);
});

// 3. Reset seed data
app.post('/api/seed/reset', (req, res) => {
  seedStorage = generateSeedData();
  res.json({ success: true, message: 'Data reset to fresh synthetic baseline' });
});

// 4. Pre-Transaction Safety & Risk Check (Core Differentiator)
app.post('/api/safety/risk-check', async (req, res) => {
  try {
    const {
      transactionId = `tx_${Date.now()}`,
      userId,
      amount,
      recipientPhone,
      recipientName,
      note,
      isNewDevice,
      isNewLocation,
      userBaselineAvgAmount,
      recentTransactions
    } = req.body;

    const sanitizedNote = sanitizeUserText(note);

    const evaluation = evaluateTransactionRisk({
      transactionId,
      userId,
      amount: Number(amount) || 0,
      recipientPhone: recipientPhone || '',
      recipientName,
      note: sanitizedNote,
      userBaselineAvgAmount: userBaselineAvgAmount || 1200,
      userRecentTransactions: recentTransactions || seedStorage.transactions,
      isNewDevice,
      isNewLocation
    });

    const maskedRecipient = maskPhoneNumber(recipientPhone);
    const maskedRecipientName = maskName(recipientName);

    const explanation = await generateLlmRiskExplanation({
      maskedRecipient,
      maskedRecipientName,
      amount: Number(amount),
      riskScore: evaluation.score,
      riskLevel: evaluation.level,
      signals: evaluation.signals,
      sanitizedNote
    });

    if (evaluation.level === 'high') {
      const queueItem = {
        id: `queue_${Date.now()}`,
        transactionId,
        userName: 'MD. AL-MAYNUL HASAN',
        userPhone: '01794809461',
        recipientPhone: recipientPhone || '',
        recipientName: recipientName || 'নতুন প্রাপক',
        amount: Number(amount),
        riskScore: evaluation.score,
        riskLevel: evaluation.level,
        signals: evaluation.signals.map(s => s.labelBn),
        status: 'pending' as const,
        timestamp: new Date().toISOString()
      };
      seedStorage.analystQueue.unshift(queueItem);
    }

    res.json({
      transactionId,
      riskScore: evaluation.score,
      riskLevel: evaluation.level,
      signals: evaluation.signals,
      explanationBn: explanation.explanationBn,
      explanationEn: explanation.explanationEn,
      actionAdviceBn: explanation.actionAdviceBn,
      actionAdviceEn: explanation.actionAdviceEn,
      coolingPeriodSeconds: evaluation.coolingPeriodSeconds,
      suggestSmallTest: evaluation.suggestSmallTest,
      baselineDiffPct: evaluation.baselineDiffPct,
      recipientTrustScore: evaluation.recipientTrustScore
    });
  } catch (error: any) {
    console.error('Error during risk check:', error);
    res.status(500).json({ error: error.message || 'Risk check failed' });
  }
});

// 5. Scam Message / Link Checker
app.post('/api/safety/scam-check', (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }
    const result = analyzeScamMessage(message);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Scam analysis failed' });
  }
});

// 6. Transcribe Audio using model gemini-3.5-transcribe
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', prompt } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({ text: 'চা-নাস্তা ৫০ টাকা (ডেমো ট্রান্সক্রিপশন)' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: prompt || 'Transcribe the spoken audio word for word. If spoken in Bengali, transcribe in accurate Bengali script.' }
        ]
      }
    });

    res.json({ text: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message || 'Audio transcription failed' });
  }
});

// 7. Search Grounding using gemini-3.5-flash with googleSearch tool
app.post('/api/ai/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        text: 'বাংলাদেশ ব্যাংকের সর্বশেষ নির্দেশনা অনুযায়ী যে কোনো এমএফএস অ্যাকাউন্টের পিন সম্পূর্ণ ব্যক্তিগত।',
        sources: []
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are Upay Safe Intelligence. Answer this financial security or MFS query accurately in Bengali using up-to-date Google Search: "${query}"`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    res.json({
      text: response.text || '',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
      sources
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    res.status(500).json({ error: error.message || 'Search grounding failed' });
  }
});

// 8. Maps Grounding using gemini-3.5-flash with googleMaps tool
app.post('/api/ai/maps-grounding', async (req, res) => {
  try {
    const { locationQuery } = req.body;
    if (!locationQuery) {
      return res.status(400).json({ error: 'Location query is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        text: 'নিকটস্থ উপায় এজেন্ট: ফার্মগেট বাসস্ট্যান্ড সংলগ্ন মোড়, ঢাকা।',
        sources: []
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Find nearby Upay cash-out agent points, ATM booths, or UCB bank branches for this location in Bangladesh: "${locationQuery}". Provide exact address, operating hours, and helpful landmarks in Bengali.`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    res.json({
      text: response.text || '',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    res.status(500).json({ error: error.message || 'Maps grounding failed' });
  }
});

// Bundle Optimizer AI Recommendation
app.post('/api/bundle/optimize', async (req, res) => {
  try {
    const habits = req.body;
    const ai = getAiClient();
    const result = await generateBundleRecommendationAi(ai, habits);
    res.json(result);
  } catch (err: any) {
    console.error('Bundle optimize error:', err);
    res.status(500).json({ error: err.message || 'Optimization failed' });
  }
});

// Dialect-aware Voice Normalization
app.post('/api/voice/dialect-normalize', async (req, res) => {
  try {
    const { spokenText } = req.body;
    const ai = getAiClient();
    const result = await normalizeDialectWithGemini(ai, spokenText || '');
    res.json(result);
  } catch (err: any) {
    console.error('Dialect normalize error:', err);
    res.status(500).json({ error: err.message || 'Dialect normalization failed' });
  }
});

// Mandate Wallet AI Instruction Parser (Parses rules ONLY, strictly NO execution)
app.post('/api/mandate/parse', async (req, res) => {
  try {
    const { instruction } = req.body;
    const ai = getAiClient();
    const result = await parseMandateInstructionWithGemini(ai, instruction || '');
    res.json(result);
  } catch (err: any) {
    console.error('Mandate parse error:', err);
    res.status(500).json({ error: err.message || 'Mandate parse failed' });
  }
});

// Payslip Auditor AI for Factory Workers
app.post('/api/payslip/audit', async (req, res) => {
  try {
    const { payslip } = req.body;
    const ai = getAiClient();
    const result = await auditPayslipWithGemini(ai, payslip);
    res.json(result);
  } catch (err: any) {
    console.error('Payslip audit error:', err);
    res.status(500).json({ error: err.message || 'Payslip audit failed' });
  }
});

// 9. Multi-Turn Gemini Chatbot with selectable models
app.post('/api/ai/multi-turn-chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.5-flash', systemInstruction } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: 'আপনার উপায় অ্যাকাউন্ট সম্পূর্ণ সুরক্ষিত। কোনো সন্দেহজনক লিংকে পিন দেবেন না।'
      });
    }

    // Map messages to Gemini contents format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    let modelToUse = model || 'gemini-3.5-flash';
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelToUse,
        contents,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are Upay Safe AI Assistant (উপায় সেফ সহকারী), a knowledgeable, respectful, concise Bengali financial assistant. Keep advice clear, reassuring, and always advise users never to share their PIN.'
        }
      });
    } catch (modelErr) {
      console.warn(`Model ${modelToUse} failed, falling back to gemini-3.8-flash`);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are Upay Safe AI Assistant (উপায় সেফ সহকারী), a knowledgeable, respectful, concise Bengali financial assistant. Keep advice clear, reassuring, and always advise users never to share their PIN.'
        }
      });
    }

    res.json({
      reply: response.text?.trim() || ''
    });
  } catch (error: any) {
    console.error('Multi-turn chat error:', error);
    res.status(500).json({ error: error.message || 'Chatbot request failed' });
  }
});

// 10. Simple Chat Q&A endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { question, userContext } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: 'আপনার তথ্য সংরক্ষিত রয়েছে। লেনদেনের নিরাপত্তা নিশ্চিত করতে আপনার পিন নম্বর কখনোই কাউকে জানাবেন না।'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are Upay Safe Assistant in Bengali. Balance: ৳${userContext?.balance || 18450}. User Question: "${question}". Answer politely in 2-3 sentences. Never ask for PIN.`
    });

    res.json({ reply: response.text?.trim() || 'নিরাপদ লেনদেন করুন।' });
  } catch (error: any) {
    res.json({ reply: 'বর্তমানে সেবা প্রক্রিয়াধীন।' });
  }
});

// 11. Auto Category Classifier
app.post('/api/safety/categorize', (req, res) => {
  const { note, recipientName, type } = req.body;
  const result = categorizeTransaction(note, recipientName, type);
  res.json(result);
});

// 12. Analyst Queue Actions
app.post('/api/analyst/queue-action', (req, res) => {
  const { queueId, action, notes } = req.body;
  const item = seedStorage.analystQueue.find(q => q.id === queueId);
  if (!item) {
    return res.status(404).json({ error: 'Queue item not found' });
  }

  if (action === 'dismiss') item.status = 'dismissed';
  if (action === 'escalate') item.status = 'escalated';
  if (action === 'review') item.status = 'reviewed';
  if (notes) item.analystNotes = notes;

  res.json({ success: true, item });
});

// 13. Alert Feedback & Scam Confirmation
app.post('/api/safety/feedback', (req, res) => {
  const { transactionId, feedback, isScam } = req.body;
  const tx = seedStorage.transactions.find(t => t.id === transactionId);
  if (tx) {
    if (feedback) tx.feedbackGiven = feedback;
    if (isScam !== undefined) tx.isScamConfirmed = isScam;
  }
  res.json({ success: true });
});

// 14. Digital Somiti: AI Fair Payout Order Generator
app.post('/api/somiti/ai-payout-order', async (req, res) => {
  try {
    const { somitiName, members, monthlyContribution, totalCycles } = req.body;
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Members list is required' });
    }

    const ai = getAiClient();
    const result = await generateFairPayoutOrderAi(ai, {
      somitiName: somitiName || 'ডিজিটাল সমিতি',
      members,
      monthlyContribution: Number(monthlyContribution) || 2000,
      totalCycles: Number(totalCycles) || members.length
    });

    res.json(result);
  } catch (error: any) {
    console.error('Somiti payout order error:', error);
    res.status(500).json({ error: error.message || 'Somiti payout generation failed' });
  }
});

// 15. Digital Somiti: Early Warning Check
app.post('/api/somiti/early-warning-check', async (req, res) => {
  try {
    const { memberName, somitiName, dueAmount, daysRemaining, walletBalance } = req.body;
    const ai = getAiClient();
    const warning = await generateEarlyWarningAi(ai, {
      memberName: memberName || 'সদস্য',
      somitiName: somitiName || 'সমিতি',
      dueAmount: Number(dueAmount) || 2000,
      daysRemaining: Number(daysRemaining) || 3,
      walletBalance: Number(walletBalance) || 0
    });

    res.json(warning);
  } catch (error: any) {
    console.error('Somiti early warning error:', error);
    res.status(500).json({ error: error.message || 'Early warning check failed' });
  }
});

// 16. TrustPay: AI Seller Trust Badge Analysis
app.post('/api/trustpay/seller-trust', async (req, res) => {
  try {
    const {
      sellerName = 'বিক্রেতা',
      sellerPhone = '',
      fCommercePage = '',
      totalOrders = 45,
      successfulDeliveries = 42,
      disputeCount = 1,
      averageDeliveryDays = 2.5,
      customerRating = 4.6,
      accountAgeMonths = 14
    } = req.body;

    const ai = getAiClient();
    const result = await analyzeSellerTrustAi(ai, {
      sellerName,
      sellerPhone,
      fCommercePage,
      totalOrders: Number(totalOrders) || 0,
      successfulDeliveries: Number(successfulDeliveries) || 0,
      disputeCount: Number(disputeCount) || 0,
      averageDeliveryDays: Number(averageDeliveryDays) || 3,
      customerRating: Number(customerRating) || 4.5,
      accountAgeMonths: Number(accountAgeMonths) || 12
    });

    res.json(result);
  } catch (error: any) {
    console.error('TrustPay seller analysis error:', error);
    res.status(500).json({ error: error.message || 'Seller trust analysis failed' });
  }
});

// 17. Liquidity Network: AI Agent Float & Shortage Forecast
app.post('/api/liquidity/forecast', async (req, res) => {
  try {
    const {
      agentName = 'বিসমিল্লাহ টেলিকম (ফার্মগেট)',
      location = 'ফার্মগেট বাসস্ট্যান্ড, ঢাকা',
      eFloatBalance = 120000,
      cashInHand = 18000,
      timeOfDay = 'সন্ধ্যা ৭:৩০',
      dayOfWeek = 'বৃহস্পতিবার',
      recentCashOutVolume = 35000,
      recentCashInVolume = 8000
    } = req.body;

    const ai = getAiClient();
    const result = await generateLiquidityForecastAi(ai, {
      agentName,
      location,
      eFloatBalance: Number(eFloatBalance) || 0,
      cashInHand: Number(cashInHand) || 0,
      timeOfDay,
      dayOfWeek,
      recentCashOutVolume: Number(recentCashOutVolume) || 0,
      recentCashInVolume: Number(recentCashInVolume) || 0
    });

    res.json(result);
  } catch (error: any) {
    console.error('Liquidity forecast error:', error);
    res.status(500).json({ error: error.message || 'Liquidity forecast failed' });
  }
});

// WebSocket Server for Gemini-3.8-Live Real-Time Voice Conversation
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Gemini Live voice stream');
  const ai = getAiClient();
  if (!ai) {
    clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
    clientWs.close();
    return;
  }

  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction:
          'You are Upay Safe Live Voice Guardian. You speak fluent Bengali (বাংলা). You help Bangladeshi users verify transactions, check for scams, and manage their finances via real-time speech. Speak naturally and warmly in Bengali.'
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (text && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ text }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close();
          }
        }
      }
    });

    clientWs.on('message', (data: Buffer | string) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      } catch (err) {
        console.error('Error parsing client audio frame:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
    });
  } catch (liveErr) {
    console.error('Gemini Live session error:', liveErr);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'Failed to connect to Live session' }));
      clientWs.close();
    }
  }
});

// Upgrade HTTP to WS for /live
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Fallback for unmatched /api routes to prevent Vite SPA HTML fallback from returning on API requests
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Global error handler for /api routes
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express API Error:', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Upay Safe server running on port ${PORT}`);
  });
}

startServer();
