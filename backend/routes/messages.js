const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const MessageService = require("../services/MessageService");
const { protect, checkMessageLimits } = require("../middleware/auth");
const User = require("../models/User");
const MessageLog = require("../models/MessageLog");

let messageService = null;

// Protect all message routes
router.use(protect);

// Initialize services - get sessionManager from sessions route
router.use((req, res, next) => {
	const io = req.app.get("io");

	if (!messageService) {
		messageService = new MessageService(io);
	}

	// Get sessionManager from app (shared with sessions route)
	req.sessionManager = req.app.get("sessionManager");
	req.messageService = messageService;
	next();
});

// Multer configuration for media upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "..", "..", "media"));
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({ storage });

// Send bulk messages
router.post(
	"/send-bulk",
	upload.single("media"),
	checkMessageLimits,
	async (req, res) => {
		console.log("=== /send-bulk endpoint called ===");
		console.log("Timestamp:", new Date().toISOString());
		console.log("User:", req.user?.userId);

		try {
			const { sessionId, contacts, template } = req.body;

			if (!sessionId || !contacts || !template) {
				return res.status(400).json({ error: "Missing required fields" });
			}

			const session = req.sessionManager.getSession(sessionId);

			if (!session) {
				return res.status(404).json({ error: "Session not found" });
			}

			if (session.status !== "connected") {
				return res.status(400).json({ error: "Session is not connected" });
			}

			const parsedContacts = JSON.parse(contacts);
			console.log("Parsed contacts count:", parsedContacts.length);

			const mediaPath = req.file ? req.file.path : null;

			// Start sending in background
			const queueId = await req.messageService.sendBulkMessages(
				sessionId,
				session,
				parsedContacts,
				template,
				mediaPath,
				req.user // Pass user for logging
			);

			console.log("Queue created with ID:", queueId);

			res.json({
				success: true,
				queueId,
				message: "Bulk sending started",
			});
		} catch (error) {
			console.error("Error in /send-bulk:", error.message);
			res.status(500).json({ error: error.message });
		}
	}
);

// Pause sending
router.post("/pause/:queueId", (req, res) => {
	try {
		const { queueId } = req.params;
		const paused = req.messageService.pauseSending(queueId);

		if (!paused) {
			return res
				.status(404)
				.json({ error: "Queue not found or cannot be paused" });
		}

		res.json({ success: true, message: "Sending paused" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Resume sending
router.post("/resume/:queueId", (req, res) => {
	try {
		const { queueId } = req.params;
		const resumed = req.messageService.resumeSending(queueId);

		if (!resumed) {
			return res
				.status(404)
				.json({ error: "Queue not found or cannot be resumed" });
		}

		res.json({ success: true, message: "Sending resumed" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Stop sending
router.post("/stop/:queueId", (req, res) => {
	try {
		const { queueId } = req.params;
		const stopped = req.messageService.stopSending(queueId);

		if (!stopped) {
			return res.status(404).json({ error: "Queue not found" });
		}

		res.json({ success: true, message: "Sending stopped" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get delivery logs
router.get("/logs", (req, res) => {
	try {
		const { limit } = req.query;
		const logs = req.messageService.getDeliveryLogs(
			limit ? parseInt(limit) : 100
		);
		res.json({ logs });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get queue status
router.get("/queue/:queueId", (req, res) => {
	try {
		const { queueId } = req.params;
		const status = req.messageService.getQueueStatus(queueId);

		if (!status) {
			return res.status(404).json({ error: "Queue not found" });
		}

		res.json({ status });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
