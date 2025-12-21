const express = require("express");
const {
	register,
	login,
	getMe,
	logout,
	updatePassword,
	verifyForgotPassword,
	resetPassword,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/register", protect, authorize("admin"), register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/updatepassword", protect, updatePassword);
router.post("/forgot-password/verify", verifyForgotPassword);
router.post("/forgot-password/reset", resetPassword);

module.exports = router;
