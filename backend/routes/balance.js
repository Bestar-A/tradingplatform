const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserBalance, updateUserBalance } = require('../services/balanceService');
const router = express.Router();

router.post('/getBalance', authenticateToken, async (req, res) => {
    const username = req.user.username;
   
    try {
        const balance = await getUserBalance(username);

        if (!balance) {
            return res.status(404).send('User not found');
        }
        res.json(balance);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/updateBalance', authenticateToken, async (req, res) => {
    const { futuresUSDTBalance, spotUSDTBalance } = req.body;
    const username = req.user.username;
    try {
        res.json(await updateUserBalance(username, futuresUSDTBalance, spotUSDTBalance));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;