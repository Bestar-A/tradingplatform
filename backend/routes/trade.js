const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserPositions, saveUserPositions } = require('../services/positionService');
const { sendFuturesLimitSucceedEmail } = require('../utils/email');

const router = express.Router();

router.post('/startTrade', authenticateToken, async (req, res) => {
    const { positionId } = req.body;
    const username = req.user.username;
    try {
        const positions = await getUserPositions(username);
        if (!positions) {
            return res.status(404).send('User not found');
        }

        let positionIndex = positions.futuresPositions.findIndex(
            (pos) => pos.id === positionId
        );
        if (positionIndex === -1) {
            return res.status(404).send("Position not found");
        } else {
            positions.futuresPositions[positionIndex].orderLimit = 0;
            sendFuturesLimitSucceedEmail(username, positions.futuresPositions[positionIndex]);
        }

        // user.futuresUSDTBalance -= user.futuresPositions[positionIndex].amount;
        await saveUserPositions(username, positions);

        res.json({
            futuresPositions: positions.futuresPositions,
            spotPositions: positions.spotPositions
        });

        // res.json({ spotPositions: positions.spotPositions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;