import joi from 'joi';

export const updateUserSchema = joi.object({
    walletId: joi.string().required(),
    name: joi.string().allow(""),
    email: joi.string().email().allow(""),
    contact: joi.string().allow(""),
    profileImage: joi.string().allow(""),
    description: joi.string().allow(""),
})

export const createProfileSchema = joi.object({
    avatar: joi.string().required(),
    walletId: joi.string().required()
})