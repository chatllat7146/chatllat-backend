import joi from "joi";

export const signupSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    fname: joi.string().required(),
    lname: joi.string().required(),
    contact: joi.string().required(),
});

export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
});

export const signupOtpVerifySchema = joi.object({
    supportUserId: joi.string().required(),
    signupOtp: joi.number().required(),
});

export const sendForgotOtpSchema = joi.object({
    email: joi.string().email().required(),
});

export const verifyForgotOtpSchema = joi.object({
    email: joi.string().email().required(),
    otp: joi.number().required(),
});

export const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});

export const changePasswordSchema = joi.object({
    email: joi.string().email().required(),
    oldPassword: joi.string().required(),
    newPassword: joi.string().required(),
});

export const allTicketSchema = joi.object({
    status: joi
        .string()
        .optional()
        .valid("DisputeRaised", "InProcess", "Resolved"),
    submittedBy: joi.string().optional().valid("Payer", "Receiver", "Auto"),
    AssignedAgent: joi.string().optional(),
    agreementId: joi.string().optional(),
    disputeId: joi.string().optional(),
    subject: joi.string().optional(),
    sort: joi.string().optional().valid("ascending", "descending"),
    startDate: joi.string()
        .optional()
        .custom((value, helpers) => {
            const startDate = new Date(value);
            if (isNaN(startDate)) {
                return helpers.message("Start date is invalid");
            }
            return value;
        }),
    endDate: joi.string()
        .optional()
        .custom((value, helpers) => {
            const endDate = new Date(value);
            if (isNaN(endDate)) {
                return helpers.message("End date is invalid");
            }
            return value;
        })
        .custom((value, helpers) => {
            const startDate = new Date(helpers.state.ancestors[0].startDate);
            const endDate = new Date(value);

            if (endDate <= startDate) {
                return helpers.message("End date must be greater than start date.");
            }
            return value;
        })
});

export const myAllTicketSchema = joi.object({
    agentId: joi.string().required(),
    status: joi
        .string()
        .optional()
        .valid("DisputeRaised", "InProcess", "Resolved"),
    submittedBy: joi.string().optional().valid("Payer", "Receiver", "Auto"),
    agreementId: joi.string().optional(),
    disputeId: joi.string().optional(),
    subject: joi.string().optional(),
    sort: joi.string().optional().valid("ascending", "descending"),
    startDate: joi.string()
        .optional()
        .custom((value, helpers) => {
            const startDate = new Date(value);
            if (isNaN(startDate)) {
                return helpers.message("Start date is invalid");
            }
            return value;
        }),
    endDate: joi.string()
        .optional()
        .custom((value, helpers) => {
            const endDate = new Date(value);
            if (isNaN(endDate)) {
                return helpers.message("End date is invalid");
            }
            return value;
        })
        .custom((value, helpers) => {
            const startDate = new Date(helpers.state.ancestors[0].startDate);
            const endDate = new Date(value);

            if (endDate <= startDate) {
                return helpers.message("End date must be greater than start date.");
            }
            return value;
        })
});

export const splitDisputeAmountSchema = joi.object({
    payerAmountPercent: joi.number().required(),
    receiverAmountPercent: joi.number().required(),
    agreementId: joi.string().required(),
    decision: joi.string().required()
})