const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create necessary directories
const dirs = ["sessions", "uploads", "media"];
dirs.forEach((dir) => {
	const dirPath = path.join(__dirname, "..", dir);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
});

// Make io accessible to routes
app.set("io", io);

// Import routes
const sessionRoutes = require("./routes/sessions");
const messageRoutes = require("./routes/messages");
const csvRoutes = require("./routes/csv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analytics");

// Use routes
app.use("/api/sessions", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/csv", csvRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
	console.error("Error caught in middleware:", err);
	console.error("Error stack:", err.stack);
	res.status(500).json({
		success: false,
		error: err.message || "Server Error",
	});
});

// Socket.io connection
io.on("connection", (socket) => {
	console.log("Client connected:", socket.id);

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
