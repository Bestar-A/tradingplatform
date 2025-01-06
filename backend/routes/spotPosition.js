const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { fetchCurrentMarketPrices } = require('../utils/market');
const { getUser, saveUser } = require('../services/userService');
const { sendTokenBuyEmail, sendTokenSellEmail } = require('../utils/email');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const { spotAssetType, positionType, orderType, amount, limitPrice } = req.body;
    const username = req.user.username;

    try {
        const user = await getUser(username);
        let orderLimit = 0;

        if (orderType == "limit") orderLimit = 1;
        if (orderType == "limit" && user.spotPositions) {
            if (
                user.spotPositions.filter((position) => position.orderLimit == 1).length == 5
            ) {
                return res.status(404).send("Limit Orders limited to 5");
            }
        }

        if (!user) return res.status(404).send("User not found");

        const currentMarketPrices = await fetchCurrentMarketPrices("spot");

        if (currentMarketPrices === null) {
            return res.status(500).send("Error fetching market price");
        }

        const currentMarketPrice = currentMarketPrices.filter(
            (item) => item.assetType == spotAssetType
        )[0].price;

        const positionId = Date.now(); // Unique ID for the position (can be replaced with a more robust method)

        const position = {
            id: positionId,
            assetType: spotAssetType,
            positionType,
            orderType,
            orderLimit,
            amount,
            limitPrice,
            entryPrice: currentMarketPrice,
        };

        if (positionType == 'buy' && orderType != "limit") {
            if (user.spotUSDTBalance < amount * currentMarketPrice) {
                return res.status(400).send("Insufficient balance");
            }
            user.spotUSDTBalance -= amount * currentMarketPrice;

            sendTokenBuyEmail(username, position, currentMarketPrice, spotAssetType, amount);
        }

        if (positionType == 'sell' && orderType != "limit") {
            user.spotUSDTBalance += amount * currentMarketPrice;
            sendTokenSellEmail(username, position, currentMarketPrice, spotAssetType, amount);
        }

        // Initialize positions array if not exists
        if (!user.spotPositions) {
            user.spotPositions = [];
        }

        user.spotPositions.push(position);

        saveUser(user);

        res.json({ spotPositions: user.spotPositions, newspotUSDTBalance: user.spotUSDTBalance, ok: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;