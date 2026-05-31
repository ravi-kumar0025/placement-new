
import { Company, Admin, User, Event, Announcement, Student } from "../models/index.model.js"
import bcrypt from "bcryptjs"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import getOtp from "../utils/getOtp.js";

const getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ verificationStatus: 'pending' });
        res.status(200).json({ companies });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch the "verification pending status" companies.' });
    }
};

const verifyCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status } = req.body;

        const validStatuses = ["verified", "rejected"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const company = await Company.findByIdAndUpdate(
            companyId,
            { verificationStatus: status },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        return res.status(200).json({
            message: `Company marked as ${status}`,
            company
        });

    } catch (error) {
        console.error("verifyCompany Error:", error);

        return res.status(500).json({
            message: "can not update the status of the company"
        });
    }
};

const assignAdminPower = async (req, res) => {
    try {
        const { email, newAdminType, fullName } = req.body;
        const currentAdminType = req.user.adminType;            //one who is assigning the power

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
            await existingUser.save();      //ye necessary h
            return res.status(200).json({ message: `Successfully updated ${email} to ${newAdminType.replace('_', ' ')}` });
        }

        const { hashedOtp } = await getOtp();
        
        const newAdmin = await Admin.create({           // admin collection me nhi change karna hoga na
            email,
            fullName,
            role: "admin",
            adminType: newAdminType,
            isVerified: true,
            status: "active",
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });

        return res.status(201).json({
            message: `Successfully granted ${newAdminType.replace('_', ' ')} access to ${email}`,
            user: newAdmin
        });
    } catch (err) {
        console.error('Assign Power Error:', err);
        res.status(500).json({ message: 'Internal server error while assigning power' });
    }
};

const getPendingStudents = async (req, res) => {
    try {
        const pendingStudents = await Student.find({ verificationStatus: 'pending' }).
            select('-otp -otpExpiry');

        return res.status(200).
            json({ pendingStudents });
    } catch (err) {
        console.error('Error to get the students in pending list Error:', err);
        res.status(500).json({ message: 'Could not get the students try again later' });
    }
};

const verifyStudentData = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status } = req.body;

        const validStatuses = ["verified", "rejected"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const student = await Student.findByIdAndUpdate(
            studentId,
            { verificationStatus: status },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json({
            message: `Student verification marked as ${status}`,
            student
        });

    } catch (error) {
        console.error("verifyStudentData Error:", error);

        return res.status(500).json({
            message: "can not verify the student at  this time"
        });
    }
};

const updateAdminRole = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { adminType } = req.body;
        const { userId, adminType: currentAdmin } = req.user;
        // admin type as currentAdminType

        const validAdminRoles = [
            "super_admin",
            "announcement_admin",
            "student_admin"
        ];

        if (currentAdmin !== "super_admin") {
            return res.status(403).json({
                message: "Only Super Admins can update admin roles."
            });
        }

        if (adminId === userId) {
            return res.status(400).json({
                message: "You cannot change your own role."
            });
        }

        if (!validAdminRoles.includes(adminType)) {
            return res.status(400).json({
                message: "Invalid admin role."
            });
        }

        // const adminUpdates = { adminType };

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { adminType },
            {
                new: true,
                runValidators: true
            }
        );


        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        return res.status(200).json({
            message: 'Admin role updated successfully.',
            admin: updatedAdmin
        });

    } catch (err) {
        console.error('updateAdminRole Error:', err);
        return res.status(500).
            json({ message: 'Role of the admin could not be updated try again later.' });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ startDate: 1 })
            .populate("createdBy", "fullName email");           //this is like join using id

        return res.status(200).json({ events });

    } catch (error) {
        console.error("getEvents Error:", error);

        return res.status(500).json({
            message: "Failed to fetch events. Please try again later."
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent)
            return res.status(404).json({ message: 'No such event found' });

        return res.status(200).json({ message: 'Event deleted' });
    } catch (err) {
        console.error('deleteEvent Error: ', err);
        res.status(500).json({ message: 'can not delete the event, try again later' });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const raw = await Announcement.find()
            .populate('createdBy', 'fullName email');
        const announcements = raw.sort((a, b) => {
            const aDate = Math.max(a.editedAt?.getTime() ?? 0, a.createdAt?.getTime() ?? 0);
            const bDate = Math.max(b.editedAt?.getTime() ?? 0, b.createdAt?.getTime() ?? 0);
            return bDate - aDate;
        });
        return res.status(200).json({ announcements });
    } catch (err) {
        res.status(500).json({ message: 'could not fetch the announcements' });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'no such announcement found' });
        }
        return res.status(200).json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500)
            .json({ message: 'could not delete the announcement, try again later' });
    }
};

const getPendingAnnouncementEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending_announcement_admin' })
            .populate('companyRef', 'companyName companyEmail email');
        return res.status(200).json({ events });
    } catch (err) {
        console.error('ERror to fetch the announcement admin approval pending events:', err);
        return res.status(500).json({ message: 'could not fetch the pending events' });
    }
};

const getPendingAdminEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending_admin' })
            .populate('companyRef', 'companyName companyEmail email');
        return res.status(200).json({ events });
    } catch (err) {
        console.error('ERror to fetch the admin approval pending events:', err);
        res.status(500).json({ message: 'could not fetch the pending events' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId: adminId } = req.user;

        if (!req.file?.path) {
            return res.status(400).json({
                message: "Profile picture is required."
            });
        }

        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

        if (!cloudinaryResponse?.url) {
            return res.status(500)
                .json({
                    message: "Failed to upload image to Cloudinary."
                });
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { profilePicture: cloudinaryResponse.url },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Profile updated successfully.",
            admin: updatedAdmin
        });

    } catch (error) {
        console.error("updateProfile Error:", error);
        return res.status(500).json({
            message: "can not update the admin profile, try again later."
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title,
            description,
            startDate,
            endDate,
            deadline,
            type,
            targetPrograms,
            targetBranches,
            targetYears,
            links,
            email } = req.body;

        const finalEndDate = endDate || deadline || startDate;

        let duration;
        if (startDate && finalEndDate) {
            const start = new Date(startDate);
            const end = new Date(finalEndDate);
            if (end < start) {
                return res.status(400).json({ message: "endDate cannot be earlier than startDate" });
            }
            duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }

        let companyRef;
        if (email) {
            const company = await Company.findOne({ email });
            if (!company)
                return res.status(404)
                    .json({ message: 'Company email not found.' });

            companyRef = company._id;
        }

        const updated = await Event.findByIdAndUpdate(
            id,
            {
                title,
                description,
                type,
                startDate,
                endDate: finalEndDate,
                deadline: deadline || finalEndDate,
                targetPrograms: targetPrograms || [],
                targetBranches: targetBranches || [],
                targetYears: targetYears || [],
                links: links || [],
                duration,
                ...(companyRef && { companyRef }),
            },
            { new: true }
        );

        // const updateData = {
        //     title,
        //     description,
        //     type,
        //     startDate,
        //     endDate: finalEndDate,
        //     deadline: deadline || finalEndDate,
        //     targetPrograms: targetPrograms || [],
        //     targetBranches: targetBranches || [],
        //     targetYears: targetYears || [],
        //     links: links || []
        // };

        // if (companyRef) {
        //     updateData.companyRef = companyRef;
        // }

        if (!updated) return res.status(404).json({ message: 'Event not found' });
        return res.status(200).json({ message: 'Event updated', event: updated });
    } catch (err) {
        console.error('updateEvent Error:', err);
        res.status(500).json({ message: 'could not update the event try again later' });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const { title,
            content,
            targetPrograms,
            targetBranches,
            targetYears } = req.body;
        const newAnnouncement = await Announcement.create({
            title,
            content,
            targetPrograms: targetPrograms || [],
            targetBranches: targetBranches || [],
            targetYears: targetYears || [],
            createdBy: req.user.userId
        });
        return res.status(201)
            .json({ message: 'Announcement created', announcement: newAnnouncement });
    } catch (err) {
        res.status(500).json({ message: 'new announcement could not be created' });
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, targetPrograms, targetBranches, targetYears } = req.body;

        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (content !== undefined) updateFields.content = content;
        if (targetPrograms !== undefined) updateFields.targetPrograms = targetPrograms;
        if (targetBranches !== undefined) updateFields.targetBranches = targetBranches;
        if (targetYears !== undefined) updateFields.targetYears = targetYears;

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            {
                ...updateFields,
                isEdited: true,
                editedAt: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        return res.status(200).json({ message: 'Announcement updated successfully', announcement: updatedAnnouncement });
    } catch (err) {
        return res.status(500).json({ message: 'could not update the announcement, try again later' });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title,
            description,
            startDate,
            endDate,
            deadline,
            duration,
            type,
            targetPrograms,
            targetBranches,
            targetYears,
            links,
            companyEmail } = req.body;

        let mappedCompany = null;
        if (companyEmail) {
            mappedCompany = await Company.findOne({ email: companyEmail });
            if (!mappedCompany) {
                return res.status(404).json({ message: 'Company email not found. Event creation aborted.' });
            }
        }

        // Apply fallback unified date logic if `endDate` wasn't sent alongside `deadline`
        const finalEndDate = endDate || deadline || startDate;

        const newEvent = await Event.create({
            title,
            description,
            duration,
            startDate,
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

        if (mappedCompany) {
            mappedCompany.events.push(newEvent._id);
            await mappedCompany.save();
        }

        return res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (err) {
        console.error('createEvent Error:', err);
        res.status(500).json({ message: 'could not create the event' });
    }
};

const allotEventTiming = async (req, res) => {
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
        return res.status(200).json({ message: 'Timing allotted and passed to main admin', event });
    } catch (err) {
        console.error('allotEventTiming Error:', err);
        return res.status(500).json({ message: 'can not allot Event timing, try again later' });
    }
};

const verifyEventTiming = async (req, res) => {
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

        await event.save();      //ye jaruri h
        return res.status(200).json({ message: 'Event verified and sent to company for approval', event });
    } catch (err) {
        console.error('verifyEventTiming Error:', err);
        return res.status(500).json({ message: 'can not verify the event timing, try again later' });
    }
};

const adminController={
    getPendingCompanies,
    verifyCompany,
    assignAdminPower,
    getPendingStudents,
    verifyStudentData,
    updateAdminRole,
    getEvents,
    deleteEvent,
    getAnnouncements,
    deleteAnnouncement,
    getPendingAnnouncementEvents,
    getPendingAdminEvents,
    updateProfile,
    updateEvent,
    createEvent,
    createAnnouncement,
    updateAnnouncement,
    allotEventTiming,
    verifyEventTiming
}
export default adminController;
