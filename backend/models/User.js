const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalValue: { type: Number, default: 0 },
    totalUSDTBalance: { type: Number, default: 0 },
    futuresValue: { type: Number, default: 0 },
    futuresUSDTBalance: { type: Number, default: 0 },
    spotValue: { type: Number, default: 0 },
    spotUSDTBalance: { type: Number, default: 0 },
    privateKey: { type: String, required: true },
    address: { type: String, required: true },
    futuresPositions: { type: Array, default: [] },
    closedFuturesPositions: { type: Array, default: [] },
    spotPositions: { type: Array, default: [] },
    closedSpotPositions: { type: Array, default: [] },
});

module.exports = mongoose.model('User', UserSchema);