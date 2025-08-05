import express from "express";
import { userModel } from "../models/user.js"; // Adjust the import path as necessary
import { authMiddleware } from "../middlewares/auth.js";
import { connectionRequestModel } from "../models/connectionRequest.js"; // Adjust the import path as necessary

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
// Get the connection requests for the user
// Assuming you have a connectionRequestModel to handle connection requests
userRouter.get("/user/requests/recieved", authMiddleware , async (req, res) => {
    try {
        console.log("Fetching connection requests for user:", req.user._id);
        const requests = await connectionRequestModel.find({
                 to_user_id: req.user._id,
                 status: { $in: ["interested"] }
        }).populate('from_user_id', 'firstname lastname age gender skills'); // Populate user details
          //.populate('to_user_id', 'firstname lastname email'); // Populate user details

        res.status(200).json({ valid: true, requests });
    }catch (error) {
        //console.error("Error fetching connection requests:", error);
        res.status(500).json({ valid: false, message:  error.message+" An error occurred while fetching connection requests."});
    }
});

userRouter.get("/user/connections", authMiddleware, async (req, res) => {
    try {
        
        const connections = await connectionRequestModel.find({
            $or: [
                { from_user_id: req.user._id, status: "accepted" },
                { to_user_id: req.user._id, status: "accepted" }
            ]
        }).populate('from_user_id', 'firstname lastname')
          .populate('to_user_id', 'firstname lastname'); // Populate user details
          const connectionList = connections.map(connection => {
            let otherUser;
            if (connection.from_user_id._id.toString() === req.user._id.toString()) {
                otherUser = connection.to_user_id;
            }else {
                otherUser = connection.from_user_id;
            }
                  return {
                    user : {
                         _id: otherUser._id,
                         firstname: otherUser.firstname,
                         lastname: otherUser.lastname   
                    }
                  }
            });
        res.status(200).json({ valid: true, connections: connectionList });
    } catch (error) {
        //console.error("Error fetching connections:", error);
        res.status(500).json({ valid: false, message: error.message + " An error occurred while fetching connections." });
    }
});

userRouter.get("/user/feed", authMiddleware, async (req, res) => {
    try {
         const requests = await connectionRequestModel.find({
            $or: [
                { from_user_id: req.user._id },  // Exclude requests from the current user
                { to_user_id: req.user._id } // Exclude requests to the current user
            ]                
        })
        .select("from_user_id to_user_id") 
        .populate('from_user_id', 'firstname lastname')
        .populate('to_user_id', 'firstname lastname'); // Populate user details
        // Get all user ids involved in connection requests
        const involvedUserIds = await connectionRequestModel.distinct("from_user_id");
        const receivedUserIds = await connectionRequestModel.distinct("to_user_id");
        const allInvolvedIds = [...new Set([...involvedUserIds, ...receivedUserIds])];
        //console.log("All involved user IDs:", allInvolvedIds);
        let page = parseInt(req.query.page) || 1; // Get the page number from query params, default to 1
        const limit = parseInt(req.query.limit) || 10; // Number of users to return per page
        const skip = (page - 1) * limit; // Calculate the number of users to skip
        console.log(skip);
        const cartList = await userModel.find({
            $and : [
                { _id: { $nin: Array.from(allInvolvedIds) } }, // Exclude users involved in connection requests
                { _id: { $ne: req.user._id } } // Exclude the
            ]
        }).select("firstname lastname age gender skills")
        .skip(skip) // Skip the number of users based on pagination
        .limit(limit); // Limit the number of users returned

        const totalUsers = await userModel.countDocuments({
            $and: [
                { _id: { $nin: Array.from(allInvolvedIds) } },
                { _id: { $ne: req.user._id } }
            ]
        });
       //let currentPage = page; // Initialize current page
        const totalPages = Math.ceil(totalUsers / limit); // Calculate total pages
        //page = page > totalPages ? totalPages : page; // Ensure current page does not exceed total pages
        res.status(200).json({ valid: true, cartList,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalUsers: totalUsers,
                limit: limit
            }
         });
    } catch (error) {
        //console.error("Error fetching user feed:", error);
        res.status(500).json({ valid: false, message: error.message + " An error occurred while fetching user feed." });
    }
});

export default userRouter;