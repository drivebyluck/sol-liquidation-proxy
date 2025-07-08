const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const API_KEY = process.env.COINGLASS_API_KEY;

// Proxy for Heatmap (Model 1 or 2)
app.get('/api/liquidation', async (req, res) => {
  const symbol = req.query.symbol || 'SOLUSDT';
  const model  = req.query.model  || '1';
  try {
    const resp = await axios.get(
      `https://open-api-v4.coinglass.com/api/futures/liquidation/heatmap/model${model}?symbol=${symbol}`,
      { headers: { 'accept':'application/json', 'coinglassSecret':API_KEY } }
    );
    res.json(resp.data);
  } catch (e) {
    res.status(500).json({ error:'Heatmap fetch failed', details:e.message });
  }
});

// Proxy for History (Long/Short liquidations)
app.get('/api/liquidation/history', async (req, res) => {
  const symbol   = req.query.symbol   || 'SOLUSDT';
  const interval = req.query.interval || '4h';  // Your front-end uses 4h
  try {
    const resp = await axios.get(
      `https://open-api-v4.coinglass.com/api/futures/liquidation/history?symbol=${symbol}&interval=${interval}`,
      { headers: { 'accept':'application/json', 'coinglassSecret':API_KEY } }
    );
    res.json(resp.data);
  } catch (e) {
    res.status(500).json({ error:'History fetch failed', details:e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});
