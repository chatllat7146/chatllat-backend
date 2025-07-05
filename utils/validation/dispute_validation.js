import joi from 'joi';

export const createDisputeSchema = joi.object({
    agreementId: joi.string().required().messages({
        'any.required': 'agreementId is required',
        'string.base': 'agreementId must be a string',
    }),
    connectedWallet: joi.string().required(),
    reason: joi.string().required(),
    disputeCategory: joi.string().required(),
    evidence: joi.array().items(joi.string().uri()).required().messages({
        'string.uri': 'Each attachment must be a valid URI',
    }),
});

export const addEvidenceSchema = joi.object({
    agreementId: joi.string().required().messages({
        'any.required': 'agreementId is required',
        'string.base': 'agreementId must be a string',
    }),
    connectedWallet: joi.string().required(),
    reason: joi.string(),
    evidence: joi.array().items(joi.string().uri()).messages({
        'string.uri': 'Each attachment must be a valid URI',
    }),
});

export const updateEvidenceSchema = joi.object({
    disputeId: joi.string().required(),
    evidence: joi.array().required(),
    connectedWalletId: joi.string().required()
})