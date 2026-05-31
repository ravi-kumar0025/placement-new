
import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt : {
        type: Date,
        default: () => Date.now() + 10 * 60 * 1000,
        index: { expires: 0 }   //  this  will automatically expire the otp after time limit
    }
});

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
