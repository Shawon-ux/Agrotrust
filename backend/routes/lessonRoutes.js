const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  addLessonToCourse,
  getLessonDetails,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

router.get("/:lessonId", protect, getLessonDetails);
router.post("/:courseId", authorizeRoles("FARMER", "GOV_OFFICIAL", "ADMIN"), addLessonToCourse);
router.patch("/:lessonId", authorizeRoles("FARMER", "GOV_OFFICIAL", "ADMIN"), updateLesson);
router.delete("/:lessonId", authorizeRoles("FARMER", "GOV_OFFICIAL", "ADMIN"), deleteLesson);

module.exports = router;
