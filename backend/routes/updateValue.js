const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { updateValue } = require('../services/updateValueService');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const username = req.user.username;
    const { futuresPositionsAmount, futuresUnrealizedPL, spotValue, totalValue } = req.body;

    try {
        res.json(await updateValue(username, futuresPositionsAmount, futuresUnrealizedPL, spotValue, totalValue));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;