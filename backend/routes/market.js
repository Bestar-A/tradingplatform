const express = require('express');
const { fetchCurrentMarketPrices } = require('../utils/market');
const router = express.Router();

router.post('/getCurrentPrice', async (req, res) => {
    const accountType = req.body.accountType;
    try {
        const price = await fetchCurrentMarketPrices(accountType);

        if (price !== null) {
            res.json({
                 currentPrices: price,
                  ok: true 
                });
        } else {
            res.status(500).json({ error: 'Failed to fetch price. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error fetching current price' });
    }
});

router.post('/getYesterdayPrice', async (req, res) => {
    const accountType = req.body.accountType;
    try {
        const price = await fetchYesterdayMarketPrices(accountType);

        if (price !== null) {
            res.json({
                 yesterdayPrices: price,
                  ok: true 
                });
        } else {
            res.status(500).json({ error: 'Failed to fetch price. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error fetching current price' });
    }
});

router.get("/futures_kline", async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTC_USDT";
        const interval = req.query.interval || "Min1";
        const intervalValue = {
            'Min1': 1,
            'Min5': 5,
            'Min30': 30,
            'Min60': 60,
            'Hour4': 240,
            'Day1': 1440,
            'Week1': 10080,
            'Month1': 1440 * 30,
        }

        const nowTime = parseInt(new Date() / 1000);
        const startTime = nowTime - intervalValue[interval] * 60 * 50;
        const url = `https://contract.mexc.com/api/v1/contract/kline/index_price/${symbol}?interval=${interval}&start=${startTime}&end=${nowTime}`;

        // console.log(url);

        const response = await axios.get(url);
        res.json(response.data.data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data from MEXC API");
    }
});

router.get("/spot_kline", async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTC_USDT";
        const interval = req.query.interval || "1m";
        const url = `https://www.mexc.com/open/api/v2/market/kline?symbol=${symbol}&interval=${interval}&limit=50`;

        // console.log(url);

        const response = await axios.get(url);
        res.json(response.data.data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data from MEXC API");
    }
});

module.exports = router;