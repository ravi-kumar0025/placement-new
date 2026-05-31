import mongoose from "mongoose";

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    roll: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        required: true,
    },

    githubUrl: {
        type: String,
        default: ''
    },

    linkedinUrl: {
        type: String,
        default: ''
    },

    isPublic: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const Developer = mongoose.model('Developer', developerSchema);

export default Developer;