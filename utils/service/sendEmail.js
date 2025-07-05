import nodemailer from "nodemailer";

export const sendEmail = async (html, email, subject) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_AUTH_CREDENTIAL_USER,
                pass: process.env.MAIL_AUTH_CREDENTIAL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false, // Bypass self-signed certificate validation
            },
        });

        // send mail with defined transport object
        const mailOptions = {
            from: `Chatllat <${process.env.MAIL_AUTH_CREDENTIAL_USER}>`,
            to: email,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("mail send successfully!");
    } catch (error) {
        console.log(error, "error");
    }
};
