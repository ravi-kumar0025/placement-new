import mongoose from "mongoose";
import User from "./User.js";

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    rollNumber: {
        type: String,
        required: true,
        unique: true,
    },

    department: {
        type: String,
        required: true,
    },

    program: {
        type: String,
        enum: ['B.Tech', 'M.Tech', 'M.Sc'],
        required: true,
    },

    graduationYear: {
        type: Number,
        required: true,
    },

    currentYearOfStudy: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
    },

    phoneNumber: {
        type: String,
        default:""
    },

    cgpa: {
        type: Number,
        default:0.0
    },

    idCard: {
        type: String,
        default:""
    },

    resume: {
        type: String,
        default: ""
    },

    verificationStatus: {
        type: String,
        enum: ['unsubmitted', 'pending', 'verified', 'rejected'],
        default: 'unsubmitted'
    }
});

studentSchema.index({
    program: 1,
    department: 1,
    currentYearOfStudy: 1
});

const Student = User.discriminator("student", studentSchema);

export default Student;