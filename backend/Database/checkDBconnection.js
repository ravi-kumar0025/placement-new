import dotenv from "dotenv"
import mongoose from "mongoose";
import {Announcement } from "../models/index.model.js"

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Announcement.countDocuments();
    const latest = await Announcement.find()
        .sort({ createdAt: -1 })
        .limit(5);
        
    console.log(`Total announcements: ${count}`);
    console.log("Latest 5:", JSON.stringify(latest, null, 2));
    process.exit(0);
})();