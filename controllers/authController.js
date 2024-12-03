const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService'); // Email helper service
const { SECRET_KEY, OTP_EXPIRY_TIME } = require('../config/keys'); // Configuration
const connectDB = require('../config/db');

let db;

// Connect to MongoDB
(async () => {
    db = await connectDB();
})();

const register = async (req, res) => {
    const { email, password } = req.body;

    try {
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
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);

        await db.collection('users').updateOne(
            { email },
            { $set: { otp, otpExpiry } }
        );

        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to login user' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });

        if (!user || user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

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
};

module.exports = { register, login, verifyOtp };
