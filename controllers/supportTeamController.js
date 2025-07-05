import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import SupportTeam from "../models/SupportTeam.js";
import Dispute from "../models/Dispute.js";
import bcryptjs from "bcryptjs";
import {
    allTicketSchema,
    changePasswordSchema,
    loginSchema,
    myAllTicketSchema,
    resetPasswordSchema,
    sendForgotOtpSchema,
    signupOtpVerifySchema,
    signupSchema,
    splitDisputeAmountSchema,
    verifyForgotOtpSchema,
} from "../utils/validation/supportTeam_validation.js";
import { generateToken } from "../lib/utils.js";
import { otp_genrator } from "../utils/service/agreement.js";
import signupOtpMail from "../utils/email_template/signup_otp.js";
import { sendEmail } from "../utils/service/sendEmail.js";
import forgotOtpMail from "../utils/email_template/forgot_otp.js";
import Agreement from "../models/Agreement.js";
import {
    allTickets,
    getMyTicketDetails,
    getMyTickets,
    getTicketDetails,
    splitAmount,
} from "../utils/service/support.js";

// export const createSupportTeam = asyncHandler(async (req, res, next) => {
//     try {
//         const { name, email, contact, profileImage } = req.body;
//         const support = await SupportTeam.create({
//             name,
//             email,
//             contact,
//             profileImage,
//         });

//         return give_response(res, 200, true, "Profile created successfully", {
//             support,
//         });
//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// });

export const signup = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await signupSchema.validateAsync(reqData);
        const { email, password, fname, lname, contact } = validatedData;

        const isExist = await SupportTeam.findOne({ email });
        if (isExist)
            return give_response(res, 400, false, "User already exist");

        const hashPass = await bcryptjs.hash(password, 8);
        const signupOtp = otp_genrator(1000, 9999);

        const user = await SupportTeam.create({
            email,
            password: hashPass,
            signupOtp,
            signupOtp_timestamp: new Date(),
            fname,
            lname,
            contact,
        });

        const { html } = signupOtpMail(email, signupOtp);
        await sendEmail(html, "Signup Otp");

        delete user._doc.password;
        delete user._doc.signupOtp;
        give_response(res, 200, true, "Signup successfully", user);
    } catch (error) {
        next(error);
    }
});

export const signupOtpVerify = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await signupOtpVerifySchema.validateAsync(
            reqData
        );
        const { supportUserId, signupOtp } = validatedData;

        const user = await SupportTeam.findById(supportUserId).select(
            "+signupOtp"
        );
        if (!user) return give_response(res, 404, false, "User not found");

        if (user.signupOtp !== signupOtp)
            return give_response(res, 400, false, "Wrong Otp!");

        if (new Date() - new Date(user.signupOtp_timestamp) >= 1800000)
            // otp expired after 30 minutes
            return give_response(
                res,
                400,
                false,
                "Otp expired!, please resend again."
            );

        user.signupOtp = null;
        user.signupOtp_timestamp = null;
        user.isVerify = true;
        user.save();

        give_response(res, 200, true, "Otp verified!");
    } catch (error) {
        next(error);
    }
});

export const login = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await loginSchema.validateAsync(reqData);
        const { email, password } = validatedData;

        const user = await SupportTeam.findOne({ email }).select("+password");
        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not exist with this email"
            );

        // if (user.isVerify === false)
        //     return give_response(
        //         res,
        //         400,
        //         false,
        //         "Please verify your account via OTP before logging in."
        //     );

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) return give_response(res, 400, false, "Wrong password");

        const token = generateToken({ userId: user._id, email: user.email });

        delete user._doc.password;
        give_response(res, 200, true, "Login successfully", {
            user,
            token,
        });
    } catch (error) {
        next(error);
    }
});

export const sendForgotOtp = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await sendForgotOtpSchema.validateAsync(reqData);
        const { email } = validatedData;

        const user = await SupportTeam.findOne({ email });
        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not found with this email"
            );

        const forgotOtp = otp_genrator(1000, 9999);
        user.forgotOtp = forgotOtp;
        user.forgotOtp_timestamp = new Date();
        user.save();

        const { html } = forgotOtpMail(forgotOtp);
        await sendEmail(html, "Forgot Otp");

        give_response(res, 200, true, "OTP has been sent");
    } catch (error) {
        next(error);
    }
});

