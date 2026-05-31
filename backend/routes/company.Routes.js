
import express from "express"
import companyController from "../controllers/company.controller.js"
import { verifyToken, requireRole, isCompanyVerified } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js"

const router = express.Router();

router.post('/verify', verifyToken, requireRole(['company']), companyController.submitVerification);
router.put('/profile', verifyToken, requireRole(['company']), upload.single('profilePicture'), companyController.updateProfile);

router.get('/events', verifyToken, requireRole(['company']), companyController.getCompanyEvents);


// Get students who applied to this company's events
router.get('/students', verifyToken, requireRole(['company', 'admin']), isCompanyVerified, companyController.getStudents);
// Get all events created by this company (for the dropdown selector)


// New Event Workflow Routes
router.post('/events/request', verifyToken, requireRole(['company']), isCompanyVerified, companyController.requestEvent);
router.put('/events/:id/action', verifyToken, requireRole(['company']), isCompanyVerified, companyController.eventAction);

export default router;
