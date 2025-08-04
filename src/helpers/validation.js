import validator from 'validator';
export const validateSignupData = (data) => {
    const { firstname, lastname, email, password} = data;
    if (!firstname || !lastname || !email || !password) {
        throw new Error("All fields are required");
       // return { valid: false, message: "All fields are required" };
    }
    else if (validator.isEmail(email) === false) {
        //return { valid: false, message: "Invalid email format" };
        throw new Error("Invalid email format");
    } else if (validator.isStrongPassword(password, { minLength: 6 }) === false ) {
        //return { valid: false, message: "Password must be at least 6 characters long" };
        throw new Error("Password must be at least 6 characters long");
    }
    return { valid: true, message: "Validation successful" };
}

export const validateProfileUpdateData = (data) => {
   const allowedFields = ['firstname', 'lastname', 'age', 'gender', 'skills'];
    const isAllowed = Object.keys(data).every((update) => allowedFields.includes(update));
   // console.log("isAllowed:", isAllowed);
    if (!isAllowed) {
        const invalidFields = Object.keys(data).filter((field) => !allowedFields.includes(field));
        throw new Error(invalidFields.join(",")+" cannot be updated.");
    }
}