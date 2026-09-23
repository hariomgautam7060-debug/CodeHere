const express = require("express");
const router = express.Router();
const middlemare = require("../middlemare/usermiddlemare");
const {
  getEditorial,
  upsertEditorial,
  deleteEditorial
} = require("../controlers/editorialcontroller");

// GET    /editorial/:problemId
router.get("/:problemId", middlemare, getEditorial);

// POST   /editorial/:problemId
router.post("/:problemId", middlemare, upsertEditorial);

// DELETE /editorial/:problemId
router.delete("/:problemId", middlemare, deleteEditorial);

module.exports = router;