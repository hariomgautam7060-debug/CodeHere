

const redisclient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utills/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Submission = require("../models/submission");

// ================= Register =================
const register = async (req, res) => {
    try {
        // 1. Validate request body
        validate(req.body);

        const { email, password } = req.body;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await User.create({
            ...req.body,
            password: hashedPassword,
            role: "user",
        });

        // 5. Generate JWT
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRETKEY,
            {
                expiresIn: "1h",
            }
        );

        // 6. Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
            // production mein HTTPS ke saath:
            // secure: true,
            // sameSite: "none"
        });

        // 7. Response mein sirf required data bhejo
        const reply = {
            firstName: user.firstName,
            email: user.email,
            _id: user._id,
        };

        return res.status(201).json({
            message: "User registered successfully",
            user: reply,
        });

    } catch (err) {
        return res.status(400).json({
            error: err.message,
        });
    }
};

// ================= Login =================
const login = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email?.toLowerCase();

        if (!email) {
            throw new Error("Email is required");
        }

        if (!password) {
            throw new Error("Password is required");
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }
       
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error("Invalid password");
        }
        // Generate JWT
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRETKEY,
            {
                expiresIn: "1h",
            }
        );

        // Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(400).json({
                message: "Token not found",
            });
        }

        const payload = jwt.decode(token);

        const ttl = payload.exp - Math.floor(Date.now() / 1000);

        await redisclient.set(`token:${token}`, "blocked");

        if (ttl > 0) {
            await redisclient.expire(`token:${token}`, ttl);
        }

        res.clearCookie("token");

        res.status(200).json({
            message: "Logout successful",
        });

    } catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};
const adminregister = async (req, res) => {
    try {
        // Validate request body
        validate(req.body);

        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Hash password
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role='admin';
        // Create user
        const user = await User.create(req.body);

        // Generate JWT
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRETKEY,
            {
                expiresIn: "1h",
            }
        );

        // Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });

        // Hide password before sending response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
        });
    } catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};

const deleteProfile = async (req, res) => {
    try {

        const userId = req.user._id;

        // User delete
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // User ki submissions delete
        await Submission.deleteMany({
            user: userId
        });

        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Profile Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
module.exports = {
    register,
    login,
    logout,
    adminregister,
    deleteProfile,
};