import mongoose from "mongoose";

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

export const connectionRequestModel = mongoose.model("connection_request", connectionRequestSchema);