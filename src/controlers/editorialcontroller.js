const Editorial = require("../models/editorial");
const Problem = require("../models/problem");

// ✅ GET editorial by problem
const getEditorial = async (req, res) => {
  try {
    const { problemId } = req.params;

    const editorial = await Editorial.findOne({ problem: problemId })
      .populate("uploadedBy", "name email");

    if (!editorial) {
      return res.status(404).json({
        success: false,
        message: "No editorial found for this problem"
      });
    }

    return res.status(200).json({
      success: true,
      editorial
    });
  } catch (error) {
    console.error("Get Editorial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch editorial"
    });
  }
};

// ✅ CREATE or UPDATE editorial (upsert)
const upsertEditorial = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, description, videoUrl, videoType } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and videoUrl are required"
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }

    const editorial = await Editorial.findOneAndUpdate(
      { problem: problemId },
      {
        problem: problemId,
        title: title.trim(),
        description: description || "",
        videoUrl,
        videoType: videoType || "youtube",
        uploadedBy: req.user._id
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      editorial
    });
  } catch (error) {
    console.error("Upsert Editorial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save editorial"
    });
  }
};

// ✅ DELETE editorial
const deleteEditorial = async (req, res) => {
  try {
    const { problemId } = req.params;

    const deleted = await Editorial.findOneAndDelete({ problem: problemId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Editorial not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Editorial deleted"
    });
  } catch (error) {
    console.error("Delete Editorial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete editorial"
    });
  }
};

module.exports = {
  getEditorial,
  upsertEditorial,
  deleteEditorial
};