const WithdrawalRequest = require('../models/WithdrawalRequest');

async function loadWithdrawalRequests() {
    try {
        const requests = await WithdrawalRequest.find();
        return requests;
    } catch (err) {
        console.error(err.message);
        return [];
    }
}

async function saveWithdrawalRequest(request) {
    try {
        await request.save();
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { loadWithdrawalRequests, saveWithdrawalRequest };