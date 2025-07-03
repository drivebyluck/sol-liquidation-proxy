const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual CoinGlass API key in the Render dashboard
const COINGLASS_API_KEY = process.env.COINGLASS_API_KEY;

app.use(cors());

app.get('/liquidations', async (req, res) => {
  try {
    const response = await axios.get('https://open-api.coinglass.com/public/v2/liquidation_map?symbol=SOLUSDT&interval=24h', {
      headers: {
        'coinglassSecret': COINGLASS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching CoinGlass data:', error.message);
    res.status(500).json({ error: 'Failed to fetch liquidation data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
