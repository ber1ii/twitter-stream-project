import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config.js';
import dotenv from 'dotenv';
import routes from "./routes.js";
import { generateMockTweets } from './utils/mockTweets.js';

dotenv.config({ path: "../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API routes MUST come before static file serving
app.use("/api", routes);

// Production: serve built React app
if (isProduction) {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientBuildPath));
    
    // SPA fallback - serve index.html for all non-API routes
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

await connectDB();

app.listen(PORT, () => {
    if (isProduction) {
        console.log(`🚀 Production server running on port ${PORT}`);
    } else {
        console.log(`🔧 Development API server running on http://localhost:${PORT}`);
        console.log(`🎨 Frontend dev server should be at http://localhost:5173`);
    }
});

// Mock tweet generation
if(process.env.MOCK_TWITTER === "true") {
    const preloadMinutes = Number(process.env.MOCK_PRELOAD_MINUTES ?? 30);
    const avgPostsPerMinute = Math.floor(Math.random() * 5) + 4;
    const preloadCount = preloadMinutes * avgPostsPerMinute;
    
    console.log(`📦 Preloading ${preloadCount} tweets for last ${preloadMinutes} minutes...`);
    await generateMockTweets(preloadCount, true); 

    const minInterval = Number(process.env.MOCK_MIN_INTERVAL_SECONDS ?? 10);
    const maxInterval = Number(process.env.MOCK_MAX_INTERVAL_SECONDS ?? 30);
    
    const scheduleNextBatch = async () => {
        const wait = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
        console.log(`⏱️  Next mock batch in ${wait}s`);
        
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