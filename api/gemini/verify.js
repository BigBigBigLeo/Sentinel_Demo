// Vercel Serverless Function: /api/gemini/verify
// Secure lightweight probe for Google Gemini API key authorization

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let effectiveKey = (req.headers['x-gemini-key'] || req.body?.apiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!effectiveKey) {
    return res.status(400).json({ ok: false, error: 'API key is empty.' });
  }

  try {
    const pingRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`);
    if (pingRes.ok) {
      const data = await pingRes.json();
      return res.status(200).json({ ok: true, modelsCount: data?.models?.length || 0 });
    }
    const errText = await pingRes.text();
    let errJson = {};
    try { errJson = JSON.parse(errText); } catch (_) {}
    const msg = errJson?.error?.message || errText;
    const reason = errJson?.error?.details?.[0]?.reason || (msg.includes('API key not valid') ? 'API_KEY_INVALID' : 'AUTH_ERROR');
    return res.status(pingRes.status).json({ ok: false, error: msg, reason, status: pingRes.status });
  } catch (err) {
    return res.status(502).json({ ok: false, error: `Upstream connection failed: ${err.message}` });
  }
}
