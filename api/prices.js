// api/prices.js
// ============================================================
// PROXY SERVERLESS — Skinport + ByMykel Cases API
// GET /api/prices           → precios Skinport (todos los items)
// GET /api/prices?type=cases → lista de cases con imágenes (ByMykel)
// ============================================================

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const type = req.query.type;

  try {
    // ── Cases con imágenes reales (ByMykel GitHub API)
    if (type === 'cases') {
      const [casesRes, capsulesRes] = await Promise.all([
        fetch('https://bymykel.github.io/CSGO-API/api/en/crates/cases.json'),
        fetch('https://bymykel.github.io/CSGO-API/api/en/crates/capsules.json'),
      ]);
      const cases    = casesRes.ok    ? await casesRes.json()    : [];
      const capsules = capsulesRes.ok ? await capsulesRes.json() : [];
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');
      return res.status(200).json({ cases, capsules });
    }

    // ── Precios completos de Skinport
    const response = await fetch(
      'https://api.skinport.com/v1/items?app_id=730&currency=USD',
      { headers: { 'Accept': 'application/json', 'User-Agent': 'PeekStonks/1.0' } }
    );
    if (!response.ok) return res.status(response.status).json({ error: `Skinport ${response.status}` });
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
