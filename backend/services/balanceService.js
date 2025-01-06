const { getUser, saveUser } = require('../services/userService');

async function getUserBalance(username) {
    try {
        const user = await getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            username,
            futuresUSDTBalance: user.futuresUSDTBalance,
            spotUSDTBalance: user.spotUSDTBalance,
            address: user.address,
            ok: true
        };
    } catch (err) {
        console.error(err.message);
        return null;
    }
}

async function updateUserBalance(username, futuresUSDTBalance, spotUSDTBalance) {
    try {
        const user = await getUser(username);
        if (!user) {
            throw new Error('User not found');
        }
        user.futuresUSDTBalance = parseFloat(futuresUSDTBalance);
        user.spotUSDTBalance = parseFloat(spotUSDTBalance);
        user.totalUSDTBalance = parseFloat(futuresUSDTBalance) + parseFloat(spotUSDTBalance);
        console.log(user.futuresUSDTBalance)
        console.log(user.spotUSDTBalance)
        console.log(user.totalUSDTBalance)
        await saveUser(user);
        return {
            futuresUSDTBalance: user.futuresUSDTBalance,
            spotUSDTBalance: user.spotUSDTBalance,
            ok: true,
        };
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { getUserBalance, updateUserBalance };