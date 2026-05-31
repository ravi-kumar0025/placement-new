import mongoose from 'mongoose';
import User from './User.js';

const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    adminType: {
        type: String,
        enum: ['super_admin', 'announcement_admin', 'student_admin'],
        required: true,
    },

    status: {
        type: String,
        default: 'active',
    }
});

adminSchema.index({ adminType: 1 });        //ye indexing ke liye h 

// inherit User schema using discriminator
const Admin = User.discriminator('admin', adminSchema);

export default Admin;