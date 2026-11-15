const mongoose = require("mongoose");

async function main() {
    await mongoose.connect(process.env.CONNECTIONSTRING);
    console.log("✅ MongoDB Connected Successfully");
}

module.exports = main;