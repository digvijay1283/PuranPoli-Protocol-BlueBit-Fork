const express = require("express");
const router = express.Router();

// @desc    Health check
// @route   GET /api/v1/health
// @access  Public
router.get("/", (req, res) => {
  res.json({ success: true, message: "Supply Chain API is running" });
});

module.exports = router;
