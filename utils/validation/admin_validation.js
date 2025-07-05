import joi from "joi";

export const adminLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});

export const reAssignedDisputeSchema = joi.object({
    disputeId: joi.string().required(),
    reAssignedReason: joi.string().required(),
});

export const addHashSchema = joi.object({
    hash: joi.string().required(),
    type: joi.string().valid("Payer", "Receiver"),
    agreementId: joi.string().required(),
});

export const getPaymentDetailSchema = joi.object({
    disputeId: joi.string().required(),
});

export const addSupportTeamUserSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    fname: joi.string().required(),
    lname: joi.string().required(),
    contact: joi.string().required(),
});
