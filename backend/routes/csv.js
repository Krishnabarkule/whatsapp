const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/auth");

// Protect all CSV routes
router.use(protect);

// Multer configuration for CSV upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "..", "..", "uploads"));
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (path.extname(file.originalname).toLowerCase() !== ".csv") {
			return cb(new Error("Only CSV files are allowed"));
		}
		cb(null, true);
	},
});

// Upload and parse CSV
router.post("/upload", upload.single("csv"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		const results = [];
		const headers = [];

		fs.createReadStream(req.file.path)
			.pipe(csv())
			.on("headers", (headerList) => {
				headers.push(...headerList);
			})
			.on("data", (data) => {
				// Validate that phone field exists
				if (!data.phone) {
					console.warn("Row missing phone field:", data);
					return;
				}
				results.push(data);
			})
			.on("end", () => {
				// Clean up uploaded file
				fs.unlinkSync(req.file.path);

				if (results.length === 0) {
					return res.status(400).json({
						error:
							'No valid contacts found. Make sure your CSV has a "phone" column.',
					});
				}

				res.json({
					success: true,
					contacts: results,
					headers,
					count: results.length,
				});
			})
			.on("error", (error) => {
				// Clean up uploaded file
				if (fs.existsSync(req.file.path)) {
					fs.unlinkSync(req.file.path);
				}
				res.status(500).json({ error: error.message });
			});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
