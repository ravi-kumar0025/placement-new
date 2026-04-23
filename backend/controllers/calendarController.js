const Event = require('../models/Event');
const Announcement = require('../models/Announcement');

exports.getUnifiedCalendar = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const Student = require('../models/Student');
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const eventQuery = { 
            $and: [
                { $or: [{ status: 'published' }, { status: { $exists: false } }] }
            ] 
        };
        const announcementQuery = { $and: [] };

        const targetBranchesRegex = [/^all$/i];
        if (student.department) {
            targetBranchesRegex.push(new RegExp(`^${student.department}$`, 'i'));
        }

        const branchCondition = {
            $or: [
                { targetBranches: { $size: 0 } },
                { targetBranches: { $in: targetBranchesRegex } }
            ]
        };
        eventQuery.$and.push(branchCondition);
        announcementQuery.$and.push(branchCondition);

        const programCondition = student.program ? {
            $or: [
                { targetPrograms: { $size: 0 } },
                { targetPrograms: { $in: [student.program] } }
            ]
        } : { targetPrograms: { $size: 0 } };
        eventQuery.$and.push(programCondition);
        announcementQuery.$and.push(programCondition);

        const yearCondition = student.currentYearOfStudy ? {
            $or: [
                { targetYears: { $size: 0 } },
                { targetYears: { $in: [student.currentYearOfStudy] } }
            ]
        } : { targetYears: { $size: 0 } };
        eventQuery.$and.push(yearCondition);
        announcementQuery.$and.push(yearCondition);

        const [events, rawAnnouncements] = await Promise.all([
            Event.find(eventQuery).populate('createdBy', 'fullName email'),
            Announcement.find(announcementQuery).populate('createdBy', 'fullName email')
        ]);

        // Sort announcements by effective date = max(editedAt, createdAt)
        const announcements = rawAnnouncements.sort((a, b) => {
            const aDate = Math.max(a.editedAt?.getTime() ?? 0, a.createdAt?.getTime() ?? 0);
            const bDate = Math.max(b.editedAt?.getTime() ?? 0, b.createdAt?.getTime() ?? 0);
            return bDate - aDate;
        });

        const calendarItems = [];

        events.forEach(event => {
            const eventObj = event.toObject();
            calendarItems.push({
                id: eventObj._id,
                title: event.title,
                start: event.startDate ? new Date(event.startDate).toISOString() : (event.date ? new Date(event.date).toISOString() : null),
                end: event.endDate ? new Date(event.endDate).toISOString() : (event.startDate ? new Date(event.startDate).toISOString() : null),
                type: event.type,
                appliedStudents: event.appliedStudents || [],
                extendedProps: {
                    ...eventObj,
                    links: event.links || [],
                }
            });
        });

        announcements.forEach(ann => {
            // Use editedAt as the calendar date if the announcement was edited
            // so it floats up to the edit date on the student calendar
            const displayDate = ann.isEdited && ann.editedAt
                ? new Date(ann.editedAt).toISOString()
                : (ann.createdAt ? new Date(ann.createdAt).toISOString() : null);

            calendarItems.push({
                id: ann._id,
                title: ann.isEdited ? `✎ ${ann.title}` : ann.title,
                start: displayDate,
                end: displayDate,
                type: 'announcement',
                appliedStudents: [],
                extendedProps: {
                    ...ann.toObject(),
                    // Expose edit metadata explicitly so the detail pane can read them
                    isEdited: ann.isEdited,
                    editedAt: ann.editedAt,
                }
            });
        });

        res.status(200).json({ calendar: calendarItems });
    } catch (err) {
        console.error('getUnifiedCalendar Error:', err);
        res.status(500).json({ message: 'Internal server error while fetching unified calendar' });
    }
};

