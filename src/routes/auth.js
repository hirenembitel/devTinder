import express from "express";
import { validateSignupData } from "../helpers/validation.js";
import { bcrypt, userModel } from "../models/user.js";

const authRouter = express.Router();
 // Middleware to parse cookies

authRouter.post("/signup", async (req, res) => {   
    
    // Extract user data from request body
    const { firstname, lastname, email, password,age,gender, skills } = req.body;    // Validate input
    
   // res.status(201).send("User created successfully!");
    try {
        validateSignupData(req.body);
        const existUser = await userModel.findOne({ email });        
        if(existUser) {
            return res.status(400).json({valid:false, message: "User already exists with this email, please use another email."});    
        }
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const user = new userModel({ firstname, lastname, email, password:hashedPassword,age,gender, skills });
        await user.save();
        res.status(201).json({valid:true,message:"User created successfully"});
    } catch (error) {            
        res.status(500).json({valid:false, message: error.message});
    }
});

authRouter.post("/login", async (req, res) => {
    console.log("Login request received");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    try {
        // Get the user by email and 
        const user = await userModel.findOne({ email });
        await user.validateCredentials(password);
        // Generate a JWT token
        const token = await user.getJWT();
        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" }); // Set cookie with user ID
        console.log("User logged in successfully:", user);
        res.status(200).send({valid:true,message:"Login successful", user});
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(401).send({valid:false,message:error.message});
    }
});

authRouter.post("/logout", (req, res) => {
    try{
        res.clearCookie("token"); // Clear the cookie
        res.status(200).send({valid:true,message:"Logged out successfully"});
    }catch(error){
        //console.error("Error during logout:", error);
        return res.status(500).send({valid:false,message:error.message});
    }    
});

export default authRouter;
// Export the authRouter to be used in app.js