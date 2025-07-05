import joi from 'joi';

export const createAgreementSchema = joi.object({
    role: joi.string().valid("Payer", "Receiver").required(),
    // creatorWallet: joi.string().required().message({
    //      'any.required': 'agreementId is required'
    // }),
     creatorWallet: joi.string().required().messages({
        'any.required': 'creatorWallet is required',
        'string.base': 'creatorWallet must be a string',
    }),
    name: joi.string(),
    chain: joi.string(),
    email: joi.string().email(),
    contact: joi.string(),
    projectTitle: joi.string().min(2),
    projectDescription: joi.string().min(10),
    amountDetails: joi.object().required().keys({
        amount: joi.string().required(),
        chain: joi.string().default("ethereum"),
    }),
    deadline: joi.date().required(),
    attachments: joi.array(),
    payerDetails: joi.object(),
    receiverDetails: joi.object(),
})

export const addWalletAddressSchema = joi.object({
    walletAddress: joi.string().required(),
    agreementId: joi.string().required(),
    status: joi.string().required().valid("Accepted", "Negotiated", "Rejected"),
    cancellationReason: joi.string().when('status', {
        is: 'Rejected',
        then: joi.required().messages({
            'any.required': 'cancellationReason is required'
        }),
        otherwise: joi.optional()
    })
})

export const updateAgreementSchema = joi.object({
    agreementId: joi.string().required().messages({
        'any.required': 'agreementId is required',
        'string.base': 'agreementId must be a string',
    }),

    payerDetails: joi.object().optional().keys({
        name: joi.string().optional(),
        email: joi.string().email().optional(),
        contact: joi.string().optional(),
    }),

    receiverDetails: joi.object().optional().keys({
        name: joi.string().optional(),
        email: joi.string().email().optional(),
        contact: joi.string().optional(),
    }),
    amountDetails: joi.object().optional().keys({
        amount: joi.string().optional(),
        chain: joi.string().optional(),
    }),

    projectTitle: joi.string().optional(),
    projectDescription: joi.string().optional(),
    deadline: joi.date().iso().optional().messages({
        'date.base': 'Deadline must be a valid ISO date',
    }),
    attachments: joi.array().items(joi.string().uri()).optional().messages({
        'string.uri': 'Each attachment must be a valid URI',
    })
});

export const addPersonalDetailsSchema = joi.object({
    agreementId: joi.string().required().messages({
        'any.required': 'agreementId is required',
        'string.base': 'agreementId must be a string',
    }),
    details: joi.object().required().messages({
        'object.base': 'details must be an object',
        'any.required': 'details is required',
    }).keys({
        name: joi.string().optional(),
        email: joi.string().email().optional(),
        contact: joi.string().optional(),
    }),
});

export const agreementIdSchema = joi.object({
    agreementId: joi.string().required().messages({
        'any.required': 'agreementId is required',
        'string.base': 'agreementId must be a string',
    })
})

export const cancelAgreementSchema = joi.object({
    agreementId: joi.string().required().messages({
        'any.required': 'agreementId is required',
        'string.base': 'agreementId must be a string',
    }),
    cancellationReason: joi.string().required(),
    connectedWalletId: joi.string().required()
})