const express = require('express');
const { fetchCandles } = require('../utils/market');
const router = express.Router();

router.get('/candles', async (req, res) => {
    const { symbol, interval } = req.query;
    try {
        const candles = await fetchCandles(symbol, interval);
        res.json(candles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;