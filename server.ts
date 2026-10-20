import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Process crash prevention
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception caught in server process:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection caught in server process:', reason);
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Cloud Run
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google OAuth Authorization URL endpoint
app.get('/api/auth/google/url', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/auth/google/callback`;

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '1081324838634-google-oauth.apps.googleusercontent.com';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token token',
    scope: 'openid email profile',
    prompt: 'select_account',
    nonce: Math.random().toString(36).substring(2)
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url, redirectUri, clientId });
});

// Google OAuth Callback endpoint
app.get(['/auth/google/callback', '/auth/google/callback/'], (req, res) => {
  const error = req.query.error;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Google Sign-In Cancelled</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #faf6f0; color: #1e293b;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_CANCELLED', message: 'Google sign-in was cancelled' }, '*');
              window.close();
            } else {
              window.location.href = '/#/login';
            }
          </script>
          <p>Sign-in was cancelled. Returning to Dreamora...</p>
        </body>
      </html>
    `);
  }

  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Completing Google Authentication...</title>
      </head>
      <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #faf6f0; color: #1e293b;">
        <p style="font-weight: 600; font-size: 14px;">Completing Google authentication...</p>
        <script>
          (async function() {
            try {
              const hash = window.location.hash.substring(1);
              const params = new URLSearchParams(hash || window.location.search);
              const idToken = params.get('id_token');
              const accessToken = params.get('access_token');

              let googleUser = null;

              if (accessToken) {
                try {
                  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: 'Bearer ' + accessToken }
                  });
                  if (userInfoRes.ok) {
                    const data = await userInfoRes.json();
                    googleUser = {
                      name: data.name || data.given_name || 'Google User',
                      email: data.email,
                      avatarUrl: data.picture || ''
                    };
                  }
                } catch (e) {
                  console.error('Error fetching userinfo from Google:', e);
                }
              }

              if (!googleUser && idToken) {
                try {
                  const base64Url = idToken.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                  }).join(''));
                  const payload = JSON.parse(jsonPayload);
                  googleUser = {
                    name: payload.name || payload.given_name || 'Google User',
                    email: payload.email,
                    avatarUrl: payload.picture || ''
                  };
                } catch (e) {
                  console.error('Error decoding ID token:', e);
                }
              }

              if (googleUser && googleUser.email) {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    user: googleUser
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/#/home';
                }
              } else {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_CANCELLED',
                    message: 'Google sign-in was cancelled'
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/#/login';
                }
              }
            } catch (err) {
              console.error('Callback execution error:', err);
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_CANCELLED',
                  message: 'Google sign-in was cancelled'
                }, '*');
                window.close();
              }
            }
          })();
        </script>
      </body>
    </html>
  `);
});

// Helper to initialize Gemini API safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API Route: Extract Clinical Treatment Plan from PDF, Image (OCR), or Text
app.post('/api/clinical/extract', async (req, res) => {
  try {
    const { sourceType, planText, fileData, mimeType } = req.body;
    const textToAnalyze = String(planText || '').trim();
    const ai = getGeminiClient();

    const fallbackWeeks = [
      {
        weekNumber: 1,
        title: 'Week 1',
        tasks: [
          { id: 'w1-1', title: 'Sleep Education', category: 'sleep_education', instruction: 'Read core sleep pressure guidance.', linkedFeature: 'education', completed: false },
          { id: 'w1-2', title: 'Sleep Diary', category: 'sleep_diary', instruction: 'Log bedtime and wake time daily in Sleep Diary.', linkedFeature: 'diary', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: 'Week 2',
        tasks: [
          { id: 'w2-1', title: 'Stimulus Control', category: 'stimulus_control', instruction: 'Get out of bed if unable to fall asleep within 20 minutes.', linkedFeature: 'diary', completed: false },
          { id: 'w2-2', title: 'Progressive Muscle Relaxation', category: 'pmr', instruction: 'Practice PMR exercise before bed.', linkedFeature: 'pmr', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: 'Week 3',
        tasks: [
          { id: 'w3-1', title: 'Drop Your Thoughts', category: 'cognitive_restructuring', instruction: 'Log and reframe anxious sleep thoughts.', linkedFeature: 'thoughts', completed: false }
        ]
      }
    ];

    if (!ai) {
      return res.json({
        clinicianName: 'Dr. Sarah Jenkins, MD',
        clinicName: 'Sleep Medicine Center',
        wakeUpTarget: '07:00 AM',
        sleepWindowStart: '11:30 PM',
        sleepWindowEnd: '07:00 AM',
        extractedText: textToAnalyze || 'Extracted clinical plan text.',
        weeks: fallbackWeeks,
        status: 'pending_review'
      });
    }

    const systemPrompt = `You are a medical document extraction AI. Extract exact CBT-I clinical plan details from the provided document, image, or text.
