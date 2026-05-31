
import {Event, User} from "../models/index.model.js"

// ye student karega
const applyToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId).select('email');
        if (!user) {
            return res.status(404).json({ message: 'no such student found' });
        }

        const studentEmail = user.email;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'such event does not exists' });
        }

        const now = new Date();
        if ((event.endDate && event.endDate < now) || event.deadline<now) {
            return res.status(400).json({ message: 'Cannot apply to a past event or deadline is passed' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $addToSet: { appliedStudents: studentEmail } },
            { new: true }
        );

        return res.status(200).json({
            message: 'Application recorded successfully',
            event: updatedEvent,
        });
    } catch (err) {
        console.error('applyToEvent Error:', err);
        return res.status(500).json({ message: 'can not apply to event contact to admin if urgent' });
    }
};

const eventController={
    applyToEvent
}
export default eventController
