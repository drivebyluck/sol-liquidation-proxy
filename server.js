const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const {
  DriftClient,
  DLOBBuilder,
  UserMap,
  convertToNumber,
  getMarketsAndOraclesForSubscription,
  initialize,
  getSpotMarketAccount,
  SpotMarketAccount,
  PerpMarketAccount
} = require('@drift-labs/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.get('/liquidations', async (req, res) => {
  try {
    await initialize();

    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const programId = new PublicKey('DMnho5n4QX...VTaJr'); // Replace with Drift V2 ID if needed

    const driftClient = new DriftClient({
      connection,
      programID: programId,
      accountSubscription: {
        type: 'websocket',
        commitment: 'processed'
      }
    });

    await driftClient.subscribe();

    const userMap = new UserMap(driftClient);
    await userMap.subscribe();

    const dlob = new DLOBBuilder(userMap, Date.now() / 1000).build();

    const marketIndex = 1; // SOL/USDC market index on Drift
    const users = userMap.users;

    const liquidationZones = [];

    for (const user of users.values()) {
      const positions = user.getUserAccount().perpPositions || [];

      for (const pos of positions) {
        if (pos.baseAssetAmount.isZero()) continue;

        if (pos.marketIndex !== marketIndex) continue;

        const liquidationPrice = await driftClient.getLiquidationPrice(user, pos.marketIndex);

        const size = convertToNumber(pos.baseAssetAmount, 9);

        liquidationZones.push({
          price: liquidationPrice.toNumber(),
          size,
        });
      }
    }

    const currentPrice = await driftClient.getOracleDataForPerpMarket(marketIndex);
    const markPrice = currentPrice.price.toNumber();

    const longZones = liquidationZones
      .filter(z => z.price > markPrice)
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map(z => ({ direction: 'Long', ...z }));

    const shortZones = liquidationZones
      .filter(z => z.price < markPrice)
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map(z => ({ direction: 'Short', ...z }));

    res.json({
      markPrice,
      data: [...shortZones, ...longZones]
    });
  } catch (err) {
    console.error('Drift error:', err);
    res.status(500).json({ error: 'Failed to fetch liquidation data from Drift' });
  }
});

app.listen(PORT, () => {
  console.log(`Drift proxy server running on port ${PORT}`);
});
