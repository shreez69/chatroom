const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const connectDB = require('../config/db');
require('dotenv').config();

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

let db;

// Connect to MongoDB
(async () => {
    db = await connectDB();
})();

// Helper function to send OTP via email
const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL, pass: EMAIL_PASSWORD },
    });

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP:', err);
        throw new Error('Failed to send OTP');
    }
};

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate email and password
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await db.collection('users').insertOne({
            email,
            password: hashedPassword,
            otp: null,
            otpExpiry: null,
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login and send OTP
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Prevent frequent OTP requests
        const now = Date.now();
        if (user.lastOtpRequest && now - user.lastOtpRequest < 60000) {
            return res.status(429).json({ error: 'OTP request too frequent' });
        }

        // Generate OTP and save to database
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(now + OTP_EXPIRY_TIME);

        await db.collection('users').updateOne(
            { email },
            { $set: { otp, otpExpiry, lastOtpRequest: now } }
        );

        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to login user' });
    }
});

// Verify OTP and generate JWT
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });

        if (!user || user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP and generate JWT
        await db.collection('users').updateOne(
            { email },
            { $set: { otp: null, otpExpiry: null } }
        );

        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'OTP verified successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
