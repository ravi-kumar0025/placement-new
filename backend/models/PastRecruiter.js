import mongoose from "mongoose"

const pastRecruiterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the company name'],
        trim: true,
        maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    industry: {
        type: String,
        required: [true, 'Please provide the industry'],
        trim: true
    },
    logoUrl: {
        type: String,
        trim: true,
        default: ''
    },
}, {
    timestamps: true
});

const PastRecruiter = mongoose.model('PastRecruiter', pastRecruiterSchema);

export default PastRecruiter