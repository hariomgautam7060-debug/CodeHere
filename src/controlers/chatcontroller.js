const Chat = require("../models/chat");
const Problem = require("../models/problem");
const { getChatResponse } = require("../services/gemini");

const getChat = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user._id;

        let chat = await Chat.findOne({ user: userId, problem: problemId });

        if (!chat) {
            chat = await Chat.create({
                user: userId,
                problem: problemId,
                messages: []
            });
        }

        return res.status(200).json({ success: true, chat });
    } catch (error) {
        console.error("Get Chat Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch chat" });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { message } = req.body;
        const userId = req.user._id;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message required" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        let chat = await Chat.findOne({ user: userId, problem: problemId });
        if (!chat) {
            chat = await Chat.create({ user: userId, problem: problemId, messages: [] });
        }

        chat.messages.push({ role: "user", content: message.trim() });

        const aiResponse = await getChatResponse(problem, chat.messages, message.trim());

        chat.messages.push({ role: "assistant", content: aiResponse });
        await chat.save();

        return res.status(200).json({ success: true, reply: aiResponse, chat });
    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed" });
    }
};

const clearChat = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user._id;

        await Chat.findOneAndDelete({ user: userId, problem: problemId });

        return res.status(200).json({ success: true, message: "Chat cleared" });
    } catch (error) {
        console.error("Clear Chat Error:", error);
        return res.status(500).json({ success: false, message: "Failed to clear chat" });
    }
};

module.exports = { getChat, sendMessage, clearChat };