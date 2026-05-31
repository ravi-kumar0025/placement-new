import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    content: {
        type: String,
        required: true
    },

    targetPrograms: [{
        type: String,
        default: []
    }],

    targetBranches: [{
        type: String,
        default: []
    }],

    targetYears: [{
        type: String,
        default: []
    }],

    isEdited: {
        type: Boolean,
        default: false
    },

    editedAt: {
        type: Date
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetPrograms: 1 });
announcementSchema.index({ targetBranches: 1 });
announcementSchema.index({ targetYears: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;