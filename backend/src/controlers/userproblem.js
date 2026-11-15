
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { runCode } = require("../services/jdoodle");

// CREATE PROBLEM
const createProblem = async (req, res) => {
    try {

        const {
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            examples,
            testCases,
            starterCode,
            solutionCode,
            tags
        } = req.body;


        // =========================
        // REQUIRED FIELDS
        // =========================

        if (
            !title ||
            !description ||
            !difficulty ||
            !inputFormat ||
            !outputFormat
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }


        // =========================
        // TEST CASE CHECK
        // =========================

        if (!testCases || testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one test case is required"
            });
        }


        // =========================
        // SOLUTION CHECK - OPTIONAL
        // =========================

        if (!solutionCode || !solutionCode.cpp) {
            console.warn("⚠️ No C++ solution provided for validation");
        }


        // =========================
        // TEST CASE VALIDATION - OPTIONAL
        // =========================

        if (solutionCode && solutionCode.cpp && testCases && testCases.length > 0) {
            console.log("✅ Validating test cases with official solution...");
            
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                
                try {
                    const result = await runCode({
                        language: "cpp",
                        versionIndex: "5",
                        code: solutionCode.cpp,
                        stdin: testCase.input
                    });
                    
                    if (!result.isExecutionSuccess) {
                        console.warn(`⚠️ Test case ${i+1} validation failed:`, result.error);
                        // Continue to next test case
                        continue;
                    }
                    
                    const actualOutput = (result.output || "").trim();
                    const expectedOutput = (testCase.expectedOutput || "").trim();
                    
                    if (actualOutput !== expectedOutput) {
                        console.warn(`⚠️ Test case ${i+1} mismatch: Expected "${expectedOutput}", Got "${actualOutput}"`);
                        // Continue to next test case
                        continue;
                    }
                    
                } catch (error) {
                    console.error(`❌ Validation error for test case ${i+1}:`, error);
                }
            }
            
            console.log("✅ Validation completed");
        }


        // =========================
        // CREATE PROBLEM
        // =========================

        const problem = await Problem.create({

            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            examples,
            testCases,
            starterCode,
            solutionCode,
            tags,

            createdBy: req.user._id
        });


        return res.status(201).json({

            success: true,

            message: "Problem created successfully",

            problem
        });

    } catch (error) {

        console.error(
            "Create Problem Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error while creating problem"
        });
    }
};

const getAllProblems = async (req, res) => {
    try {

        const problems = await Problem.find()
            .select(
                "title difficulty tags createdAt"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            count: problems.length,

            problems
        });

    } catch (error) {

        console.error(
            "Get Problems Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error while fetching problems"
        });
    }
};

const getProblemById = async (req, res) => {
    try {

        const { id } = req.params;


        const problem = await Problem.findById(id);


        if (!problem) {

            return res.status(404).json({

                success: false,

                message: "Problem not found"
            });
        }


        // Never send official solution to frontend
        const problemData = problem.toObject();

        delete problemData.solutionCode;


        return res.status(200).json({

            success: true,

            problem: problemData
        });

    } catch (error) {

        console.error(
            "Get Problem Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error while fetching problem"
        });
    }
};

// UPDATE PROBLEM
const updateProblem = async (req, res) => {

    try {

        const { id } = req.params;


        // =========================
        // FIND EXISTING PROBLEM
        // =========================

        const problem = await Problem.findById(id);


        if (!problem) {

            return res.status(404).json({

                success: false,

                message: "Problem not found"
            });
        }


        const {

            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            examples,
            testCases,
            starterCode,
            solutionCode,
            tags

        } = req.body;


        // =========================
        // UPDATE DATABASE
        // =========================

        if (title !== undefined)
            problem.title = title;

        if (description !== undefined)
            problem.description = description;

        if (difficulty !== undefined)
            problem.difficulty = difficulty;

        if (inputFormat !== undefined)
            problem.inputFormat = inputFormat;

        if (outputFormat !== undefined)
            problem.outputFormat = outputFormat;

        if (constraints !== undefined)
            problem.constraints = constraints;

        if (examples !== undefined)
            problem.examples = examples;

        if (testCases !== undefined)
            problem.testCases = testCases;

        if (starterCode !== undefined)
            problem.starterCode = starterCode;

        if (solutionCode !== undefined)
            problem.solutionCode = solutionCode;

        if (tags !== undefined)
            problem.tags = tags;


        await problem.save();


        return res.status(200).json({

            success: true,

            message:
                "Problem updated successfully",

            problem
        });


    } catch (error) {

        console.error(
            "Update Problem Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while updating problem"
        });
    }
};

// delete problem
const deleteProblem = async (req, res) => {
    try {

        const { id } = req.params;

        // ID check
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Problem ID is missing"
            });
        }

        // Find and delete
        const deletedProblem = await Problem.findByIdAndDelete(id);

        // Problem not found
        if (!deletedProblem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // Successfully deleted
        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });

    } catch (error) {

        console.error("Delete Problem Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting problem"
        });
    }
};

const solvedallproblembyuser = async (req, res) => {
    try {
        const userid = req.user._id;

        const user = await User.findById(userid)
            .populate("problemSolved");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            problemSolved: user.problemSolved
        });

    } catch (error) {
        console.error("Solved Problems Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    solvedallproblembyuser
};