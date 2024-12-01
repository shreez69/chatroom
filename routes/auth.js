const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const connectDB = require('../config/db'); // Adjust the path to your db.js file

const router = express.Router();

const SECRET_KEY = 'your_secret_key'; // Use a secure key for JWT
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

let db;

// Connect to MongoDB
(async () => {
    db = await connectDB();
})();

// Helper function to send OTP via email
async function sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // Replace with your email
            pass: 'your-email-password', // Replace with your email password
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP:', err);
    }
}

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

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

        // Generate OTP and save it to the database
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);

        await db.collection('users').updateOne(
            { email },
            { $set: { otp, otpExpiry } }
        );

        // Send OTP to the user's email
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

        // Clear OTP after successful verification
        await db.collection('users').updateOne(
            { email },
            { $set: { otp: null, otpExpiry: null } }
        );

        // Generate JWT token
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'OTP verified successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
