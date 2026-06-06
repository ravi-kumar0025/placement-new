import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

import { User, Company, Admin, Student } from "../models/index.model.js"
import sendOTP from '../utils/sendEmail.js';
import getOtp from "../utils/getOtp.js";

const maskEmail = (email = '') => email.replace(/^(.{2}).*(@.*)$/, '$1***$2');

const signup = async (req, res) => {
    try {
        const { email, role, ...rest } = req.body;
        console.log('[auth][signup] Request received', { email: maskEmail(email), role });
        if (!email || !role) {
            console.warn('[auth][signup] Missing email or role');
            return res.status(400).json({ message: 'Email and role are required' });
        }

        let user = await User.findOne({ email });                   // Check if user exists

        if (user) {
            console.log('[auth][signup] Existing user found', {
                email: maskEmail(email),
                role: user.role,
                isVerified: user.isVerified,
            });
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified' });
            }
            await User.deleteOne({ email });
            console.log('[auth][signup] Removed unverified existing user', { email: maskEmail(email) });
        }

        if (role === 'student') {
            const { fullName,
                rollNumber,
                department,
                program,
                graduationYear,
                currentYearOfStudy } = rest;
            if (!fullName || !rollNumber || !department || !program || !graduationYear || !currentYearOfStudy) {
                console.warn('[auth][signup] Missing student fields', { email: maskEmail(email) });
                return res.status(400).json({ message: 'Please provide all the required fields' });
            }
            const existingStudent = await Student.findOne({ rollNumber });

            if (existingStudent && existingStudent.isVerified) {
                console.warn('[auth][signup] Verified roll number already exists', { email: maskEmail(email), rollNumber });
                return res.status(400).json({ message: 'Roll number already registered and verified' });
            }
        }
        else if (role === 'company') {
            const { companyName, companyEmail, companyWebsite, HRContactName, HRContactEmail } = rest;
            if (!companyName || !companyEmail || !companyWebsite || !HRContactName || !HRContactEmail) {
                console.warn('[auth][signup] Missing company fields', { email: maskEmail(email) });
                return res.status(400).json({ message: 'Missing required company fields' });
            }
            const existingCompany = await Company.findOne({ companyEmail });
            if (existingCompany && existingCompany.verificationStatus === 'verified') {
                console.warn('[auth][signup] Verified company email already exists', { email: maskEmail(email), companyEmail: maskEmail(companyEmail) });
                return res.status(400).json({ message: 'Company email already registered and verified' });
            }
        }
        else if (role === 'admin') {
            const { fullName, adminType } = rest;
            if (!fullName || !adminType) {
                console.warn('[auth][signup] Missing admin fields', { email: maskEmail(email) });
                return res.status(400).json({ message: 'Missing required admin fields' });
            }
        }
        else {
            console.warn('[auth][signup] Invalid role', { email: maskEmail(email), role });
            return res.status(400).json({ message: 'Invalid role' });
        }

        const { otp, hashedOtp } = await getOtp();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        console.log('[auth][signup] OTP generated', { email: maskEmail(email), role });

        // Create new user cleanly
        if (role === 'student') {
            user = await Student.create({
                email,
                role,
                otp: hashedOtp,
                otpExpiry,
                isVerified: false,
                fullName: rest.fullName,
                rollNumber: rest.rollNumber,
                department: rest.department,
                program: rest.program,
                graduationYear: rest.graduationYear,
                currentYearOfStudy: rest.currentYearOfStudy,
                verificationStatus: 'unsubmitted',
            });
        } else if (role === 'company') {
            user = await Company.create({
                email,
                role,
                otp: hashedOtp,
                otpExpiry,
                isVerified: false,
                companyName: rest.companyName,
                companyEmail: rest.companyEmail,
                companyWebsite: rest.companyWebsite,
                HRContactName: rest.HRContactName,
                HRContactEmail: rest.HRContactEmail,
                verificationStatus: 'unsubmitted',
            });
        } else if (role === 'admin') {
            user = await Admin.create({
                email,
                role,
                otp: hashedOtp,
                otpExpiry,
                isVerified: false,
                fullName: rest.fullName,
                adminType: rest.adminType,
                status: 'active',
            });
        }
        console.log('[auth][signup] User created, sending OTP email', {
            email: maskEmail(email),
            role,
            userId: user?._id,
        });

        await sendOTP(email, otp);

        console.log('[auth][signup] OTP email sent, responding success', { email: maskEmail(email), role });
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'can not signup, try again later' });
    }
};

