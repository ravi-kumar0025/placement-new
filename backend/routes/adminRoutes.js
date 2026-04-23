const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole, checkAdminRole } = require('../middleware/authMiddleware');

router.use(verifyToken, requireRole(['admin'])); // All routes require admin

router.get('/companies/pending', checkAdminRole(['super_admin']), adminController.getPendingCompanies);
router.put('/companies/:companyId/verify', checkAdminRole(['super_admin']), adminController.verifyCompany);

// Student Verification Routes
router.get('/students/pending', checkAdminRole(['super_admin', 'student_admin']), adminController.getPendingStudents);
router.put('/students/:studentId/verify', checkAdminRole(['super_admin', 'student_admin']), adminController.verifyStudentData);
router.post('/assign-power', checkAdminRole(['super_admin', 'announcement_admin', 'student_admin']), adminController.assignAdminPower);

// Event Workflow Routes
router.get('/events/workflow/pending-announcement', checkAdminRole(['super_admin', 'announcement_admin']), adminController.getPendingAnnouncementEvents);
router.put('/events/workflow/:id/allot-timing', checkAdminRole(['super_admin', 'announcement_admin']), adminController.allotEventTiming);
router.get('/events/workflow/pending-admin', checkAdminRole(['super_admin', 'student_admin']), adminController.getPendingAdminEvents);
router.put('/events/workflow/:id/verify-timing', checkAdminRole(['super_admin', 'student_admin']), adminController.verifyEventTiming);

// Events Routes
router.get('/events', checkAdminRole(['super_admin', 'student_admin']), adminController.getEvents);
router.post('/events', checkAdminRole(['super_admin', 'student_admin']), adminController.createEvent);
router.put('/events/:id', checkAdminRole(['super_admin', 'student_admin']), adminController.updateEvent);
router.delete('/events/:id', checkAdminRole(['super_admin', 'student_admin']), adminController.deleteEvent);

// Announcements Routes
router.get('/announcements', checkAdminRole(['super_admin', 'announcement_admin']), adminController.getAnnouncements);
router.post('/announcements', checkAdminRole(['super_admin', 'announcement_admin']), adminController.createAnnouncement);
router.put('/announcements/:id', checkAdminRole(['super_admin', 'announcement_admin']), adminController.updateAnnouncement);
router.delete('/announcements/:id', checkAdminRole(['super_admin', 'announcement_admin']), adminController.deleteAnnouncement);

const { upload } = require('../utils/cloudinaryConfig');

// Profile editing for Admins
router.put('/profile/:adminId/role', checkAdminRole(['super_admin']), adminController.updateAdminRole);
router.put('/profile', upload.single('profilePicture'), adminController.updateProfile);

module.exports = router;
