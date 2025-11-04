import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        test: { type: String, required: true},
        user: { type: String },
        tweetId: {type: String, unique: true  },
    },
    { timestamps: true }
);

export default mongoose.model("Tweet", tweetSchema);