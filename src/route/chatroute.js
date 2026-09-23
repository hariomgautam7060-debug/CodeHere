const express = require("express");
const router = express.Router();
const middlemare = require("../middlemare/usermiddlemare");
const { getChat, sendMessage, clearChat } = require("../controlers/chatcontroller");

router.get("/:problemId", middlemare, getChat);
router.post("/:problemId", middlemare, sendMessage);
router.delete("/:problemId", middlemare, clearChat);

module.exports = router;