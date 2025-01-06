const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
    username: { type: String, required: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);