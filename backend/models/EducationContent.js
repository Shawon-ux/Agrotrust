const mongoose = require("mongoose");

const educationContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contentType: { type: String, enum: ["ARTICLE", "VIDEO", "PDF"], default: "ARTICLE" },
    language: { type: String, default: "en" },
    url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EducationContent", educationContentSchema);
