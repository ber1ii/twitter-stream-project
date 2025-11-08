import Tweet from "../models/Tweet.js";
import dotenv from "dotenv";
import { users, topics, verbs, endings, hashtags, emojis } from "../data/mockData.js";
import { broadcastNewTweets } from "../routes.js";

dotenv.config({ path: "../../.env" });

let isTrimming = false;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const maybe = (chance = 0.5) => Math.random() < chance;

const generateTweetText = () => {
    const base = `I'm ${pick(verbs)} something related to ${pick(topics)} - ${pick(endings)}`;
    const withHashtag = maybe(0.3) ? `${base} ${pick(hashtags)}` : base;
    const withEmoji = maybe(0.4) ? `${withHashtag} ${pick(emojis)}` : withHashtag;
    return withEmoji;
}

export const generateMockTweets = async (count = Number(process.env.MOCK_BATCH_SIZE ?? 10), preload = false) => {
    const tweets = [];

    if(preload) {
        // Preload backdated tweets within last N minutes
        const preloadWindow = Number(process.env.MOCK_PRELOAD_MINUTES ?? 30);

        for(let i = 0; i < count; i++) {
            const offset = Math.random() * preloadWindow * 60 * 1000;
            const createdAt = new Date(Date.now() - offset);

            tweets.push({
                text: generateTweetText(),
                user: pick(users),
                tweetId: `mock-${Date.now()}-${Math.random().toString(16).slice(2)}-${i}`,
                createdAt,
                updatedAt: createdAt,
            });
        }
    } else {
        // "Real-time" batch: generate tweets <= current time
        const latest = await Tweet.findOne().sort({ createdAt: -1 }).lean();
        const latestTime = latest ? new Date(latest.createdAt).getTime() : Date.now() - 10_000;

        const current = Date.now();
        // leave a small gap to avoid future timestamps
        const safetyWindow = 5 * 1000;

        for(let i = 0; i < count; i++) {
            const upperBound = current - Math.random() * safetyWindow;
            const createdAt = new Date(
                latestTime + Math.random() * (upperBound - latestTime)
            );

            tweets.push({
                text: generateTweetText(),
                user: pick(users),
                tweetId: `mock-${Date.now()}-${Math.random().toString(16).slice(2)}-${i}`,
                createdAt,
                updatedAt: createdAt,
            });
        }
    }

    await Tweet.insertMany(tweets);

    if (!preload) {
        console.log(`📤 Broadcasting ${tweets.length} new tweets to clients...`);
        broadcastNewTweets(tweets.length);
    }

    const MAX_TWEETS = Number(process.env.MOCK_MAX_TWEETS ?? 300);
    const total = await Tweet.countDocuments();

    if(total > MAX_TWEETS) {
        if(isTrimming) return;
        isTrimming = true;

        const toDelete = total - MAX_TWEETS;

        const oldIds = await Tweet.find()
            .sort({ createdAt: 1 })
            .limit(toDelete)
            .select("_id")
        
        const ids = oldIds.map((t) => t._id);
        await Tweet.deleteMany({ _id: { $in: ids } });

        isTrimming = false;
        console.log(`Trimmed ${toDelete} old tweets, keeping total at ${MAX_TWEETS}.`);
    }

    console.log(`Inserted ${tweets.length} mock tweets into the database.`);
}