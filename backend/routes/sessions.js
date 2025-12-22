const express = require("express");
const router = express.Router();
const SessionManager = require("../services/SessionManager");
const { protect } = require("../middleware/auth");

let sessionManager = null;

// Protect all session routes
router.use(protect);

// Initialize session manager
router.use((req, res, next) => {
	if (!sessionManager) {
		const io = req.app.get("io");
		sessionManager = new SessionManager(io);
		// Store in app for sharing with other routes
		req.app.set("sessionManager", sessionManager);
		// Don't auto-load sessions - let users reconnect manually
		// sessionManager.loadExistingSessions();
	}
	req.sessionManager = sessionManager;
	next();
});

// Create new session
router.post("/create", async (req, res) => {
	try {
		const { sessionId, usePairingCode, phoneNumber } = req.body;

		console.log("Creating session:", {
			sessionId,
			usePairingCode,
			phoneNumber,
			userId: req.user.userId,
		});

		if (!sessionId) {
			return res.status(400).json({ error: "Session ID is required" });
		}

		if (usePairingCode && !phoneNumber) {
			return res
				.status(400)
				.json({ error: "Phone number is required for pairing code" });
		}

		// Create session with userId
		const session = await req.sessionManager.createSession(
			sessionId,
			usePairingCode,
			phoneNumber,
			false,
			req.user.userId
		);

		console.log("Session created successfully:", sessionId);

		res.json({
			success: true,
			sessionId,
			status: session.status,
		});
	} catch (error) {
		console.error("Error creating session:", error);
		res.status(500).json({ error: error.message });
	}
});

// Get all sessions (filtered by user)
router.get("/list", (req, res) => {
	try {
		const allSessions = req.sessionManager.getAllSessions();
		// Filter sessions by userId (admin can see all)
		const sessions =
			req.user.role === "admin"
				? allSessions
				: allSessions.filter((s) => s.userId === req.user.userId);
		res.json({ sessions });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get specific session
router.get("/:sessionId", (req, res) => {
	try {
		const { sessionId } = req.params;
		const session = req.sessionManager.getSession(sessionId);

		if (!session) {
			return res.status(404).json({ error: "Session not found" });
		}

		// Check ownership (admin can access all)
		if (req.user.role !== "admin" && session.userId !== req.user.userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		res.json({
			sessionId,
			status: session.status,
			qr: session.qr,
			pairingCode: session.pairingCode,
			user: session.socket.user,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Delete session
router.delete("/:sessionId", async (req, res) => {
	try {
		const { sessionId } = req.params;
		const session = req.sessionManager.getSession(sessionId);

		if (!session) {
			return res.status(404).json({ error: "Session not found" });
		}

		// Check ownership (admin can delete any)
		if (req.user.role !== "admin" && session.userId !== req.user.userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		const deleted = await req.sessionManager.deleteSession(sessionId);

		if (!deleted) {
			return res.status(404).json({ error: "Session not found" });
		}

		res.json({ success: true, message: "Session deleted" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