export const verifyForgotOtp = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await verifyForgotOtpSchema.validateAsync(
            reqData
        );
        const { email, otp } = validatedData;

        const user = await SupportTeam.findOne({ email }).select("+forgotOtp");
        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not found with this email"
            );

        if (user.forgotOtp !== otp)
            return give_response(res, 400, false, "Wrong Otp!");

        if (new Date() - new Date(user.forgotOtp_timestamp) >= 1800000)
            // otp expired after 30 minutes
            return give_response(
                res,
                400,
                false,
                "Otp expired!, please resend again."
            );

        user.forgotOtp = null;
        user.forgotOtp_timestamp = null;
        user.isVerifyForgotOtp = true;
        user.save();

        give_response(res, 200, true, "Otp verified!");
    } catch (error) {
        next(error);
    }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await resetPasswordSchema.validateAsync(reqData);
        const { email, password } = validatedData;

        const user = await SupportTeam.findOne({ email });
        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not found with this email"
            );

        if (user.isVerifyForgotOtp === false)
            return give_response(
                res,
                400,
                false,
                "You are not able to reset password"
            );

        const hashPass = await bcryptjs.hash(password, 8);
        user.password = hashPass;
        user.isVerifyForgotOtp = false;
        user.save();

        give_response(res, 200, true, "Password reset successfully!");
    } catch (error) {
        next(error);
    }
});

export const changePassword = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await changePasswordSchema.validateAsync(reqData);
        const { email, oldPassword, newPassword } = validatedData;

        const user = await SupportTeam.findOne({ email }).select("+password");
        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not found with this email"
            );

        if (oldPassword == req.body.newPassword)
            return give_response(
                res,
                201,
                false,
                "old password and new password must be different"
            );

        const isMatch = await bcryptjs.compare(oldPassword, user.password);
        if (!isMatch)
            return give_response(res, 400, false, "Wrong old password");

        const hashPass = await bcryptjs.hash(newPassword, 8);
        user.password = hashPass;
        user.save();

        give_response(res, 200, true, "Password changed successfully!");
    } catch (error) {
        next(error);
    }
});

export const resendOtp = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const { email, type } = reqData;

        const user = await SupportTeam.findOne({ email });
        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not found with this email"
            );

        const otp = otp_genrator(1000, 9999);

        if (type == "signup") {
            if (user.isVerify === true)
                return give_response(
                    res,
                    400,
                    false,
                    "You are already verified!"
                );

            user.signupOtp = otp;
            user.signupOtp_timestamp = new Date();
            user.save();

            const { html } = signupOtpMail(email, otp);
            await sendEmail(html, "Signup Otp");
        } else {
            user.forgotOtp = otp;
            user.forgotOtp_timestamp = new Date();
            user.save();

            const { html } = forgotOtpMail(otp);
            await sendEmail(html, "Forgot Otp");
        }

        give_response(res, 200, true, "Otp resend successfully!");
    } catch (error) {
        next(error);
    }
});

export const getAllTickets = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.query;
        const validatedData = await allTicketSchema.validateAsync(reqData);

        const tickets = await allTickets(validatedData);

        give_response(res, 200, true, "Dispute get successfully", {
            tickets,
        });
    } catch (error) {
        next(error);
    }
});

export const ticketDetails = asyncHandler(async (req, res, next) => {
    try {
        const { disputeId } = req.query;
        const ticketDetails = await getTicketDetails(disputeId);

        give_response(res, 200, true, "Dispute get successfully", {
            ticketDetails,
        });
    } catch (error) {
        next(error);
    }
});

export const myTicketDetails = asyncHandler(async (req, res, next) => {
    try {
        const { ticketId } = req.query;
        const ticketDetail = await getMyTicketDetails(ticketId);

        give_response(res, 200, true, "Ticket get successfully", {
            ticketDetail,
        });
    } catch (error) {
        next(error);
    }
});

export const myAllTickets = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.query;
        const validatedData = await myAllTicketSchema.validateAsync(reqData);

        const tickets = await getMyTickets(validatedData);

        give_response(res, 200, true, "Tickets get successfully", { tickets });
    } catch (error) {
        next(error);
    }
});

export const splitDisputeAmount = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await splitDisputeAmountSchema.validateAsync(
            reqData
        );
        const { payerAmountPercent, receiverAmountPercent, agreementId } =
            validatedData;

        if (payerAmountPercent + receiverAmountPercent !== 100) {
            return give_response(
                res,
                400,
                false,
                "Percentages must add up to 100"
            );
        }

        const agreement = await Agreement.findOne({
            agreementId,
        });
        if (!agreement)
            return give_response(res, 404, false, "agreement not found");

        const updatedAgreement = await splitAmount(validatedData, agreement);

        return give_response(res, 200, true, "Amount split successfully", {
            updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

export const takeATicket = asyncHandler(async (req, res, next) => {
    try {
        const { disputeId } = req.body;
        const agentId = req.userId;
        const agent = await SupportTeam.findById(agentId);

        await SupportTeam.updateOne(
            { _id: agent._id },
            {
                $push: { assignedDispute: disputeId },
            }
        );

        const AssignedAgent = {
            agentId: agent._id,
            fname: agent.fname,
            lname: agent.lname,
            email: agent.email,
        };
        await Dispute.updateOne(
            { disputeId },
            { $set: { AssignedAgent, assignStatus: "OnWork" } }
        );

        return give_response(
            res,
            200,
            true,
            "Ticket assigned successfully",
            {}
        );
    } catch (error) {
        next(error);
    }
});
