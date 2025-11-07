import express from 'express';
import { create } from "express-handlebars";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config.js';
import dotenv from 'dotenv';
import routes from "./routes.js";
import { fetchTweets } from './utils/fetchTweets.js';
import { generateMockTweets } from './utils/mockTweets.js';

dotenv.config({ path: "../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const hbs = create({ extname: ".handlebars" });

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/", routes);

const PORT = process.env.PORT || 3000;

await connectDB();
//await fetchTweets(process.env.TWITTER_KEYWORD);

/*let fetching = false;
setInterval(async () => {
    if(fetching) return;
    fetching = true;
    await fetchTweets(process.env.TWITTER_KEYWORD);
    fetching = false;
}, 12 * 60 *60 * 1000);
*/

// Updatead mock interval to 20seconds for "real-time" feel
if(process.env.MOCK_TWITTER === "true") {
    const preloadMinutes = Number(process.env.MOCK_PRELOAD_MINUTES ?? 30);
    const avgPostsPerMinute = Math.floor(Math.random() * 5) + 4; // 4-8 posts per minute
    const preloadCount = preloadMinutes * avgPostsPerMinute;
    
    console.log(`Preloading tweets for last ${preloadMinutes} minutes...`);
    await generateMockTweets(preloadCount, true); 

    const minInterval = Number(process.env.MOCK_MIN_INTERVAL_SECONDS ?? 10);
    const maxInterval = Number(process.env.MOCK_MAX_INTERVAL_SECONDS ?? 30);
    
    const scheduleNextBatch = async () => {
        const wait = Math.floor(Math.random() *  (maxInterval - minInterval + 1)) + minInterval;
        console.log(`Next mock batch in ${wait}s`);
        
        setTimeout(async () => {
            try {
                const count = 3 + Math.floor(Math.random() * 3);
                await generateMockTweets(count, false);
            } catch(err) {
                console.error("Mock insertion error:", err);
            }
            await scheduleNextBatch();
        }, wait * 1000);
    };

    await scheduleNextBatch();
}

app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
);