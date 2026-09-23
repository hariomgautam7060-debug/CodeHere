const express = require("express");

const router = express.Router();

const middlemare = require("../middlemare/usermiddlemare");
const adminmiddlemare = require("../middlemare/adminmiddlemare");

const {
    register,
    login,
    logout,
    adminregister,
    deleteProfile,
} = require("../controlers/userauthen");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", middlemare, logout);
router.post("/admin/register", adminmiddlemare, adminregister);
router.delete(
    "/deleteprofile",
    middlemare,
    deleteProfile
);
router.post("/check", middlemare, (req, res) => {

    const reply = {
        firstName: req.user.firstName,
        email: req.user.email,
        _id: req.user._id
    };

    res.status(200).json({
        user: reply,
        message: "valid user"
    });
});

module.exports = router;