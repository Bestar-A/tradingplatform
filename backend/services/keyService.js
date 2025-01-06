const Key = require('../models/Key');

async function loadKeys() {
    try {
        const keys = await Key.find();
        console.log('keys: ', keys)
        return keys;
    } catch (err) {
        console.error(err.message);
        return [];
    }
}

async function saveKey(key) {
    try {
        await key.save();
    } catch (err) {
        console.error(err.message);
    }
}

async function deleteKey(keyId) {
    try {
        await Key.deleteOne({ _id: keyId });
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { loadKeys, saveKey, deleteKey };