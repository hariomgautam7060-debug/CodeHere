const express = require("express");

const router = express.Router();

const {
    submitCode,
    getMySubmissions,
    runCodeOnly
} = require("../controlers/submissioncontroller");

const middlemare = require("../middlemare/usermiddlemare");


// Run Code
router.post(
    "/run",
    middlemare,
    runCodeOnly
);


// Submit Code
router.post(
    "/",
    middlemare,
    submitCode
);


// Submission History
router.get(
    "/my",
    middlemare,
    getMySubmissions
);
module.exports = router;