

// const mongoose = require("mongoose");

// const problemSchema = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         description: {
//             type: String,
//             required: true
//         },

//         difficulty: {
//             type: String,
//             enum: ["Easy", "Medium", "Hard"],
//             required: true
//         },

//         inputFormat: {
//             type: String,
//             required: true
//         },

//         outputFormat: {
//             type: String,
//             required: true
//         },

//         constraints: {
//             type: String
//         },

//         examples: [
//             {
//                 input: String,
//                 output: String,
//                 explanation: String
//             }
//         ],

//         testCases: [
//             {
//                 input: {
//                     type: String,
//                     required: true
//                 },

//                 expectedOutput: {
//                     type: String,
//                     required: true
//                 },

//                 isHidden: {
//                     type: Boolean,
//                     default: true
//                 }
//             }
//         ],

//         starterCode: {
//             cpp: {
//                 type: String,
//                 default: ""
//             },

//             python: {
//                 type: String,
//                 default: ""
//             },

//             javascript: {
//                 type: String,
//                 default: ""
//             }
//         },

//         // Official solution used to validate test cases
//         solutionCode: {
//             cpp: {
//                 type: String,
//                 default: ""
//             },

//             python: {
//                 type: String,
//                 default: ""
//             },

//             javascript: {
//                 type: String,
//                 default: ""
//             }
//         },

//         tags: [
//             {
//                 type: String
//             }
//         ],

//         createdBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         }
//     },

//     {
//         timestamps: true
//     }
// );

// module.exports = mongoose.model("Problem", problemSchema);

const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        },

        inputFormat: {
            type: String,
            required: true
        },

        outputFormat: {
            type: String,
            required: true
        },

        constraints: {
            type: String
        },

        examples: [
            {
                input: String,
                output: String,
                explanation: String
            }
        ],

        testCases: [
            {
                input: {
                    type: String,
                    required: true
                },

                expectedOutput: {
                    type: String,
                    required: true
                },

                isHidden: {
                    type: Boolean,
                    default: true
                }
            }
        ],

        starterCode: {
            cpp: {
                type: String,
                default: ""
            },

            python: {
                type: String,
                default: ""
            },

            javascript: {
                type: String,
                default: ""
            }
        },

        // Official solution used to validate test cases
        solutionCode: {
            cpp: {
                type: String,
                default: ""
            },

            python: {
                type: String,
                default: ""
            },

            javascript: {
                type: String,
                default: ""
            }
        },

        tags: [
            {
                type: String
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Problem", problemSchema);