// api/csfloat.js
// ============================================================
// PROXY SERVERLESS para CSFloat API — Vercel Function
// Browser → /api/csfloat?... → este archivo → csfloat.com
// La API key vive en variables de entorno de Vercel (segura)
// No hay CORS porque la llamada la hace el servidor, no el browser
// ============================================================

const CSFLOAT_BASE = 'https://csfloat.com/api/v1';

module.exports = async (req, res) => {
  // Headers CORS para que el browser pueda llamar a /api/csfloat
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extraer el endpoint destino y los query params
    const { _endpoint = '/listings', ...rest } = req.query;
    const params = new URLSearchParams(rest).toString();
    const targetURL = `${CSFLOAT_BASE}${_endpoint}${params ? '?' + params : ''}`;

    console.log(`[CSFloat Proxy] → ${targetURL}`);

    const response = await fetch(targetURL, {
      headers: {
        // CSFLOAT_API_KEY se configura en Vercel Dashboard → Settings → Environment Variables
        'Authorization': process.env.CSFLOAT_API_KEY || '',
        'Content-Type': 'application/json',
        'User-Agent': 'PeekStonks/1.0',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[CSFloat Proxy] Error ${response.status}:`, data);
      return res.status(response.status).json({
        error: `CSFloat error ${response.status}`,
        details: data,
      });
    }

    // Cache de 5 minutos en Vercel CDN
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    console.error('[CSFloat Proxy] Exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
