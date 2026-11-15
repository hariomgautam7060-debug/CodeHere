
const axios = require("axios");

const getlanguageid = (language) => {
    const languages = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };

    return languages[language.toLowerCase()] || null;
};

const submitbatch = async (submissions) => {

    const options = {
        method: "POST",
        url: "http://localhost:2358/submissions/batch",
        params: {
            base64_encoded: "false",
            wait: "true"
        },
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            submissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};
const submittoken = async (resulttoken) => {

    const maxRetries = 20;

    for (let i = 0; i < maxRetries; i++) {

        try {

            const options = {
                method: "GET",
                url: "http://localhost:2358/submissions/batch",
                params: {
                    tokens: resulttoken.join(","),
                    base64_encoded: "false"
                },
                headers: {
                    "Content-Type": "application/json"
                }
            };

            const response = await axios.request(options);

            const submissions = response.data.submissions;

            const pending = submissions.some(
                (submission) => submission.status.id <= 2
            );

            if (!pending) {
                return submissions;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    }

    throw new Error("Judge0 timed out.");
};

module.exports = {
    getlanguageid,
    submitbatch,
    submittoken
};