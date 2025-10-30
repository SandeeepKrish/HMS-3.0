// scripts/reset-password.js
import mongoose from "mongoose";
import { config } from "dotenv";
import { User } from "../models/userSchema.js";

config({ path: "./config/config.env" });

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const toReset = [
        { email: "Developer12@gmail.com", newPassword: "Developer@12345" },
        // add more if needed
    ];

    for (const { email, newPassword } of toReset) {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            console.log("Not found:", email);
            continue;
        }
        user.password = newPassword; // pre-save hook will hash this
        await user.save();
        console.log("✅ Password reset for:", email);
    }

    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
