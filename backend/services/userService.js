const User = require('../models/User');

async function loadUsers() {
    try {
        const users = await User.find();
        return users;
    } catch (err) {
        console.error(err.message);
        return [];
    }
}

async function saveUser(user) {
    try {
        await user.save();
    } catch (err) {
        console.error(err.message);
    }
}

async function getUser(username) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (err) {
        console.error(err.message);
    }
}

async function getAllUsers() {
    try {
        const users = await User.find()
        if (!users) {
            throw new Error('User not found');
        }
        return users;
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { loadUsers, saveUser, getUser, getAllUsers };