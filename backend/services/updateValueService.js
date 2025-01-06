const { getUser, saveUser } = require('../services/userService');

async function updateValue(username, futuresPositionsAmount, futuresUnrealizedPL, spotValue, totalValue) {
    try {
        const user = await getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        user.futuresValue = user.futuresUSDTBalance + parseFloat(futuresPositionsAmount) + parseFloat(futuresUnrealizedPL);
        user.spotValue = parseFloat(spotValue);
        // user.totalValue = parseFloat(totalValue);

        user.totalUSDTBalance = user.futuresUSDTBalance + user.spotUSDTBalance;
        saveUser(user);
        return {
            futuresValue: user.futuresValue,
            spotValue: user.spotValue,
        };
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports = { updateValue };