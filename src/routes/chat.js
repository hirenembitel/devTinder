import express from "express";
import chat from '../models/chat.js';
import { authMiddleware } from "../middlewares/auth.js";

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", authMiddleware, async (req,res) => {
    const targetUserId = req.params.targetUserId;
   // console.log("Hiren"+targetUserId+'--'+req.user._id);
    const userId = req.user._id;
    try{
        let chatObject = await chat.findOne({
            participants:{$all:[userId,targetUserId]}
        }).populate({
            path:"messages.senderId",
            select:"firstname lastname"
        });
        if(!chatObject) {
            chatObject = new chat({
                participants:[userId,targetUserId],
                messages:[]
            });
            await chatObject.save();
        }
        res.json(chatObject);
    }catch(error) {
        console.log(error);
    }
});

export default chatRouter;
