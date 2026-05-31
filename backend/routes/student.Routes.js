import express from "express";
const router = express.Router();

import { studentController, calendarController } from "../controllers/index.controllers.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const authStudent = [verifyToken, requireRole(["student"])];

router.get("/events", ...authStudent, studentController.getEvents);
router.get("/announcements", ...authStudent, studentController.getAnnouncements);
router.get("/calendar", ...authStudent, calendarController.getUnifiedCalendar);

router.post("/verify", ...authStudent, upload.single("idCard"), studentController.submitVerification);

router.put(
    "/profile", ...authStudent, upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "profilePicture", maxCount: 1 },
    ]), studentController.updateProfile
);

export default router;