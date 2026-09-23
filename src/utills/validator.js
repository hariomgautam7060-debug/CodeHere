const validator = require("validator");

const validate = (data) => {
    // Required fields
    const mandatoryFields = ["firstName", "email", "password"];

    const isAllowed = mandatoryFields.every((field) =>
        Object.keys(data).includes(field)
    );

    if (!isAllowed) {
        throw new Error("Please fill all required fields");
    }

    // Email Validation
    if (!validator.isEmail(data.email)) {
        throw new Error("Invalid Email");
    }

    // Strong Password Validation
    if (!validator.isStrongPassword(data.password)) {
        throw new Error(
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
        );
    }
};

module.exports = validate;