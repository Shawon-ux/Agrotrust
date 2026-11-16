const mongoose = require("mongoose");

const STAGES = ["PLANNED", "SOWN", "GROWING", "HARVESTED"];

const farmPlanSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cropName: { type: String, required: true, trim: true },
    // land details (FR-5)
    landArea: { type: Number, required: true, min: 0 },
    landUnit: { type: String, enum: ["acre", "hectare", "bigha", "decimal"], default: "acre" },
    landLocation: { type: String, trim: true },
    expectedYieldKg: { type: Number, min: 0 },
    actualYieldKg: { type: Number, min: 0 },
    sowingDate: { type: Date },
    expectedHarvestDate: { type: Date },
    stage: { type: String, enum: STAGES, default: "PLANNED" },
    history: [
      {
        stage: { type: String, enum: STAGES },
        note: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

farmPlanSchema.statics.STAGES = STAGES;
module.exports = mongoose.model("FarmPlan", farmPlanSchema);
