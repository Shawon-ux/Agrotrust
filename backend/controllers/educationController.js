const EducationContent = require("../models/EducationContent");

exports.listContent = async (req, res) => {
  try {
    const lang = req.query.lang || req.user.languagePreference || "en";
    const content = await EducationContent.find({ language: lang });
    res.json(content);
  } catch (err) {
    console.error("List education error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
