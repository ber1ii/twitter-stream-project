import mongoose from "mongoose";
import dotenv from "dotenv";
import Tweet from "../models/Tweet.js";
dotenv.config({ path: "../../.env" });

const uri = process.env.MONGO_URI;

try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    const res = await Tweet.deleteMany({});
    console.log(`Deleted ${res.deletedCount} tweets.`);
} catch(err) {
    console.error("Error clearing tweets:", err.message);
} finally {
    await mongoose.disconnect();
    process.exit();
}