import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config({ debug: true });

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: String,
    email: {
        type: String,
        required: true,
        unique: true,
        // validate: {
        //     validator: function(v) {
        //         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        //     }
        // }
    },
    password: String,
    age: Number,
    gender: String,
    skills: {
        type: [String],
        default: []
    }
},
{
    timestamps: true,
});

userSchema.methods.getJWT = async function() {
    const user = this;
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
};

userSchema.methods.validateCredentials = async function(passwordInputByUser) {
    const user = this;
    if (!user) {
        throw new Error("User not found");
    }
    const passwordHash = user.password; // password stored in the database in encrypted form with the help of bcrypt
    const isMatch = await bcrypt.compare(passwordInputByUser,passwordHash);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
};
export const userModel = mongoose.model("User", userSchema);
export {dotenv, bcrypt, jwt}; // Export dotenv and bcrypt for use in other files
//export default userModel; // Default export for userModel