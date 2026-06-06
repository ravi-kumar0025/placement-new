import nodemailer from "nodemailer"

const sendOTP = async (to, otp) => {
    const maskedTo = to.replace(/^(.{2}).*(@.*)$/, '$1***$2');
    console.log('[auth][email] Preparing OTP email', { to: maskedTo });

    // make the transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // check the transporter
    try {
        console.log('[auth][email] Verifying SMTP transporter', { to: maskedTo });
        await transporter.verify();
        console.log('[auth][email] SMTP transporter ready', { to: maskedTo });
    } catch (err) {
        console.error('[auth][email] SMTP verification failed', {
            to: maskedTo,
            code: err.code,
            message: err.message,
        });
        throw err;
    }
    
    // ye hi to h message
    const message = {
        from: `"TPC" <${process.env.EMAIL_USER}>`,
        to,
        subject: "TPC - Login OTP",
        html: ` <div style="background-color:#f4f7fb;padding:40px 20px;font-family:Arial,sans-serif;"> <div style=" max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08); "> <!-- Header --> <div style=" background:linear-gradient(135deg,#2563eb,#1e40af); padding:30px 20px; text-align:center; "> <h1 style=" color:#ffffff; margin:0; font-size:28px; "> Training & Placement Cell </h1> <p style=" color:#dbeafe; margin-top:10px; font-size:14px; "> Secure Login Verification </p> </div> <!-- Body --> <div style="padding:40px 30px;"> <h2 style=" margin-top:0; color:#1f2937; font-size:24px; "> Your OTP Code </h2> <p style=" font-size:16px; color:#4b5563; line-height:1.7; "> Dear User, </p> <p style=" font-size:16px; color:#4b5563; line-height:1.7; "> Use the following One-Time Password (OTP) to securely access your TPC portal account. </p> <!-- OTP Box --> <div style=" margin:35px 0; text-align:center; "> <div style=" display:inline-block; background:#eff6ff; border:2px dashed #2563eb; border-radius:10px; padding:18px 40px; font-size:36px; font-weight:bold; letter-spacing:10px; color:#1d4ed8; "> ${otp} </div> </div> <!-- Warning --> <div style=" background:#fef3c7; border-left:5px solid #f59e0b; padding:14px 18px; border-radius:8px; margin-bottom:25px; "> <p style=" margin:0; color:#92400e; font-size:15px; font-weight:600; "> This OTP is valid for 10 minutes. </p> </div> <p style=" font-size:15px; color:#6b7280; line-height:1.7; "> If you did not request this OTP, you can safely ignore this email. No further action is required. </p> </div> <!-- Footer --> <div style=" background:#f9fafb; padding:20px; text-align:center; border-top:1px solid #e5e7eb; "> <p style=" margin:0; font-size:13px; color:#9ca3af; "> This is an automated email from TPC Portal. </p> <p style=" margin-top:8px; font-size:12px; color:#9ca3af; "> Please do not reply to this message. </p> </div> </div> </div> `,
    };

    // chalo try karte h send karne ka
    try {
        console.log('[auth][email] Sending OTP email', { to: maskedTo });
        const info = await transporter.sendMail(message);
        console.log('[auth][email] OTP email sent', { to: maskedTo, messageId: info.messageId });

        if (info.rejected.length > 0) {
            console.warn('[auth][email] Some recipients were rejected', { to: maskedTo, rejected: info.rejected });
        }
    } catch (err) {
        switch (err.code) {
            case "ECONNECTION":
            case "ETIMEDOUT":
                console.error("Network error - retry later:", err.message);
                break;
            case "EAUTH":
                console.error("Authentication failed:", err.message);
                break;
            case "EENVELOPE":
                console.error("Invalid recipients:", err.rejected);
                break;
            default:
                console.error("Send failed:", err.message);
        }
        console.error('[auth][email] OTP email send failed', {
            to: maskedTo,
            code: err.code,
            message: err.message,
        });
        throw err;
    }
};

export default sendOTP;
