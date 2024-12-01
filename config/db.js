const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:admin1234@cluster0.utlef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);s
    } finally {
        await client.close();
    }
}

testConnection();