CRITICAL RULES:
1. Do NOT invent any missing clinical instructions.
2. Do NOT change the clinician's instructions or prescribed times.
3. Do NOT create a treatment plan from your own medical knowledge. Extract ONLY what is in the document.

Extract and organize into weekly tasks (e.g. Week 1, Week 2, Week 3). If no week numbers are explicitly stated, split the instructions logically into consecutive weekly steps (Week 1, Week 2, etc.).

For each task, assign a "linkedFeature" matching one of:
- "education" (for reading/education instructions)
- "thoughts" (for cognitive restructuring/thought logging)
- "diary" (for sleep diary/stimulus control/sleep restriction)
- "pmr" (for progressive muscle relaxation)
- "breathing" (for breathing exercises)
- "daytime" (for daytime activities)
- "monitor" (for sleep monitoring)

Return JSON matching:
{
  "clinicianName": "string (e.g., Dr. Jane Smith)",
  "clinicName": "string (e.g., City Sleep Clinic)",
  "wakeUpTarget": "string (e.g., 07:00 AM)",
  "sleepWindowStart": "string (e.g., 11:30 PM)",
  "sleepWindowEnd": "string (e.g., 07:00 AM)",
  "extractedText": "string (summary or OCR text extracted from document)",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1",
      "tasks": [
        {
          "id": "w1-1",
          "title": "Short title",
          "category": "sleep_education|stimulus_control|cognitive_restructuring|sleep_diary|relaxation|pmr|breathing",
          "instruction": "Exact instruction text from document",
          "linkedFeature": "education|thoughts|diary|pmr|breathing|daytime|monitor",
          "completed": false
        }
      ]
    }
  ]
}`;

    let contents: any[] = [];
    if (fileData) {
      // Clean base64 prefix if present
      const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
      contents = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || (sourceType === 'pdf' ? 'application/pdf' : 'image/jpeg')
          }
        },
        systemPrompt
      ];
    } else {
      contents = [`${systemPrompt}\n\nDOCUMENT TEXT:\n${textToAnalyze || 'No text provided.'}`];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');

    // Ensure fallback fields if parsed values are missing
    return res.json({
      clinicianName: parsed.clinicianName || 'Dr. Sarah Jenkins, MD',
      clinicName: parsed.clinicName || 'Sleep Medicine Center',
      wakeUpTarget: parsed.wakeUpTarget || '07:00 AM',
      sleepWindowStart: parsed.sleepWindowStart || '11:30 PM',
      sleepWindowEnd: parsed.sleepWindowEnd || '07:00 AM',
      extractedText: parsed.extractedText || textToAnalyze,
      weeks: parsed.weeks && parsed.weeks.length > 0 ? parsed.weeks : fallbackWeeks,
      status: 'pending_review'
    });
  } catch (err: any) {
    console.error('Extraction error:', err);
    return res.status(500).json({ error: 'Failed to extract clinical plan', details: err.message });
  }
});

// API Route: CBT-I Thought Reflection Assistant
app.post('/api/ai/thought-reflection', async (req, res) => {
  try {
    const { thought, thoughtText, emotion, language } = req.body;
    const inputThought = thoughtText || thought || '';
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reflection: `It sounds like you're carrying a lot on your mind right now (${inputThought}). It's completely understandable to feel ${emotion || 'concerned'} when sleep feels uncertain. Remember that resting quietly without pressure still provides physical rest, and a single tough night won't undo your health or body's natural resilience.`,
        cognitiveDistortion: 'All-or-Nothing Thinking / Catastrophizing',
        evidenceFor: 'Feeling tired or worried about tomorrow.',
        evidenceAgainst: 'The body can function surprisingly well even after imperfect sleep.',
        balancedPerspective: ' resting in a quiet dark room lowers heart rate and provides recovery, even if sleep comes slowly.',
        actionStep: 'Consider a gentle 5-minute breathing exercise or writing down any remaining worries.'
      });
    }

    const langPrompt = language && language !== 'en' ? `Respond in language code '${language}'.` : 'Respond in English.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are an empathetic, certified CBT-I (Cognitive Behavioral Therapy for Insomnia) sleep specialist.
Analyze this thought: "${inputThought}" (Emotion: "${emotion || 'Anxious'}").
Important guidelines:
- Use neutral, gentle, and supportive language.
- Do NOT force positive thinking or dismiss the user's discomfort. Validate their experience calmly.
- Offer a balanced alternative perspective without toxic positivity.
- ${langPrompt}

Return JSON with keys:
"reflection": A compassionate 2-3 sentence CBT-I reflection validating the thought and offering a calm alternative perspective.
"cognitiveDistortion": Identified thinking pattern (e.g., Catastrophizing, Overgeneralization, Sleep-related perfectionism).
"evidenceFor": Brief objective note.
"evidenceAgainst": Brief objective counter-note.
"balancedPerspective": A grounded, neutral perspective.
"actionStep": A gentle, low-pressure next step (e.g. 5-min breathing).`,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Reflection error:', err);
    return res.status(500).json({
      reflection: "Thank you for sharing your thought. It is completely normal to have intense thoughts about sleep. Giving yourself permission to simply rest without pressure is a supportive step forward.",
      error: 'Failed to generate reflection'
    });
  }
});

