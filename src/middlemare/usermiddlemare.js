
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const redisclient = require("../config/redis");

const middlemare = async (req, res, next) => {

    try {

        // =========================
        // GET TOKEN FROM COOKIE
        // =========================

        const { token } = req.cookies;

        if (!token) {
            throw new Error("Invalid token");
        }


        // =========================
        // VERIFY JWT
        // =========================

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRETKEY
        );


        // =========================
        // GET USER ID
        // =========================

        const _id = payload._id;

        if (!_id) {
            throw new Error("ID is missing");
        }


        // =========================
        // FIND USER
        // =========================

        const result = await User.findById(_id);

        if (!result) {
            throw new Error("User does not exist");
        }


        // =========================
        // CHECK BLACKLIST
        // =========================

        const isBlocked = await redisclient.exists(
            `token:${token}`
        );

        if (isBlocked) {
            throw new Error("Token has been blacklisted");
        }


        // =========================
        // SAVE USER IN REQUEST
        // =========================

        req.user = result;

        next();

    } catch (err) {

        console.log("Middleware Error:", err.message);

        return res.status(401).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = middlemare;