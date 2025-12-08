// backend/controllers/lessonController.js (Modified Code)

const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// @desc    Add a new lesson to a course
// @route   POST /api/lessons/:courseId
// @access  Private/Farmer/GovOfficial/Admin (Updated access comment)
exports.addLessonToCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // In a real app, logic would go here to ensure req.user.role is authorized to edit the course
    // before allowing the lesson to be created.

    req.body.courseId = courseId;
    const lesson = await Lesson.create(req.body);

    // Update the parent Course document to include the new lesson ID
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { lessons: lesson._id } },
      { new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get a single lesson's details
// @route   GET /api/lessons/:lessonId
// @access  Private (must be logged in/enrolled)
exports.getLessonDetails = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    
    if (!lesson) {
        return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // In a real app, you would add logic here to check enrollment status
    // before sending the videoUrl or content

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a lesson
// @route   PATCH /api/lessons/:lessonId
// @access  Private/Farmer/GovOfficial/Admin (Updated access comment)
exports.updateLesson = async (req, res) => {
    try {
        // We must check if the user is authorized to edit the parent course
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

        const course = await Course.findById(lesson.courseId);
        
        // Check if the user is the owner OR is an authorized role
        const allowedRoles = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
        const isAuthorizedRole = allowedRoles.includes(req.user.role);
        const isOwner = course.instructor.toString() === req.user.id;

        if (!isOwner && !isAuthorizedRole) {
            return res.status(403).json({ success: false, message: 'User not authorized to update this lesson' });
        }
        // End authorization check

        const updatedLesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: updatedLesson });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// @desc    Delete a lesson
// @route   DELETE /api/lessons/:lessonId
// @access  Private/Farmer/GovOfficial/Admin (Updated access comment)
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    
    // We must check if the user is authorized to edit the parent course before deleting the lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const course = await Course.findById(lesson.courseId);

    // Check if the user is the owner OR is an authorized role
    const allowedRoles = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
    const isAuthorizedRole = allowedRoles.includes(req.user.role);
    const isOwner = course.instructor.toString() === req.user.id;

    if (!isOwner && !isAuthorizedRole) {
        return res.status(403).json({ success: false, message: 'User not authorized to delete this lesson' });
    }
    // End authorization check

    // Proceed with deletion if authorized
    await Lesson.findByIdAndDelete(lessonId);

    // Also remove the lesson reference from the parent Course document
    await Course.findByIdAndUpdate(lesson.courseId, { $pull: { lessons: lessonId } });

    res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
