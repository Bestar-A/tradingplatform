const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Key = require('../models/Key');
const { loadUsers, saveUser } = require('../services/userService');
const { loadKeys, deleteKey } = require('../services/keyService');
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('username: ', username);
    
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        const keys = await loadKeys();
        if (keys.length === 0) {
            return res.status(500).send('No available keys');
        }

        const randomIndex = Math.floor(Math.random() * keys.length);
        const selectedKey = keys.splice(randomIndex, 1)[0];

        user = new User({
            username,
            totalValue: 0,
            totalUSDTBalance : 0,
            futuresValue: 0,
            futuresUSDTBalance: 0,
            spotValue: 0,
            spotUSDTBalance: 0,
            password: hashedPassword,
            privateKey: selectedKey.privateKey,
            address: selectedKey.address,
        });
        await saveUser(user);
        await deleteKey(selectedKey._id);
        res.json({ redirectTo: '/login' , ok: true});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
        console.log('token: ', token)
        res.json({ token, redirectTo: '/trading', ok: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;