const User = require('../models/User');

async function getUserPositions(username) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            futuresPositions: user.futuresPositions,
            closedFuturesPositions: user.closedFuturesPositions,
            spotPositions: user.spotPositions,
            closedSpotPositions: user.closedSpotPositions,
            ok: true,
        };
    } catch (err) {
        console.error(err.message);
        return null;
    }
}

async function saveUserPositions(username, positions) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }
        user.futuresPositions = positions.futuresPositions;
        user.closedFuturesPositions = positions.closedFuturesPositions;
        user.spotPositions = positions.spotPositions;
        user.closedSpotPositions = positions.closedSpotPositions;
        await user.save();
    } catch (err) {
        console.error(err.message);
    }
}

async function saveUserSpotPositions(username, spotPositions) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }
        user.spotPositions = spotPositions;
        await user.save();
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { getUserPositions, saveUserPositions, saveUserSpotPositions };