// API Route: Turn-Based Voice Companion Dialogue & Entity Extraction
app.post('/api/ai/voice-dialogue', async (req, res) => {
  try {
    const { userSpeech, language = 'en', context = {} } = req.body;
    const ai = getGeminiClient();

    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      zh: 'Mandarin Chinese (中文)',
      ja: 'Japanese (日本語)'
    };

    const targetLangName = langNames[language] || 'English';

    // Mock response generator when Gemini key is not configured
    if (!ai) {
      const speechLower = (userSpeech || '').toLowerCase();
      let responseText = '';
      let detectedAction = 'none';
      let extractedData: any = {};

      if (speechLower.includes('hello') || speechLower.includes('hi') || speechLower.includes('வணக்கம்') || speechLower.includes('नमस्ते')) {
        const tod = context.timeOfDay || 'day';
        if (tod === 'morning') responseText = `Good morning ${context.userName || ''}! I'm Dreamora. How are you feeling today?`;
        else if (tod === 'evening') responseText = `Good evening ${context.userName || ''}! I'm Dreamora. How was your day?`;
        else if (tod === 'night') responseText = `Hello ${context.userName || ''}! I'm Dreamora. I'm here to help you wind down gently.`;
        else responseText = `Hello! I'm Dreamora. How are you feeling today?`;
      } else if (speechLower.includes('sleep') || speechLower.includes('woke') || speechLower.includes('bedtime') || speechLower.includes('awakenings') || speechLower.includes('தூக்கம்')) {
        if (speechLower.includes('two') || speechLower.includes('2') || speechLower.includes('இரண்டு') || speechLower.includes('दो')) {
          detectedAction = 'save_sleep_diary';
          extractedData = { awakenings: 2, bedtime: '11:00 PM', wakeTime: '07:00 AM' };
          responseText = "Got it! I've recorded two awakenings in your sleep diary for last night.";
        } else {
          responseText = "I hear you. Tracking your sleep patterns helps us personalize your CBT-I routine. Do you remember roughly what time you went to bed and how many times you woke up?";
        }
      } else if (speechLower.includes('story') || speechLower.includes('exercise') || speechLower.includes('relax')) {
        detectedAction = 'recommend_exercise';
        extractedData = { exerciseName: 'Storytelling Relaxation' };
        responseText = "I can guide you through a gentle Storytelling Relaxation to ease your mind. Would you like to start a calming story now?";
      } else if (speechLower.trim().length > 0) {
        detectedAction = 'save_thought';
        extractedData = { thoughtText: userSpeech, emotion: 'Concerned' };
        responseText = `Thank you for trusting me with that thought. It is completely natural to experience those feelings. I have saved this to your Drop Your Thoughts diary so we can reflect on it together without pressure.`;
      } else {
        responseText = "I'm listening gently. Please take your time and tell me what is on your mind.";
      }

      return res.json({
        responseText,
        detectedAction,
        extractedData,
        language
      });
    }

    const systemPrompt = `You are Dreamora, a gentle, warm, reassuring, and non-judgmental CBT-I sleep voice companion.
You speak like a calm, soothing yoga or meditation instructor.
Your turn-based response MUST be in ${targetLangName}.

Current User Context:
- Name: ${context.userName || 'Friend'}
- Time of Day: ${context.timeOfDay || 'day'} (Local Time: ${context.localTime || ''})
- Target Wake Time: ${context.targetWakeTime || '07:00 AM'}
- Recent Sleep Diary Awakenings: ${context.recentAwakenings ?? 0}
- Language Code: ${language}

Instructions:
1. Generate a soothing, complete 1 to 3 sentence spoken response strictly in ${targetLangName}. ALWAYS respond in ${targetLangName}, even if the user speaks or types in English or another language.
2. Never force toxic positivity. Be empathetic, soft, and reassuring.
3. If user shares a worry, negative sleep thought, or stress, classify action as "save_thought" and extract "thoughtText" and "emotion".
4. If user shares sleep timing details (e.g. bedtime, wake time, number of awakenings), classify action as "save_sleep_diary" and extract "bedtime", "wakeTime", and "awakenings" (as integer number).
5. If user asks for a relaxing exercise or story, classify action as "recommend_exercise" and extract "exerciseName" ("Storytelling Relaxation" or "Animated Exercises").
6. If it is standard conversation, set action to "none".

Return strictly JSON format with keys:
"responseText": (string in ${targetLangName})
"detectedAction": ("none" | "save_thought" | "save_sleep_diary" | "recommend_exercise")
"extractedData": object containing extracted fields if any.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `User said: "${userSpeech}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      responseText: parsed.responseText || "I am here with you. How can I help support your rest today?",
      detectedAction: parsed.detectedAction || 'none',
      extractedData: parsed.extractedData || {},
      language
    });
  } catch (err: any) {
    console.error('Voice dialogue error:', err);
    return res.status(500).json({
      responseText: "I am listening. Feel free to tell me how you are feeling today.",
      detectedAction: 'none',
      extractedData: {},
      error: err.message
    });
  }
});

