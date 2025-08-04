import express from "express";
import { authMiddleware } from "../middlewares/auth.js"; // Assuming you have an auth middleware to check authentication    
import { validateProfileUpdateData } from "../helpers/validation.js"; // Import validation helper

const profileRouter = express.Router();

profileRouter.get("/profilecheck", authMiddleware,(req, res) => {   
    try {
        const user = req.user; // User is attached to request object by authMiddleware
        res.status(200).json({ valid: true, message: "User is authenticated", user });
    } catch (error) {
        //console.error("Error checking profile:", error);
        return res.status(500).send("Internal Server Error");
    }         
});

profileRouter.get("/profile/view", (req, res) => {    
    try {
        authMiddleware(req, res, async () => {
            res.status(200).json(req.user); // Send the authenticated user profile
        });
    } catch (error) {
        //console.error("Error fetching user profile:", error);
       return res.status(500).send({valid:false,message:error.message});
    }
});

profileRouter.patch("/profile/edit", authMiddleware, async (req, res) => {
    try{
        validateProfileUpdateData(req.body); // Validate the update data
        var user = req.user; // Get the authenticated user from request object
        console.log("User before update:", user.firstname);
        // Only assign allowed fields
        Object.keys(req.body).forEach(field => {
        user[field] = req.body[field];
        });
        const updatedUser = await user.save(); // Update the user profile with the new data
        console.log("User after update:", updatedUser.firstname);
        res.status(200).send({valid:true,message:"Profile updated successfully.",data:updatedUser});
    }catch (error) {
        //console.error("Error updating profile:", error);
        return res.status(500).send({valid:false,message:error.message});
    }
});

export default profileRouter;
// Export the profileRouter to be used in app.js