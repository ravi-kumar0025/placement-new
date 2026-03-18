const nodemailer = require('nodemailer');

const sendOTPEmail = async (to, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS environment variables are not set. Please configure them in your Render dashboard.');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"TPC IIT Patna" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'TPC IIT Patna - Login OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Training and Placement Cell, IIT Patna</h2>
                    <p style="font-size: 16px; color: #555;">Dear User,</p>
                    <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) for accessing the TPC portal is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px; padding: 10px 20px; border: 1px dashed #e74c3c; border-radius: 4px; background-color: #fceceb;">${otp}</span>
                    </div>
                    <p style="font-size: 16px; color: #555; font-weight: bold;">This OTP is valid for 10 minutes.</p>
                    <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">If you did not request this OTP, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #95a5a6; text-align: center;">This is an automated message, please do not reply.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL STUB] Sent OTP ${otp} to ${to}`);
        return info;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = { sendOTPEmail };
