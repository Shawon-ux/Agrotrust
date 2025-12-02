const express = require("express");
const router = express.Router();
const {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getComplaints);
router.post("/", protect, createComplaint);
router.patch("/:id/status", protect, updateComplaintStatus);

module.exports = router;
