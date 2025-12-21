const express = require("express");
const {
	getDashboardStats,
	getDailyUsage,
	getMonthlyUsage,
	getAdminOverview,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/daily/:days", getDailyUsage);
router.get("/monthly/:months", getMonthlyUsage);
router.get("/admin/overview", authorize("admin"), getAdminOverview);

module.exports = router;
