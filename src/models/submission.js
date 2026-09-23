const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },

        language: {
            type: String,
            enum: ["cpp", "python", "javascript"],
            required: true
        },

        code: {
            type: String,
            required: true
        },

        verdict: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "Runtime Error",
                "Compilation Error",
                "Time Limit Exceeded"
            ],
            required: true
        },

        passedTestCases: {
            type: Number,
            default: 0
        },

        totalTestCases: {
            type: Number,
            default: 0
        },

        executionTime: {
            type: Number,
            default: null
        },

        memory: {
            type: Number,
            default: null
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Submission", submissionSchema);