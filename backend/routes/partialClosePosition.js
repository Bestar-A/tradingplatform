const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { partialClosePosition } = require('../services/partialClosePositionService');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const { positionId, percent } = req.body;
    const username = req.user.username;

    try {
        res.json(await partialClosePosition(username, positionId, percent));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;