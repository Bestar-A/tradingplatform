const WithdrawalRequest = require('../models/WithdrawalRequest');
const { sendWithdrawalEmail } = require('../utils/email');

exports.withdrawRequest = async (req, res) => {
    const { address, amount } = req.body;
    const username = req.user.username;

    try {
        const newRequest = new WithdrawalRequest({ username, address, amount });
        await newRequest.save();
        sendWithdrawalEmail(username, address, amount);
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};