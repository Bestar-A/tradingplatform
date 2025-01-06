const express = require('express');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const { authenticateToken } = require('../middleware/auth');
const { sendWithdrawalEmail } = require('../utils/email');
const { saveWithdrawalRequest } = require('../services/withdrawalService');
const router = express.Router();

// Withdrawal Request API
router.post('/withdrawRequest', authenticateToken, async (req, res) => {
    const { address, amount } = req.body;
    const username = req.user.username;

    try {
        const withdrawalRequest = new WithdrawalRequest({
            username,
            address,
            amount,
        });

        await saveWithdrawalRequest(withdrawalRequest);
        sendWithdrawalEmail(username, address, amount);

        res.json({
            ok: true,
            message: 'Withdrawal request submitted successfully',
        });
    } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
}
});

module.exports = router;