import express from "express"
import { pastRecruiterController } from "../controllers/index.controllers.js"
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.route('/')
    .get(pastRecruiterController.getPastRecruiters)
    .post(verifyToken, requireRole(['admin']), upload.single('logo'), pastRecruiterController.createPastRecruiter);

router.route('/:id')
    .put(verifyToken, requireRole(['admin']), upload.single('logo'), pastRecruiterController.updatePastRecruiter)
    .delete(verifyToken, requireRole(['admin']), pastRecruiterController.deletePastRecruiter);

export default router
