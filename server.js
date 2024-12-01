const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const http = require("http");

const SECRET_KEY = "your_secret_key"; // Replace with a secure key
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "/public")));

// In-memory storage for simplicity (use a database for production)
const activeUsers = {};

// Middleware to verify JWT token
function verifyToken(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: Token required"));
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.user = decoded; // Add user data to socket object
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
}

// Socket.IO middleware to verify JWT
io.use(verifyToken);

// Socket.IO connection handling
io.on("connection", (socket) => {
    const username = socket.user.email;

    // Add user to activeUsers
    activeUsers[username] = socket.id;
    socket.broadcast.emit("update", `${username} joined the conversation`);

    // Handle chat messages
    socket.on("chat", (message) => {
        io.emit("chat", { username, message });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        delete activeUsers[username];
        socket.broadcast.emit("update", `${username} left the conversation`);
    });
});

// Start the server
server.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
