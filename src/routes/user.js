import express from "express";
import { userModel } from "../models/user.js"; // Adjust the import path as necessary

const userRouter = express.Router();


userRouter.get("/users", (req, res) => {
    console.log("Fetching all users");
    userModel.find({})
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => {
           // console.error("Error fetching users:", err);
            res.status(500).send("Internal Server Error");
        });    
});

userRouter.get("/userByEmail",async (req, res) => {
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

userRouter.delete("/user", async (req, res) => {
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

userRouter.patch("/user",async (req, res) => {
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

export default userRouter;