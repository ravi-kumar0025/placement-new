import { Student, Company, Event } from "../models/index.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const submitVerification = async (req, res) => {
    try {
        const companyId = req.user.userId;
        const { companyName, companyEmail, companyWebsite, HRContactName, HRContactEmail, contactNumber } = req.body;

        const requiredFields = ['companyName', 'companyEmail', 'HRContactName', 'HRContactEmail'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required for verification.` });
            }
        }

        const updateData = {
            companyName,
            companyEmail,
            HRContactName,
            HRContactEmail,
            verificationStatus: 'pending'
        };

        if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
        if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        return res.status(200).json({
            message: 'Company verification submitted successfully.',
            company: updatedCompany
        });

    } catch (err) {
        console.error('submitVerification Error:', err);
        return res.status(500).json({
            message: 'Internal server error during company verification submission.'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const companyId = req.user.userId;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        if (company.verificationStatus !== 'verified') {
            return res.status(403).json({
                message: 'Profile editing is restricted until verification is complete.'
            });
        }

        const { companyWebsite, HRContactName, HRContactEmail, contactNumber } = req.body;
        const updateData = {};

        if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
        if (HRContactName !== undefined) updateData.HRContactName = HRContactName;
        if (HRContactEmail !== undefined) updateData.HRContactEmail = HRContactEmail;
        if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

        if (req.file?.path) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (!cloudinaryResponse) {
                return res.status(500).json({ message: 'Error uploading profile picture to Cloudinary.' });
            }
            updateData.profilePicture = cloudinaryResponse.url;
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: 'Company profile updated successfully.',
            company: updatedCompany
        });

    } catch (err) {
        console.error('updateProfile Error:', err);
        return res.status(500).json({ message: 'Internal server error while updating the profile.' });
    }
};

const getCompanyEvents = async (req, res) => {

    try {
        const companyId = req.user.userId;
        const events = await Event.find({
            $or: [
                { createdBy: companyId },
                { companyRef: companyId }
            ]
        });
        return res.status(200).json({ events });
    } catch (err) {
        console.error('getCompanyEvents Error:', err);
        return res.status(500).json({ message: 'Internal server error while fetching events' });
    }

};

const getStudents = async (req, res) => {

    try {
        const { cgpa, branch, program, eventId } = req.query;
        const companyId = req.user.userId;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        let appliedStudentIds = null;

        if (eventId) {

            if (!company.events.includes(eventId)) {
                return res.status(403).json({ message: 'Event not found or unauthorized' });
            }
            const event = await Event.findById(eventId);
            appliedStudentIds = event ? event.appliedStudents : [];
        } else {

            const allEvents = await Event.find({ _id: { $in: company.events } });
            appliedStudentIds = allEvents.reduce((acc, curr) => {
                return acc.concat(curr.appliedStudents || []);
            }, []);

            appliedStudentIds = [...new Set(appliedStudentIds)];
        }

        const query = {};

        if (appliedStudentIds.length === 0) {
            return res.status(200).json({ students: [] });
        }
        query.email = { $in: appliedStudentIds };

        if (cgpa) {
            query.cgpa = { $gte: parseFloat(cgpa) };
        }

        if (branch) {
            const branchArray = branch.split(',').map(b => b.trim()).filter(Boolean);
            if (branchArray.length > 0) {
                query.department = { $in: branchArray };
            }
        }

        if (program) {
            const programArray = program.split(',').map(p => p.trim());
            if (programArray.length > 0) {
                query.program = { $in: programArray };
            }
        }

        const students = await Student.find(query).select('-__v');
        res.status(200).json({ students });
    } catch (err) {
        console.error('getStudents Error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const requestEvent = async (req, res) => {
    try {
        const { title, description, type, targetPrograms, targetBranches, targetYears, links } = req.body;
        const companyId = req.user.userId;

        const newEvent = await Event.create({
            title,
            description,
            type,
            targetPrograms: targetPrograms || [],
            targetBranches: targetBranches || [],
            targetYears: targetYears || [],
            links: links || [],
            createdBy: companyId,
            companyRef: companyId,
            status: 'pending_announcement_admin'
        });

        // Add to company events
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(400).json({ message: "no such company exits in database" })
        }
        company.events.push(newEvent._id);
        await company.save();

        return res.status(201).json({ message: 'Event request submitted successfully', event: newEvent });
    } catch (err) {
        console.error('requestEvent Error:', err);
        return res.status(500).json({ message: 'Internal server error while requesting event creation, try again later or contact administration' });
    }
};

const eventAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, companyFeedback } = req.body; // action: 'approve', 'request_change', 'cancel'
        const companyId = req.user.userId;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.companyRef.toString() !== companyId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (event.status !== 'pending_company_approval') {
            return res.status(400).json({ message: 'Event is not pending your approval' });
        }

        if (action === 'approve') {
            event.status = 'published';
            event.companyFeedback = ''; // clear feedback
        } else if (action === 'request_change') {
            if (!companyFeedback) {
                return res.status(400).json({ message: 'Feedback is required when requesting a change' });
            }
            event.status = 'pending_announcement_admin';
            event.companyFeedback = companyFeedback;
        } else if (action === 'cancel') {
            event.status = 'cancelled';
            event.companyFeedback = companyFeedback || 'Cancelled by company';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await event.save();
        res.status(200).json({ message: `Event action '${action}' applied successfully`, event });
    } catch (err) {
        console.error('eventAction Error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const companyController={
    submitVerification,
    getCompanyEvents,
    updateProfile,
    getStudents,
    requestEvent,
    eventAction
}
export default companyController
