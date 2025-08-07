import jwt from "jsonwebtoken";
import { userModel } from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
    
    try {
        const token = req.cookies.token; // Get the token from cookies
        //console.log("Token received:", token); // Debugging line to check the token
        if (!token) {
            //return res.status(401).send("Unauthorized: No token provided");
            throw new Error("Unauthorized: No token provided");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);
        if (!user) {
            //return res.status(404).send("User not found");
            throw new Error("User not found");
        }
            req.user = user; // Attach user to request object
            next();       
     } catch (error) {
        //console.error("Error fetching user:", error);
        res.status(401).send({valid:false,message:error.message || "Internal Server Error123"});
        //throw new Error(error.message || "Internal Server Error");
    }
}