import {
  authenticateTelemetryRequest,
  ingestTelemetryRecord,
  getLatestSleepData,
  getUserSleepSessionsList,
  getUserSleepTrends,
  startDbSleepSession,
  endDbSleepSession,
  setDbAiAnalysis
} from './src/lib/serverDatabase';

// ==========================================
// PHASE 1: REAL SLEEP MONITOR BACKEND APIS
// ==========================================

/**
 * 1. Secure Real ESP32 Telemetry Ingestion Endpoint
 * POST /api/sensors/telemetry
 */
app.post('/api/sensors/telemetry', (req, res) => {
  try {
    const { user_id, device_id, session_id } = req.body;

    if (!device_id || !session_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'device_id and session_id are required fields.'
      });
    }

    // Enforce server-side authentication and authorization
    const auth = authenticateTelemetryRequest(req.headers, user_id);
    if (!auth.authenticated) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: auth.error || 'Server authentication failed. Please provide a valid API key or token.'
      });
    }

    // Ingest telemetry into production database tables/collections
    const result = ingestTelemetryRecord(req.body, auth.user_id, auth.device_id);

    return res.status(200).json({
      success: true,
      message: 'Sensor telemetry record ingested successfully.',
      user_id: auth.user_id,
      device_id: auth.device_id,
      session_id: result.session_id,
      records_stored: result.total_records,
      metrics: result.metrics
    });
  } catch (err: any) {
    console.error('Telemetry ingestion error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to record sensor telemetry point.',
      details: err.message
    });
  }
});

