import express from 'express';
import Tweet from "./models/Tweet.js";

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

export default router;