const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins (safe here because it's your server)
app.use(cors());

// Environment variable for your CoinGlass API key
const API_KEY = process.env.COINGLASS_API_KEY;

// Proxy route
app.get('/api/liquidation', async (req, res) => {
  const symbol = req.query.symbol || 'SOLUSDT';
  try {
    const response = await axios.get(`https://open-api-v4.coinglass.com/api/futures/liquidation/heatmap/model1?symbol=${symbol}`, {
      headers: {
        'accept': 'application/json',
        'coinglassSecret': API_KEY
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch liquidation data', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
