import mongoose from "mongoose";
import { userModel } from "./user.js"; // Assuming userModel is defined in user.js

const connectionRequestSchema = new mongoose.Schema({
    from_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    to_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,        
    },
    status: {
        type: String,
        required: true,
        enum: ["pending","ignored","interested", "accepted", "rejected"],
        default: "pending",
        message:`{VALUE} is not a valid status. Valid values are 'ignored', 'interested', 'accepted', or 'rejected'.`
    }
},
{
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

connectionRequestSchema.index({ from_user_id: 1, to_user_id: 1 }, { unique: true }); // Ensure unique connection requests between users  

connectionRequestSchema.pre("save",async function(next) {

    const isExistingFromUser = await userModel.exists({ _id: this.from_user_id });
    if (!isExistingFromUser) {
        return next(new Error("from_user_id must be valid users"));
    }
    const isExistingToUser = await userModel.exists({ _id: this.to_user_id });
    if (!isExistingToUser) {
        return next(new Error("to_user_id must be valid users"));
    }
    // Ensure that the status is always set to 'pending' when a new request is created
    // check from user id and to user id are not same
    // if(this.from_user_id.toString() === this.to_user_id.toString()) {
    //     return next(new Error("From user and To user cannot be the same"));
    // }
    // check request is not duplicate
    const existingRequest = await this.constructor.findOne({
        $or: [
            { from_user_id: this.from_user_id, to_user_id: this.to_user_id,status: this.status },
            { from_user_id: this.to_user_id, to_user_id: this.from_user_id, status: this.status }
        ]
    });   
    console.log(existingRequest);
    if (existingRequest) {
        return next(new Error("Connection request already exists with the same status"));
    }
    // console.log(existingRequest);
    // var nextProcedureAllowedStatuses = ["interested","ignored"/*"accepted", "rejected"*/];
    // if (!existingRequest && !nextProcedureAllowedStatuses.includes(this.status)) {
    //    // console.log("Invalid status provided. Valid statuses are: ", nextProcedureAllowedStatuses);
    //     return next(new Error(`Invalid status providedddd. Valid statuses are: ${nextProcedureAllowedStatuses.join(", ")}`));
    // }
    next();
});

export const connectionRequestModel = mongoose.model("connection_request", connectionRequestSchema);