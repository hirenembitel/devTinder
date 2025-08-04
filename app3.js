import express from "express";
import path from "path";
import dotenv from "dotenv";
import { dbConnection } from "./middlewares/dbconnection.js";
dotenv.config({ debug: true });
import { userModel } from "./models/user.js";
import { validateSignupData } from "./helpers/validation.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middlewares/auth.js";

const PORTNUMBER = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cookieParser()); // Middleware to parse cookies
app.use(dbConnection); // Use the database connection middleware
//app.post("/signup", express.json(), async (req, res) => {
 app.post("/signup", async (req, res) => {   
    
    // Extract user data from request body
    const { firstname, lastname, email, password,age,gender, skills } = req.body;    // Validate input
    
   // res.status(201).send("User created successfully!");
    try {
        validateSignupData(req.body);
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const user = new userModel({ firstname, lastname, email, password:hashedPassword,age,gender, skills });
        await user.save();
        res.status(201).send({valid:true,message:"User created successfully"});
    } catch (error) {            
        res.status(400).send({valid:false, message: error.message});
    }
});

app.post("/login", async (req, res) => {
    console.log("Login request received");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({valid:true,message:"User not found"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            //return res.status(401).send("Invalid password");
            return res.status(404).send({valid:false,message:"Invalid password"});
        }
        // Generate a JWT token
        const token = await user.getJWT();
        res.cookie("token", token, { httpOnly: true, secure: true }); // Set cookie with user ID
        //console.log("User logged in successfully:", user);
        res.status(200).send({valid:true,message:"Login successful", user});
    } catch (error) {
        //console.error("Error during login:", error);
        res.status(500).send(error.message);
    }
});

app.get("/profilecheck", authMiddleware,(req, res) => {   
    try {
        const user = req.user; // User is attached to request object by authMiddleware
        res.status(200).json({ valid: true, message: "User is authenticated", user });
    } catch (error) {
        //console.error("Error checking profile:", error);
        return res.status(500).send("Internal Server Error");
    }         
});

app.get("/profile", (req, res) => {
    // const token = req.cookies.token; // Get the token from cookies
    // if (!token) {
    //     return res.status(401).send("Unauthorized: No token provided");
    // }
    // jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    //     if (err) {
    //         return res.status(401).send("Unauthorized: Invalid token");
    //     }
    //     try {
    //         const user = await userModel.findById(decoded._id);
    //         if (!user) {
    //             return res.status(404).send("User not found");
    //         }
    //         res.status(200).json(user);
    //     } catch (error) {
    //         //console.error("Error fetching user profile:", error);
    //         res.status(500).send("Internal Server Error");
    //     }
    // });
    try {
        authMiddleware(req, res, async () => {
            res.status(200).json(req.user); // Send the authenticated user profile
        });
    } catch (error) {
        //console.error("Error fetching user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/users", (req, res) => {
    userModel.find({})
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => {
           // console.error("Error fetching users:", err);
            res.status(500).send("Internal Server Error");
        });    
});

app.get("/userByEmail",async (req, res) => {
    const email  = req.body.email;        
    if (!email) {
        return res.status(400).send("Email query parameter is required");
    }
    await userModel.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.status(200).json(user);
        })
        .catch(err => {
            //console.error("Error fetching user by email:", err);
            res.status(500).send("Internal Server Error");
        });
});

app.delete("/user", async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send("Email query parameter is required");
    }
    try {
        const result = await userModel.deleteOne({ email });
        if (result.deletedCount === 0) {
            return res.status(404).send("User not found");
        }
        res.status(200).send("User deleted successfully");
    } catch (error) {
        //console.error("Error deleting user:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.patch("/user",async (req, res) => {
    const userId = req.body.userId;
    try {
        if (!userId) {
            return res.status(400).send("UserId query parameter is required");
        }
        const updateData = req.body; // Assuming the body contains the fields to update
        //validate the updateData if necessary
        // Define allowed fields for update
        const allowedUpdates = ['userId', 'firstname', 'lastname','password','age','gender','skills']; 
        const updates = Object.keys(req.body); // fields user is trying to update
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }
        const result = await userModel.findByIdAndUpdate(
            { _id: userId },
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate  
        );
        if (result.nModified === 0) {
            return res.status(404).send("User not found or no changes made");
        }
        res.status(200).send({success:"User updated successfully"});
    }catch (error) {
        //console.error("Error updating user:", error);
        res.status(500).send(error.message);
    }
});


app.listen(PORTNUMBER,() => {
    console.log(`Server is running at port ${PORTNUMBER}`);
});