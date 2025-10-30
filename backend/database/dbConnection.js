import mongoose from "mongoose";
import chalk from "chalk";

export const dbConnection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(chalk.red.bold(" MongoDB URI is missing from .env file"));
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(chalk.yellow.bold(" Successfully connected to MongoDB!"));
  } catch (err) {
    console.error(chalk.red.bold(" MongoDB Connection Error:"), chalk.yellow(err.message));
    process.exit(1);
  }
};
