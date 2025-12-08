// backend/controllers/lessonController.js

const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// @desc    Add a new lesson to a course
// @route   POST /api/lessons/:courseId
// @access  Private/Instructor/Admin
exports.addLessonToCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // Check if the user is authorized to edit this course (controller logic required)

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
// @access  Private/Instructor/Admin
exports.updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
            new: true,
            runValidators: true,
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }
        res.status(200).json({ success: true, data: lesson });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// @desc    Delete a lesson
// @route   DELETE /api/lessons/:lessonId
// @access  Private/Instructor/Admin
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findByIdAndDelete(lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // Also remove the lesson reference from the parent Course document
    await Course.findByIdAndUpdate(lesson.courseId, { $pull: { lessons: lessonId } });

    res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
