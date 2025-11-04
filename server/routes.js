import express from 'express';
import Tweet from "./models/Tweet.js";
import { fetchTweets } from './utils/fetchTweets.js';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

const router = express.Router();

router.get('/', async (req, res) => {
    res.render("home", {
        title: "Twitter Stream Dashboard",
    });
});

router.get("/api/tweets", async (req, res) => {
    try {
        const tweets = await Tweet.find().sort({ createdAt: -1 }).limit(10);
        res.json(tweets);
    } catch (err) {
        console.error("Error fetching tweets: ", err);
        res.status(500).json({ error: "Server error fetching tweets" });
    }
});

//Maunal trigger to fetch tweets
router.post("/api/refresh-tweets", async (req, res) => {
    try {
        await fetchTweets(process.env.TWITTER_KEYWORD || "tech");
        res.json({ success: true, message: "Tweets refreshed successfully." });
    } catch (err) {
        console.error("Manual refresh error:", err);
        res.status(500).json({ error: "Failed to refresh tweets." });
    }
});

export default router;