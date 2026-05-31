
import express from "express";
import { eventController } from "../controllers/index.controllers.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js"
const router = express.Router()

// Student applies to an event
router.patch('/:eventId/apply', verifyToken, requireRole(['student']), eventController.applyToEvent);

export default router
