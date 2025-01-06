const mongoose = require('mongoose');

const KeySchema = new mongoose.Schema({
    privateKey: { type: String, required: true },
    address: { type: String, required: true },
});

module.exports = mongoose.model('Key', KeySchema);