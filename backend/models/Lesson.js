const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: { type: Number, required: true }, // For sequencing lessons correctly
    videoUrl: { type: String },
    content: { type: String }, // Text, HTML, or markdown content
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
