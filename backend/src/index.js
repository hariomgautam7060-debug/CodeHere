require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const main = require("./config/db");
const redisclient = require("./config/redis");

const authrouter = require("./route/userauth");
const problemrouter = require("./route/problemcreator");
const submissionrouter = require("./route/submissionroute");
const chatrouter = require("./route/chatroute"); 
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.use(cookieParser());

app.use("/user", authrouter);
app.use("/problem", problemrouter);
app.use("/submission", submissionrouter);
app.use("/chat", chatrouter);
app.use("/editorial", require("./route/editorialroutes"));

const initializeconnection = async () => {
    try {
        await main();

        await redisclient.connect();

        console.log("✅ MongoDB & Redis connected");

       const PORT = process.env.PORT || 3000;

       app.listen(PORT, () => {
       console.log(
        `🚀 Server running on port ${PORT}`
       );
});

    } catch (err) {
        console.error(
            "❌ Server initialization failed:",
            err
        );
    }
};

initializeconnection();