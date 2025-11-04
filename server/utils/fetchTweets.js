import { TwitterApi } from "twitter-api-v2";
import Tweet from "../models/Tweet.js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export const fetchTweets = async (keyword = "javascript") => {
    try {
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

        console.log(`[${new Date().toISOString()}] Fetched ${tweets.length} tweets about #${keyword}.`);
    } catch (err) {
        console.error("Twitter fetch error:", err.data || err);
    }
};