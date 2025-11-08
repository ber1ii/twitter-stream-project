import express from 'express';
import Tweet from "./models/Tweet.js";
import { fetchTweets } from './utils/fetchTweets.js';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

const router = express.Router();

const clients = new Set();

router.get("/tweets", async (req, res) => {
    try {
        const { before, limit, order = "desc", user } = req.query;
        const query = {};
        const max = parseInt(limit) || 10;

        if(user) {
            query.user = new RegExp(user, 'i');
        }

        if(before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const sortOrder = { createdAt: order === "asc" ? 1 : -1 };

        const tweets = await Tweet.find(query)
            .sort(sortOrder)
            .limit(max)
            .lean();

        res.json(tweets);
    } catch (err) {
        console.error("Error fetching tweets: ", err);
        res.status(500).json({ error: "Server error fetching tweets" });
    }
});

// SSE Endpoint
router.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.write("data: connected\n\n");

    const clientId = Date.now();
    const client = { id: clientId, res };
    clients.add(client);

    console.log(`✅ SSE client connected: ${clientId} (Total: ${clients.size})`);

    const keepAlive = setInterval(() => {
        try {
            res.write(": ping\n\n");
        } catch (err) {
            clearInterval(keepAlive);
            clients.delete(client);
        }
    }, 30000);

    req.on("close", () => {
        clearInterval(keepAlive);
        clients.delete(client);
        console.log(`❌ SSE client disconnected: ${clientId} (Total: ${clients.size})`);
    });
});

// Broadcast function
export function broadcastNewTweets(count) {
    const message = `data: ${JSON.stringify({ type: "new_tweets", count })}\n\n`;
    let disconnected = 0;
    
    clients.forEach((client) => {
        try {
            client.res.write(message);
        } catch (err) {
            clients.delete(client);
            disconnected++;
        }
    });

    console.log(`📢 Broadcasted ${count} new tweets to ${clients.size} clients${disconnected > 0 ? ` (${disconnected} disconnected)` : ''}`);
}

router.post("/refresh-tweets", async (req, res) => {
    try {
        await fetchTweets(process.env.TWITTER_KEYWORD || "tech");
        res.json({ success: true, message: "Tweets refreshed successfully." });
    } catch (err) {
        console.error("Manual refresh error:", err);
        res.status(500).json({ error: "Failed to refresh tweets." });
    }
});

router.get("/tweetcount", async (req, res) => {
    try {
        const total = await Tweet.countDocuments();
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: "count error" });
    }
});

export default router;