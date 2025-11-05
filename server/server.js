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
    const initialBatch = Number(process.env.MOCK_BATCH_SIZE ?? 10);
    const intervalSeconds = Number(process.env.MOCK_INTERVAL_SECONDS ?? 20);
    
    console.log(`Seeding ${initialBatch} mock tweets...`);
    await generateMockTweets(initialBatch);

    console.log(`Auto-inserting new mock tweets every ${intervalSeconds} seconds...`);
    setInterval(async () => {
        try {
            const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 tweets
            await generateMockTweets(count);
        } catch(err) {
            console.error("Mock insertion error:", err);
        }
    }, intervalSeconds * 1000); 
}

app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
);