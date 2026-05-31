import mongoose  from "mongoose";

const baseOptions = {
    discriminatorKey: 'role',
    collection: 'users',
    timestamps: true,
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'company', 'student'],
        required: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, baseOptions);

userSchema.index({ role: 1, email: 1 });

const User = mongoose.model('User', userSchema);

export default User;
