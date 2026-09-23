
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { runCode } = require("../services/jdoodle");

const submitCode = async (req, res) => {
    try {

        const {
            problemId,
            language,
            code
        } = req.body;

        // =========================
        // VALIDATION
        // =========================

        if (!problemId || !language || !code) {
            return res.status(400).json({
                success: false,
                message: "problemId, language and code are required"
            });
        }

        // =========================
        // CHECK USER
        // =========================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // =========================
        // FIND PROBLEM
        // =========================

        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No test cases found"
            });
        }

        // =========================
        // LANGUAGE
        // =========================

        const languageMap = {

            cpp: {
                language: "cpp",
                versionIndex: "5"
            },

            python: {
                language: "python3",
                versionIndex: "4"
            },

            javascript: {
                language: "nodejs",
                versionIndex: "4"
            }

        };

        const selectedLanguage = languageMap[language];

        if (!selectedLanguage) {
            return res.status(400).json({
                success: false,
                message: "Unsupported language"
            });
        }

        // =========================
        // TEST CASES
        // =========================

        const results = [];

        let passedTestCases = 0;

        for (let i = 0; i < problem.testCases.length; i++) {

            const testCase = problem.testCases[i];

            const result = await runCode({
                language: selectedLanguage.language,
                versionIndex: selectedLanguage.versionIndex,
                code,
                stdin: testCase.input
            });

            // =========================
            // RUNTIME ERROR
            // =========================

            if (!result.isExecutionSuccess) {

                const submission = await Submission.create({

                    user: req.user._id,

                    problem: problem._id,

                    language,

                    code,

                    verdict: "Runtime Error",

                    passedTestCases,

                    totalTestCases: problem.testCases.length,

                    executionTime: result.cpuTime
                        ? Number(result.cpuTime)
                        : null,

                    memory: result.memory
                        ? Number(result.memory)
                        : null
                });

                return res.status(200).json({

                    success: true,

                    verdict: "Runtime Error",

                    testCase: i + 1,

                    error:
                        result.error ||
                        result.output ||
                        "Execution failed",

                    submissionId: submission._id
                });
            }

            // =========================
            // COMPARE OUTPUT
            // =========================

            const actualOutput =
                (result.output || "").trim();

            const expectedOutput =
                (testCase.expectedOutput || "").trim();

            const passed =
                actualOutput === expectedOutput;

            if (passed) {
                passedTestCases++;
            }

            results.push({

                testCase: i + 1,

                passed,

                expectedOutput,

                actualOutput
            });

            // =========================
            // WRONG ANSWER
            // =========================

            if (!passed) {

                const submission = await Submission.create({

                    user: req.user._id,

                    problem: problem._id,

                    language,

                    code,

                    verdict: "Wrong Answer",

                    passedTestCases,

                    totalTestCases: problem.testCases.length,

                    executionTime: result.cpuTime
                        ? Number(result.cpuTime)
                        : null,

                    memory: result.memory
                        ? Number(result.memory)
                        : null
                });

                return res.status(200).json({

                    success: true,

                    verdict: "Wrong Answer",

                    testCase: i + 1,

                    results,

                    submissionId: submission._id
                });
            }
        }

        // =========================
        // ACCEPTED
        // =========================

        const submission = await Submission.create({

            user: req.user._id,

            problem: problem._id,

            language,

            code,

            verdict: "Accepted",

            passedTestCases,

            totalTestCases: problem.testCases.length
        });

        return res.status(200).json({

            success: true,

            verdict: "Accepted",

            results,

            submissionId: submission._id
        });

    } catch (error) {

        console.error(
            "Submit Code Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Code submission failed"
        });
    }
};

