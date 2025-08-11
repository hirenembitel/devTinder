import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { connectionRequestModel } from "../models/connectionRequest.js";
import { userModel } from "../models/user.js";

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:userId", authMiddleware, async (req, res) => {
    //"interested", "ignored","accepted", "rejected"
    try {
        var allowedStatuses = ["interested", "ignored"];
        if (!allowedStatuses.includes(req.params.status)) {
            return res.status(400).json({ valid: false, message: "Invalid status provided" });
        }

        if(req.params.userId === req.user._id.toString()) {
            return res.status(400).json({ valid: false, message: "You cannot send a connection request to yourself" });
        }
        // Check if the userId is valid
        // const toUserId = req.params.userId;
        // const isExistingUser = await userModel.exists({ _id: toUserId });
        // if (!isExistingUser) {
        //     return res.status(404).json({ valid: false, message: "User not found" });
        // }
        //throw error if request is duplicate
        // const existingRequest = await connectionRequestModel.findOne({
        //     $or: [
        //         { from_user_id: req.user._id, to_user_id: req.params.userId, status: req.params.status },
        //         { from_user_id: req.params.userId, to_user_id: req.user._id, status: req.params.status }
        //     ]
        //     //from_user_id:req.user._id, to_user_id: req.params.userId, status: req.params.status
        // });
        // if (existingRequest) {
        //     return res.status(400).json({ valid: false, message: "Connection request already exists with the same status" });
        // }
        const connectionRequest = new connectionRequestModel({
            from_user_id: req.user._id,
            to_user_id: req.params.userId,
            status: req.params.status
        });
        const savedRequest = await connectionRequest.save();
        res.status(201).json({ valid: true, message: "Connection request sent successfully  as interested.", request: savedRequest });
    }catch (error) {
        //console.error("Error sending connection request:", error);
        res.status(500).json({valid:false, message: error.message || "An error occurred while sending the connection request."});
    }
});

requestRouter.post("/request/review/:status/:requestId", authMiddleware, async (req, res) => {
    try {
        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(req.params.status)) {
            return res.status(400).json({ valid: false, message: "Invalid status provided" });
        }
        const request = await connectionRequestModel.findOne({
            from_user_id:req.params.requestId,
            to_user_id: req.user._id,
            status: "interested"
        });
      //  console.log(request);
        if (!request) {
            return res.status(200).json({ valid: false, message: `Connection request not found OR Already accepted or rejected or ignored the request.` });
        }
        // Check if the user is authorized to review this request
       // console.log(request.to_user_id.toString() +"!=="+ req.user._id.toString());
        if (request.to_user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ valid: false, message: "You are not authorized to review this request" });
        }
        // Update the status of the connection request
        request.status = req.params.status;
        const updatedRequest = await request.save();
        res.status(200).json({ valid: true, message: `Connection request reviewed as ${req.params.status}.`});
    } catch (error) {
        console.error("Error reviewing connection request:", error);
        res.status(500).json({ valid: false, message: error.message || "An error occurred while reviewing the connection request." });
    }
});

export default requestRouter;