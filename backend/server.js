const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Use routes
app.use("/api/sessions", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/csv", csvRoutes);

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
