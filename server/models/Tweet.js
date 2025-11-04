import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        text: { type: String, required: true},
        user: { type: String },
        tweetId: {type: String, unique: true  },
        createdAt: { type: Date, default: Date.now, expires: "7d" },
    },
    { timestamps: true }
);

export default mongoose.model("Tweet", tweetSchema);