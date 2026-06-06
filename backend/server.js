import express from "express";
import "dotenv/config";
import cors from "cors"
import connectDB from "./Database/index.database.js"
const app = express();

const normalizeOrigin = (origin) => origin?.trim().replace(/\/$/, "");

const allowedOrigins = new Set(
    [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://placement-portal-pi-six.vercel.app",
        process.env.FRONTEND_URL,
        ...(process.env.FRONTEND_URLS?.split(",") || [])
    ]
        .map(normalizeOrigin)
        .filter(Boolean)
);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
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
