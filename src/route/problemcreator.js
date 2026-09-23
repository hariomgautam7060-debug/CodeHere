const express = require("express");
const router = express.Router();

const {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    solvedallproblembyuser
} = require("../controlers/userproblem");

const adminmiddlemare = require("../middlemare/adminmiddlemare");
const middlemare = require("../middlemare/usermiddlemare");

// Create - /problem/create
router.post("/create", adminmiddlemare, createProblem);

// Get all - /problem/all
router.get("/all", middlemare, getAllProblems);

// Update - /problem/update/:id
router.put("/update/:id", adminmiddlemare, updateProblem);

// Get solved - /problem/solvedproblembyuser
router.get("/solvedproblembyuser", middlemare, solvedallproblembyuser);

// Get single - /problem/:id
router.get("/:id", middlemare, getProblemById);

// Delete - /problem/:id
router.delete("/:id", adminmiddlemare, deleteProblem);

module.exports = router;