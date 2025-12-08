const Course = require("../models/Course"); // Import the Mongoose model
const User = require("../models/User");

const Notification = require("../models/Notification");

// @desc    Get all courses (public or published only)
// @route   GET /api/courses
// @access  Public
// @desc    Get all courses (public or published only, unless user is admin/manager)
// @route   GET /api/courses
// @access  Public (but login changes scope)
exports.getAllCourses = async (req, res) => {
    try {
      let filter = { published: true }; // Default filter for public view
  
      // If the user is logged in AND is authorized to manage courses, show all of them
      const allowedRoles = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
      if (req.user && allowedRoles.includes(req.user.role)) {
          // If they are allowed to manage, don't filter by published status here.
          // The frontend EducationList component handles the filtering UI
          filter = {}; 
      }
  
      const courses = await Course.find(filter).populate("instructor", "name email");
      res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private (users must be logged in to view course details)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name")
      .populate("lessons", "title order");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Farmer/GovOfficial/Admin
///prev code------------------
// exports.createCourse = async (req, res) => {
//   try {
//     req.body.instructor = req.user.id; 

//    //If the creator is not an ADMIN, force the course to be unpublished initially
//     if (req.user.role !== "ADMIN") {
//         req.body.published = false; 
//     }
//     // ----------------------------

//     if (req.file) {
//       req.body.thumbnailUrl = req.file.path; 
//     }

//     const course = await Course.create(req.body);
//     // ADDED response message
//     res.status(201).json({ success: true, data: course, message: "Course created successfully. Awaiting admin approval." });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// @desc    Update course details
// @route   PATCH /api/courses/:id
// @access  Private/Farmer/GovOfficial/Admin
exports.createCourse = async (req, res) => {
    try {
      req.body.instructor = req.user.id; 
      const isAdminCreating = req.user.role === "ADMIN";
  
      // Force unpublished if not an admin
      if (!isAdminCreating) {
          req.body.published = false; 
      }
  
      if (req.file) {
        req.body.thumbnailUrl = req.file.path; 
      }
  
      const course = await Course.create(req.body);
  
      //  ADDED LOGIC FOR ADMIN NOTIFICATION 
      if (!isAdminCreating) {
          const admins = await User.find({ role: "ADMIN" });
          const notificationTitle = "New Course Awaiting Approval";
          const notificationMessage = `A new course ("${course.title}") was submitted by ${req.user.name}.`;
          const notificationLink = `/education/admin/review/${course._id}`; // Define where admins review courses
  
          // Create a notification record for each admin found
          for (const admin of admins) {
              await Notification.create({
                  user: admin._id,
                  title: notificationTitle,
                  message: notificationMessage,
                  type: "COURSE_APPROVAL", 
                  link: notificationLink,
              });
          }
      }
      // ----------------------------------------
  
      res.status(201).json({ success: true, data: course, message: "Course created successfully. Awaiting admin approval." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    // Check if the user is the owner OR is an authorized role
    const allowedRoles = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
    const isAuthorizedRole = allowedRoles.includes(req.user.role);
    const isOwner = course.instructor.toString() === req.user.id;

    if (!isOwner && !isAuthorizedRole) {
        return res.status(403).json({ success: false, message: 'User not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated object
      runValidators: true, // Ensure Mongoose schema validation runs
    });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle course publication status (This route is less relevant now as approval handles publishing)
// @route   PATCH /api/courses/:id/publish
// @access  Private/Farmer/GovOfficial/Admin
exports.publishCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        const allowedRoles = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
        const isAuthorizedRole = allowedRoles.includes(req.user.role);
        const isOwner = course.instructor.toString() === req.user.id;

        if (!isOwner && !isAuthorizedRole) {
            return res.status(403).json({ success: false, message: 'User not authorized to publish this course' });
        }

        course.published = !course.published;
        await course.save();

        res.status(200).json({ success: true, data: course });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin (Only Admins can delete permanently)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ⭐️ NEW ENROLLMENT FUNCTION ⭐️
// @desc    Enroll the logged-in user into a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollInCourse = async (req, res) => {
    const courseId = req.params.id;
    // Assumes req.user is populated by your 'protect' middleware
    const userId = req.user._id; 
  
    try {
      // 1. Check if the course exists and is published
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found." });
      }
      if (!course.published) {
        return res.status(403).json({ success: false, message: "Cannot enroll in an unpublished course." });
      }
  
      // 2. Find the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // 3. Check if the user is already enrolled
      // Note: Mongoose's .includes() works directly with ObjectId types in this context
      const alreadyEnrolled = user.enrolledCourses.includes(courseId);
  
      if (alreadyEnrolled) {
        return res.status(400).json({ success: false, message: "You are already enrolled in this course." });
      }
  
      // 4. Enroll the user (add courseId to enrolledCourses array)
      user.enrolledCourses.push(courseId);
      await user.save();
  
      res.status(200).json({
        success: true,
        message: `Successfully enrolled in "${course.title}".`,
        enrolledCourses: user.enrolledCourses,
      });
    } catch (error) {
      console.error("Enrollment error:", error.message);
      res.status(500).json({ success: false, message: "Server error during enrollment." });
    }
  };
  // ⭐️ END ENROLLMENT FUNCTION ⭐️

// 👇 ADDED FUNCTION: Admin explicit approval 
// @desc    Admin explicitly approves a course
// @route   PATCH /api/courses/:id/approve
// @access  Private/Admin
exports.adminApproveCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (req.user.role !== "ADMIN") {
             return res.status(403).json({ success: false, message: 'Only admins can approve courses.' });
        }

        course.published = true;
        await course.save();

        res.status(200).json({ success: true, data: course, message: "Course approved and published." });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