const login = async (req, res) => {
    try {
        const { role, email } = req.body;
        console.log('[auth][login] Request received', { email: maskEmail(email), role });
        if (!email || !role) {
            console.warn('[auth][login] Missing email or role');
            return res.status(400).json({ message: 'Email and role are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.warn('[auth][login] Account not found', { email: maskEmail(email), role });
            return res.status(404).json({ message: 'Account not found. Please sign up.' });
        }

        if (user.role !== role) {
            console.warn('[auth][login] Role mismatch', { email: maskEmail(email), requestedRole: role, actualRole: user.role });
            return res.status(400).json({ message: `Account registered as ${user.role}, not ${role}.` });
        }

        if (!user.isVerified) {
            console.warn('[auth][login] Account not verified', { email: maskEmail(email), role });
            return res.status(403).json({ message: 'Account not verified. Please complete signup.' });
        }

        let { otp, hashedOtp } = await getOtp();
        if (["superadmin@gmail.com", "annadmin@gmail.com", "studadmin@gmail.com", "comp@gmail.com", "stud@gmail.com"].includes(email)) {
            otp = "123";
            hashedOtp = await bcrypt.hash(otp, 10);
            console.log('[auth][login] Demo OTP enabled for seeded account', { email: maskEmail(email), role });
        }
        user.otp = hashedOtp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();
        console.log('[auth][login] OTP saved, sending email', { email: maskEmail(email), role, userId: user._id });

        await sendOTP(email, otp);

        console.log('[auth][login] OTP email sent, responding success', { email: maskEmail(email), role });
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'could not login, try again later' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log('[auth][verify-otp] Request received', { email: maskEmail(email), hasOtp: Boolean(otp) });

        if (!email || !otp) {
            console.warn('[auth][verify-otp] Missing email or OTP', { email: maskEmail(email), hasOtp: Boolean(otp) });
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.warn('[auth][verify-otp] User not found', { email: maskEmail(email) });
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            console.warn('[auth][verify-otp] OTP expired', { email: maskEmail(email), userId: user._id });
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);

        if (!isMatch) {
            console.warn('[auth][verify-otp] OTP mismatch', { email: maskEmail(email), userId: user._id });
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Set verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        console.log('[auth][verify-otp] OTP verified and user saved', {
            email: maskEmail(email),
            role: user.role,
            userId: user._id,
        });

        // Issue JWT
        const payload = {
            userId: user._id,
            role: user.role,
        };

        if (user.role === 'admin') payload.adminType = user.adminType;
        if (user.role === 'company') payload.verificationStatus = user.verificationStatus;
        if (user.role === 'student') payload.verificationStatus = user.verificationStatus;

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // TO DO LEFT

        const userToReturn = await User.findById(user._id).select('-otp -otpExpiry');

        console.log('[auth][verify-otp] Responding with token', {
            email: maskEmail(email),
            role: user.role,
            userId: user._id,
        });
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: userToReturn
        });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        res.status(500).json({ message: 'can not verify otp at this time, try again later', error: err.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-otp -otpExpiry');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.error('Get Current User Error:', err);
        res.status(500).json({ message: 'can not fetch the details of the user' });
    }
};

const authController = {
    signup,
    login,
    verifyOtp,
    getCurrentUser
}

export default authController
