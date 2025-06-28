const forgotOtpMail = (otp) => {
    return {
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forgot Password OTP</title><style>body{font-family:Arial,sans-serif;background-color:#f4f6f8;margin:0;padding:0;-webkit-text-size-adjust:100%}.email-container{max-width:600px;margin:40px auto;background-color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);padding:30px;color:#333}.header{text-align:center;margin-bottom:30px}.header img{max-width:250px;margin-bottom:20px}h1{font-size:24px;margin-bottom:24px;color:#222}p{font-size:16px;line-height:1.5;margin-bottom:24px}.otp-code{font-size:28px;font-weight:700;letter-spacing:6px;color:#2a9d8f;background-color:#e0f2f1;padding:12px 0;text-align:center;border-radius:6px;margin-bottom:32px;user-select:all}.footer{font-size:14px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px}</style></head><body><div class="email-container" role="main"><div class="header"><img src="https://res.cloudinary.com/doojdskc0/image/upload/v1750391008/mdwtqwkbtvje2lzzc5hq.png" alt="Your Company Logo"></div><h1>Hello user,</h1><p>You requested a reset password for your account. Please use the following OTP to reset your password:</p><div class="otp-code" aria-label="One Time Password">${otp}</div><p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p><div class="footer">&copy; 2024 Your Company. All rights reserved.</div></div></body></html>`,
    };
};


export default forgotOtpMail;
