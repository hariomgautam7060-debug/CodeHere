const axios = require("axios");

const runCode = async ({
    language,
    versionIndex,
    code,
    stdin = ""
}) => {

    try {

        const response = await axios.post(
            "https://api.jdoodle.com/v1/execute",
            {
                clientId: process.env.JDOODLE_CLIENT_ID,
                clientSecret: process.env.JDOODLE_CLIENT_SECRET,
                script: code,
                stdin: stdin,
                language: language,
                versionIndex: versionIndex
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "JDoodle Error:",
            error.response?.data || error.message
        );

        throw new Error("Code execution failed");
    }
};

module.exports = {
    runCode
};