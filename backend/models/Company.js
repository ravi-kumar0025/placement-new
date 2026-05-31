import mongoose from "mongoose";
import User from "./User.js";

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },

    companyEmail: {
        type: String,
        required: true,
        unique: true,
    },

    companyWebsite: {
        type: String,
        required: true,
    },

    HRContactName: {
        type: String,
        required: true,
    },

    HRContactEmail: {
        type: String,
        required: true,
    },

    contactNumber: {
        type: String,
    },
    
    verificationStatus: {
        type: String,
        enum: ['unsubmitted', 'pending', 'verified', 'rejected'],
        default: 'unsubmitted'
    },

    verificationDeadline: {
        type: Date,
        default: () => Date.now() + 48 * 60 * 60 * 1000,
    },
    
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

// TTL + conditional index
companySchema.index(
    { verificationDeadline: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            verificationStatus: { $in: ['unsubmitted', 'pending'] }
        }
    }
);

// discriminator model
const Company = User.discriminator('company', companySchema);

export default Company;