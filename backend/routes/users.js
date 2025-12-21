const express = require("express");
const {
	getUsers,
	getUser,
	updateUser,
	deleteUser,
	resetPassword,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, authorize("admin"));

router.route("/").get(getUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.put("/:id/reset-password", resetPassword);

module.exports = router;
