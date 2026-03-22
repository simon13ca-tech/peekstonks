// api/prices.js
// ============================================================
// PROXY SERVERLESS → Skinport API
// Browser → /api/prices → este archivo → api.skinport.com
// Corre en el servidor de Vercel, sin CORS
// ============================================================

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(
      'https://api.skinport.com/v1/items?app_id=730&currency=USD',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PeekStonks/1.0',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `Skinport ${response.status}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
