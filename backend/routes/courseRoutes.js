const express = require("express");
const router = express.Router();


// Assuming you have this middleware set up similarly to your crop routes
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload"); // For course thumbnails

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  adminApproveCourse, 
  enrollInCourse,
} = require("../controllers/courseController");

router.get("/",protect, getAllCourses);
router.get("/:id", protect, getCourseById);
router.route("/:id/enroll").post(protect, enrollInCourse);
router.post(
  "/",
  protect,
  authorizeRoles("FARMER", "GOV_OFFICIAL", "ADMIN"),
  upload.single("thumbnail"),
  createCourse

);
router.patch("/:id", protect, authorizeRoles("FARMER", "GOV_OFFICIAL", "ADMIN"), updateCourse);
router.patch("/:id/publish", protect, authorizeRoles("FARMER", "GOV_OFFICIAL", "ADMIN"), publishCourse);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteCourse);
router.patch(
    "/:id/approve",
    protect,
    authorizeRoles("ADMIN"), // Only Admins can use this route
    adminApproveCourse
  );
  
module.exports = router;
