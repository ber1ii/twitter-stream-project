import { TwitterApi } from "twitter-api-v2";
import Tweet from "../models/Tweet.js";
import dotenv from "dotenv";
import { generateMockTweets } from "./mockTweets.js";

dotenv.config({ path: "../../.env" });

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export const fetchTweets = async (keyword = "javascript") => {
    try {
        if(process.env.MOCK_TWITTER === "true") {
            return await generateMockTweets(5);
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

        const total = await Tweet.countDocuments();
        const MAX_TWEETS = 300;

        if (total > MAX_TWEETS) {
            const toDelete = total - MAX_TWEETS;
            await Tweet.find()
                .sort({ createdAt: 1 })
                .limit(toDelete)
                .deleteMany();

            console.log(`[${new Date().toISOString()}] Deleted ${toDelete} old tweets to maintain the limit of ${MAX_TWEETS}.`);
        }

        console.log(`[${new Date().toISOString()}] Fetched ${tweets.length} tweets about #${keyword}.`);
    } catch (err) {
        console.error("Twitter fetch error:", err.data || err);
    }
};