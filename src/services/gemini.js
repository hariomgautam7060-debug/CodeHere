const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getChatResponse = async (problem, messages, userMessage) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash",
            systemInstruction: `You are a coding assistant for the CodeHere platform.
You ONLY answer questions related to the current coding problem.

You CAN:
- Explain the problem
- Give hints
- Explain the approach/algorithm
- Provide COMPLETE WORKING CODE when the user asks for it (e.g. "complete code do", "solution do", "full code")
- Debug the user's code

Current Problem:
Title: ${problem.title}
Description: ${problem.description}
Difficulty: ${problem.difficulty}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Constraints: ${problem.constraints || 'N/A'}

${problem.examples && problem.examples.length > 0
    ? 'Examples:\n' + problem.examples.map((ex, i) =>
        `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? '\nExplanation: ' + ex.explanation : ''}`
    ).join('\n\n')
    : ''}

Starter Code:
${problem.starterCode ? JSON.stringify(problem.starterCode, null, 2) : 'N/A'}

Rules:
- If the user asks for "complete code" / "solution" / "full code", give the FULL working code.
- Wrap all code inside triple backticks with the language name.
- Be concise but complete.
- If the question is NOT related to this problem, politely refuse and say you can only help with this problem.`
        });

        // History: current user message chhod ke purane messages
        const history = messages.slice(0, -1).slice(-10).map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        return result.response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message);
    }
};

module.exports = { getChatResponse };