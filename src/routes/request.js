import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { connectionRequestModel } from "../models/connectionRequest.js";

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:userId", authMiddleware, async (req, res) => {
    try {
        var allowedStatuses = ["interested", "ignored"];
        if (!allowedStatuses.includes(req.params.status)) {
            return res.status(400).json({ valid: false, message: "Invalid status provided" });
        }
        //throw error if request is duplicate
        const existingRequest = await connectionRequestModel.findOne({from_user_id:req.user._id, to_user_id: req.params.userId, status: req.params.status});
        if (existingRequest) {
            return res.status(400).json({ valid: false, message: "Connection request already exists with the same status" });
        }
        const connectionRequest = new connectionRequestModel({
            from_user_id: req.user._id,
            to_user_id: req.params.userId,
            status: req.params.status
        });
        const savedRequest = await connectionRequest.save();
        res.status(201).json({ valid: true, message: "Connection request sent successfully  as interested.", request: savedRequest });
    }catch (error) {
        //console.error("Error sending connection request:", error);
        res.status(500).json({valid:false, message: "Internal server error" });
    }
});

export default requestRouter;