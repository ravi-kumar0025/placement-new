import bcrypt from "bcryptjs";

const getOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    return { otp, hashedOtp };   // return both so callers can email the plain OTP
};

export default getOtp;