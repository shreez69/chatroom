const { MongoClient } = require('mongodb');
require('dotenv').config(); 
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(process.env.DB_NAME); 
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

module.exports = connectDB;
