import Tweet from "../models/Tweet.js";

const fakeUsers = ["beri", "markotxp2", "alemasina", "sabac je ceo", "sin"];

export const generateMockTweets = async (count = 5) => {
    const tweets = Array.from({ length: count }).map((_, i) => ({
        text: `Mock tweet #${i + 1}: ${
            ["building cool stuff", "learning JavaScript", "exploring Node.js", "coding is fun", "hello world"][
                Math.floor(Math.random() * 5)
            ]
        }`,
        user: fakeUsers[Math.floor(Math.random() * fakeUsers.length)],
        tweetId: `mock-${Date.now()}-${i}`,
    }));

    await Tweet.deleteMany({});
    await Tweet.insertMany(tweets);

    console.log(`Inserted ${tweets.length} mock tweets into the database.`);
}