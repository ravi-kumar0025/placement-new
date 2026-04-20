const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, requireRole, isCompanyVerified } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinaryConfig');

// Get students who applied to this company's events
router.get('/students', verifyToken, requireRole(['company', 'admin']), isCompanyVerified, companyController.getStudents);
// Get all events created by this company (for the dropdown selector)
router.get('/events', verifyToken, requireRole(['company']), companyController.getCompanyEvents);
router.post('/verify', verifyToken, requireRole(['company']), companyController.submitVerification);
router.put('/profile', verifyToken, requireRole(['company']), upload.single('profilePicture'), companyController.updateProfile);

module.exports = router;
