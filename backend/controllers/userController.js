// backend/controllers/userController.js
const User = require("../models/User");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("enrolledCourses", "title instructor published");
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
