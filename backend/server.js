// server.js
import app from "./app.js";
import { config } from "dotenv";
import chalk from "chalk";
import cloudinary from "cloudinary";

// Load environment variables
config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(chalk.blue.bold(` Server running on port ${PORT}`));
});
