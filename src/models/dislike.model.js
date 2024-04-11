import mongoose, {Schema} from "mongoose";

// i don't understand how sir think to use this model. but i use this model as - everytime user is like anything between three a new docs made. i can use it as there is no field that is tagged as required. but as per me likedBy is required.
const dislikeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    communityPost: {
        type: Schema.Types.ObjectId,
        ref: "CommunityPost"
    },
    dislikedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const Dislike = mongoose.model("Disike", dislikeSchema)