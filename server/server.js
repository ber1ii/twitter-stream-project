import express from 'express';
import { create } from "express-handlebars";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config.js';
import dotenv from 'dotenv';
import routes from "./routes.js";

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

app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
);