const runCodeOnly = async (req, res) => {
    try {
        const { problemId, language, code } = req.body;

        // Basic validation
        if (!problemId || !language || !code) {
            return res.status(400).json({
                success: false,
                message: "problemId, language and code are required"
            });
        }

        // Find problem
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // Only public/sample test cases
        const publicTestCases = problem.testCases.filter(
            (testCase) => testCase.isHidden === false
        );

        if (publicTestCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No public test cases found"
            });
        }

        // Language mapping
        const languageMap = {
            cpp: {
                language: "cpp",
                versionIndex: "5"
            },

            python: {
                language: "python3",
                versionIndex: "4"
            },

            javascript: {
                language: "nodejs",
                versionIndex: "4"
            }
        };

        const selectedLanguage = languageMap[language];

        if (!selectedLanguage) {
            return res.status(400).json({
                success: false,
                message: "Unsupported language"
            });
        }

        const results = [];

        // Run only public test cases
        for (let i = 0; i < publicTestCases.length; i++) {

            const testCase = publicTestCases[i];

            const result = await runCode({
                language: selectedLanguage.language,
                versionIndex: selectedLanguage.versionIndex,
                code,
                stdin: testCase.input
            });

            // Runtime / compilation error
            if (!result.isExecutionSuccess) {
                return res.status(200).json({
                    success: true,
                    verdict: "Runtime Error",
                    testCase: i + 1,
                    error:
                        result.error ||
                        result.output ||
                        "Execution failed",
                    results
                });
            }

            const actualOutput =
                (result.output || "").trim();

            const expectedOutput =
                (testCase.expectedOutput || "").trim();

            const passed =
                actualOutput === expectedOutput;

            results.push({
                testCase: i + 1,
                input: testCase.input,
                expectedOutput,
                actualOutput,
                passed
            });

            // Wrong answer
            if (!passed) {
                return res.status(200).json({
                    success: true,
                    verdict: "Wrong Answer",
                    testCase: i + 1,
                    results
                });
            }
        }

        // All public test cases passed
        return res.status(200).json({
            success: true,
            verdict: "Passed",
            results
        });

    } catch (error) {

        console.error(
            "Run Code Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Code execution failed"
        });
    }
};

const getMySubmissions = async (req, res) => {
    try {

        const submissions = await Submission.find({
            user: req.user._id
        })
            .populate("problem", "title difficulty")
            .select("-code")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {

        console.error(
            "Get Submissions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submissions"
        });
    }
};

// backend/controlers/submissioncontroller.js
const getAcceptanceRate = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const submissions = await Submission.find({ user: userId });
        const total = submissions.length;
        const accepted = submissions.filter(s => s.verdict === 'Accepted').length;
        
        const rate = total > 0 ? Math.round((accepted / total) * 100) : 0;
        
        return res.status(200).json({
            success: true,
            acceptanceRate: rate,
            totalSubmissions: total,
            acceptedSubmissions: accepted
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// backend/controlers/usercontroller.js
const getRanking = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Sab users ko solved count ke saath fetch karo
        const users = await User.find()
            .select('_id problemSolved')
            .lean();
        
        // Solved count calculate karo
        const userRanks = users.map(u => ({
            userId: u._id,
            solvedCount: u.problemSolved?.length || 0
        }));
        
        // Sort by solved count (descending)
        userRanks.sort((a, b) => b.solvedCount - a.solvedCount);
        
        // Current user ka rank find karo
        const userRank = userRanks.findIndex(u => u.userId.toString() === userId.toString()) + 1;
        
        return res.status(200).json({
            success: true,
            ranking: userRank || 0,
            totalUsers: userRanks.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// backend/controlers/submissioncontroller.js
const getStreak = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const submissions = await Submission.find({ user: userId })
            .select('createdAt')
            .sort({ createdAt: -1 });
        
        if (submissions.length === 0) {
            return res.status(200).json({ success: true, streak: 0 });
        }
        
        // Unique dates extract karo
        const dates = submissions.map(s => 
            new Date(s.createdAt).toDateString()
        );
        const uniqueDates = [...new Set(dates)];
        
        // Streak calculate karo
        let streak = 1;
        const today = new Date().toDateString();
        
        if (!uniqueDates.includes(today)) {
            return res.status(200).json({ success: true, streak: 0 });
        }
        
        // Check consecutive days
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const date = new Date(uniqueDates[i]);
            const prevDate = new Date(uniqueDates[i + 1]);
            const diffDays = Math.floor((date - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return res.status(200).json({
            success: true,
            streak: streak
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    submitCode,
    getMySubmissions,
    getStreak,
    getAcceptanceRate,
    runCodeOnly,
    getRanking
};