// api/prices.js
// ============================================================
// PROXY SERVERLESS para Steam Community Market API
// Browser → /api/prices?item=AK-47+Redline → Steam Market
// Sin API key necesaria, funciona directo
// ============================================================

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { item } = req.query;
  if (!item) return res.status(400).json({ error: 'Falta el parámetro item' });

  try {
    const encoded = encodeURIComponent(item);
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encoded}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeekStonks/1.0)',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Steam error ${response.status}` });
    }

    const data = await response.json();

    // Cache 5 minutos en Vercel CDN
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
