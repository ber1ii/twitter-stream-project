import Tweet from "../models/Tweet.js";

const users = [
    "beri",
    "markotxp2",
    "alemasina",
    "sabac je ceo",
    "sin",
    "techno_lynx",
    "mousetrap",
    "gamma",
    "syntheticDreams",
    "theRealCoder",
];

const topics = [
    "AI",
    "startups",
    "JavaScript",
    "music production",
    "networking",
    "self‑development",
    "design patterns",
    "open source",
    "cybersecurity",
    "machine learning",
];

const verbs = [
    "disrupting",
    "exploring",
    "building",
    "learning",
    "debugging",
    "breaking",
    "shipping",
    "automating",
    "testing",
    "deploying",
];

const endings = [
    "it's going great!",
    "today’s challenge was real.",
    "loving every minute.",
    "coffee solves everything ☕",
    "I broke it again...",
    "progress feels amazing!",
    "it finally works 🎉",
    "hello world 2.0",
    "debugging reality",
    "stay tuned!",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateMockTweets = async (count = 10) => {
    const tweets = Array.from({ length: count }).map((_, i) => ({
        text: `I'm ${pick(verbs)} something related to ${pick(topics)} — ${pick(
      endings
    )}`,
    user: pick(users),
    tweetId: `mock-${Date.now()}-${i}`,
    }));

    const MAX_TWEETS = 300;
    const total = await Tweet.countDocuments();
    const excess = total + count - MAX_TWEETS;

    if(excess > 0) {
        await Tweet.find()
            .sort({ createdAt: 1 })
            .limit(excess)
            .deleteMany();

        console.log(`Deleted ${excess} old tweets to maintain the limit of ${MAX_TWEETS}.`);
    }

    await Tweet.insertMany(tweets);

    console.log(`Inserted ${tweets.length} mock tweets into the database.`);
}