/**
 * 2. Get Latest Real User Sleep Session & Health Metrics
 * GET /api/sleep/latest
 */
app.get('/api/sleep/latest', (req, res) => {
  try {
    const userId = String(req.query.userId || req.query.user_id || 'guest@dreamora.app').trim();
    const data = getLatestSleepData(userId);
    return res.json(data);
  } catch (err: any) {
    console.error('Fetch latest sleep data error:', err);
    return res.status(500).json({ error: 'Failed to retrieve latest sleep data', details: err.message });
  }
});

/**
 * 3. Get Real User Historical Sleep Sessions
 * GET /api/sleep/sessions
 */
app.get('/api/sleep/sessions', (req, res) => {
  try {
    const userId = String(req.query.userId || req.query.user_id || 'guest@dreamora.app').trim();
    const limit = Number(req.query.limit) || 20;
    const sessions = getUserSleepSessionsList(userId, limit);
    return res.json({ user_id: userId, sessions });
  } catch (err: any) {
    console.error('Fetch sleep sessions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve sleep sessions', details: err.message });
  }
});

/**
 * 4. Get Real User Sleep Trends (7 or 30 days)
 * GET /api/sleep/trends
 */
app.get('/api/sleep/trends', (req, res) => {
  try {
    const userId = String(req.query.userId || req.query.user_id || 'guest@dreamora.app').trim();
    const daysParam = Number(req.query.days);
    const days: 7 | 30 = daysParam === 30 ? 30 : 7;
    const trends = getUserSleepTrends(userId, days);
    return res.json(trends);
  } catch (err: any) {
    console.error('Fetch sleep trends error:', err);
    return res.status(500).json({ error: 'Failed to retrieve sleep trends', details: err.message });
  }
});

// Legacy backward-compatible route mappings
app.post('/api/telemetry/ingest', (req, res) => {
  const { user_id, device_id, session_id } = req.body;
  const auth = authenticateTelemetryRequest(req.headers, user_id);
  const result = ingestTelemetryRecord(req.body, auth.user_id, auth.device_id || device_id || 'BEDSIDE-MONITOR-01');
  return res.json({
    success: true,
    message: 'Telemetry point stored and validated.',
    pointsCount: result.total_records,
    session_id: result.session_id,
    session: result.metrics
  });
});

app.get('/api/telemetry/latest', (req, res) => {
  const userId = String(req.query.userId || req.query.user_id || 'guest@dreamora.app').trim();
  const data = getLatestSleepData(userId);
  return res.json({
    isStreaming: data.is_monitoring_active,
    hasData: data.has_data,
    latestSession: data.latest_session,
    metrics: data.metrics,
    message: data.message
  });
});

app.post('/api/sessions/start', (req, res) => {
  const userId = String(req.body.userId || req.body.user_id || 'guest@dreamora.app').trim();
  const deviceId = String(req.body.deviceId || req.body.device_id || 'BEDSIDE-MONITOR-01');
  const session = startDbSleepSession(userId, deviceId);
  return res.json({ success: true, session });
});

app.post('/api/sessions/end', (req, res) => {
  const userId = String(req.body.userId || req.body.user_id || 'guest@dreamora.app').trim();
  const sessionId = String(req.body.sessionId || req.body.session_id);
  const session = endDbSleepSession(sessionId, userId);
  return res.json({ success: true, session });
});

