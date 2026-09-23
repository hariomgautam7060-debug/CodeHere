const { createClient } = require("redis");

const redisclient = createClient({
    username: "default",
    password: process.env.REDIS_PASS,
    socket: {
        host: "tendency-cheerful-stone-57234.db.redis.io",
        port: 19005,
    },
});

redisclient.on("connect", () => {
    console.log("✅ Redis Connected");
});

redisclient.on("ready", () => {
    console.log("✅ Redis Ready");
});

redisclient.on("error", (err) => {
    console.error("❌ Redis Error:", err);
});

module.exports = redisclient;