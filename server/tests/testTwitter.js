import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

try {
  const result = await client.v2.search("tech", { max_results: 10 });
  console.log(result.data?.length, "tweets fetched successfully");
} catch (err) {
  console.error("Test fetch failed:", err);
}