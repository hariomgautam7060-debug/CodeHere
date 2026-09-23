const mongoose = require("mongoose");

const editorialSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    videoUrl: {
      type: String,
      required: true
    },
    videoType: {
      type: String,
      enum: ["youtube", "direct"],
      default: "youtube"
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Editorial", editorialSchema);