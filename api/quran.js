let cachedToken = null;
let expiresAt = 0;
let inflight = null;

const ENV = process.env.QF_ENV === 'prelive' ? 'prelive' : 'production';
const AUTH_BASE = ENV === 'prelive'
  ? 'https://prelive-oauth2.quran.foundation'
  : 'https://oauth2.quran.foundation';
const API_BASE = ENV === 'prelive'
  ? 'https://apis-prelive.quran.foundation/content/api/v4'
  : 'https://apis.quran.foundation/content/api/v4';

async function fetchToken() {
  const id = process.env.QF_CLIENT_ID;
  const secret = process.env.QF_CLIENT_SECRET;
  if (!id || !secret) {
    const err = new Error('Quran Foundation credentials are not configured.');
    err.code = 'QF_NOT_CONFIGURED';
    throw err;
  }
  const auth = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'content' })
  });
  if (!res.ok) throw new Error(`Quran auth failed (${res.status})`);
  const data = await res.json();
  cachedToken = data.access_token;
  expiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function token() {
  if (cachedToken && Date.now() < expiresAt - 30000) return cachedToken;
  if (!inflight) inflight = fetchToken().finally(() => { inflight = null; });
  return inflight;
}

async function qf(path, retry = true) {
  const access = await token();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'x-auth-token': access,
      'x-client-id': process.env.QF_CLIENT_ID
    }
  });
  if (res.status === 401 && retry) {
    cachedToken = null; expiresAt = 0;
    return qf(path, false);
  }
  const body = await res.text();
  if (!res.ok) throw new Error(`Quran API ${res.status}: ${body.slice(0,180)}`);
  return JSON.parse(body);
}

function int(value, min, max, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  try {
    const action = String(req.query.action || 'page');
    if (action === 'chapters') {
      return res.status(200).json(await qf('/chapters?language=en'));
    }
    if (action === 'page') {
      const page = int(req.query.page, 1, 610, 1);
      const params = new URLSearchParams({
        mushaf: '6',
        words: 'true',
        per_page: '50',
        fields: 'text_indopak,juz_number,page_number',
        word_fields: 'text_indopak,verse_key,location,page_number,line_number,audio_url'
      });
      return res.status(200).json(await qf(`/verses/by_page/${page}?${params}`));
    }
    if (action === 'lookup') {
      const verse = /^\d{1,3}:\d{1,3}$/.test(String(req.query.verse || '')) ? String(req.query.verse) : '1:1';
      const params = new URLSearchParams({ mushaf: '6', from: verse, to: verse });
      return res.status(200).json(await qf(`/pages/lookup?${params}`));
    }
    if (action === 'juz') {
      const juz = int(req.query.juz, 1, 30, 1);
      const params = new URLSearchParams({ mushaf: '6', juz_number: String(juz) });
      return res.status(200).json(await qf(`/pages/lookup?${params}`));
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    const notConfigured = error?.code === 'QF_NOT_CONFIGURED';
    return res.status(notConfigured ? 503 : 502).json({
      error: notConfigured ? 'quran_provider_not_configured' : 'quran_provider_error',
      message: error?.message || 'Quran provider failed',
      environment: ENV
    });
  }
};