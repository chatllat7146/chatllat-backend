import joi from 'joi'

export const getSignatureSchema = joi.object({
    address: joi.string().required(),
    agreementId: joi.string().required()
})