import express from "express";
import "dotenv/config";
import cors from "cors"
import connectDB from "./Database/index.database.js"
const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL
        ],
        credentials: true
    })
);

app.use(express.json());
connectDB();

// Routes will be imported here

import {
    adminRoutes,
    authRoutes,
    companyRoutes,
    developerRoutes,
    eventRoutes,
    pastRecruiterRoutes,
    studentRoutes
} from "./routes/index.routes.js"



app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/past-recruiters', pastRecruiterRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