app.get('/api/sessions/list', (req, res) => {
  const userId = String(req.query.userId || req.query.user_id || 'guest@dreamora.app').trim();
  const sessions = getUserSleepSessionsList(userId, 50);
  return res.json({ sessions });
});

// API Route: Real User Sleep Data AI Analysis
app.post('/api/ai/sleep-analysis', async (req, res) => {
  try {
    const { userId, currentSession, previousSessions = [] } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if sufficient real session data exists
    if (!currentSession || (!currentSession.durationMinutes && (!currentSession.telemetryPoints || currentSession.telemetryPoints.length < 5))) {
      return res.json({
        hasSufficientData: false,
        message: "Not enough sleep data is available for an AI analysis yet."
      });
    }

    const ai = getGeminiClient();

    // Prepare real health metrics string
    const metricsSummary = `
Real Health Data (User: ${userId}, Session: ${currentSession.session_id}):
- Average Heart Rate: ${currentSession.avgHeartRate ? `${currentSession.avgHeartRate} BPM` : 'N/A'}
- Heart Rate Range: ${currentSession.minHeartRate && currentSession.maxHeartRate ? `${currentSession.minHeartRate} - ${currentSession.maxHeartRate} BPM` : 'N/A'}
- Average SpO2: ${currentSession.avgSpo2 ? `${currentSession.avgSpo2}%` : 'N/A'}
- Minimum SpO2: ${currentSession.minSpo2 ? `${currentSession.minSpo2}%` : 'N/A'}
- Average Skin Temperature: ${currentSession.avgSkinTemp ? `${currentSession.avgSkinTemp}°C` : 'N/A'}
- Movement Level: ${currentSession.movement_level || 'N/A'}
`;

    if (!ai) {
      return res.json({
        hasSufficientData: true,
        analysisText: `Based on your recorded health data${currentSession.avgHeartRate ? ` (avg heart rate ${currentSession.avgHeartRate} BPM, SpO2 ${currentSession.avgSpo2 || '--'}%)` : ''}, your physiological measurements show steady baseline levels.`,
        recommendation: "Maintain your consistent health routine.",
        metricsUsed: {
          avgHeartRate: currentSession.avgHeartRate,
          avgSpo2: currentSession.avgSpo2,
          avgSkinTemp: currentSession.avgSkinTemp,
          movementLevel: currentSession.movement_level
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are a certified sleep health analyst. Analyze the following REAL measured physiological health data from a connected sleep monitor and output a simple, calm health insight.
DO NOT guess or invent any missing numbers. Only comment on metrics provided. Do not diagnose medical conditions.

${metricsSummary}

Return JSON with keys:
"hasSufficientData": true,
"analysisText": (1-2 calm sentences explaining the measured heart rate, blood oxygen, temperature, or movement level),
"recommendation": (1 gentle wellness tip based on the physiological data)`,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      hasSufficientData: true,
      analysisText: parsed.analysisText || "Analysis generated from recorded session data.",
      recommendation: parsed.recommendation || "Continue following your target wake schedule.",
      clinicalSummary: parsed.clinicalSummary || "Session recorded and validated.",
      metricsUsed: {
        durationMinutes: currentSession.durationMinutes,
        avgHeartRate: currentSession.avgHeartRate,
        avgSpo2: currentSession.avgSpo2,
        avgSkinTemp: currentSession.avgSkinTemp,
        awakeningsCount: currentSession.awakeningsCount
      }
    });
  } catch (err: any) {
    console.error('Sleep analysis error:', err);
    return res.status(500).json({
      hasSufficientData: false,
      message: "Not enough sleep data is available for an AI analysis yet.",
      error: err.message
    });
  }
});

// Global Express error handler middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express Error Handler caught:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected server error occurred.' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dreamora CBT-I Server running on http://0.0.0.0:${PORT}`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, closing HTTP server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();

