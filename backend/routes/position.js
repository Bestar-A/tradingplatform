const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserPositions, saveUserPositions } = require('../services/positionService');
const { getUser, saveUser } = require('../services/userService');
const { sendPositionOpenEmail, sendPositionClosedEmail, sendPositionTPEmail, sendPositionSLEmail } = require('../utils/email');
const { fetchCurrentMarketPrices } = require('../utils/market');
const router = express.Router();

router.post('/getPositions', authenticateToken, async (req, res) => {
    const username = req.user.username;
    try {
        const positions = await getUserPositions(username);
        if (!positions) {
            return res.status(404).send('User not found');
        }
        res.json(positions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/openFuturesPosition', authenticateToken, async (req, res) => {
    const { futuresAssetType, positionType, orderType, amount, leverage, limitPrice } = req.body;
    const username = req.user.username;
    try {
        const user = await getUser(username);
        let orderLimit = 0;

        if (!user) return res.status(404).send("User not found");

        if (orderType == "limit") orderLimit = 1;
        if (orderType == "limit" && user.futuresPositions) {
            if (
                user.futuresPositions.filter((position) => position.orderLimit == 1).length >= 10
            ) {
                return res.status(400).send("Limit Orders limited to 10");
            }
        }

        if (orderLimit == 0 && user.futuresPositions) {
            if (
                user.futuresPositions.filter((position) => position.orderLimit == 0).length>= 10
            ) {
                return res.status(400).send("Limit Positions limited to 10");
            }
        }

        if (user.futuresUSDTBalance < amount) {
            return res.status(400).send("Insufficient balance");
        }

        const currentMarketPrices = await fetchCurrentMarketPrices("futures");

        if (currentMarketPrices === null) {
            return res.status(500).send("Error fetching market price");
        }

        const currentMarketPrice = currentMarketPrices.filter(
            (item) => item.assetType == futuresAssetType
        )[0].price;
        // if(orderType=='market')user.futuresUSDTBalance -= amount; // Deduct the amount from user's balance
        user.futuresUSDTBalance -= amount; // Deduct the amount from user's balance

        const positionId = Date.now(); // Unique ID for the position (can be replaced with a more robust method)
        let tp = 0;
        let sl = 0;
        if (positionType == "Long") {
            tp = 100000000;
            sl = 0;
        }
        if (positionType == "Short") {
            tp = 0;
            sl = 100000000;
        }
        const position = {
            id: positionId,
            assetType: futuresAssetType,
            positionType,
            orderType,
            orderLimit,
            amount,
            leverage,
            tp,
            sl,
            limitPrice,
            entryPrice: currentMarketPrice,
        };

        // Initialize positions array if not exists
        if (!user.futuresPositions) {
            user.futuresPositions = [];
        }

        user.futuresPositions.push(position);
        saveUser(user);
        if (orderType !== "limit")
            sendPositionOpenEmail(username, position);

        res.json({ futuresPositions: user.futuresPositions, newfuturesUSDTBalance: user.futuresUSDTBalance, ok: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/closeFuturesPosition', authenticateToken, async (req, res) => {
    const { positionId, reason } = req.body;
    const username = req.user.username;
    try {
        const user = await getUser(username);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const positionIndex = user.futuresPositions.findIndex(
            (pos) => pos.id === positionId
        );
        if (positionIndex === -1) return res.status(404).send("Position not found");

        const closedPosition = user.futuresPositions.splice(positionIndex, 1)[0];

        // Fetch the current market price
        const currentMarketPrices = await fetchCurrentMarketPrices("futures");
        if (currentMarketPrices === null) {
            return res.status(500).send("Error fetching market price");
        }

        const currentMarketPrice = currentMarketPrices.filter(
            (item) => item.assetType == closedPosition.assetType
        )[0].price;

        // Calculate realized profit or loss
        const priceDiff =
            (currentMarketPrice - closedPosition.entryPrice) *
            (closedPosition.positionType === "Long" ? 1 : -1);
        let profitLoss =
            closedPosition.amount *
            closedPosition.leverage *
            (priceDiff / closedPosition.entryPrice);

        if (closedPosition.orderLimit) profitLoss = 0;

        // Update balance
        if (reason == 3) profitLoss = -closedPosition.amount; // liquidation
        // if(!closedPosition.orderLimit)user.futuresUSDTBalance += closedPosition.amount + profitLoss; // Add the amount and profit/loss
        user.futuresUSDTBalance += closedPosition.amount + profitLoss; // Add the amount and profit/loss

        // Log the closed position with realized P/L
        if (!user.closedFuturesPositions) {
            user.closedFuturesPositions = [];
        }
        user.closedFuturesPositions.push({
            ...closedPosition,
            exitPrice: currentMarketPrice,
            realizedPL: profitLoss,
            closedReason: reason,
        });

        if (closedPosition.orderLimit == 0) sendPositionClosedEmail(username, closedPosition, currentMarketPrice);

        saveUser(user);
        res.json({ futuresPositions: user.futuresPositions, newFuturesUSDTBalance: user.futuresUSDTBalance, profitLoss, ok: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/closeSpotPosition', authenticateToken, async (req, res) => {
    const { positionId } = req.body;
    console.log(positionId);
    
    const username = req.user.username;
    try {
        const user = await getUser(username);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const positionIndex = user.spotPositions.findIndex(
            (pos) => pos.id === positionId
        );
        if (positionIndex === -1) return res.status(404).send("Position not found");

        const closedPosition = user.spotPositions.splice(positionIndex, 1)[0];

        if (!closedPosition.orderLimit) return res.status(400).send("Open position can't be closed in spot trading");
        // Fetch the current market price
        const currentMarketPrices = await fetchCurrentMarketPrices("spot");
        if (currentMarketPrices === null) {
            return res.status(500).send("Error fetching market price");
        }

        const currentMarketPrice = currentMarketPrices.filter(
            (item) => item.assetType == closedPosition.assetType
        )[0].price;

        if (closedPosition.positionType == 'buy' && closedPosition.orderType != "limit") {
            user.spotUSDTBalance += closedPosition.amount * closedPosition.entryPrice; // Add the amount and profit/loss
        }
        if (closedPosition.positionType == 'sell' && closedPosition.orderType != "limit") {
            user.spotUSDTBalance -= closedPosition.amount * closedPosition.entryPrice; // Add the amount and profit/loss
        }

        saveUser(user);
        res.json({ spotPositions: user.spotPositions, newSpotUSDTBalance: user.spotUSDTBalance, ok: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/saveTPSL', authenticateToken, async (req, res) => {
    const { positionId, tp, sl } = req.body;
    const username = req.user.username;
    try {
        const positions = await getUserPositions(username);
        if (!positions) {
            return res.status(404).send('User not found');
        }

        const positionIndex = positions.futuresPositions.findIndex(pos => pos.id === positionId);
        if (positionIndex === -1) {
            return res.status(404).send('Position not found');
        }

        const oldTP = positions.futuresPositions[positionIndex].tp;
        positions.futuresPositions[positionIndex].tp = tp;
        // if (oldTP != tp) sendPositionTPEmail(username, positions.futuresPositions[positionIndex]);

        const oldSL = positions.futuresPositions[positionIndex].sl;
        positions.futuresPositions[positionIndex].sl = sl;
        // if (oldSL != sl) sendPositionSLEmail(username, positions.futuresPositions[positionIndex]);
        await saveUserPositions(username, positions);
        res.json({ futuresPositions: positions.futuresPositions, ok: true, });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;