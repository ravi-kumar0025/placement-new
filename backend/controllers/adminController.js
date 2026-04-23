const Company = require('../models/Company');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Student = require('../models/Student');

exports.getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ verificationStatus: 'pending' });
        res.status(200).json({ companies });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const company = await Company.findByIdAndUpdate(
            companyId,
            { verificationStatus: status },
            { returnDocument: 'after' }
        );

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json({ message: `Company marked as ${status}`, company });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.assignAdminPower = async (req, res) => {
    try {
        const { email, newAdminType } = req.body;
        const currentAdminType = req.user.adminType;

        if (currentAdminType !== 'super_admin' && currentAdminType !== newAdminType) {
            return res.status(403).json({ message: 'You can only create admins of your own type' });
        }

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role !== 'admin') {
                return res.status(400).json({ message: `Cannot change role of an existing ${existingUser.role} into an admin automatically. Delete the account first or use a new email.` });
            }
            // Update existing admin
            existingUser.adminType = newAdminType;
            await existingUser.save();
            return res.status(200).json({ message: `Successfully updated ${email} to ${newAdminType.replace('_', ' ')}` });
        }

        const bcrypt = require('bcryptjs');
        const otp = '123';
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        const newAdmin = await Admin.create({
            email,
            role: 'admin',
            adminType: newAdminType,
            isVerified: true,
            fullName: 'Newly Assigned Admin',
            status: 'active',
            otp: hashedOtp,
            otpExpiry: Date.now() + 10000000
        });

        res.status(201).json({ message: `Successfully granted ${newAdminType.replace('_', ' ')} access to ${email}`, user: newAdmin });
    } catch (err) {
        console.error('Assign Power Error:', err);
        res.status(500).json({ message: 'Internal server error while assigning power' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, startDate, endDate, deadline, type, targetPrograms, targetBranches, targetYears, links, companyEmail } = req.body;

        let mappedCompany = null;
        if (companyEmail) {
            mappedCompany = await Company.findOne({ email: companyEmail });
            if (!mappedCompany) {
                return res.status(404).json({ message: 'Company email not found. Event creation aborted.' });
            }
        }

        // Apply fallback unified date logic if `endDate` wasn't sent alongside `deadline`
        const finalEndDate = endDate || deadline || startDate || date;

        const newEvent = await Event.create({
            title,
            description,
            date: date || startDate,
            startDate: startDate || date,
            endDate: finalEndDate,
            type,
            targetPrograms: targetPrograms || [],
            targetBranches: targetBranches || [],
            targetYears: targetYears || [],
            deadline: deadline || finalEndDate,
            links: links || [],
            createdBy: req.user.userId,
            companyRef: mappedCompany ? mappedCompany._id : undefined
        });

        // Link Event to the Company's roster so Applicants Database works
        if (mappedCompany) {
            mappedCompany.events.push(newEvent._id);
            await mappedCompany.save();
        }

        res.status(201).json({ message: 'Event created', event: newEvent });
    } catch (err) {
        console.error('createEvent Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ startDate: 1 }).populate('createdBy', 'fullName email');
        res.status(200).json({ events });
    } catch (err) {
        console.error('getEvents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted' });
    } catch (err) {
        console.error('deleteEvent Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startDate, endDate, deadline, type, targetPrograms, targetBranches, targetYears, links, companyEmail } = req.body;

        const finalEndDate = endDate || deadline || startDate;

        let companyRef;
        if (companyEmail) {
            const company = await Company.findOne({ email: companyEmail });
            if (!company) return res.status(404).json({ message: 'Company email not found.' });
            companyRef = company._id;
        }

        const updated = await Event.findByIdAndUpdate(
            id,
            {
                title, description, type,
                startDate, endDate: finalEndDate,
                deadline: deadline || finalEndDate,
                targetPrograms: targetPrograms || [],
                targetBranches: targetBranches || [],
                targetYears: targetYears || [],
                links: links || [],
                ...(companyRef && { companyRef }),
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event updated', event: updated });
    } catch (err) {
        console.error('updateEvent Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const raw = await Announcement.find()
            .populate('createdBy', 'fullName email');
        // Sort by effective date = max(editedAt, createdAt)
        const announcements = raw.sort((a, b) => {
            const aDate = Math.max(a.editedAt?.getTime() ?? 0, a.createdAt?.getTime() ?? 0);
            const bDate = Math.max(b.editedAt?.getTime() ?? 0, b.createdAt?.getTime() ?? 0);
            return bDate - aDate;
        });
        res.status(200).json({ announcements });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, targetPrograms, targetBranches, targetYears } = req.body;
        const newAnnouncement = await Announcement.create({
            title,
            content,
            targetPrograms: targetPrograms || [],
            targetBranches: targetBranches || [],
            targetYears: targetYears || [],
            createdBy: req.user.userId
        });
        res.status(201).json({ message: 'Announcement created', announcement: newAnnouncement });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, targetPrograms, targetBranches, targetYears } = req.body;
        const now = new Date();

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(targetPrograms !== undefined && { targetPrograms }),
                ...(targetBranches !== undefined && { targetBranches }),
                ...(targetYears !== undefined && { targetYears }),
                isEdited: true,
                editedAt: now,
            },
            { new: true, runValidators: true }
        );
        if (!updatedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json({ message: 'Announcement updated', announcement: updatedAnnouncement });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPendingStudents = async (req, res) => {
    try {
        const pendingStudents = await Student.find({ verificationStatus: 'pending' }).select('-otp -otpExpiry');
        res.status(200).json({ pendingStudents });
    } catch (err) {
        console.error('getPendingStudents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyStudentData = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const student = await Student.findByIdAndUpdate(
            studentId,
            { verificationStatus: status },
            { returnDocument: 'after' }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: `Student verification marked as ${status}`, student });
    } catch (err) {
        console.error('verifyStudentData Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateAdminRole = async (req, res) => {
    try {
        const { adminId } = req.params;
        const currentUserId = req.user.userId;
        const { adminType } = req.body;

        // Gatekeeper: Only Super Admin can change roles.
        // Also prevent a Super Admin from changing their OWN role through this endpoint as a safety measure.
        if (req.user.adminType !== 'super_admin') {
            return res.status(403).json({ message: 'Only Super Admins can update admin roles.' });
        }

        if (adminId === currentUserId) {
            return res.status(400).json({ message: 'You cannot change your own role.' });
        }

        if (!['super_admin', 'announcement_admin', 'student_admin'].includes(adminType)) {
            return res.status(400).json({ message: 'Invalid admin role.' });
        }

        const adminUpdates = { adminType };

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            adminUpdates,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.status(200).json({
            message: 'Admin role updated successfully.',
            admin: updatedAdmin
        });

    } catch (err) {
        console.error('updateAdminRole Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const updateData = {};

        if (req.file && req.file.path) {
            const { uploadOnCloudinary } = require('../utils/cloudinaryConfig');
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

            if (cloudinaryResponse) {
                updateData.profilePicture = cloudinaryResponse.url;
            } else {
                return res.status(500).json({ message: 'Error uploading profile picture to Cloudinary.' });
            }
        }

        if (Object.keys(updateData).length > 0) {
            const updatedAdmin = await Admin.findByIdAndUpdate(
                adminId,
                updateData,
                { returnDocument: 'after' }
            );
            return res.status(200).json({ message: 'Profile updated successfully.', admin: updatedAdmin });
        }

        res.status(200).json({ message: 'No changes provided.', admin: await Admin.findById(adminId) });
    } catch (err) {
        console.error('updateProfile Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// New Event Workflow for Admins

exports.getPendingAnnouncementEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending_announcement_admin' }).populate('companyRef', 'companyName companyEmail');
        res.status(200).json({ events });
    } catch (err) {
        console.error('getPendingAnnouncementEvents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.allotEventTiming = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, deadline, adminNotes } = req.body;

        if (!startDate) return res.status(400).json({ message: 'startDate is required' });

        const finalEndDate = endDate || startDate;
        const finalDeadline = deadline || finalEndDate;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.status !== 'pending_announcement_admin') {
            return res.status(400).json({ message: 'Event is not in the correct state' });
        }

        event.startDate = startDate;
        event.endDate = finalEndDate;
        event.deadline = finalDeadline;
        event.status = 'pending_admin';
        if (adminNotes) event.adminNotes = adminNotes;

        await event.save();
        res.status(200).json({ message: 'Timing allotted and passed to main admin', event });
    } catch (err) {
        console.error('allotEventTiming Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPendingAdminEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending_admin' }).populate('companyRef', 'companyName companyEmail');
        res.status(200).json({ events });
    } catch (err) {
        console.error('getPendingAdminEvents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyEventTiming = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.status !== 'pending_admin') {
            return res.status(400).json({ message: 'Event is not in the correct state' });
        }

        event.status = 'pending_company_approval';
        if (adminNotes) {
            event.adminNotes = event.adminNotes ? event.adminNotes + '\n' + adminNotes : adminNotes;
        }

        await event.save();
        res.status(200).json({ message: 'Event verified and sent to company for approval', event });
    } catch (err) {
        console.error('verifyEventTiming Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
