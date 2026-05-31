import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
    },

    duration: {
        type: Number, // stored in days
    },

    type: {
        type: String,
        enum: ['internship', 'placement', 'workshop'],
        required: true,
    },

    targetPrograms: {
        type: [String],
        enum: ["ALL", "BTech", "MTech", "MBA"],
        default: ["ALL"]
    },

    targetBranches: {
        type: [String],
        enum: ["ALL", "CSE", "IT", "ECE", "ME", "EE"],
        default: ["ALL"]
    },

    targetYears: {
        type: [String],
        enum: ["ALL", "1st", "2nd", "3rd", "4th"],
        default: ["ALL"]
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

    deadline: {
        type: Date,
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


//  prefer to use "function" because "this" ka use iske bina nhi hoga not to use arrow function
eventSchema.pre('save', function (next) {

    if (!this.startDate) {
        return next(new Error("startDate is required"));
    }

    if (!this.endDate) {
        this.endDate = this.startDate;
    }

    if (this.endDate < this.startDate) {
        return next(new Error("endDate cannot be earlier than startDate"));
    }

    this.duration = Math.ceil(
        (this.endDate - this.startDate) / (1000 * 60 * 60 * 24)
    );

    next();
});

eventSchema.index({ type: 1, startDate: -1 });
eventSchema.index({ targetPrograms: 1 });
eventSchema.index({ targetBranches: 1 });
eventSchema.index({ targetYears: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event