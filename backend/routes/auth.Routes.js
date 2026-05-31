import express from "express"
const router = express.Router();
import { authController } from "../controllers/index.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js"

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.get('/me', verifyToken, authController.getCurrentUser);

export default router
