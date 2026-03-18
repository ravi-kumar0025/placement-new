const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const { sendOTPEmail } = require('../utils/sendEmail');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
    try {
        const { email, role, ...rest } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified' });
            } else {
                // Delete existing unverified record to allow fresh signup attempts
                await User.deleteOne({ email });
            }
        }

        // --- Role Specific Validation ---
        if (role === 'student') {
            const { fullName, rollNumber, department, program, graduationYear, currentYearOfStudy } = rest;
            if (!fullName || !rollNumber || !department || !program || !graduationYear || !currentYearOfStudy) {
                return res.status(400).json({ message: 'Missing required student fields' });
            }
            const existingStudent = await Student.findOne({ rollNumber });
            if (existingStudent && existingStudent.isVerified) {
                return res.status(400).json({ message: 'Roll number already registered and verified' });
            }
        } else if (role === 'company') {
            const { companyName, companyEmail, companyWebsite, HRContactName, HRContactEmail } = rest;
            if (!companyName || !companyEmail || !companyWebsite || !HRContactName || !HRContactEmail) {
                return res.status(400).json({ message: 'Missing required company fields' });
            }
            const existingCompany = await Company.findOne({ companyEmail });
            if (existingCompany && existingCompany.verificationStatus === 'verified') {
                return res.status(400).json({ message: 'Company email already registered and verified' });
            }
        } else if (role === 'admin') {
            const { fullName, adminType } = rest;
            if (!fullName || !adminType) {
                return res.status(400).json({ message: 'Missing required admin fields' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const testEmails = ['superadmin@gmail.com', 'annadmin@gmail.com', 'studadmin@gmail.com', 'comp@gmail.com', 'stud@gmail.com'];
        const isTestEmail = testEmails.includes(email);

        const otp = isTestEmail ? '123' : generateOtp();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

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
                institute: rest.institute || 'IIT Patna',
                phoneNumber: rest.phoneNumber,
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

        // Send OTP email
        if (!isTestEmail) {
            await sendOTPEmail(email, otp);
        }

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Account not found. Please sign up.' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: `Account registered as ${user.role}, not ${role}.` });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Account not verified. Please complete signup.' });
        }

        const testEmails = ['superadmin@gmail.com', 'annadmin@gmail.com', 'studadmin@gmail.com', 'comp@gmail.com', 'stud@gmail.com'];
        const isTestEmail = testEmails.includes(email);

        // Generate dynamic OTP for returning user
        const otp = isTestEmail ? '123' : generateOtp();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        user.otp = hashedOtp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP email
        if (!isTestEmail) {
            await sendOTPEmail(email, otp);
        }

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Set verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Issue JWT
        const payload = {
            userId: user._id,
            role: user.role,
        };
        if (user.role === 'admin') payload.adminType = user.adminType;
        if (user.role === 'company') payload.verificationStatus = user.verificationStatus;
        if (user.role === 'student') payload.verificationStatus = user.verificationStatus;

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_super_secret_jwt_key', {
            expiresIn: '7d',
        });

        // Strip out sensible fields before sending
        const userObj = user.toObject();
        delete userObj.otp;
        delete userObj.otpExpiry;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userObj,
        });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-otp -otpExpiry');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error('Get Current User Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
