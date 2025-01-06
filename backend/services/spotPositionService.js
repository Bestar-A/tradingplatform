const User = require('../models/User');

async function openSpotPosition(username, spotAssetType, amount, orderType, limitPrice) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }

        const positionId = Date.now();
        const position = {
            id: positionId,
            assetType: spotAssetType,
            amount,
            orderType,
            limitPrice,
        };

        user.spotPositions.push(position);
        await user.save();
        return user.spotPositions;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports = { openSpotPosition };