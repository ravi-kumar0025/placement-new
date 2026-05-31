
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Event, Student, Announcement } from "../models/index.model.js"

const submitVerification = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { cgpa, phoneNumber, fullName, rollNumber, currentYearOfStudy } = req.body;

        const requiredFields = ['cgpa', 'phoneNumber', 'fullName', 'rollNumber', 'currentYearOfStudy'];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required.` });
            }
        }

        const updateData = {
            verificationStatus: 'pending',
            fullName,
            rollNumber,
            cgpa: parseFloat(cgpa),
            phoneNumber,
            currentYearOfStudy
        };

        if (req.file && req.file.path) {                                                                                    //ye soda to id card ke liye h
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

            if (!cloudinaryResponse) {
                return res.status(500).json({ message: 'can not process the image, try again.' });
            }

            updateData.idCard = cloudinaryResponse.url;
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        return res.status(200).json({
            message: 'Verification form submitted successfully.',
            student: updatedStudent
        });

    } catch (err) {
        console.error('submitVerification Error:', err);
        return res.status(500).json({ message: 'Internal server error during verification submission.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (student.verificationStatus !== 'verified') {            //verified to ho pahle
            return res.status(403).json({
                message: 'Profile editing is restricted until verification is complete.'
            });
        }

        const { phoneNumber } = req.body;
        const updateData = {};

        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

        if (req.files?.resume?.[0]) {
            const oldResume = student.resume;
            const cloudinaryResponse = await uploadOnCloudinary(
                req.files.resume[0].path
            );
            if (!cloudinaryResponse) {
                return res.status(500).json({
                    message: "Error uploading resume to Cloudinary."
                });
            }
            updateData.resume = cloudinaryResponse.url;
            if (oldResume) {
                await deleteFromCloudinary(oldResume);
            }
        }

        if (req.files?.profilePicture?.[0]) {
            const oldProfilePicture = student.profilePicture;
            const cloudinaryResponse = await uploadOnCloudinary(
                req.files.profilePicture[0].path
            );
            if (!cloudinaryResponse) {
                return res.status(500).json({
                    message: "Error uploading profile picture to Cloudinary."
                });
            }
            updateData.profilePicture = cloudinaryResponse.url;
            if (oldProfilePicture) {
                await deleteFromCloudinary(oldProfilePicture);
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: 'Profile updated successfully.',
            student: updatedStudent
        });

    } catch (err) {
        console.error('updateProfile Error:', err);
        return res.status(500).json({ message: 'could not update the profile, try again later.' });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const { userId: studentId } = req.user;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: 'Student not found.'
            });
        }

        const query = {
            $and: []
        };

        // branch filters
        const branchFilters = [/^all$/i];

        if (student.department) {
            branchFilters.push(
                new RegExp(`^${student.department}$`, "i")
            );
        }

        query.$and.push({
            $or: [
                { targetBranches: { $size: 0 } },
                { targetBranches: { $in: branchFilters } }
            ]
        });

        // program filters
        query.$and.push(
            student.program
                ? {
                    $or: [
                        { targetPrograms: { $size: 0 } },
                        { targetPrograms: { $in: [student.program] } }
                    ]
                }
                : {
                    targetPrograms: { $size: 0 }
                }
        );

        // year filters
        query.$and.push(
            student.currentYearOfStudy
                ? {
                    $or: [
                        { targetYears: { $size: 0 } },
                        { targetYears: { $in: [student.currentYearOfStudy] } }
                    ]
                }
                : {
                    targetYears: { $size: 0 }
                }
        );

        const rawAnnouncements = await Announcement.find(query)
            .populate("createdBy", "fullName email");

        const announcements = rawAnnouncements
            .sort((a, b) => {
                const aDate = Math.max(
                    a.editedAt?.getTime() ?? 0,
                    a.createdAt?.getTime() ?? 0
                );

                const bDate = Math.max(
                    b.editedAt?.getTime() ?? 0,
                    b.createdAt?.getTime() ?? 0
                );

                return bDate - aDate;
            })
            .slice(0, 50);

        return res.status(200).json({ announcements });
    } catch (err) {
        console.error('getAnnouncements Error:', err);
        res.status(500).json({ message: 'could not fetch the announcements' });
    }
};

const getEvents = async (req, res) => {
    try {
        const { userId: studentId } = req.user;
        const student = await Student.findById(studentId);
        const { type, targetBranch } = req.query;

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const query = {
            $and: [
                {
                    $or: [{ status: 'published' },
                    { status: { $exists: false } }]
                }
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

        const events = await Event.find(query).sort({ startDate: 1 });
        res.status(200).json({ events });
    } catch (err) {
        console.error('getEvents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const studentController = {
    getEvents,
    getAnnouncements,
    submitVerification,
    updateProfile,
}
export default studentController
