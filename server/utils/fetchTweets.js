import { TwitterApi } from "twitter-api-v2";
import Tweet from "../models/Tweet.js";
import dotenv from "dotenv";
import { generateMockTweets } from "./mockTweets.js";

dotenv.config({ path: "../../.env" });

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export const fetchTweets = async (keyword = process.env.TWITTER_KEYWORD ?? "javascript") => {
    try {
        const MAX_TWEETS = Number(process.env.MOCK_MAX_TWEETS ?? 300);

        if(process.env.MOCK_TWITTER === "true") {
            return await generateMockTweets(Number(process.env.MOCK_BATCH_SIZE ?? 10), false);
        }

        const response = await twitterClient.v2.search(keyword, {
            max_results: 10,
            "tweet.fields": ["created_at", "text", "author_id"],
        });

        const tweets = response.data || [];

        for (const t of tweets) {
            const exists = await Tweet.findOne({ tweetId: t.id });
            if(!exists) {
                await Tweet.create({
                    text: t.text,
                    user: t.author_id,
                    tweetId: t.id,
                });
            }
        }

        let total = await Tweet.countDocuments();

        while (total > MAX_TWEETS) {
            const toDelete = total - MAX_TWEETS;
            const oldest = await Tweet.find().sort({ createdAt: 1 }).limit(toDelete).select("_id");
            
            await Tweet.deleteMany({ _id: { $in: oldest.map(x => x._id) } });
            console.log(`[${new Date().toISOString()}] Deleted ${toDelete} old tweets to maintain the limit of ${MAX_TWEETS}.`);
            
            total = await Tweet.countDocuments();
        }

        console.log(`[${new Date().toISOString()}] Fetched ${tweets.length} tweets about #${keyword}.`);
    } catch (err) {
        console.error("Twitter fetch error:", err.data || err);
    }
};