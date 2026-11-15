// Vercel Serverless Function: /api/gemini/generate
// Dynamic multi-model relay for Google Gemini API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const effectiveKey = (req.headers['x-gemini-key'] || req.body?.apiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!effectiveKey) {
    return res.status(503).json({ error: 'Gemini is not configured. Please input a valid Gemini API key in settings or set GEMINI_API_KEY.' });
  }

  const prompt = req.body?.prompt || 'Analyze current scenario';

  // 1. Resolve available models dynamically from Google for this specific key
  let targetModels = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (listRes.ok) {
      const listData = await listRes.json();
      const available = (listData?.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        // Strictly exclude deprecated or restricted models (e.g. gemini-2.5, preview-05, etc.)
        .filter(name => !name.startsWith('gemini-2.5') && !name.includes('preview-05') && !name.includes('preview-09'));
      const priorityList = [
        'gemini-3.8-flash',
        'gemini-3.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-flash-latest'
      ];
      for (const p of priorityList) {
        if (available.includes(p)) targetModels.push(p);
      }
      for (const m of available) {
        if (!targetModels.includes(m) && targetModels.length < 3) targetModels.push(m);
      }
    }
  } catch (_) {}

  if (!targetModels.length) {
    targetModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  }
  targetModels = targetModels.slice(0, 3);

  let lastError = null;
  for (const model of targetModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`;
      const gRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.25 }
        })
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        const reply = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ text: reply, source: `Google ${model} (在线大模型)` });
        }
      }
      const errBody = await gRes.text();
      let parsed = {};
      try { parsed = JSON.parse(errBody); } catch (_) {}
      lastError = parsed?.error?.message || errBody;
      if (lastError.includes('API_KEY_INVALID') || lastError.includes('API key not valid')) {
        return res.status(400).json({ error: lastError });
      }
      if (gRes.status === 403 && (lastError.includes('PERMISSION_DENIED') || lastError.includes('location is not supported'))) {
        return res.status(403).json({ error: lastError });
      }
      if (gRes.status === 429 && lastError.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({ error: lastError });
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(502).json({ error: `Gemini relay failed: ${lastError}` });
}
