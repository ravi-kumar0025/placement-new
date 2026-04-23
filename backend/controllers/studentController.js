const Event = require('../models/Event');
const Student = require('../models/Student');
const Announcement = require('../models/Announcement');

exports.getEvents = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const { type, targetBranch } = req.query;

        const query = { 
            $and: [
                { $or: [{ status: 'published' }, { status: { $exists: false } }] }
            ] 
        };
        if (type) query.type = type;

        const targetBranchesRegex = [];
        if (targetBranch && targetBranch.trim() && targetBranch.trim().toLowerCase() !== 'undefined') {
            targetBranchesRegex.push(new RegExp(`^${targetBranch.trim()}$`, 'i'));
        } else if (student.department) {
            targetBranchesRegex.push(new RegExp(`^${student.department}$`, 'i'));
        }
        targetBranchesRegex.push(/^all$/i);

        query.$and.push({
            $or: [
                { targetBranches: { $size: 0 } },
                { targetBranches: { $in: targetBranchesRegex } }
            ]
        });

        query.$and.push(student.program ? {
            $or: [
                { targetPrograms: { $size: 0 } },
                { targetPrograms: { $in: [student.program] } }
            ]
        } : { targetPrograms: { $size: 0 } });

        query.$and.push(student.currentYearOfStudy ? {
            $or: [
                { targetYears: { $size: 0 } },
                { targetYears: { $in: [student.currentYearOfStudy] } }
            ]
        } : { targetYears: { $size: 0 } });

        // Clean up empty $and if needed, though we always push at least branches
        if (query.$and.length === 0) delete query.$and;

        const events = await Event.find(query).sort({ date: 1 });
        res.status(200).json({ events });
    } catch (err) {
        console.error('getEvents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const query = { $and: [] };

        const targetBranchesRegex = [/^all$/i];
        if (student.department) {
            targetBranchesRegex.push(new RegExp(`^${student.department}$`, 'i'));
        }

        query.$and.push({
            $or: [
                { targetBranches: { $size: 0 } },
                { targetBranches: { $in: targetBranchesRegex } }
            ]
        });

        query.$and.push(student.program ? {
            $or: [
                { targetPrograms: { $size: 0 } },
                { targetPrograms: { $in: [student.program] } }
            ]
        } : { targetPrograms: { $size: 0 } });

        query.$and.push(student.currentYearOfStudy ? {
            $or: [
                { targetYears: { $size: 0 } },
                { targetYears: { $in: [student.currentYearOfStudy] } }
            ]
        } : { targetYears: { $size: 0 } });

        // Sort by effective date = max(editedAt, createdAt) so edited announcements
        // slot into the correct chronological position instead of jumping to the top.
        const raw = await Announcement.find(query)
            .populate('createdBy', 'fullName email');
        const announcements = raw
            .sort((a, b) => {
                const aDate = Math.max(a.editedAt?.getTime() ?? 0, a.createdAt?.getTime() ?? 0);
                const bDate = Math.max(b.editedAt?.getTime() ?? 0, b.createdAt?.getTime() ?? 0);
                return bDate - aDate;
            })
            .slice(0, 50);
        res.status(200).json({ announcements });
    } catch (err) {
        console.error('getAnnouncements Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.submitVerification = async (req, res) => {
    try {
        console.log("---- DEBUG: submitVerification endpoint hit ----");
        const { cgpa, phoneNumber } = req.body;
        console.log("DEBUG: Received body:", req.body);
        console.log("DEBUG: Received file:", req.file ? req.file.path : "No file attached");

        const studentId = req.user.userId; // From verifyToken middleware
        console.log("DEBUG: Student ID from token:", studentId);

        const updateData = {
            verificationStatus: 'pending',
        };

        if (req.body.fullName) updateData.fullName = req.body.fullName;
        if (req.body.rollNumber) updateData.rollNumber = req.body.rollNumber;
        if (cgpa) updateData.cgpa = parseFloat(cgpa);
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (req.body.currentYearOfStudy) updateData.currentYearOfStudy = req.body.currentYearOfStudy;

        console.log("DEBUG: Checking for file to upload to Cloudinary...");
        if (req.file && req.file.path) {
            console.log("DEBUG: req.file exists. Calling uploadOnCloudinary...");
            const { uploadOnCloudinary } = require('../utils/cloudinaryConfig');
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

            if (cloudinaryResponse) {
                console.log("DEBUG: Cloudinary upload successful, attaching URL to update data.");
                updateData.idCardUrl = cloudinaryResponse.url;
            } else {
                console.error("DEBUG: uploadOnCloudinary returned null or failed.");
                return res.status(500).json({ message: 'Error uploading image to Cloudinary.' });
            }
        } else {
            console.log("DEBUG: No file provided under req.file");
        }

        console.log("DEBUG: Executing findByIdAndUpdate for student:", studentId);
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { returnDocument: 'after' }
        );

        if (!updatedStudent) {
            console.warn("DEBUG: Student not found in DB");
            return res.status(404).json({ message: 'Student not found.' });
        }

        console.log("DEBUG: Verification updated successfully in DB.");
        res.status(200).json({
            message: 'Verification form submitted successfully.',
            student: updatedStudent
        });

    } catch (err) {
        console.error('---- DEBUG: submitVerification Error ----');
        console.error(err);
        res.status(500).json({ message: 'Internal server error during verification submission.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const studentId = req.user.userId;

        // Fetch student to check verification status
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Gatekeeper: Only verified students can update their profile
        if (student.verificationStatus !== 'verified') {
            return res.status(403).json({ message: 'Profile editing is restricted until verification is complete.' });
        }

        // Destructure ONLY the allowed editable fields (Field-Level Immutability)
        const { phoneNumber } = req.body;

        const updateData = {};
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

        // Handle Resume Upload
        if (req.files && req.files.resume && req.files.resume[0]) {
            const { uploadOnCloudinary } = require('../utils/cloudinaryConfig');
            const cloudinaryResponse = await uploadOnCloudinary(req.files.resume[0].path);

            if (cloudinaryResponse) {
                updateData.resumeLink = cloudinaryResponse.url;
            } else {
                return res.status(500).json({ message: 'Error uploading resume to Cloudinary.' });
            }
        } else if (req.body.removeResume === 'true') {
            updateData.resumeLink = ''; // Clear the resume link
        }
        
        // Handle Profile Picture Upload
        if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
            const { uploadOnCloudinary } = require('../utils/cloudinaryConfig');
            const cloudinaryResponse = await uploadOnCloudinary(req.files.profilePicture[0].path);

            if (cloudinaryResponse) {
                updateData.profilePicture = cloudinaryResponse.url;
            } else {
                return res.status(500).json({ message: 'Error uploading profile picture to Cloudinary.' });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully.',
            student: updatedStudent
        });
    } catch (err) {
        console.error('updateProfile Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
