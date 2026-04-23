const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // Legacy field kept for backward compatibility
    date: {
        type: Date,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    type: {
        type: String,
        enum: ['internship', 'placement_drive', 'workshop'],
        required: true,
    },
    targetPrograms: [{
        type: String,
    }],
    targetBranches: [{
        type: String,
        required: true,
    }],
    targetYears: [{
        type: String,
    }],
    deadline: {
        type: Date,
    },
    appliedStudents: [{
        type: String,
    }],
    links: [{
        label: { type: String },
        url: { type: String },
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    companyRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending_announcement_admin', 'pending_admin', 'pending_company_approval', 'published', 'cancelled'],
        default: 'published'
    },
    companyFeedback: {
        type: String,
    },
    adminNotes: {
        type: String,
    }
}, { timestamps: true });

// If endDate is not set, default to startDate
eventSchema.pre('save', function (next) {
    if (!this.endDate && this.startDate) {
        this.endDate = this.startDate;
    }
    // Keep legacy date field in sync
    if (!this.date && this.startDate) {
        this.date = this.startDate;
    }
    if (typeof next === 'function') {
        next();
    }
});

// Compound index for segmenting events and filtering by date/type
eventSchema.index({ type: 1, startDate: -1 });
eventSchema.index({ targetPrograms: 1 });
eventSchema.index({ targetBranches: 1 });
eventSchema.index({ targetYears: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
