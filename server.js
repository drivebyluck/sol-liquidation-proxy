const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.COINGLASS_API_KEY;

app.use(cors());

const headers = {
  'accept': 'application/json',
  'coinglassSecret': API_KEY
};

app.get('/sol-data', async (req, res) => {
  try {
    const [liquidationRes, openInterestRes, tradeCountRes, volumeRes] = await Promise.all([
      axios.get('https://open-api.coinglass.com/public/v2/liquidation_chart?symbol=SOL', { headers }),
      axios.get('https://open-api.coinglass.com/public/v2/open_interest_chart?symbol=SOL', { headers }),
      axios.get('https://open-api.coinglass.com/public/v2/future_trading_volume?symbol=SOL', {
