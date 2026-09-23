const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 20,
            trim: true,
        },

        lastName: {
            type: String,
            minlength: 3,
            maxlength: 20,
            trim: true,
        },

        age: {
            type: Number,
            min: 13,
            max: 80,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            immutable: true,
           match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

       problemSolved: [
    {
        type: Schema.Types.ObjectId,
        ref: "Problem"
    }
]
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;